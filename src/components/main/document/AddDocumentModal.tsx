import React, { ChangeEvent, Component, Fragment } from 'react';
import {
  Button,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import DocumentTypeService from '../../../services/DocumentTypeService';
import FileUploader from '../../common/FileUploader';
import DocumentType from '../../../models/DocumentType';
import Document from '../../../models/document/Document';
import { ReactComponent as CrossSvg } from '../../../img/cross2.svg';
import { ReactComponent as CrossSmSvg } from '../../../img/cross2-sm.svg';
import { ReactComponent as NewDocSvg } from '../../../img/new-doc-2.svg';
import { ReactComponent as NewDocSmSvg } from '../../../img/new-doc-sm.svg';
import { OptionTypeBase } from 'react-select';
import './AddDocumentModal.scss';
import AccountImpl from '../../../models/AccountImpl';
import Account from '../../../models/Account';
import AccountService from '../../../services/AccountService';
import Toggle from '../../common/Toggle';
import DatePicker from 'react-datepicker';
import MSelect from '../../common/MSelect';
import FileBase64 from 'react-file-base64';
import ImageUtil from '../../../util/ImageUtil';
import NotaryUtil from '../../../util/NotaryUtil';
import StringUtil from '../../../util/StringUtil';
import NotaryService from '../../../services/NotaryService';
import PdfPreview from '../../common/PdfPreview';
import UpdateDocumentRequest from '../../../models/document/UpdateDocumentRequest';
import jsPDF from 'jspdf';
import ZipUtil from '../../../util/ZipUtil';
import CryptoUtil from '../../../util/CryptoUtil';
import ProgressIndicator from '../../common/ProgressIndicator';
import rskapi from 'rskapi';
import Web3 from 'web3';
import QRCode from 'qrcode.react';

const CONTRACT_DEFAULT_GAS = 300000;
const rskClient = rskapi.client('https://public-node.rsk.co:443'); // rsk mainnet public node
const web3 = new Web3(
  new Web3.providers.HttpProvider(
    'https://mainnet.infura.io/v3/f89f8f95ce6c4199849037177b155d08'
  )
);

// NOTE: you could use this to add min max date selection
// import {subMonths, addMonths} from 'date-fns';

interface AddDocumentModalProps {
  showModal: boolean;
  toggleModal: () => void;
  documentTypes: DocumentType[];
  documents: Document[];
  handleAddNewDocument: (
    newFile: File,
    newThumbnailFile: File,
    documentType: string,
    referencedAccount?: Account,
    validUntilDate?: Date
  ) => Promise<Document>;
  privateEncryptionKey?: string;
  referencedAccount?: Account;
  myAccount: Account;
  handleUpdateDocument: (request: UpdateDocumentRequest) => void;
}

enum AddDocumentStep {
  TYPE_SELECTION,
  FILE_SELECTION,
  EXPIRATION,
  NOTARIZATION,
  NOTARIZED,
}

interface AddDocumentModalState {
  rskGasPrice: number;
  ethGasPrice: number;
  adminPublicKey: string;
  currentBtcPrice: number;
  currentEthPrice: number;
  networkSelect: string;
  documentType: string;
  newFile?: File;
  newThumbnailFile?: File;
  isOther: boolean;
  errorMessage?: string;
  documentTypeOption?: OptionTypeBase;
  addDocumentStep: AddDocumentStep;
  previewURL?: string;
  hasValidUntilDate: boolean;
  validUntilDate: Date;
  isGoingToNotarize: boolean;
  notaryId: string;
  notarySealBase64: string;
  privatePem: string;
  publicPem: string;
  vc?: string;
  doc?: jsPDF;
  isLoading: boolean;
}

class AddDocumentModal extends Component<
  AddDocumentModalProps,
  AddDocumentModalState
> {
  minDate: Date;
  constructor(props: Readonly<AddDocumentModalProps>) {
    super(props);

    this.minDate = new Date();
    this.minDate.setDate(new Date().getDate() + 1);
    this.state = {
      rskGasPrice: 1000000000,
      ethGasPrice: 1000000000,
      adminPublicKey: '',
      currentBtcPrice: 0,
      currentEthPrice: 0,
      networkSelect: 's3',
      addDocumentStep: AddDocumentStep.TYPE_SELECTION,
      documentType: '',
      isOther: false,
      hasValidUntilDate: false,
      validUntilDate: this.minDate,
      isGoingToNotarize: false,
      notaryId: '',
      notarySealBase64: '',
      privatePem: '',
      publicPem: '',
      vc: undefined,
      doc: undefined,
      isLoading: false,
    };
  }

  componentDidMount = async () => {
    if (this.state.adminPublicKey === '') {
      const rskGasPrice = await rskClient.host().getGasPrice();
      const ethGasPrice = web3.utils.toWei(
        '' + (await NotaryService.getEthGasPrice()) / 10,
        'gwei'
      );

      const adminPublicKeyResponse = await NotaryService.getAdminPublicKey();
      const currentBtcPrice = await NotaryService.getCoinPrice('bitcoin');
      const currentEthPrice = await NotaryService.getCoinPrice('ethereum');

      this.setState({ ethGasPrice: Number(ethGasPrice) });
      this.setState({ rskGasPrice });

      if (
        adminPublicKeyResponse === undefined ||
        adminPublicKeyResponse == null
      ) {
        this.setState({ adminPublicKey: '-' });
      } else {
        this.setState({
          adminPublicKey: adminPublicKeyResponse.adminPublicKey,
        });
      }
      this.setState({ currentBtcPrice });
      this.setState({ currentEthPrice });
    }
  };

  handleChangeNetworkSelect = (e) => {
    this.setState({ networkSelect: e.target.value });
  };

  setFile = (newFile: File, newThumbnailFile: File, previewURL: string) => {
    this.setState({ newFile, newThumbnailFile, previewURL });
  };

  handleDocumentType = (documentTypeOption: OptionTypeBase) => {
    const isOther = documentTypeOption.value === 'Other';
    const documentType =
      documentTypeOption.value === 'Other' ? '' : documentTypeOption.value;
    this.setState({ documentType, isOther, documentTypeOption });
  };

  handleDocumentTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    this.setState({ documentType: value, errorMessage: undefined });
  };

  handleAddNewDocument = async () => {
    const { handleAddNewDocument, documents, referencedAccount } = {
      ...this.props,
    };
    let { documentType, newFile, errorMessage, isOther } = { ...this.state };
    errorMessage = '';
    const { hasValidUntilDate, validUntilDate } = { ...this.state };
    const { newThumbnailFile } = { ...this.state };
    // If document type exists show error message, this shouldn't happen though
    if (
      DocumentTypeService.findDocumentTypeMatchInDocuments(
        documentType!,
        documents
      )
    ) {
      errorMessage = 'document type already exists.';
    } else {
      try {
        let validDate: Date | undefined;
        if (hasValidUntilDate) {
          validDate = validUntilDate;
        }
        if (referencedAccount) {
          await handleAddNewDocument(
            newFile!,
            newThumbnailFile!,
            documentType!,
            referencedAccount,
            validDate
          );
        } else {
          await handleAddNewDocument(
            newFile!,
            newThumbnailFile!,
            documentType!,
            undefined,
            validDate
          );
        }
        // reset the field since success
        errorMessage = undefined;
        newFile = undefined;
        documentType = '';
        isOther = false;
      } catch (err) {
        errorMessage =
          'Oops, something went wrong. Please try again in a few minutes.';
      }
    }
    this.setState({
      addDocumentStep: AddDocumentStep.TYPE_SELECTION,
      documentTypeOption: undefined,
      isOther,
      documentType,
      newFile,
      errorMessage,
      hasValidUntilDate: false,
      validUntilDate: this.minDate,
    });
    this.toggleModal();
  };

  handleNotaryIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    this.setState({ notaryId: value });
  };

  handleNotaryUploadNewSeal = (file: any) => {
    let { errorMessage, notarySealBase64 } = { ...this.state };
    errorMessage = '';
    if (file.type === 'image/jpeg' || file.type === 'image/png') {
      notarySealBase64 = file.base64;
      ImageUtil.processImageBase64(notarySealBase64);
    } else {
      errorMessage = 'Invalid Notary Seal File';
    }
    this.setState({ errorMessage, notarySealBase64 });
  };

  handleNotaryUploadPem = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    let { errorMessage, privatePem, publicPem } = { ...this.state };
    errorMessage = '';
    try {
      if (e.target.files !== null) {
        const file: File = e.target.files[0];
        publicPem = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (ev) => {
            privatePem = ev?.target?.result as string;
            let publicPem1;
            try {
              publicPem1 = NotaryUtil.getPublicKeyFromPrivateKey(privatePem);
            } catch (err) {
              reject(err);
            }
            resolve(publicPem1);
          };
          reader.onerror = reject;
          reader.readAsText(file);
        });
      }
    } catch (err) {
      console.error(err);
      errorMessage = 'Invalid Signing Key';
    }
    this.setState({ errorMessage, privatePem, publicPem });
  };

  handleNotarizeDocument = async () => {
    const {
      documentType,
      newFile,
      validUntilDate,
      publicPem,
      privatePem,
      notarySealBase64,
      notaryId,
    } = { ...this.state };
    const { newThumbnailFile } = { ...this.state };
    const {
      referencedAccount,
      myAccount,
      handleAddNewDocument,
      privateEncryptionKey,
    } = { ...this.props };
    try {
      this.setState({ isLoading: true });
      const zippedString = await StringUtil.fileContentsToString(newFile!);
      const encryptedString = await ZipUtil.unzip(zippedString);
      const base64String = await CryptoUtil.getDecryptedString(
        privateEncryptionKey!,
        encryptedString
      );
      await handleAddNewDocument(
        newFile!,
        newThumbnailFile!,
        documentType!,
        referencedAccount,
        validUntilDate
      );
      const notarizedDoc = await NotaryUtil.createNotarizedDocument(
        'certifiedCopy',
        validUntilDate,
        parseInt(notaryId, 10),
        myAccount.didAddress,
        privateEncryptionKey === undefined ? '' : privateEncryptionKey,
        publicPem,
        privatePem,
        referencedAccount?.didAddress === undefined
          ? ''
          : referencedAccount?.didAddress,
        base64String,
        notarySealBase64,
        documentType,
        AccountImpl.getFullName(
          referencedAccount?.firstName,
          referencedAccount?.lastName
        ),
        AccountImpl.getFullName(myAccount.firstName, myAccount.lastName)
      );

      const base64Pdf: string = notarizedDoc!.doc.output('datauristring');

      const ownerEncrypted = await CryptoUtil.getEncryptedByPublicString(
        referencedAccount!.didPublicEncryptionKey!,
        base64Pdf
      );
      const ownerZipped: Blob = await ZipUtil.zip(ownerEncrypted);
      const ownerFile = new File([ownerZipped], 'encrypted-notary.zip', {
        type: 'application/zip',
        lastModified: Date.now(),
      });

      const helperEncrypted = await CryptoUtil.getEncryptedByPublicString(
        myAccount.didPublicEncryptionKey!,
        base64Pdf
      );
      const helperZipped: Blob = await ZipUtil.zip(helperEncrypted);
      const helperFile = new File([helperZipped], 'encrypted-notary.zip', {
        type: 'application/zip',
        lastModified: Date.now(),
      });

      await NotaryService.updateDocumentVC(
        referencedAccount?.id!,
        documentType,
        notarizedDoc!.vc,
        helperFile,
        ownerFile,
        this.state.networkSelect
      );

      this.setState({
        vc: notarizedDoc!.vc,
        doc: notarizedDoc!.doc,
        addDocumentStep: AddDocumentStep.NOTARIZED,
        isLoading: false,
      });
    } catch (err) {
      console.error('Failure in notarize document');
      console.error(err);
    }
  };

  toggleModal = () => {
    // clear state
    const { toggleModal } = { ...this.props };
    this.setState({
      addDocumentStep: AddDocumentStep.TYPE_SELECTION,
      documentType: '',
      isOther: false,
      documentTypeOption: undefined,
      hasValidUntilDate: false,
      validUntilDate: this.minDate,
      isGoingToNotarize: false,
      notaryId: '',
    });
    toggleModal();
  };

  isNotarizeDisabled = () => {
    // TODO: do file check pem check return error if they are in a bad format, e.g. wrong file for seal, incorrect pem format.
    const { notaryId, notarySealBase64, publicPem, errorMessage } = { ...this.state };
    let isDisabled = false;
    if (notaryId.length <= 0) {
      isDisabled = true;
    }
    if (notarySealBase64.length <= 0) {
      isDisabled = true;
    }
    if (publicPem.length <= 0) {
      isDisabled = true;
    }
    if(errorMessage && errorMessage.length > 0) {
      isDisabled = true;
    }
    return isDisabled;
  };

  renderDocumentTypeSection() {
    const { documentTypes, documents } = { ...this.props };
    const { documentType, isOther, errorMessage, documentTypeOption } = {
      ...this.state,
    };

    const options: OptionTypeBase[] = documentTypes.map((documentTypeItem) => ({
      value: documentTypeItem.name,
      label: documentTypeItem.name,
      isDisabled: DocumentTypeService.findDocumentTypeMatchInDocuments(
        documentTypeItem.name,
        documents
      ),
    }));
    options.push({ value: 'Other', label: 'Other', isDisabled: false });
    return (
      <section className="type-section">
        <div className="type-prompt">First, what type of document is this?</div>
        <div className="select-md">
          <MSelect
            value={documentTypeOption}
            onChange={this.handleDocumentType}
            options={options}
            isSearchable={false}
            placeholder={'-Select document-'}
          />
        </div>
        <div className="select-sm">
          <MSelect
            value={documentTypeOption}
            onChange={this.handleDocumentType}
            options={options}
            isSearchable={false}
            placeholder={'-Select document-'}
            isSmall
          />
        </div>
        {isOther && (
          <div className="document-type-selected">
            {errorMessage && <div className="error">{errorMessage}</div>}
            <FormGroup>
              <Label for="documentTypeSelected" className="other-prompt">
                Ok, what's the title of this document?
              </Label>
              <Input
                type="text"
                name="documentTypeSelected"
                id="documentTypeSelected"
                value={documentType}
                onChange={this.handleDocumentTypeChange}
                placeholder="Document Title..."
              />
            </FormGroup>
          </div>
        )}
      </section>
    );
  }

  renderDocumentFileSection() {
    const { documentType } = { ...this.state };
    return (
      <section>
        <FileUploader
          setFile={this.setFile}
          documentType={documentType}
          privateEncryptionKey={this.props.privateEncryptionKey}
        />
      </section>
    );
  }

  renderExpirationDateSection() {
    const { previewURL, hasValidUntilDate, validUntilDate } = { ...this.state };
    return (
      <section className="expiration-date-section">
        <div className="image-container">
          <img src={previewURL} alt="" />
        </div>
        <div className="expiration-date-container">
          <div className="expiration-toggle">
            <div className="prompt">
              Does this document have an expiration date?
            </div>
            <Toggle
              isLarge
              value={hasValidUntilDate}
              onToggle={() =>
                this.setState({ hasValidUntilDate: !hasValidUntilDate })
              }
            />
          </div>
          {hasValidUntilDate && (
            <div className="date-picker">
              <div className="label">EXPIRATION DATE</div>
              <DatePicker
                minDate={this.minDate}
                selected={validUntilDate}
                onChange={(date) => {
                  this.setState({ validUntilDate: date });
                }}
                dateFormatCalendar={'MMM yyyy'}
                peekNextMonth
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
              />
            </div>
          )}
        </div>
      </section>
    );
  }

  renderNotarizeSection() {
    const { previewURL, isGoingToNotarize, notaryId, errorMessage } = {
      ...this.state,
    };

    let fundNetworkSection;

    if (this.state.networkSelect === 'rsk') {
      const rskTotalCostToSend = web3.utils.fromWei(
        '' + this.state.rskGasPrice * CONTRACT_DEFAULT_GAS,
        'ether'
      );

      const dollarAmount =
        Math.round(
          parseFloat(rskTotalCostToSend) * this.state.currentBtcPrice * 1000
        ) / 1000;

      fundNetworkSection = (
        <div>
          {' '}
          <Label
            style={{ paddingRight: '30px' }}
            for="network"
            className="other-prompt"
          >
            Please Send Funds:
          </Label>
          <p>
            {rskTotalCostToSend} RSK (${dollarAmount})
          </p>
          <QRCode value={this.state.adminPublicKey} size="256" />
          <p>{this.state.adminPublicKey}</p>
        </div>
      );
    } else if (this.state.networkSelect === 'eth') {
      const ethTotalCostToSend = web3.utils.fromWei(
        '' + this.state.ethGasPrice * CONTRACT_DEFAULT_GAS,
        'ether'
      );

      const dollarAmount =
        Math.round(
          parseFloat(ethTotalCostToSend) * this.state.currentEthPrice * 1000
        ) / 1000;

      fundNetworkSection = (
        <div>
          {' '}
          <Label
            style={{ paddingRight: '30px' }}
            for="network"
            className="other-prompt"
          >
            Please Send Funds:
          </Label>
          <p>
            {ethTotalCostToSend} ETH (${dollarAmount})
          </p>
          <QRCode value={this.state.adminPublicKey} size="256" />
          <p>{this.state.adminPublicKey}</p>
        </div>
      );
    }

    return (
      <section className="notarize-section">
        <div className="image-container">
          <img src={previewURL} alt="" />
        </div>
        <div className="notary-container">
          <div className="notary-toggle">
            <div className="prompt">Are you going to notarize?</div>
            <Toggle
              isLarge
              value={isGoingToNotarize}
              onToggle={() =>
                this.setState({ isGoingToNotarize: !isGoingToNotarize })
              }
            />
          </div>
          {/* TODO: */}
          {isGoingToNotarize && (
            <div className="notary-form">
              <div>NOTARY INFORMATION</div>
              {errorMessage && errorMessage.length > 0 && (
                <span className="error">{errorMessage}</span>
              )}
              {/* <div className="form-line">
                <div className="input-section">
                  <label>Notary State</label>
                </div>
              </div> */}
              <div className="form-line">
                <div className="input-section">
                  <Label for="notaryId">Notary #</Label>
                  <Input
                    type="text"
                    name="notaryId"
                    id="notaryId"
                    value={notaryId}
                    onChange={this.handleNotaryIdChange}
                    placeholder="Notary Id #..."
                  />
                  <Label
                    style={{ paddingRight: '30px' }}
                    for="notarySeal"
                    className="other-prompt"
                  >
                    SIGNING KEY (Use PEM)
                  </Label>
                  <input
                    type="file"
                    onChange={(e) => this.handleNotaryUploadPem(e)}
                  />
                </div>
                <div className="input-section">
                  <Label
                    style={{ paddingRight: '30px' }}
                    for="notarySeal"
                    className="other-prompt"
                  >
                    Notary Seal:
                  </Label>
                  <FileBase64
                    multiple={false}
                    onDone={this.handleNotaryUploadNewSeal}
                  />

                  <Label
                    style={{ paddingRight: '30px' }}
                    for="network"
                    className="other-prompt"
                  >
                    Notarization Destination
                  </Label>
                  <select
                    value={this.state.networkSelect}
                    onChange={this.handleChangeNetworkSelect}
                  >
                    <option value="eth">Ethereum Network</option>
                    <option value="rsk">RSK Network</option>
                    <option value="s3">Amazon S3</option>
                  </select>

                  {this.state.networkSelect === 's3' ? '' : fundNetworkSection}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  renderNotarizedSection() {
    const { doc } = { ...this.state };
    return (
      <section className="notarized-section">
        {/* <h3>Verifiable Credential</h3> */}
        {/* <pre className="vc-display">{this.state.vc}</pre> */}
        {doc && (
          <div className="pdf-display">
            <PdfPreview fileURL={doc.output('datauristring')} />
            <Button
              className="margin-wide"
              color="primary"
              onClick={() => doc.save('generated.pdf')}
            >
              Save Pdf
            </Button>
          </div>
        )}
      </section>
    );
  }

  render() {
    const { showModal, referencedAccount } = { ...this.props };
    const {
      documentType,
      newFile,
      addDocumentStep,
      isGoingToNotarize,
      hasValidUntilDate,
      isLoading,
    } = { ...this.state };
    const closeBtn = (
      <div className="modal-close" onClick={this.toggleModal}>
        <CrossSvg className="lg" />
        <CrossSmSvg className="sm" />
      </div>
    );
    return (
      <Fragment>
        {isLoading && <ProgressIndicator isFullscreen />}
        <Modal
          isOpen={showModal}
          toggle={this.toggleModal}
          backdrop={'static'}
          size={'xl'}
          className="add-doc-modal"
        >
          <ModalHeader toggle={this.toggleModal} close={closeBtn}>
            {referencedAccount && (
              <Fragment>
                <img
                  src={AccountService.getProfileURL(
                    referencedAccount.profileImageUrl!
                  )}
                  alt=""
                />
                <span>
                  {AccountImpl.getFullName(
                    referencedAccount.firstName,
                    referencedAccount.lastName
                  )}
                </span>
              </Fragment>
            )}
            {!referencedAccount && (
              <Fragment>
                <NewDocSvg />
                <NewDocSmSvg />
                <span>New Document</span>
              </Fragment>
            )}
          </ModalHeader>
          <ModalBody>
            <div className="document-type-container">
              {[AddDocumentStep.TYPE_SELECTION].includes(addDocumentStep) &&
                this.renderDocumentTypeSection()}
              {AddDocumentStep.FILE_SELECTION === addDocumentStep &&
                this.renderDocumentFileSection()}
              {AddDocumentStep.EXPIRATION === addDocumentStep &&
                this.renderExpirationDateSection()}
              {AddDocumentStep.NOTARIZATION === addDocumentStep &&
                this.renderNotarizeSection()}
              {AddDocumentStep.NOTARIZED === addDocumentStep &&
                this.renderNotarizedSection()}
            </div>
          </ModalBody>
          <ModalFooter>
            {AddDocumentStep.TYPE_SELECTION === addDocumentStep && (
              <Fragment>
                <Button
                  className="margin-wide"
                  outline
                  color="secondary"
                  onClick={this.toggleModal}
                >
                  Cancel
                </Button>{' '}
                <Button
                  className="margin-wide"
                  color="primary"
                  disabled={!documentType}
                  onClick={() =>
                    this.setState({
                      addDocumentStep: AddDocumentStep.FILE_SELECTION,
                    })
                  }
                >
                  Next
                </Button>
              </Fragment>
            )}
            {AddDocumentStep.FILE_SELECTION === addDocumentStep && (
              <Fragment>
                <Button
                  className="margin-wide"
                  outline
                  color="secondary"
                  onClick={() =>
                    this.setState({
                      addDocumentStep: AddDocumentStep.TYPE_SELECTION,
                    })
                  }
                >
                  Go Back
                </Button>{' '}
                <Button
                  className="margin-wide"
                  color="primary"
                  disabled={!newFile || !documentType}
                  onClick={() =>
                    this.setState({
                      addDocumentStep: AddDocumentStep.EXPIRATION,
                    })
                  }
                >
                  Next
                </Button>
              </Fragment>
            )}
            {AddDocumentStep.EXPIRATION === addDocumentStep && (
              <Fragment>
                <Button
                  className="margin-wide"
                  outline
                  color="secondary"
                  onClick={() =>
                    this.setState({
                      addDocumentStep: AddDocumentStep.FILE_SELECTION,
                    })
                  }
                >
                  Go Back
                </Button>{' '}
                {hasValidUntilDate && referencedAccount && (
                  <Button
                    className="margin-wide"
                    color="primary"
                    onClick={() =>
                      this.setState({
                        addDocumentStep: AddDocumentStep.NOTARIZATION,
                      })
                    }
                  >
                    Next
                  </Button>
                )}
                {(!hasValidUntilDate || !referencedAccount) && (
                  <Button
                    className="margin-wide"
                    color="primary"
                    onClick={this.handleAddNewDocument}
                  >
                    Add File
                  </Button>
                )}
              </Fragment>
            )}
            {AddDocumentStep.NOTARIZATION === addDocumentStep && (
              <Fragment>
                <Button
                  className="margin-wide"
                  outline
                  color="secondary"
                  onClick={() =>
                    this.setState({
                      addDocumentStep: AddDocumentStep.EXPIRATION,
                    })
                  }
                >
                  Go Back
                </Button>{' '}
                {isGoingToNotarize && (
                  <Button
                    className="margin-wide"
                    color="primary"
                    // onClick={() => this.setState({ addDocumentStep: AddDocumentStep.NOTARIZED })}
                    onClick={this.handleNotarizeDocument}
                    disabled={this.isNotarizeDisabled()}
                  >
                    Notarize
                  </Button>
                )}
                {!isGoingToNotarize && (
                  <Button
                    className="margin-wide"
                    color="primary"
                    onClick={this.handleAddNewDocument}
                  >
                    Add File
                  </Button>
                )}
              </Fragment>
            )}
            {AddDocumentStep.NOTARIZED === addDocumentStep && (
              <Fragment>
                <Button
                  className="margin-wide"
                  color="primary"
                  onClick={this.toggleModal}
                >
                  Close
                </Button>
              </Fragment>
            )}
          </ModalFooter>
        </Modal>
      </Fragment>
    );
  }
}

export default AddDocumentModal;

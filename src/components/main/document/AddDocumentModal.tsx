import React, { ChangeEvent, Component, Fragment } from 'react';
import {
  Button,
  Col,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
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
import ProfileImage, { ProfileImageSizeEnum } from '../../common/ProfileImage';
import { ReactComponent as NotarizeOverviewSvg } from '../../../img/notarize-overview.svg';
import { ReactComponent as NotarizeRecordOverviewSvg } from '../../../img/notarize-record-overview.svg';
import { ReactComponent as NotarizeRecordOverviewDesktopSvg } from '../../../img/notarize-record-overview-desktop.svg';
import { ReactComponent as NotaryHandoffSvg } from '../../../img/notary-handoff.svg';
import { ReactComponent as NotaryHandoffDesktopSvg } from '../../../img/notary-handoff-desktop.svg';
import { ReactComponent as CustodianHandoffSvg } from '../../../img/custodian-handoff.svg';
import { ReactComponent as CustodianHandoffDesktopSvg } from '../../../img/custodian-handoff-desktop.svg';
import Checkbox from '../../common/Checkbox';

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
  NOTARIZATION_OVERVIEW,
  NOTARIZATION,
  NOTARIZATION_CUSTODIAN_HANDOFF,
  NOTARIZATION_CUSTODIAN_CONFIRM,
  NOTARIZATION_NOTARY_HANDOFF,
  NOTARIZATION_NOTARY_CONFIRM,
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
  validUntilDate: Date | null;
  isGoingToNotarize: boolean;
  notaryId: string;
  notarySealBase64: string;
  privatePem: string;
  publicPem: string;
  vc?: string;
  doc?: jsPDF;
  isLoading: boolean;
  acceptsUsingDigitalSignatures: boolean;
  isTrueDocument: boolean;
  acceptsDigitalSignature: boolean;
  custodianAcceptsUsingDigitalSignatures: boolean;
  custodianIsTrueDocument: boolean;
  custodianAcceptsDigitalSignature: boolean;
  width: number;
  county: string;
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
      // addDocumentStep: AddDocumentStep.NOTARIZATION_CUSTODIAN_HANDOFF,
      documentType: '',
      // documentType: 'MAP Card',
      // documentType: 'Social Security Card',
      isOther: false,
      hasValidUntilDate: false,
      validUntilDate: null,
      isGoingToNotarize: false,
      notaryId: '',
      notarySealBase64: '',
      privatePem: '',
      publicPem: '',
      vc: undefined,
      doc: undefined,
      isLoading: false,
      acceptsUsingDigitalSignatures: false,
      isTrueDocument: false,
      acceptsDigitalSignature: false,
      custodianAcceptsUsingDigitalSignatures: false,
      custodianIsTrueDocument: false,
      custodianAcceptsDigitalSignature: false,
      width: 0,
      county: '',
    };
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({ width: window.innerWidth });
  };

  getNotarizationInfo = async () => {
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

  isRecordable = () => {
    const { documentType } = { ...this.state };
    const { documentTypes } = { ...this.props };
    return !!documentTypes.find((dt) => dt.name === documentType)
      ?.isRecordableDoc;
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
          validDate = validUntilDate !== null ? validUntilDate : undefined;
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
      county
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
        validUntilDate !== null ? validUntilDate : undefined
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
        AccountImpl.displayName(referencedAccount),
        AccountImpl.getFullName(myAccount.firstName, myAccount.lastName),
        county,
        this.isRecordable()
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
    const { notaryId, notarySealBase64, publicPem, errorMessage } = {
      ...this.state,
    };
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
    if (errorMessage && errorMessage.length > 0) {
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
    const { previewURL, hasValidUntilDate } = { ...this.state };
    let { validUntilDate } = { ...this.state };
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
              onToggle={() => {
                if (hasValidUntilDate) {
                  validUntilDate = null;
                } else {
                  validUntilDate = this.minDate;
                }
                this.setState({
                  hasValidUntilDate: !hasValidUntilDate,
                  validUntilDate,
                });
              }}
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

  renderNotarizeOverview() {
    return (
      <div className="notarize-overview">
        {this.isRecordable() && (
          <div id="notarize-overview">
            <NotarizeRecordOverviewSvg />
          </div>
        )}
        {this.isRecordable() && (
          <div id="notarize-overview-desktop">
            <NotarizeRecordOverviewDesktopSvg />
          </div>
        )}
        {!this.isRecordable() && <NotarizeOverviewSvg />}
      </div>
    );
  }

  renderNotarizeCustodianHandoff() {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div id="svg-mobile">
          <CustodianHandoffSvg />
        </div>
        <div id="svg-desktop">
          <CustodianHandoffDesktopSvg />
        </div>
      </div>
    );
  }

  renderNotarizeCustodianConfirm() {
    const {
      custodianAcceptsUsingDigitalSignatures,
      custodianIsTrueDocument,
      custodianAcceptsDigitalSignature,
      previewURL,
    } = { ...this.state };
    const { referencedAccount } = { ...this.props };
    return (
      <div className="notarize-confirm custodian">
        <div className="notarize-prompt">
          By electronically signing this document you accept the following terms
        </div>
        {/* d-none d-md-block */}
        <Row>
          <Col
            sm={12}
            xl={6}
            className="d-none d-xl-block"
            style={{
              marginTop: '33px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              className="image-container"
              style={{
                width: '100%',
                backgroundColor: '#ccc',
                minWidth: '100px',
                minHeight: '100px',
              }}
            >
              <img src={previewURL} alt="" style={{ width: '100%' }} />
            </div>
          </Col>
          <Col sm={12} xl={6} style={{ marginTop: '33px' }}>
            <div className="confirm-item">
              <Checkbox
                isChecked={custodianAcceptsUsingDigitalSignatures}
                onClick={() =>
                  this.setState({
                    custodianAcceptsUsingDigitalSignatures: !custodianAcceptsUsingDigitalSignatures,
                  })
                }
              />
              <div className="confirm-label">
                I accept the use of digital signatures
              </div>
            </div>
            <div className="confirm-item">
              <Checkbox
                isChecked={custodianIsTrueDocument}
                onClick={() =>
                  this.setState({
                    custodianIsTrueDocument: !custodianIsTrueDocument,
                  })
                }
              />
              <div className="confirm-label">
                I affirm that the scanned document is a true, exact, complete,
                and unaltered copy of the original document in my posession
              </div>
            </div>
            <div className="confirm-item">
              <Checkbox
                isChecked={custodianAcceptsDigitalSignature}
                onClick={() =>
                  this.setState({
                    custodianAcceptsDigitalSignature: !custodianAcceptsDigitalSignature,
                  })
                }
              />
              <div className="confirm-label">
                I accept the following as my digital signature:
              </div>
            </div>
            <div className="digital-sig">
              {AccountImpl.displayName(referencedAccount)}
            </div>
            <div className="continue-exerpt">Check the boxes to continue</div>
          </Col>
        </Row>
      </div>
    );
  }

  renderNotarizeNotaryHandoff() {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div id="svg-mobile">
          <NotaryHandoffSvg />
        </div>
        <div id="svg-desktop">
          <NotaryHandoffDesktopSvg />
        </div>
      </div>
    );
  }

  renderNotarizeConfirm() {
    const {
      acceptsUsingDigitalSignatures,
      isTrueDocument,
      acceptsDigitalSignature,
      previewURL,
    } = { ...this.state };
    const { myAccount } = { ...this.props };
    return (
      <div className="notarize-confirm">
        <div className="notarize-prompt">
          By notarizing this document you accept the following terms
        </div>
        <Row>
          <Col
            sm={12}
            xl={6}
            style={{
              marginTop: '33px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              className="image-container"
              style={{
                width: '100%',
                backgroundColor: '#ccc',
                minWidth: '100px',
                minHeight: '100px',
              }}
            >
              <img src={previewURL} alt="" style={{ width: '100%' }} />
            </div>
          </Col>
          <Col sm={12} xl={6} style={{ marginTop: '33px' }}>
            <div className="confirm-item">
              <Checkbox
                isChecked={acceptsUsingDigitalSignatures}
                onClick={() =>
                  this.setState({
                    acceptsUsingDigitalSignatures: !acceptsUsingDigitalSignatures,
                  })
                }
              />
              <div className="confirm-label">
                I accept the use of digital signatures
              </div>
            </div>
            <div className="confirm-item">
              <Checkbox
                isChecked={isTrueDocument}
                onClick={() =>
                  this.setState({
                    isTrueDocument: !isTrueDocument,
                  })
                }
              />
              <div className="confirm-label">
                {this.isRecordable() && (
                  <Fragment>
                    I affirm that the document custodian has sworn before me and
                    has proved their identity to me on the basis of satisfactory
                    evidence
                  </Fragment>
                )}
                {!this.isRecordable() && (
                  <Fragment>
                    I affirm that the scanned document, is a true, exact,
                    complete, and unaltered copy made by me. And this document
                    was presented to me by the document's custodian, and that to
                    the best of my knowledge, the scanned document is neither
                    public record nor a publically recordable document.
                  </Fragment>
                )}
              </div>
            </div>
            <div className="confirm-item">
              <Checkbox
                isChecked={acceptsDigitalSignature}
                onClick={() =>
                  this.setState({
                    acceptsDigitalSignature: !acceptsDigitalSignature,
                  })
                }
              />
              <div className="confirm-label">
                I accept the following as my digital signature:
              </div>
            </div>
            <div className="digital-sig">
              {AccountImpl.getFullName(myAccount.firstName, myAccount.lastName)}
            </div>
            <div className="continue-exerpt">Check the boxes to continue</div>
          </Col>
        </Row>
      </div>
    );
  }

  renderNotarizeSection() {
    const { previewURL, notaryId, errorMessage, county } = {
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
          <QRCode value={this.state.adminPublicKey} size={256} renderAs="svg" />
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
          <QRCode value={this.state.adminPublicKey} size={256} renderAs="svg" />
          <p>{this.state.adminPublicKey}</p>
        </div>
      );
    }

    return (
      <section className="notarize-section">
        <div className="notarize-prompt">
          Would you like to notarize this document?
        </div>
        <Button
          className="add-non-notarize-btn"
          outline
          color="secondary"
          onClick={this.handleAddNewDocument}
        >
          No, skip this step
        </Button>
        <Row>
          <Col sm={12} xl={6} className="image-container-col">
            <div className="image-container">
              <img src={previewURL} alt="" />
            </div>
          </Col>
          <Col sm={12} xl={6}>
            <div className="notary-container">
              <div className="notary-form">
                <div className="notary-info">NOTARY INFORMATION</div>
                {errorMessage && errorMessage.length > 0 && (
                  <span className="error">{errorMessage}</span>
                )}
                <div className="form-line">
                  <div className="input-section">
                    <Label for="notaryId">Notary ID</Label>
                    <Input
                      type="text"
                      name="notaryId"
                      id="notaryId"
                      value={notaryId}
                      onChange={this.handleNotaryIdChange}
                      placeholder="Notary Id..."
                    />
                    <Label for="county">County</Label>
                    <Input
                      type="text"
                      name="county"
                      id="county"
                      value={county}
                      onChange={(e) => this.setState({county: e.target.value})}
                      placeholder="County..."
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
                    <br />
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

                    {this.state.networkSelect === 's3'
                      ? ''
                      : fundNetworkSection}
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </section>
    );
  }

  renderNotarizedSection() {
    const { doc, width } = { ...this.state };
    let pdfHeight = 200;
    if (width < 576) {
      pdfHeight = 200;
    }
    if (width >= 576) {
      pdfHeight = 300;
    }
    if (width >= 1200) {
      pdfHeight = 400;
    }
    return (
      <section className="notarized-section">
        {/* <h3>Verifiable Credential</h3> */}
        {/* <pre className="vc-display">{this.state.vc}</pre> */}
        {doc && (
          <div className="pdf-display">
            <PdfPreview
              fileURL={doc.output('datauristring')}
              height={pdfHeight}
            />
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
      hasValidUntilDate,
      isLoading,
      acceptsUsingDigitalSignatures,
      isTrueDocument,
      acceptsDigitalSignature,
      custodianAcceptsUsingDigitalSignatures,
      custodianIsTrueDocument,
      custodianAcceptsDigitalSignature,
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
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {!referencedAccount.profileImageUrl && (
                  <div style={{ marginRight: '28.3px' }}>
                    <ProfileImage
                      account={referencedAccount}
                      size={ProfileImageSizeEnum.SMALL}
                    />
                  </div>
                )}
                {referencedAccount.profileImageUrl && (
                  <img
                    src={AccountService.getProfileURL(
                      referencedAccount.profileImageUrl!
                    )}
                    alt=""
                  />
                )}
                <span className="add-doc-title">
                  {AccountImpl.hasNameSet(referencedAccount) &&
                    AccountImpl.getFullName(
                      referencedAccount.firstName,
                      referencedAccount.lastName
                    )}
                  {!AccountImpl.hasNameSet(referencedAccount) &&
                    referencedAccount.username}
                </span>
              </div>
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
              {AddDocumentStep.NOTARIZATION_OVERVIEW === addDocumentStep &&
                this.renderNotarizeOverview()}
              {AddDocumentStep.NOTARIZATION_CUSTODIAN_HANDOFF ===
                addDocumentStep && this.renderNotarizeCustodianHandoff()}
              {AddDocumentStep.NOTARIZATION_CUSTODIAN_CONFIRM ===
                addDocumentStep && this.renderNotarizeCustodianConfirm()}
              {AddDocumentStep.NOTARIZATION_NOTARY_HANDOFF ===
                addDocumentStep && this.renderNotarizeNotaryHandoff()}
              {AddDocumentStep.NOTARIZATION_NOTARY_CONFIRM ===
                addDocumentStep && this.renderNotarizeConfirm()}
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
                {referencedAccount && (
                  <Button
                    className="margin-wide"
                    color="primary"
                    onClick={() =>
                      this.setState({
                        addDocumentStep: AddDocumentStep.NOTARIZATION_OVERVIEW,
                      })
                    }
                  >
                    Next
                  </Button>
                )}
                {!referencedAccount && (
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
            {AddDocumentStep.NOTARIZATION_OVERVIEW === addDocumentStep && (
              <Fragment>
                <Button
                  className="margin-wide"
                  color="primary"
                  onClick={() =>
                    this.setState({
                      addDocumentStep: AddDocumentStep.NOTARIZATION,
                    })
                  }
                >
                  Got it
                </Button>
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
                <Button
                  className="margin-wide"
                  color="primary"
                  onClick={() => {
                    if (this.isRecordable()) {
                      this.setState({
                        addDocumentStep:
                          AddDocumentStep.NOTARIZATION_CUSTODIAN_HANDOFF,
                      });
                    } else {
                      this.setState({
                        addDocumentStep:
                          AddDocumentStep.NOTARIZATION_NOTARY_CONFIRM,
                      });
                    }
                  }}
                  disabled={this.isNotarizeDisabled()}
                >
                  Next
                </Button>
              </Fragment>
            )}
            {AddDocumentStep.NOTARIZATION_CUSTODIAN_HANDOFF ===
              addDocumentStep && (
              <Fragment>
                <Button
                  className="margin-wide"
                  outline
                  color="secondary"
                  onClick={() =>
                    this.setState({
                      addDocumentStep: AddDocumentStep.NOTARIZATION,
                    })
                  }
                >
                  Go Back
                </Button>
                <Button
                  style={{ backgroundColor: '#2362c7', borderColor: '#2362c7' }}
                  className="margin-wide"
                  color="primary"
                  onClick={() => {
                    this.setState({
                      addDocumentStep:
                        AddDocumentStep.NOTARIZATION_CUSTODIAN_CONFIRM,
                    });
                  }}
                >
                  Next
                </Button>
              </Fragment>
            )}
            {AddDocumentStep.NOTARIZATION_CUSTODIAN_CONFIRM ===
              addDocumentStep && (
              <Fragment>
                <Button
                  className="margin-wide"
                  outline
                  color="secondary"
                  onClick={() =>
                    this.setState({
                      addDocumentStep:
                        AddDocumentStep.NOTARIZATION_CUSTODIAN_HANDOFF,
                    })
                  }
                >
                  Go Back
                </Button>
                <Button
                  style={{ backgroundColor: '#2362c7', borderColor: '#2362c7' }}
                  className="margin-wide"
                  color="primary"
                  onClick={() => {
                    this.setState({
                      addDocumentStep:
                        AddDocumentStep.NOTARIZATION_NOTARY_HANDOFF,
                    });
                  }}
                  disabled={
                    !custodianAcceptsUsingDigitalSignatures ||
                    !custodianIsTrueDocument ||
                    !custodianAcceptsDigitalSignature
                  }
                >
                  Accept
                </Button>
              </Fragment>
            )}
            {AddDocumentStep.NOTARIZATION_NOTARY_HANDOFF ===
              addDocumentStep && (
              <Fragment>
                <Button
                  className="margin-wide"
                  outline
                  color="secondary"
                  onClick={() =>
                    this.setState({
                      addDocumentStep:
                        AddDocumentStep.NOTARIZATION_CUSTODIAN_CONFIRM,
                    })
                  }
                >
                  Go Back
                </Button>
                <Button
                  className="margin-wide"
                  color="primary"
                  onClick={() => {
                    this.setState({
                      addDocumentStep:
                        AddDocumentStep.NOTARIZATION_NOTARY_CONFIRM,
                    });
                  }}
                >
                  Next
                </Button>
              </Fragment>
            )}
            {AddDocumentStep.NOTARIZATION_NOTARY_CONFIRM ===
              addDocumentStep && (
              <Fragment>
                <Button
                  className="margin-wide"
                  outline
                  color="secondary"
                  onClick={() =>
                    this.setState({
                      addDocumentStep: AddDocumentStep.NOTARIZATION,
                    })
                  }
                >
                  Go Back
                </Button>
                <Button
                  className="margin-wide"
                  color="primary"
                  onClick={this.handleNotarizeDocument}
                  disabled={
                    !acceptsUsingDigitalSignatures ||
                    !isTrueDocument ||
                    !acceptsDigitalSignature
                  }
                >
                  Notarize
                </Button>
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

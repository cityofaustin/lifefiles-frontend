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
import Select, { OptionTypeBase } from 'react-select';
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

// NOTE: you could use this to add min max date selection
// import {subMonths, addMonths} from 'date-fns';

interface AddDocumentModalProps {
  showModal: boolean;
  toggleModal: () => void;
  documentTypes: DocumentType[];
  documents: Document[];
  handleAddNewDocument: (newFile: File, newThumbnailFile: File, documentType: string, referencedAccount?: Account, validUntilDate?: Date) => Promise<Document>;
  privateEncryptionKey?: string;
  referencedAccount?: Account;
  myAccount: Account;
}

enum AddDocumentStep {
  TYPE_SELECTION,
  FILE_SELECTION,
  EXPIRATION,
  NOTARIZATION,
  NOTARIZED
}

interface AddDocumentModalState {
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
  doc?: any;
}

class AddDocumentModal extends Component<AddDocumentModalProps,
  AddDocumentModalState> {
  constructor(props: Readonly<AddDocumentModalProps>) {
    super(props);

    this.state = {
      addDocumentStep: AddDocumentStep.TYPE_SELECTION,
      documentType: '',
      isOther: false,
      hasValidUntilDate: false,
      validUntilDate: new Date(),
      isGoingToNotarize: false,
      notaryId: '',
      notarySealBase64: '',
      privatePem: '',
      publicPem: '',
      vc: undefined,
      doc: undefined,
    };
  }

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
    const { handleAddNewDocument, documents, referencedAccount } = { ...this.props };
    let { documentType, newFile, errorMessage, isOther } = { ...this.state };
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
          await handleAddNewDocument(newFile!, newThumbnailFile!, documentType!, referencedAccount, validDate);
        } else {
          await handleAddNewDocument(newFile!, newThumbnailFile!, documentType!, undefined, validDate);
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
      validUntilDate: new Date()
    });
  };

  handleNotaryIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    this.setState({ notaryId: value });
  };

  handleNotaryUploadNewSeal = (file: any) => {
    const notarySealBase64 = file.base64;
    ImageUtil.processImageBase64(notarySealBase64);
    this.setState({ notarySealBase64 });
  };

  handleNotaryUploadPem = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (ev) => {
      let privatePem = '' as any;
      privatePem = ev?.target?.result;
      const publicPem = NotaryUtil.getPublicKeyFromPrivateKey(privatePem);
      this.setState({ privatePem, publicPem });
    };
    if (e.target.files !== null) {
      reader.readAsText(e.target.files[0]);
    }
  };

  handleNotarizeDocument = async () => {
    const { documentType, newFile, validUntilDate, publicPem, privatePem, notarySealBase64 } = { ...this.state };
    const { newThumbnailFile } = { ...this.state };
    const {referencedAccount, myAccount, handleAddNewDocument, privateEncryptionKey} = {...this.props};
    const document = await handleAddNewDocument(newFile!, newThumbnailFile!, documentType!, referencedAccount, validUntilDate);
    const base64String = await StringUtil.fileContentsToString(newFile!);
    const notarizedDoc = await NotaryUtil.createNotarizedDocument(
      'certifiedCopy',
      validUntilDate,
      parseInt(this.state.notaryId, 10),
      myAccount.didAddress,
      privateEncryptionKey === undefined ? '' : privateEncryptionKey,
      publicPem,
      privatePem,
      referencedAccount?.didAddress === undefined
        ? ''
        : referencedAccount?.didAddress,
      base64String,
      notarySealBase64,
      document?.type!,
      AccountImpl.getFullName(referencedAccount?.firstName, referencedAccount?.lastName),
      AccountImpl.getFullName(myAccount.firstName, myAccount.lastName)
    );

    await NotaryService.updateDocumentVC(
      referencedAccount?.id!,
      documentType,
      notarizedDoc.vc
    );

    this.setState({ vc: notarizedDoc.vc, doc: notarizedDoc.doc, addDocumentStep: AddDocumentStep.NOTARIZED });
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
      validUntilDate: new Date()
    });
    toggleModal();
  };

  renderDocumentTypeSection() {
    const { documentTypes, documents } = { ...this.props };
    const { documentType, isOther, errorMessage, documentTypeOption } = {
      ...this.state
    };

    const options: OptionTypeBase[] = documentTypes.map((documentTypeItem) => ({
      value: documentTypeItem.name,
      label: documentTypeItem.name,
      isDisabled: DocumentTypeService.findDocumentTypeMatchInDocuments(
        documentTypeItem.name,
        documents
      )
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
    const {previewURL, hasValidUntilDate, validUntilDate} = {...this.state};
    return (
      <section className="expiration-date-section">
        <div className="image-container">
          <img
              src={previewURL}
              alt=""
          />
        </div>
        <div className="expiration-date-container">
          <div className="expiration-toggle">
            <div className="prompt">Does this document have an expiration date?</div>
            <Toggle isLarge value={hasValidUntilDate} onToggle={() => this.setState({hasValidUntilDate: !hasValidUntilDate})} />
          </div>
          {hasValidUntilDate && (
            <div className="date-picker">
              <div className="label">EXPIRATION DATE</div>
              <DatePicker
                selected={validUntilDate}
                onChange={date => {this.setState({validUntilDate: date});}}
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
    const {previewURL, isGoingToNotarize, notaryId} = {...this.state};
    return (
      <section className="notarize-section">
        <div className="image-container">
          <img
              src={previewURL}
              alt=""
          />
        </div>
        <div className="notary-container">
          <div className="notary-toggle">
            <div className="prompt">Are you going to notarize?</div>
            <Toggle isLarge value={isGoingToNotarize} onToggle={() => this.setState({isGoingToNotarize: !isGoingToNotarize})} />
          </div>
          {/* TODO: */}
          {isGoingToNotarize && (
            <div className="notary-form">
              <div>NOTARY INFORMATION</div>
              {/* <div className="form-line">
                <div className="input-section">
                  <label>Notary State</label>
                </div>
              </div> */}
              <div className="form-line">
                <div className="input-section">
                  <Label for="notaryId">
                    Notary #
                  </Label>
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
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  renderNotarizedSection() {
    // TODO:
    return (
      <section>
        TODO
      </section>
    )
  }

  render() {
    const { showModal, referencedAccount } = { ...this.props };
    const { documentType, newFile, addDocumentStep, isGoingToNotarize, hasValidUntilDate } = { ...this.state };
    const closeBtn = (
      <div className="modal-close" onClick={this.toggleModal}>
        <CrossSvg className="lg" />
        <CrossSmSvg className="sm" />
      </div>
    );
    return (
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
              <img src={AccountService.getProfileURL(referencedAccount.profileImageUrl!)} alt="" />
              <span>{AccountImpl.getFullName(referencedAccount.firstName, referencedAccount.lastName)}</span>
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
            {[AddDocumentStep.TYPE_SELECTION].includes(addDocumentStep) && this.renderDocumentTypeSection()}
            {AddDocumentStep.FILE_SELECTION === addDocumentStep && this.renderDocumentFileSection()}
            {AddDocumentStep.EXPIRATION === addDocumentStep && this.renderExpirationDateSection()}
            {AddDocumentStep.NOTARIZATION === addDocumentStep && this.renderNotarizeSection()}
            {AddDocumentStep.NOTARIZED === addDocumentStep && this.renderNotarizedSection()}
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
                onClick={() => this.setState({ addDocumentStep: AddDocumentStep.FILE_SELECTION })}
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
                onClick={() => this.setState({ addDocumentStep: AddDocumentStep.TYPE_SELECTION })}
              >
                Go Back
              </Button>{' '}
              <Button
                className="margin-wide"
                color="primary"
                disabled={!newFile || !documentType}
                onClick={() => this.setState({ addDocumentStep: AddDocumentStep.EXPIRATION })}
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
                onClick={() => this.setState({ addDocumentStep: AddDocumentStep.FILE_SELECTION })}
              >
                Go Back
              </Button>{' '}
              {hasValidUntilDate && referencedAccount && (
                <Button
                  className="margin-wide"
                  color="primary"
                  onClick={() => this.setState({ addDocumentStep: AddDocumentStep.NOTARIZATION })}
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
                onClick={() => this.setState({ addDocumentStep: AddDocumentStep.EXPIRATION })}
              >
                Go Back
              </Button>{' '}
              {isGoingToNotarize && (
              <Button
                className="margin-wide"
                color="primary"
                // onClick={() => this.setState({ addDocumentStep: AddDocumentStep.NOTARIZED })}
                onClick={this.handleNotarizeDocument}
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
    );
  }
}

export default AddDocumentModal;

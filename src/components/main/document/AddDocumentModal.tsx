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
// NOTE: you could use this to add min max date selection
// import {subMonths, addMonths} from 'date-fns';

interface AddDocumentModalProps {
  showModal: boolean;
  toggleModal: () => void;
  documentTypes: DocumentType[];
  documents: Document[];
  handleAddNewDocument: (newFile: File, newThumbnailFile: File, documentType: string, referencedAccount?: Account) => Promise<void>;
  privateEncryptionKey?: string;
  referencedAccount?: Account;
}

enum AddDocumentStep {
  TYPE_SELECTION,
  FILE_SELECTION,
  NOTARIZATION,
  EXPIRATION
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
  hasExpiration: boolean;
  expirateDate: Date;
}

class AddDocumentModal extends Component<AddDocumentModalProps,
  AddDocumentModalState> {
  constructor(props: Readonly<AddDocumentModalProps>) {
    super(props);

    this.state = {
      addDocumentStep: AddDocumentStep.TYPE_SELECTION,
      documentType: '',
      isOther: false,
      hasExpiration: false,
      expirateDate: new Date()
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
        // TODO: add expiration date here once you adjust the API call.
        if (referencedAccount) {
          await handleAddNewDocument(newFile!, newThumbnailFile!, documentType!, referencedAccount);
        } else {
          await handleAddNewDocument(newFile!, newThumbnailFile!, documentType!);
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
      hasExpiration: false,
      expirateDate: new Date()
    });
  };

  toggleModal = () => {
    // clear state
    const { toggleModal } = { ...this.props };
    this.setState({
      addDocumentStep: AddDocumentStep.TYPE_SELECTION,
      documentType: '',
      isOther: false,
      documentTypeOption: undefined,
      hasExpiration: false,
      expirateDate: new Date()
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

    const customStyles = {
      control: (provided: any) => ({
        ...provided,
        height: '54.8px'
      }),
      option: (provided: any, state: any) => {
        // if(state.isSelected) {
        //   console.log(provided);
        // }
        const backgroundColor = state.isSelected
          ? '#2362C7'
          : provided.backgroundColor;
        const color = state.isSelected ? 'white' : '#3b3b3b';
        //   label: "option"
        //   backgroundColor: "#2684FF"
        //   color: "hsl(0, 0%, 100%)"
        //   cursor: "default"
        //   display: "block"
        //   fontSize: "inherit"
        //   padding: "8px 12px"
        //   width: "100%"
        //   userSelect: "none"
        //   WebkitTapHighlightColor: "rgba(0, 0, 0, 0)"
        // :active: {backgroundColor: "#2684FF"}
        //   boxSizing: "border-box"
        return {
          ...provided,
          backgroundColor,
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontSize: '25px',
          color,
          paddingLeft: '27.5px',
          paddingTop: '7px',
          paddingBottom: '7px',
          opacity: state.isDisabled ? 0.5 : 1
          // borderBottom: '1px dotted pink',
          // color: state.isSelected ? 'red' : 'blue',
          // padding: 20
        };
      },
      input: (provided: any) => ({
        ...provided
      }),
      placeholder: (provided: any) => ({
        ...provided,
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontSize: '25px',
        color: '#3b3b3b',
        paddingLeft: '30px'
        // marginTop: '12px',
        // marginBottom: '12px'
      }),
      singleValue: (provided: any, state: any) => ({
        ...provided,
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontSize: '25px',
        color: '#3b3b3b',
        paddingLeft: '30px',
        opacity: state.isDisabled ? 0.5 : 1,
        transition: 'opacity 300ms'
      })
    };
    const customStylesSm = {
      control: (provided: any) => ({
        ...provided,
        height: '54.8px'
      }),
      option: (provided: any, state: any) => {
        const backgroundColor = state.isSelected
          ? '#2362C7'
          : provided.backgroundColor;
        const color = state.isSelected ? 'white' : '#3b3b3b';
        return {
          ...provided,
          backgroundColor,
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontSize: '18px',
          color,
          paddingLeft: '27.5px',
          paddingTop: '7px',
          paddingBottom: '7px',
          opacity: state.isDisabled ? 0.5 : 1
        };
      },
      input: (provided: any) => ({
        ...provided
      }),
      placeholder: (provided: any) => ({
        ...provided,
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontSize: '18px',
        color: '#3b3b3b',
        paddingLeft: '30px'
      }),
      singleValue: (provided: any, state: any) => ({
        ...provided,
        fontFamily: 'Montserrat, Arial, sans-serif',
        fontSize: '18px',
        color: '#3b3b3b',
        paddingLeft: '30px',
        opacity: state.isDisabled ? 0.5 : 1,
        transition: 'opacity 300ms'
      })
    };
    return (
      <section className="type-section">
        <div className="type-prompt">First, what type of document is this?</div>
        <div className="select-md">
          <Select
            value={documentTypeOption}
            onChange={this.handleDocumentType}
            options={options}
            isSearchable={false}
            placeholder={'-Select document-'}
            styles={customStyles}
          />
        </div>
        <div className="select-sm">
          <Select
            value={documentTypeOption}
            onChange={this.handleDocumentType}
            options={options}
            isSearchable={false}
            placeholder={'-Select document-'}
            styles={customStylesSm}
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
    const {previewURL, hasExpiration, expirateDate} = {...this.state};
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
            <Toggle isLarge value={hasExpiration} onToggle={() => this.setState({hasExpiration: !hasExpiration})} />
          </div>
          {hasExpiration && (
            <div className="date-picker">
              <div className="label">EXPIRATION DATE</div>
              <DatePicker
                selected={expirateDate}
                onChange={date => {this.setState({expirateDate: date})}}
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

  render() {
    const { showModal, referencedAccount } = { ...this.props };
    const { documentType, newFile, addDocumentStep } = { ...this.state };
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
            {/* TODO: */}
            {AddDocumentStep.NOTARIZATION === addDocumentStep && <Fragment />}
            {AddDocumentStep.EXPIRATION === addDocumentStep && this.renderExpirationDateSection()}
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
          {AddDocumentStep.NOTARIZATION === addDocumentStep && (
            // TODO:
            <Fragment />
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
              <Button
                className="margin-wide"
                color="primary"
                onClick={this.handleAddNewDocument}
              >
                Add File
              </Button>
            </Fragment>
          )}
        </ModalFooter>
      </Modal>
    );
  }
}

export default AddDocumentModal;

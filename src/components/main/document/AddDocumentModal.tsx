import React, {ChangeEvent, Component, Fragment} from 'react';
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
import {ReactComponent as CrossSvg} from '../../../img/cross2.svg';
import {ReactComponent as CrossSmSvg} from '../../../img/cross2-sm.svg';
import {ReactComponent as NewDocSvg} from '../../../img/new-doc-2.svg';
import {ReactComponent as NewDocSmSvg} from '../../../img/new-doc-sm.svg';
import Select, {OptionTypeBase} from 'react-select';
import './AddDocumentModal.scss';

interface AddDocumentModalProps {
  showModal: boolean;
  toggleModal: () => void;
  documentTypes: DocumentType[];
  documents: Document[];
  handleAddNewDocument: (newFile: File, newThumbnailFile: File, documentType: string) => Promise<void>;
  privateEncryptionKey?: string;
}

interface AddDocumentModalState {
  documentType: string;
  newFile?: File;
  newThumbnailFile?: File;
  isOther: boolean;
  errorMessage?: string;
  documentTypeOption?: OptionTypeBase;
  uploadingStep: boolean;
}

class AddDocumentModal extends Component<AddDocumentModalProps,
  AddDocumentModalState> {
  constructor(props: Readonly<AddDocumentModalProps>) {
    super(props);

    this.state = {
      uploadingStep: false,
      documentType: '',
      isOther: false
    };
  }

  setFile = (newFile: File, newThumbnailFile: File) => {
    this.setState({newFile, newThumbnailFile});
  };

  handleDocumentType = (documentTypeOption: OptionTypeBase) => {
    const isOther = documentTypeOption.value === 'Other';
    const documentType =
      documentTypeOption.value === 'Other' ? '' : documentTypeOption.value;
    this.setState({documentType, isOther, documentTypeOption});
  };

  handleDocumentTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    this.setState({documentType: value, errorMessage: undefined});
  };

  handleAddNewDocument = async () => {
    const {handleAddNewDocument, documents} = {...this.props};
    let {documentType, newFile, errorMessage, isOther} = {...this.state};
    const {newThumbnailFile} = {...this.state};
    // If document type exists show error message
    if (
      DocumentTypeService.findDocumentTypeMatchInDocuments(
        documentType!,
        documents
      )
    ) {
      errorMessage = 'document type already exists.';
    } else {
      try {
        await handleAddNewDocument(newFile!, newThumbnailFile!, documentType!);
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
      uploadingStep: false,
      documentTypeOption: undefined,
      isOther,
      documentType,
      newFile,
      errorMessage
    });
  };

  toggleModal = () => {
    // clear state
    const {toggleModal} = {...this.props};
    this.setState({
      uploadingStep: false,
      documentType: '',
      isOther: false,
      documentTypeOption: undefined
    });
    toggleModal();
  };

  renderDocumentTypeSection() {
    const {documentTypes, documents} = {...this.props};
    const {documentType, isOther, errorMessage, documentTypeOption} = {
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
    options.push({value: 'Other', label: 'Other', isDisabled: false});

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
    const {documentType} = {...this.state};
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

  render() {
    const {showModal} = {...this.props};
    const {documentType, newFile, uploadingStep} = {...this.state};
    const closeBtn = (
      <div className="modal-close" onClick={this.toggleModal}>
        <CrossSvg className="lg"/>
        <CrossSmSvg className="sm"/>
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
          <NewDocSvg/>
          <NewDocSmSvg/>
          <span>New Document</span>
        </ModalHeader>
        <ModalBody>
          <div className="document-type-container">
            {!uploadingStep && this.renderDocumentTypeSection()}
            {uploadingStep && this.renderDocumentFileSection()}
          </div>
        </ModalBody>
        <ModalFooter>
          {!uploadingStep && (
            <Fragment>
              <Button
                className="margin-wide"
                outline
                color="secondary"
                onClick={this.toggleModal}
              >
                Cancel
              </Button>{' '}
            </Fragment>
          )}
          {!uploadingStep && (
            <Button
              className="margin-wide"
              color="primary"
              disabled={!documentType}
              onClick={() => this.setState({uploadingStep: true})}
            >
              Next
            </Button>
          )}
          {uploadingStep && (
            <Fragment>
              <Button
                className="margin-wide"
                outline
                color="secondary"
                onClick={() => this.setState({uploadingStep: false})}
              >
                Go Back
              </Button>{' '}
            </Fragment>
          )}
          {uploadingStep && (
            <Button
              className="margin-wide"
              color="primary"
              disabled={!newFile || !documentType}
              onClick={this.handleAddNewDocument}
            >
              Save
            </Button>
          )}
        </ModalFooter>
      </Modal>
    );
  }
}

export default AddDocumentModal;

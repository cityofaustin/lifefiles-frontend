import React, {ChangeEvent, Component} from 'react';
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle, Form, FormGroup, Input, Label, Modal,
  ModalBody,
  ModalFooter,
  ModalHeader
} from 'reactstrap';
import DocumentTypeService from '../../../services/DocumentTypeService';
import FileUploader from '../../common/FileUploader';
import DocumentType from '../../../models/DocumentType';
import Document from '../../../models/Document';
import crossImg from '../../../img/cross.svg';

interface AddDocumentModalProps {
  showModal: boolean;
  toggleModal: () => void;
  documentTypes: DocumentType[];
  documents: Document[];
  handleAddNewDocument: (newFile: File, documentTypeSelected: string) => Promise<void>;
}

interface AddDocumentModalState {
  isDocumentTypeDropdownOpen: boolean;
  documentTypeSelected?: string;
  newFile?: File;
  isOther: boolean;
  errorMessage?: string;
}

class AddDocumentModal extends Component<AddDocumentModalProps, AddDocumentModalState> {
  constructor(props: Readonly<AddDocumentModalProps>) {
    super(props);

    this.state = {
      isOther: false,
      isDocumentTypeDropdownOpen: false
    };
  }

  setFile = (newFile: File) => {
    this.setState({newFile});
  };

  toggleDocumentTypeDropdown = () => {
    const {isDocumentTypeDropdownOpen} = {...this.state};
    this.setState({isDocumentTypeDropdownOpen: !isDocumentTypeDropdownOpen});
  };

  handleDocumentType = (documentTypeName: string) => {
    this.setState({documentTypeSelected: documentTypeName, isOther: false});
  };

  handleDocumentTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    this.setState({documentTypeSelected: value, errorMessage: undefined});
  };

  handleAddNewDocument = async () => {
    const {handleAddNewDocument, documents} = {...this.props};
    let {documentTypeSelected, newFile, errorMessage, isOther} = {...this.state};
    // If document type exists show error message
    if (DocumentTypeService.findDocumentTypeMatchInDocuments(documentTypeSelected!, documents)) {
      errorMessage = 'Document type already exists.';
    } else {
      try {
        await handleAddNewDocument(newFile!, documentTypeSelected!);
        // reset the field since success
        errorMessage = undefined;
        newFile = undefined;
        documentTypeSelected = undefined;
        isOther = false;
      } catch (err) {
        errorMessage = 'Oops, something went wrong. Please try again in a few minutes.';
      }
    }
    this.setState({isOther, documentTypeSelected, newFile, errorMessage});

  };

  render() {
    const {showModal, toggleModal, documentTypes, documents} = {...this.props};
    const {isDocumentTypeDropdownOpen, documentTypeSelected, newFile, isOther, errorMessage} = {...this.state};
    const closeBtn = (<button className="close" onClick={toggleModal}><img src={`${window.location.origin}/${crossImg}`} alt="close"/></button>);
    return (
      <Modal isOpen={showModal} toggle={toggleModal} backdrop={'static'}>
        <ModalHeader toggle={toggleModal} close={closeBtn}>Add Document</ModalHeader>
        <ModalBody>
          <div className="document-type-container">
            <Dropdown isOpen={isDocumentTypeDropdownOpen} toggle={this.toggleDocumentTypeDropdown}>
              <DropdownToggle caret>
                Document Type
              </DropdownToggle>
              <DropdownMenu>
                {documentTypes.map(documentType => (
                  <DropdownItem
                    key={documentType.name}
                    onClick={() => this.handleDocumentType(documentType.name)}
                    disabled={DocumentTypeService.findDocumentTypeMatchInDocuments(documentType.name, documents)}
                  >
                    {documentType.name}
                  </DropdownItem>
                ))}
                <DropdownItem divider/>
                <DropdownItem
                  onClick={() => this.setState({isOther: true, documentTypeSelected: ''})}
                >
                  Other
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
            {(documentTypeSelected && !isOther) &&
            <div className="document-type-selected">Document Type: {documentTypeSelected}</div>
            }
            {isOther &&
            <div className="document-type-selected">
              {errorMessage && <div className="error">{errorMessage}</div>}
              <FormGroup>
                <Label for="documentTypeSelected">Document Type:</Label>
                <Input type="text" name="documentTypeSelected" id="documentTypeSelected" value={documentTypeSelected}
                       onChange={this.handleDocumentTypeChange}
                       placeholder="Document Type"/>
              </FormGroup>
            </div>
            }
          </div>
          <FileUploader setFile={this.setFile}/>
        </ModalBody>
        <ModalFooter className="modal-footer-center">
          <Button
            className="button-wide"
            color="primary"
            disabled={(!newFile || !documentTypeSelected)}
            onClick={this.handleAddNewDocument}
          >
            Save
          </Button>
          {/*<Button color="secondary" onClick={this.toggleModal}>Cancel</Button>*/}
        </ModalFooter>
      </Modal>
    );
  }
}

export default AddDocumentModal;

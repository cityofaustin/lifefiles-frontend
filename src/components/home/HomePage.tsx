import React, {Component, Fragment} from 'react';
import DocumentSummary from './DocumentSummary';
import DocumentDetail from './DocumentDetail';
import {
  Button,
  Col,
  Dropdown, DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row
} from 'reactstrap';
import './HomePage.scss';
import AccountPage from './AccountPage';
import SearchInput from '../common/SearchInput';
import Chevron from '../common/Chevron';
import AddNewDocument from './AddNewDocument';
import Account from '../../models/Account';
import Document from '../../models/Document';
import StringUtil from '../../util/StringUtil';
import FileUploader from '../common/FileUploader';
import DocumentService from '../../services/DocumentService';
import ProgressIndicator from '../common/ProgressIndicator';
import Folder from '../common/Folder';
import deleteSvg from '../../img/delete.svg';
import DocumentType from '../../models/DocumentType';
import DocumentTypeService from '../../services/DocumentTypeService';

interface HomePageState {
  documentTypes: DocumentType[];
  documents: Document[];
  searchedDocuments: Document[];
  documentTypeSelected?: string;
  documentSelected?: Document;
  isAccount: boolean;
  sortAsc: boolean;
  showModal: boolean;
  isAccountMenuOpen: boolean;
  isDocumentTypeDropdownOpen: boolean;
  newFile?: File;
  isLoading: boolean;
}

interface HomePageProps {
  account: Account;
  handleLogout: () => void;
}

class HomePage extends Component<HomePageProps, HomePageState> {

  constructor(props: Readonly<HomePageProps>) {
    super(props);

    this.state = {
      documentTypes: [],
      documents: [],
      searchedDocuments: [],
      documentTypeSelected: undefined,
      documentSelected: undefined,
      isAccount: false,
      sortAsc: true,
      showModal: false,
      isAccountMenuOpen: false,
      isDocumentTypeDropdownOpen: false,
      newFile: undefined,
      isLoading: false
    };
  }

  async componentDidMount() {
    const {account} = {...this.props};
    const {sortAsc} = {...this.state};
    let {documentTypes} = {...this.state};
    const documents: Document[] = account.documents;
    this.setState({isLoading: true});
    try {
      documentTypes = (await DocumentTypeService.get()).documentTypes;
    } catch (err) {
      console.error('failed to fetch document types');
    }
    this.setState({
      documentTypes,
      documents,
      searchedDocuments: this.sortDocuments(documents, sortAsc),
      isLoading: false
    });
  }

  handleSearchDocuments = (query: string) => {
    const {documents, sortAsc} = {...this.state};
    let searchedDocuments = documents
      .filter(document => {
        return document.type && document.type.toLowerCase().indexOf(query.toLowerCase()) !== -1;
      });
    if (query.length === 0) {
      searchedDocuments = documents;
    }
    searchedDocuments = this.sortDocuments(searchedDocuments, sortAsc);
    this.setState({searchedDocuments});
  };

  toggleSort = () => {
    let {sortAsc, searchedDocuments} = {...this.state};
    sortAsc = !sortAsc;
    searchedDocuments = this.sortDocuments(searchedDocuments, sortAsc);
    this.setState({sortAsc, searchedDocuments});
  };

  sortDocuments(documents: Document[], sortAsc: boolean) {
    return documents.sort((docA: Document, docB: Document) => {
      if (docA.type < docB.type) {
        return sortAsc ? -1 : 1;
      }
      if (docA.type > docB.type) {
        return sortAsc ? 1 : -1;
      }
      return 0;
    });
  }

  handleSelectDocument = (document?: Document) => {
    this.setState({documentSelected: document});
  };

  goToAccount = () => {
    this.setState({documentSelected: undefined, isAccount: true});
  };

  goBack = () => {
    this.setState({documentSelected: undefined, isAccount: false});
  };

  handleAddNew = () => {
    this.toggleModal();
  };

  toggleModal = () => {
    const {showModal} = {...this.state};
    this.setState({showModal: !showModal});
  };

  toggleAccountMenu = () => {
    const {isAccountMenuOpen} = {...this.state};
    this.setState({isAccountMenuOpen: !isAccountMenuOpen});
  };

  toggleDocumentTypeDropdown = () => {
    const {isDocumentTypeDropdownOpen} = {...this.state};
    this.setState({isDocumentTypeDropdownOpen: !isDocumentTypeDropdownOpen});
  };

  setFile = (newFile: File) => {
    this.setState({newFile});
  };

  handleAddNewDocument = async () => {
    const {newFile, documents, searchedDocuments, documentTypeSelected} = {...this.state};
    this.setState({isLoading: true});
    try {
      if (newFile) {
        const response = await DocumentService.addDocument(newFile, documentTypeSelected!);
        const newDocument: Document = {
          url: response.file,
          notarized: false,
          did: '',
          hash: '',
          vcJwt: '',
          vpJwt: '',
          type: documentTypeSelected!,
          sharedWithAccountIds: []
        };
        documents.push(newDocument);
        const newSearchDocument = {...newDocument};
        searchedDocuments.push(newSearchDocument);
      }
    } catch (err) {
      console.error('failed to upload file');
    }
    this.setState({documents, searchedDocuments, showModal: false, isLoading: false});
  };

  handleDeleteDocument = async (document: Document) => {
    let {documents, searchedDocuments} = {...this.state};
    this.setState({isLoading: true});

    try {
      await DocumentService.deleteDocument(document.url);
    } catch (err) {
      console.error('failed to remove image');
    }

    searchedDocuments = searchedDocuments.filter(searchedDocument => {
      return (searchedDocument as Document).url !== document.url;
    });
    documents = documents.filter(documentItem => {
      return (documentItem as Document).url !== document.url;
    });

    this.setState({documents, searchedDocuments, isLoading: false});
  };

  handleDocumentType = (documentTypeName: string) => {
    this.setState({documentTypeSelected: documentTypeName});
  };

  renderNewDocumentModal() {
    const {
      newFile, showModal, isDocumentTypeDropdownOpen,
      documentTypes, documentTypeSelected, documents
    } = {...this.state};
    return (
      <Fragment>
        <Modal isOpen={showModal} toggle={this.toggleModal}>
          <ModalHeader toggle={this.toggleModal}>Upload Document</ModalHeader>
          <ModalBody>
            <div className="document-type-container">
              <Dropdown isOpen={isDocumentTypeDropdownOpen} toggle={this.toggleDocumentTypeDropdown}>
                <DropdownToggle caret>
                  Document Type
                </DropdownToggle>
                <DropdownMenu>
                  {/* TODO need other input text */}
                  {documentTypes.map(documentType => (
                    <DropdownItem
                      key={documentType.name}
                      onClick={() => this.handleDocumentType(documentType.name)}
                      disabled={DocumentTypeService.findDocumentTypeMatchInDocuments(documentType.name, documents)}
                    >
                      {documentType.name}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
              { documentTypeSelected &&
                <div className="document-type-selected">Document Type: {documentTypeSelected}</div>
              }
            </div>
            <FileUploader setFile={this.setFile}/>
          </ModalBody>
          <ModalFooter className="modal-footer-center">
            <Button color="primary button-wide" disabled={(!newFile || !documentTypeSelected)} onClick={this.handleAddNewDocument}>Save</Button>
            {/*<Button color="secondary" onClick={this.toggleModal}>Cancel</Button>*/}
          </ModalFooter>
        </Modal>
      </Fragment>
    );
  }

  renderTopBar() {
    const {account, handleLogout} = {...this.props};
    const {isAccountMenuOpen} = {...this.state};

    return (
      <Fragment>
        <div id="home-top-bar">
          <div id="home-logo">
            <Folder/>
            {/*<img className="logo" src={`${window.location.origin}/${folderImage}`} alt="Logo"/>*/}
          </div>
          <Row id="home-search">
            <Col style={{display: 'flex'}}>
              <SearchInput handleSearch={this.handleSearchDocuments}/>
            </Col>
          </Row>
          <div id="home-profile">
            <Dropdown isOpen={isAccountMenuOpen} toggle={this.toggleAccountMenu}>
              <DropdownToggle
                tag="span"
                data-toggle="dropdown"
                aria-expanded={isAccountMenuOpen}
              >
                <div className="account-circle">{StringUtil.getFirstUppercase(account.username)}</div>
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem onClick={this.goToAccount}>My Account</DropdownItem>
                <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            {/*<img className="account-profile-image" src={account.profileimgUrl} />*/}
          </div>
        </div>
        <Row id="home-search-sm">
          <Col style={{display: 'flex'}}>
            <SearchInput handleSearch={this.handleSearchDocuments}/>
          </Col>
        </Row>
      </Fragment>
    );
  }

  renderAccount() {
    const {account} = {...this.props};
    const {isAccount} = {...this.state};

    if (isAccount) {
      return (
        <AccountPage goBack={this.goBack} account={account}/>
      );
    }
    return (
      <Fragment/>
    );
  }

  renderMyDocuments() {
    const {searchedDocuments, documentSelected, isAccount, sortAsc} = {...this.state};

    if (!documentSelected && !isAccount) {
      return (
        <div className="main-content">
          <div className="big-title">My Documents</div>
          <div className="subtitle">Sort by <span style={{cursor: 'pointer'}} onClick={this.toggleSort}>NAME <Chevron
            isAscending={sortAsc}/></span></div>
          <Row>
            <Col
              sm="12"
              md="6"
              lg="4"
              className="document-add-new"
            >
              <AddNewDocument handleAddNew={this.handleAddNew}/>
            </Col>
            {searchedDocuments.map((document, idx) => {
              return (
                <Col
                  sm="12"
                  md="6"
                  lg="4"
                  key={idx}
                  className="document-summary-container"
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}>
                    <img
                      style={{cursor: 'pointer'}}
                      src={deleteSvg}
                      alt="delete"
                      onClick={() => this.handleDeleteDocument(document!)}
                    />
                  </div>
                  <div
                    style={{cursor: 'pointer'}}
                    onClick={() => this.handleSelectDocument(document)}>
                    <DocumentSummary
                      document={document}
                      documentIdx={idx++}
                    />
                  </div>
                </Col>
              );
            })}
          </Row>
        </div>
      );
    }
    return <Fragment/>;
  }

  renderDocumentDetail() {
    const {documentSelected} = {...this.state};

    if (documentSelected) {
      return (
        <DocumentDetail document={documentSelected} goBack={this.goBack}/>
      );
    }

    return (
      <Fragment/>
    );
  }

  render() {
    const {isLoading} = {...this.state};
    return (
      <Fragment>
        {isLoading &&
        <ProgressIndicator isFullscreen/>
        }
        <div id="home-container">
          {this.renderNewDocumentModal()}
          {this.renderTopBar()}
          <div className="home-content">
            <div className="home-side"/>
            <div className="home-main">
              {this.renderAccount()}
              {this.renderMyDocuments()}
              {this.renderDocumentDetail()}
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default HomePage;

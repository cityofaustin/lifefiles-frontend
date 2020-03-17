import React, {Component, Fragment} from 'react';
import DocumentSummary from './DocumentSummary';
// import DocumentDetail from './DocumentDetail';
import {
  Col,
  Dropdown, DropdownItem,
  DropdownMenu,
  DropdownToggle,
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
import DocumentService from '../../services/DocumentService';
import ProgressIndicator from '../common/ProgressIndicator';
import Folder from '../common/Folder';
import deleteSvg from '../../img/delete.svg';
import DocumentType from '../../models/DocumentType';
import DocumentTypeService from '../../services/DocumentTypeService';
import AddDocumentModal from './AddDocumentModal';
import UpdateDocumentModal from './UpdateDocumentModal';

interface HomePageState {
  documentTypes: DocumentType[];
  documents: Document[];
  searchedDocuments: Document[];
  documentSelected?: Document;
  isAccount: boolean;
  sortAsc: boolean;
  showModal: boolean;
  isAccountMenuOpen: boolean;
  isLoading: boolean;
  documentQuery: string;
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
      documentSelected: undefined,
      isAccount: false,
      sortAsc: true,
      showModal: false,
      isAccountMenuOpen: false,
      isLoading: false,
      documentQuery: ''
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
    this.setState({searchedDocuments, documentQuery: query});
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

  handleAddNewDocument = async (newFile: File, documentTypeSelected: string) => {
    const {documents, searchedDocuments, documentQuery} = {...this.state};
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
      }
    } catch (err) {
      console.error('failed to upload file');
    }
    this.setState({documents, searchedDocuments, showModal: false, isLoading: false},
      () => {
        this.handleSearchDocuments(documentQuery);
      });
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

    this.setState({documents, searchedDocuments, isLoading: false, documentSelected: undefined});
  };

  renderAddDocumentModal() {
    const {showModal, documentTypes, documents} = {...this.state};
    return (
      <AddDocumentModal
        showModal={showModal}
        toggleModal={this.toggleModal}
        documentTypes={documentTypes}
        documents={documents}
        handleAddNewDocument={this.handleAddNewDocument}
      />
    );
  }

  renderUpdateDocumentModal() {
    const {documentSelected} = {...this.state};

    return (
      <UpdateDocumentModal
        showModal={!!documentSelected}
        toggleModal={() => this.setState({documentSelected: undefined})}
        document={documentSelected}
        handleDeleteDocument={this.handleDeleteDocument}
      />
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
    const {searchedDocuments, isAccount, sortAsc} = {...this.state};

    if (!isAccount) {
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

  render() {
    const {isLoading} = {...this.state};
    return (
      <Fragment>
        {isLoading &&
        <ProgressIndicator isFullscreen/>
        }
        <div id="home-container">
          {this.renderAddDocumentModal()}
          {this.renderUpdateDocumentModal()}
          {this.renderTopBar()}
          <div className="home-content">
            <div className="home-side"/>
            <div className="home-main">
              {this.renderAccount()}
              {this.renderMyDocuments()}
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default HomePage;

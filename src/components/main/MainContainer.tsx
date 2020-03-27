import React, {Component, Fragment} from 'react';
import DocumentSummary from './document/DocumentSummary';
// import DocumentDetail from './DocumentDetail';
import {
  Button,
  Col,
  Dropdown, DropdownItem,
  DropdownMenu,
  DropdownToggle, ListGroup, ListGroupItem,
  Row
} from 'reactstrap';
import './MainContainer.scss';
import AccountPage from './account/AccountPage';
import SearchInput from '../common/SearchInput';
import Chevron from '../common/Chevron';
import AddNewDocument from './document/AddNewDocument';
import Account from '../../models/Account';
import Document from '../../models/Document';
import StringUtil from '../../util/StringUtil';
import DocumentService from '../../services/DocumentService';
import ProgressIndicator from '../common/ProgressIndicator';
import Folder from '../common/Folder';
import deleteSvg from '../../img/delete.svg';
import DocumentType from '../../models/DocumentType';
import DocumentTypeService from '../../services/DocumentTypeService';
import AddDocumentModal from './document/AddDocumentModal';
import UpdateDocumentModal from './document/UpdateDocumentModal';
import AccountService from '../../services/AccountService';
import DocumentPage from './document/DocumentPage';
import ClientPage from './account/ClientPage';

// TODO use react router dom and make this more of a app container

interface MainContainerState {
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
  accounts: Account[];
}

interface MainContainerProps {
  account: Account;
  handleLogout: () => void;
}

class MainContainer extends Component<MainContainerProps, MainContainerState> {

  constructor(props: Readonly<MainContainerProps>) {
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
      documentQuery: '',
      accounts: []
    };
  }

  async componentDidMount() {
    const {account} = {...this.props};
    const {sortAsc} = {...this.state};
    let {documentTypes, accounts} = {...this.state};
    const documents: Document[] = account.documents;
    this.setState({isLoading: true});
    try {
      documentTypes = (await DocumentTypeService.get()).documentTypes;
      if(account.role === 'notary') {
        accounts = (await AccountService.getAccounts()).filter(accountItem => {
          if(accountItem.role === 'owner' && accountItem.id !== account.id) {
            return accountItem;
          }
        });
      } else {
        accounts = (await AccountService.getAccounts()).filter(accountItem => {
          if(accountItem.role === 'notary' && accountItem.id !== account.id) {
            return accountItem;
          }
        });
      }
      // NOTE: since not paging yet, preventing from getting too big for layout
      accounts = accounts.length > 8 ? accounts.slice(0, 8) : accounts;
    } catch (err) {
      console.error('failed to fetch main data');
    }
    this.setState({
      documentTypes,
      documents,
      searchedDocuments: this.sortDocuments(documents, sortAsc),
      isLoading: false,
      accounts
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
    const {documentSelected, accounts} = {...this.state};
    const {account} = {...this.props};
    const pendingShareRequests: string[] = account.shareRequests
      .filter(sharedRequest => {
      if(sharedRequest.documentType === documentSelected?.type && !sharedRequest.approved) {
        return sharedRequest;
      }
      })
      .map(sharedRequest => sharedRequest.shareWithAccountId);
    return (
      <UpdateDocumentModal
        accounts={accounts}
        showModal={!!documentSelected}
        toggleModal={() => this.setState({documentSelected: undefined})}
        document={documentSelected}
        pendingShareRequests={pendingShareRequests}
        handleDeleteDocument={this.handleDeleteDocument}
      />
    );
  }

  renderTopBar() {
    const {account, handleLogout} = {...this.props};
    const {isAccountMenuOpen} = {...this.state};

    return (
      <div>
        <div id="main-top-bar">
          <div id="main-logo">
            <Folder/>
            {/*<img className="logo" src={`${window.location.origin}/${folderImage}`} alt="Logo"/>*/}
          </div>
          <Row id="main-search">
            <Col style={{display: 'flex'}}>
              <SearchInput handleSearch={this.handleSearchDocuments}/>
            </Col>
          </Row>
          <div id="main-profile">
            <Dropdown isOpen={isAccountMenuOpen} toggle={this.toggleAccountMenu}>
              <DropdownToggle
                tag="span"
                data-toggle="dropdown"
                aria-expanded={isAccountMenuOpen}
              >
                { account.profileImageUrl && (
                  <img className="shared-with-image-single" src={AccountService.getProfileURL(account.profileImageUrl)} alt="Profile" />
                ) }
                { !account.profileImageUrl && (
                  <div className="account-circle">{StringUtil.getFirstUppercase(account.username)}</div>
                )}
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem onClick={this.goToAccount}>My Account</DropdownItem>
                <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            {/*<img className="account-profile-image" src={account.profileimgUrl} />*/}
          </div>
        </div>
        <Row id="main-search-sm">
          <Col style={{display: 'flex'}}>
            <SearchInput handleSearch={this.handleSearchDocuments}/>
          </Col>
        </Row>
      </div>
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

  renderMyClients() {
    const {searchedDocuments, accounts, isAccount, sortAsc} = {...this.state};

    if (!isAccount) {
      return (
        <ClientPage
          otherOwnerAccounts={accounts}
          handleAddNew={this.handleAddNew}
          handleSelectDocument={this.handleSelectDocument}
          searchedDocuments={searchedDocuments}
          sortAsc={sortAsc}
          toggleSort={this.toggleSort}
        />
      );
    }
  }

  renderMyDocuments() {
    const {searchedDocuments, isAccount, sortAsc} = {...this.state};

    if (!isAccount) {
      return <DocumentPage
        sortAsc={sortAsc}
        toggleSort={this.toggleSort}
        handleAddNew={this.handleAddNew}
        searchedDocuments={searchedDocuments}
        handleSelectDocument={this.handleSelectDocument}
      />;
    }
    return <Fragment/>;
  }

  render() {
    const {account} = {...this.props};
    const {isLoading, isAccount} = {...this.state};
    return (
      <Fragment>
        {isLoading &&
        <ProgressIndicator isFullscreen/>
        }
        <div id="main-container">
          {this.renderAddDocumentModal()}
          {this.renderUpdateDocumentModal()}
          {this.renderTopBar()}
          <div className="main-page">
            <div className="main-side"/>
            <div className="main-section">
              {this.renderAccount()}
              { account.role === 'owner' && this.renderMyDocuments() }
              { (!isAccount && account.role === 'notary') && this.renderMyClients() }
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default MainContainer;

import React, { Component, Fragment } from 'react';
import {
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
} from 'reactstrap';
import './MainContainer.scss';
import AccountPage from './account/AccountPage';
import BringYourKeyPage from './account/BringYourKeyPage';
import CheckoutPage from './account/CheckoutPage';
import AdminPage from './account/AdminPage';
import SearchInput from '../common/SearchInput';
import Account from '../../models/Account';
import Document from '../../models/document/Document';
import StringUtil from '../../util/StringUtil';
import DocumentService from '../../services/DocumentService';
import ProgressIndicator from '../common/ProgressIndicator';
import Folder from '../common/Folder';
import DocumentType from '../../models/DocumentType';
import DocumentTypeService from '../../services/DocumentTypeService';
import AddDocumentModal from './document/AddDocumentModal';
import UpdateDocumentModal from './document/UpdateDocumentModal';
import AccountService from '../../services/AccountService';
import DocumentPage from './DocumentPage';
import ClientPage from './account/ClientPage';
import ShareRequest from '../../models/ShareRequest';
import UpdateDocumentRequest from '../../models/document/UpdateDocumentRequest';
import AccountImpl from '../../models/AccountImpl';
import { ReactComponent as LogoSm } from '../../img/logo-sm.svg';
import Sidebar from '../layout/Sidebar';
import ShareRequestService from '../../services/ShareRequestService';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from 'react-router-dom';
import ZipUtil from '../../util/ZipUtil';
import CryptoUtil from '../../util/CryptoUtil';
import AppSetting from '../../models/AppSetting';

interface MainContainerState {
  documentTypes: DocumentType[];
  documents: Document[];
  searchedDocuments: Document[];
  documentSelected?: Document;
  isAccount: boolean;
  sortAsc: boolean;
  showModal: boolean;
  isAccountMenuOpen: boolean;
  isSmallMenuOpen: boolean;
  isLoading: boolean;
  documentQuery: string;
  accounts: Account[];
  searchedAccounts: Account[];
  activeTab: string;
  activeDocumentTab: string;
  sidebarOpen?: boolean;
  clientShares: Map<string, ShareRequest[]>;
}

interface MainContainerProps {
  appSettings: AppSetting[];
  saveAppSettings: (title: string, logo?: File) => Promise<void>;
  account: Account;
  handleLogout: () => void;
  updateAccountShareRequests: (requests: ShareRequest[]) => void;
  privateEncryptionKey?: string;
  setBringYourOwnEncryptionKey: (key) => void;
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
      isSmallMenuOpen: false,
      isLoading: false,
      documentQuery: '',
      accounts: [],
      searchedAccounts: [],
      activeTab: '1',
      activeDocumentTab: '1',
      sidebarOpen: false,
      clientShares: new Map<string, ShareRequest[]>(),
    };
  }

  async componentDidMount() {
    const { account } = { ...this.props };
    const { sortAsc, clientShares } = { ...this.state };
    let { documentTypes, accounts } = { ...this.state };
    const documents: Document[] = account.documents;
    this.setState({ isLoading: true });
    try {
      documentTypes = (await DocumentTypeService.get()).documentTypes;
      if (account.role === 'helper') {
        accounts = (await AccountService.getAccounts()).filter(
          (accountItem) => {
            if (accountItem.role === 'owner' && accountItem.id !== account.id) {
              return accountItem;
            }
          }
        );
        for (const otherOwnerAccount of accounts) {
          const shareRequests = await ShareRequestService.get(
            otherOwnerAccount.id
          );
          clientShares.set(otherOwnerAccount.id, shareRequests);
        }
      } else {
        accounts = (await AccountService.getAccounts()).filter(
          (accountItem) => {
            if (
              accountItem.role === 'helper' &&
              accountItem.id !== account.id
            ) {
              return accountItem;
            }
          }
        );
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
      accounts,
      searchedAccounts: this.sortAccounts(accounts, sortAsc),
      clientShares,
    });
  }

  handleSearch = (query: string) => {
    const { documents, accounts, sortAsc } = { ...this.state };
    let searchedDocuments = documents.filter((document) => {
      return (
        document.type &&
        document.type.toLowerCase().indexOf(query.toLowerCase()) !== -1
      );
    });
    let searchedAccounts = accounts.filter((account) => {
      return (
        AccountImpl.getFullName(account?.firstName, account?.lastName) &&
        AccountImpl.getFullName(account?.firstName, account?.lastName)
          .toLowerCase()
          .indexOf(query.toLowerCase()) !== -1
      );
    });
    if (query.length === 0) {
      searchedDocuments = documents;
      searchedAccounts = accounts;
    }
    searchedDocuments = this.sortDocuments(searchedDocuments, sortAsc);
    searchedAccounts = this.sortAccounts(searchedAccounts, sortAsc);
    this.setState({
      searchedDocuments,
      searchedAccounts,
      documentQuery: query,
    });
  };

  setSidebarOpen = (b: boolean) => {
    this.setState({ sidebarOpen: b });
  };

  toggleSort = () => {
    let { sortAsc, searchedDocuments, searchedAccounts } = { ...this.state };
    sortAsc = !sortAsc;
    searchedDocuments = this.sortDocuments(searchedDocuments, sortAsc);
    searchedAccounts = this.sortAccounts(searchedAccounts, sortAsc);
    this.setState({ sortAsc, searchedDocuments, searchedAccounts });
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

  sortAccounts(accounts: Account[], sortAsc: boolean) {
    return accounts.sort((acctA: Account, acctB: Account) => {
      if (acctA.firstName! < acctB.firstName!) {
        return sortAsc ? -1 : 1;
      }
      if (acctA.firstName! > acctB.firstName!) {
        return sortAsc ? 1 : -1;
      }
      return 0;
    });
  }

  handleSelectDocument = (document?: Document, goToClaim?: boolean) => {
    this.setState({
      documentSelected: document,
      activeDocumentTab: goToClaim ? '3' : '1',
    });
  };

  goToAccount = () => {
    this.setState({
      documentSelected: undefined,
      isAccount: true,
      activeDocumentTab: '1',
    });
  };

  goBack = () => {
    this.setState({
      documentSelected: undefined,
      isAccount: false,
      activeDocumentTab: '1',
    });
  };

  handleAddNew = () => {
    this.toggleModal();
  };

  toggleModal = () => {
    const { showModal } = { ...this.state };
    this.setState({ showModal: !showModal });
  };

  toggleAccountMenu = () => {
    const { isAccountMenuOpen } = { ...this.state };
    this.setState({ isAccountMenuOpen: !isAccountMenuOpen });
  };

  toggleSmallMenu = () => {
    const { isSmallMenuOpen } = { ...this.state };
    this.setState({ isSmallMenuOpen: !isSmallMenuOpen });
  };

  handleAddNewDocument = async (
    newFile: File,
    newThumbnailFile: File,
    documentTypeSelected: string,
    referencedAccount?: Account,
    validUntilDate?: Date
  ): Promise<Document> => {
    const { documents, searchedDocuments, documentQuery } = { ...this.state };
    const { account, privateEncryptionKey } = { ...this.props };
    this.setState({ isLoading: true });

    let newDocument;
    try {
      if (newFile) {
        try {
          if (referencedAccount) {
            const caseWorkerFile = newFile;
            const caseWorkerThumbnail = newThumbnailFile;
            const originalBase64 = await CryptoUtil.getDecryptedString(
              privateEncryptionKey!,
              await ZipUtil.unzip(
                await StringUtil.fileContentsToString(newFile)
              )
            );
            const thumbnailBase64 = await CryptoUtil.getDecryptedString(
              privateEncryptionKey!,
              await ZipUtil.unzip(
                await StringUtil.fileContentsToString(newThumbnailFile)
              )
            );
            const ownerEncrypted = await CryptoUtil.getEncryptedByPublicString(
              referencedAccount.didPublicEncryptionKey!,
              originalBase64
            );
            const ownerEncryptedThumbnail = await CryptoUtil.getEncryptedByPublicString(
              referencedAccount.didPublicEncryptionKey!,
              thumbnailBase64
            );
            const ownerZipped: Blob = await ZipUtil.zip(ownerEncrypted);
            const ownerZippedThumbnail: Blob = await ZipUtil.zip(
              ownerEncryptedThumbnail
            );
            const ownerFile = new File([ownerZipped], 'encrypted-image.zip', {
              type: 'application/zip',
              lastModified: Date.now(),
            });
            const ownerThumbnail = new File(
              [ownerZippedThumbnail],
              'encrypted-image-thumbnail.zip',
              { type: 'application/zip', lastModified: Date.now() }
            );
            const response = await DocumentService.uploadDocumentOnBehalfOfUser(
              caseWorkerFile,
              caseWorkerThumbnail,
              ownerFile,
              ownerThumbnail,
              documentTypeSelected!,
              referencedAccount.id
            );
            this.handleClientSelected(referencedAccount);
            newDocument = response.document;
            // newDocument._id = newDocument.id;
            // documents.push(newDocument);
          } else {
            const response = await DocumentService.addDocument(
              newFile,
              newThumbnailFile,
              documentTypeSelected!,
              account.didPublicEncryptionKey!,
              validUntilDate
            );
            newDocument = response.document;
            // NOTE: The uploaded by account object is nice but switching to account id to make consistent with the /my-account api call
            newDocument.uploadedBy = newDocument.uploadedBy.id;
            newDocument._id = newDocument.id;
            documents.push(newDocument);
          }
        } catch (err) {
          console.error(err.message);
        }
      }
    } catch (err) {
      console.error('failed to upload file');
    }
    this.setState({ documents, searchedDocuments, isLoading: false }, () => {
      this.handleSearch(documentQuery);
    });
    return newDocument as any;
  };

  handleUpdateDocument = async (request: UpdateDocumentRequest) => {
    let { documents } = { ...this.state };
    const { documentQuery } = { ...this.state };
    this.setState({ isLoading: true });
    try {
      const updatedDoc = await DocumentService.updateDocument(request);
      // FIXME: get API call to return updatedAt
      updatedDoc.updatedAt = new Date();
      documents = documents.map((doc) =>
        doc.type === updatedDoc.type ? updatedDoc : doc
      );
    } catch (err) {
      console.error('failed to upload file');
    }
    this.setState(
      {
        documents,
        showModal: false,
        isLoading: false,
        documentSelected: undefined,
        activeDocumentTab: '1',
      },
      () => {
        this.handleSearch(documentQuery);
      }
    );
  };

  handleDeleteDocument = async (document: Document) => {
    const { account } = { ...this.props };
    let { documents, searchedDocuments } = { ...this.state };
    this.setState({ isLoading: true });

    try {
      await DocumentService.deleteDocument(document.url);
    } catch (err) {
      console.error('failed to remove image');
    }

    searchedDocuments = searchedDocuments.filter((searchedDocument) => {
      return (searchedDocument as Document).url !== document.url;
    });
    documents = documents.filter((documentItem) => {
      return (documentItem as Document).url !== document.url;
    });
    // also remove share requests
    const matchedShareRequests = account.shareRequests.filter(
      (shareRequest) => {
        return shareRequest.documentType === document.type;
      }
    );
    matchedShareRequests.forEach((matchedShareRequest) =>
      this.removeShareRequest(matchedShareRequest)
    );
    this.setState({
      documents,
      searchedDocuments,
      isLoading: false,
      documentSelected: undefined,
      activeDocumentTab: '1',
    });
  };

  addShareRequest = (request: ShareRequest) => {
    const { updateAccountShareRequests, account } = { ...this.props };
    const { shareRequests } = { ...account };
    shareRequests.push(request);
    updateAccountShareRequests(shareRequests);
  };

  removeShareRequest = (request: ShareRequest) => {
    const { updateAccountShareRequests, account } = { ...this.props };
    let { shareRequests } = { ...account };
    shareRequests = shareRequests.filter(
      (shareRequest) => shareRequest._id !== request._id
    );
    updateAccountShareRequests(shareRequests);
  };

  setActiveTab = (tab: string) => {
    this.setState({ activeTab: tab });
  };

  handleClientSelected = async (otherOwnerAccount: Account) => {
    const { searchedDocuments, documentQuery } = { ...this.state };
    let { documents } = { ...this.state };
    const { account } = { ...this.props };
    this.setState({ isLoading: true });
    try {
      const shareRequests = await ShareRequestService.get(otherOwnerAccount.id);
      const sharedDocuments: Document[] = shareRequests
        .filter((shareRequest: ShareRequest) => {
          return shareRequest.shareWithAccountId === account.id;
        })
        .map((shareRequest: ShareRequest) => {
          return {
            type: shareRequest.documentType,
            // FIXME: this could be handled more elegantly, but this way works for now, the server should be sending owner's documenturl
            // and not the thumbnail but should instead be sending both as empty strings.
            url: shareRequest.approved ? shareRequest.documentUrl : '',
            thumbnailUrl: shareRequest.documentThumbnailUrl
              ? shareRequest.documentThumbnailUrl
              : '',
            sharedWithAccountIds: [shareRequest.shareWithAccountId],
          };
        });
      const docTypes: string[] = await DocumentTypeService.getDocumentTypesAccountHas(
        otherOwnerAccount.id
      );
      const notSharedDocuments: Document[] = docTypes
        .filter((docType) => {
          return !sharedDocuments.some(
            (sharedDocument) => sharedDocument.type === docType
          );
        })
        .map((docType) => {
          return {
            type: docType,
            url: '',
            thumbnailUrl: '',
            sharedWithAccountIds: [],
          };
        });
      documents = [
        ...account.documents,
        ...sharedDocuments,
        ...notSharedDocuments,
      ];
    } catch (err) {
      console.error(err.message);
    }
    this.setState({ documents, searchedDocuments, isLoading: false }, () => {
      this.handleSearch(documentQuery);
    });
  };

  renderAddDocumentModal(props) {
    const { showModal, documentTypes, documents, accounts } = { ...this.state };
    const { privateEncryptionKey, account } = { ...this.props };
    const { id } = props.match.params;
    let referencedAccount;
    if (id) {
      referencedAccount = accounts.filter(
        (accountItem) => accountItem.id === id
      )[0];
    }
    return (
      <AddDocumentModal
        myAccount={account}
        showModal={showModal}
        toggleModal={this.toggleModal}
        documentTypes={documentTypes}
        documents={documents}
        handleAddNewDocument={this.handleAddNewDocument}
        privateEncryptionKey={privateEncryptionKey}
        referencedAccount={referencedAccount}
        // used to put in the pdf over the original image.
        handleUpdateDocument={this.handleUpdateDocument}
      />
    );
  }

  renderUpdateDocumentModal(props) {
    const { documentSelected, accounts, activeDocumentTab } = { ...this.state };
    const { account } = { ...this.props };
    const { id } = props.match.params;
    let referencedAccount;
    if (id) {
      referencedAccount = accounts.filter(
        (accountItem) => accountItem.id === id
      )[0];
    }
    const shareRequests: ShareRequest[] = account.shareRequests.filter(
      (sharedRequest) => {
        if (sharedRequest.documentType === documentSelected?.type) {
          return sharedRequest;
        }
      }
    );
    return (
      <UpdateDocumentModal
        accounts={accounts}
        showModal={!!documentSelected}
        toggleModal={() =>
          this.setState({ documentSelected: undefined, activeDocumentTab: '1' })
        }
        document={documentSelected}
        shareRequests={shareRequests}
        handleUpdateDocument={this.handleUpdateDocument}
        handleDeleteDocument={this.handleDeleteDocument}
        addShareRequest={this.addShareRequest}
        removeShareRequest={this.removeShareRequest}
        myAccount={account}
        privateEncryptionKey={this.props.privateEncryptionKey}
        referencedAccount={referencedAccount}
        handleClientSelected={this.handleClientSelected}
        activeTab={activeDocumentTab}
      />
    );
  }

  renderTopBarSmall() {
    const { account } = { ...this.props };
    const { isSmallMenuOpen } = { ...this.state };
    return (
      <div id="main-top-bar-sm">
        <LogoSm onClick={() => this.setSidebarOpen(true)} />
        {account.role !== 'admin' && (
          <SearchInput handleSearch={this.handleSearch} />
        )}
      </div>
    );
  }

  renderTopBar(adminLogin) {
    const { account, handleLogout } = { ...this.props };
    const { isAccountMenuOpen } = { ...this.state };

    return (
      <div>
        <div id="main-top-bar">
          <div id="main-logo" onClick={() => this.setActiveTab('1')}>
            <Link to={account.role === 'helper' ? '/clients' : '/documents'}>
              <Folder />
            </Link>
          </div>
          {account.role !== 'admin' && adminLogin !== true && (
            <Row id="main-search">
              <Col style={{ display: 'flex' }}>
                <SearchInput handleSearch={this.handleSearch} />
              </Col>
            </Row>
          )}
          <div id="main-profile">
            <Dropdown
              isOpen={isAccountMenuOpen}
              toggle={this.toggleAccountMenu}
            >
              <DropdownToggle
                tag="span"
                data-toggle="dropdown"
                aria-expanded={isAccountMenuOpen}
              >
                {account.profileImageUrl && (
                  <img
                    className="shared-with-image-single"
                    src={AccountService.getProfileURL(account.profileImageUrl)}
                    alt="Profile"
                  />
                )}
                {!account.profileImageUrl && (
                  <div className="account-circle">
                    {StringUtil.getFirstUppercase(account.username)}
                  </div>
                )}
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>
                  <Link to="/account">My Account</Link>
                </DropdownItem>
                <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
    );
  }

  renderAccount() {
    const { account } = { ...this.props };
    // const { isAccount } = { ...this.state };

    // if (isAccount) {
    return <AccountPage goBack={this.goBack} account={account} />;
    // }
    // return <Fragment />;
  }

  renderBringYourKeyPage() {
    const { account } = { ...this.props };

    return (
      <BringYourKeyPage
        goBack={this.goBack}
        account={account}
        setBringYourOwnEncryptionKey={this.props.setBringYourOwnEncryptionKey}
      />
    );
  }

  renderCheckoutPage() {
    const { account, privateEncryptionKey } = { ...this.props };

    return (
      <CheckoutPage
        privateEncryptionKey={privateEncryptionKey}
        goBack={this.goBack}
        account={account}
      />
    );
  }

  renderAdminPage() {
    const { account, privateEncryptionKey, appSettings, saveAppSettings } = { ...this.props };
    return <AdminPage goBack={this.goBack} account={account} appSettings={appSettings} saveAppSettings={saveAppSettings} />;
  }

  renderMyClients() {
    const { searchedDocuments, accounts, sortAsc, clientShares } = {
      ...this.state,
    };
    const { account, privateEncryptionKey } = { ...this.props };
    return (
      <ClientPage
        otherOwnerAccounts={accounts}
        handleAddNew={this.handleAddNew}
        handleSelectDocument={this.handleSelectDocument}
        searchedDocuments={searchedDocuments}
        sortAsc={sortAsc}
        toggleSort={this.toggleSort}
        myAccount={account}
        addShareRequest={this.addShareRequest}
        removeShareRequest={this.removeShareRequest}
        privateEncryptionKey={privateEncryptionKey!}
        clientShares={clientShares}
        handleClientSelected={this.handleClientSelected}
      />
    );
  }

  renderDocumentPage(props) {
    const {
      searchedDocuments,
      sortAsc,
      searchedAccounts,
      activeTab,
      accounts,
    } = { ...this.state };
    const { account, privateEncryptionKey } = { ...this.props };
    const { id } = props.match.params;
    let referencedAccount;
    if (id) {
      referencedAccount = accounts.filter(
        (accountItem) => accountItem.id === id
      )[0];
    }
    return (
      <DocumentPage
        sortAsc={sortAsc}
        toggleSort={this.toggleSort}
        handleAddNew={this.handleAddNew}
        searchedDocuments={searchedDocuments}
        handleSelectDocument={this.handleSelectDocument}
        searchedAccounts={searchedAccounts}
        shareRequests={account.shareRequests}
        activeTab={activeTab}
        setActiveTab={this.setActiveTab}
        myAccount={account}
        addShareRequest={this.addShareRequest}
        removeShareRequest={this.removeShareRequest}
        privateEncryptionKey={privateEncryptionKey}
        referencedAccount={referencedAccount}
        handleClientSelected={this.handleClientSelected}
      />
    );
  }

  render() {
    const { account, handleLogout } = { ...this.props };
    const { isLoading, isAccount, sidebarOpen } = { ...this.state };

    let adminLogin = false;

    if (
      (window.location.href.indexOf('admin-login') > -1 &&
        account.canAddOtherAccounts) ||
      account.role === 'admin'
    ) {
      adminLogin = true;
    }

    if (adminLogin) {
      return (
        <Router hashType="slash">
          <div id="main-container">
            {this.renderTopBar(false)}
            <div className="main-section">{this.renderAdminPage()}</div>
          </div>
        </Router>
      );
    }

    return (
      <Router
        hashType="slash"
        // history={history}
      >
        {isLoading && <ProgressIndicator isFullscreen />}
        <div id="main-container">
          <Sidebar
            account={account}
            handleLogout={handleLogout}
            goToAccount={this.goToAccount}
            isOpen={!!sidebarOpen}
            setOpen={this.setSidebarOpen}
          />
          {this.renderTopBar(false)}
          {this.renderTopBarSmall()}
          <div className="main-page">
            {account.role !== 'admin' && <div className="main-side" />}
            <div className="main-section">
              {isAccount && <Redirect push to="/account" />}
              <Switch>
                <Route exact path="/">
                  {account.role === 'helper' && <Redirect to="/clients" />}
                  {account.role === 'owner' && <Redirect to="/documents" />}
                  {account.role === 'admin' && <Redirect to="/admin" />}
                </Route>
                <Route exact path="/account">
                  {this.renderAccount()}
                </Route>
                <Route exact path="/bring-your-key">
                  {this.renderBringYourKeyPage()}
                </Route>
                <Route exact path="/checkout">
                  {this.renderCheckoutPage()}
                </Route>
                <Route
                  exact
                  path="/documents"
                  render={(props) => {
                    return (
                      <Fragment>
                        {account.role === 'helper' && (
                          <Redirect push to="/clients" />
                        )}
                        {account.role === 'admin' && (
                          <Redirect push to="/admin" />
                        )}
                        {this.renderAddDocumentModal(props)}
                        {this.renderUpdateDocumentModal(props)}
                        {this.renderDocumentPage(props)}
                      </Fragment>
                    );
                  }}
                />
                <Route exact path="/clients">
                  {account.role === 'owner' && (
                    <Redirect push to="/documents" />
                  )}
                  {account.role === 'admin' && <Redirect push to="/admin" />}
                  {this.renderMyClients()}
                </Route>
                <Route
                  exact
                  path="/clients/:id/documents"
                  render={(props) => {
                    return (
                      <Fragment>
                        {account.role === 'owner' && (
                          <Redirect push to="/documents" />
                        )}
                        {account.role === 'admin' && (
                          <Redirect push to="/admin" />
                        )}
                        {this.renderAddDocumentModal(props)}
                        {this.renderUpdateDocumentModal(props)}
                        {this.renderDocumentPage(props)}
                      </Fragment>
                    );
                  }}
                />
                >
                <Route exact path="/admin">
                  {account.role === 'owner' && (
                    <Redirect push to="/documents" />
                  )}
                  {account.role === 'helper' && <Redirect push to="/clients" />}
                  {this.renderAdminPage()}
                </Route>
                <Route exact path="/admin">
                  {account.role === 'owner' && (
                    <Redirect push to="/documents" />
                  )}
                  {account.role === 'helper' && <Redirect push to="/clients" />}
                  {this.renderAdminPage()}
                </Route>
              </Switch>
            </div>
          </div>
        </div>
      </Router>
    );
  }
}

export default MainContainer;

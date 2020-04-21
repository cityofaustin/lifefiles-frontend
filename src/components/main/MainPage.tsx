import React, { Component, Fragment } from 'react';
import Chevron from '../common/Chevron';
import {
  Breadcrumb,
  BreadcrumbItem,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from 'reactstrap';
import AddNewDocument from './document/AddNewDocument';
import DocumentSummary from './document/DocumentSummary';
import Document from '../../models/document/Document';
import Account from '../../models/Account';
import SvgButton, { SvgButtonTypes } from '../common/SvgButton';
import './MainPage.scss';
import ShareRequest from '../../models/ShareRequest';
import classNames from 'classnames';
import AccountSummary from './account/AccountSummary';
import { ReactComponent as NewDocumentSmallSvg } from '../../img/new-document-small.svg';
import SortArrow from '../common/SortArrow';
import ImageWithStatus, { ImageViewTypes } from '../common/ImageWithStatus';
import DocumentService from '../../services/DocumentService';
import SharedWith from './document/SharedWith';
import StringUtil from '../../util/StringUtil';
import AccountImpl from '../../models/AccountImpl';
import { format } from 'date-fns';
import { ReactComponent as FabAdd } from '../../img/fab-add.svg';

interface MainPageProps {
  sortAsc: boolean;
  toggleSort: () => void;
  handleAddNew: () => void;
  searchedDocuments: Document[];
  handleSelectDocument: (document: Document) => void;
  referencedAccount?: Account;
  goBack?: () => void;
  shareRequests: ShareRequest[];
  searchedAccounts: Account[];
  activeTab: string;
  setActiveTab: (activeTab: string) => void;
  myAccount: Account;
  addShareRequest: (request: ShareRequest) => void;
  removeShareRequest: (request: ShareRequest) => void;
  privateEncryptionKey?: string;
}

interface MainPageState {
  isLayoutGrid: boolean;
}

class MainPage extends Component<MainPageProps, MainPageState> {
  constructor(props: Readonly<MainPageProps>) {
    super(props);
    this.state = {
      isLayoutGrid: true
    };
  }

  getSharedAccounts = (
    document: Document,
    searchedAccounts: Account[],
    shareRequests: ShareRequest[]
  ): Account[] => {
    return searchedAccounts.filter((sharedAccount: Account) => {
      const matchedShareRequest = shareRequests.find((shareRequest) => {
        return (
          shareRequest.shareWithAccountId === sharedAccount.id &&
          shareRequest.documentType === document.type
        );
      });
      if (matchedShareRequest) {
        return sharedAccount;
      }
    });
  };

  toggleLayout = () => {
    const { isLayoutGrid } = { ...this.state };
    this.setState({ isLayoutGrid: !isLayoutGrid });
  };

  toggleTab = (tab: string) => {
    const { activeTab, setActiveTab } = { ...this.props };
    if (activeTab !== tab) setActiveTab(tab);
  };

  renderGridSort() {
    const { sortAsc, toggleSort, activeTab } = { ...this.props };
    return (
      <Fragment>
        <div className="sort-section">
          <div className="subtitle">Sort by</div>
          <div className="subtitle subtitle-key" onClick={toggleSort}>
            NAME
          </div>
          <Chevron isAscending={sortAsc} onClick={toggleSort} />
        </div>
        <div className="sort-section-sm">
          <div className="sort-container" onClick={toggleSort}>
            <SortArrow isAscending={sortAsc} />
            <div className="subtitle subtitle-key">NAME</div>
          </div>
          {activeTab === '1' && (
            <SvgButton buttonType={SvgButtonTypes.LAYOUT_GRID_MOBILE} />
          )}
        </div>
      </Fragment>
    );
  }

  renderDocumentGridView() {
    const {
      handleAddNew,
      searchedDocuments,
      handleSelectDocument,
      searchedAccounts,
      shareRequests,
      privateEncryptionKey
    } = { ...this.props };
    return (
      <Fragment>
        {this.renderGridSort()}
        <Row style={{ marginRight: '0', minHeight: '480px' }}>
          <Col
            sm="12"
            md="6"
            lg="4"
            className="document-add-new document-item"
            onClick={handleAddNew}
          >
            <AddNewDocument handleAddNew={handleAddNew} />
          </Col>
          {searchedDocuments.length <= 0 && (
            <Col sm="12" md="6" lg="4" className="document-summary-container">
              <div
                style={{
                  display: 'flex',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <h4>No Documents.</h4>
              </div>
            </Col>
          )}
          {searchedDocuments.map((document, idx) => {
            const sharedAccounts: Account[] = this.getSharedAccounts(
              document,
              searchedAccounts,
              shareRequests
            );
            return (
              <Col
                key={idx}
                sm="12"
                md="6"
                lg="4"
                className="document-summary-container"
              >
                <div
                  style={{ cursor: 'pointer', marginRight: '0' }}
                  onClick={() => handleSelectDocument(document)}
                >
                  <DocumentSummary
                    document={document}
                    documentIdx={idx++}
                    sharedAccounts={sharedAccounts}
                    privateEncryptionKey={privateEncryptionKey}
                  />
                </div>
              </Col>
            );
          })}
        </Row>
      </Fragment>
    );
  }

  renderDocumentListView() {
    const {
      sortAsc,
      toggleSort,
      handleAddNew,
      searchedDocuments,
      handleSelectDocument,
      searchedAccounts,
      shareRequests,
      myAccount,
      privateEncryptionKey
    } = { ...this.props };
    return (
      <div>
        <table className="doc-table">
          <thead>
            <tr>
              <th>
                <div className="header-cell" onClick={toggleSort}>
                  <SortArrow isAscending={sortAsc} />
                  <div>Name</div>
                </div>
              </th>
              <th>Shared With</th>
              <th>Updated</th>
              <th>Valid Until</th>
              <th>Notarized</th>
            </tr>
          </thead>
          <tbody>
            <tr onClick={handleAddNew}>
              <td>
                <div className="add-new">
                  <div>
                    <NewDocumentSmallSvg />
                  </div>
                  <div>Add new</div>
                </div>
              </td>
              <td />
              <td />
              <td />
              <td />
            </tr>
            {searchedDocuments.map((document, idx) => {
              const sharedAccounts: Account[] = this.getSharedAccounts(
                document,
                searchedAccounts,
                shareRequests
              );
              const accountProfileURL = AccountImpl.getProfileURLByIdAndList(
                [myAccount, ...searchedAccounts],
                document.uploadedBy
              );
              const matchedAccount = AccountImpl.getAccountByIdAndList(
                [myAccount, ...searchedAccounts],
                document.uploadedBy
              );
              return (
                <tr
                  key={document.type}
                  onClick={() => handleSelectDocument(document)}
                >
                  <td>
                    <div className="doc-name-cell">
                      <ImageWithStatus
                        imageViewType={ImageViewTypes.LIST_LAYOUT}
                        imageUrl={DocumentService.getDocumentURL(document.thumbnailUrl)}
                        encrypted
                        privateEncryptionKey={privateEncryptionKey}
                      />
                      <div>{document.type}</div>
                    </div>
                  </td>
                  <td>
                    <div className="doc-share-cell">
                      <SharedWith sharedAccounts={sharedAccounts} />
                    </div>
                  </td>
                  <td>
                    <div className="doc-updated-cell">
                      {accountProfileURL && (
                        <img
                          className="profile-image"
                          src={accountProfileURL}
                          alt=""
                        />
                      )}
                      {!accountProfileURL && (
                        <div className="account-circle">
                          {StringUtil.getFirstUppercase(
                            matchedAccount!.username
                          )}
                        </div>
                      )}
                      <div>
                        {format(new Date(document.updatedAt!), 'MMM d, y')}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="doc-valid-cell">
                      {document.validateUntilDate
                        ? format(
                          new Date(document.validateUntilDate),
                          'MMM d, y'
                        )
                        : 'N/A'}
                    </div>
                  </td>
                  <td>{document.notarized}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {searchedDocuments.length <= 0 && (
          <Col sm="12" className="document-summary-container">
            <div
              style={{
                display: 'flex',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <h4>No Documents.</h4>
            </div>
          </Col>
        )}
      </div>
    );
  }

  renderNetworkGridView() {
    const {
      searchedDocuments,
      searchedAccounts,
      shareRequests,
      myAccount,
      addShareRequest,
      removeShareRequest
    } = { ...this.props };
    return (
      <Fragment>
        {this.renderGridSort()}
        <Row className="network-row">
          {searchedAccounts.length <= 0 && (
            <div className="no-network">There are no contacts.</div>
          )}
          {searchedAccounts.map((account) => {
            const matchedShareRequests = shareRequests.filter(
              (shareRequest) => shareRequest.shareWithAccountId === account.id
            );
            return (
              <Col
                key={account.id}
                sm="12"
                md="12"
                lg="6"
                xl="4"
                className="network-container"
              >
                <AccountSummary
                  account={account}
                  shareRequests={matchedShareRequests}
                  searchedDocuments={searchedDocuments}
                  myAccount={myAccount}
                  addShareRequest={addShareRequest}
                  removeShareRequest={removeShareRequest}
                />
              </Col>
            );
          })}
        </Row>
      </Fragment>
    );
  }

  renderNav() {
    const { activeTab } = { ...this.props };
    return (
      <Nav tabs className="large">
        <NavItem>
          <NavLink
            className={classNames({ active: activeTab === '1' })}
            onClick={() => {
              this.toggleTab('1');
            }}
          >
            My Documents
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classNames({ active: activeTab === '2' })}
            onClick={() => {
              this.toggleTab('2');
            }}
          >
            My Network
          </NavLink>
        </NavItem>
      </Nav>
    );
  }

  renderNavSmall() {
    const { activeTab } = { ...this.props };
    return (
      <Nav tabs className="small">
        <NavItem>
          <NavLink
            className={classNames({ active: activeTab === '1' })}
            onClick={() => {
              this.toggleTab('1');
            }}
          >
            My Documents
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classNames({ active: activeTab === '2' })}
            onClick={() => {
              this.toggleTab('2');
            }}
          >
            My Network
          </NavLink>
        </NavItem>
      </Nav>
    );
  }

  render() {
    const { activeTab, referencedAccount, goBack, handleAddNew } = {
      ...this.props
    };
    const { isLayoutGrid } = { ...this.state };
    return (
      <div className="main-content">
        {referencedAccount && (
          <Breadcrumb>
            <BreadcrumbItem className="breadcrumb-link" onClick={goBack}>
              My Clients
            </BreadcrumbItem>
            <BreadcrumbItem active>
              {referencedAccount?.username}
            </BreadcrumbItem>
          </Breadcrumb>
        )}
        {!referencedAccount && (
          <Fragment>
            {this.renderNavSmall()}
            <div className="document-header">
              {this.renderNav()}
              <div className="document-toolbar">
                {activeTab === '1' && isLayoutGrid && (
                  <SvgButton
                    buttonType={SvgButtonTypes.LAYOUT_GRID}
                    onClick={this.toggleLayout}
                  />
                )}
                {activeTab === '1' && !isLayoutGrid && (
                  <SvgButton
                    buttonType={SvgButtonTypes.LAYOUT_LIST}
                    onClick={this.toggleLayout}
                  />
                )}
                <SvgButton buttonType={SvgButtonTypes.INFO} />
              </div>
            </div>
            <TabContent activeTab={activeTab}>
              <TabPane tabId="1">
                {isLayoutGrid && this.renderDocumentGridView()}
                {!isLayoutGrid && this.renderDocumentListView()}
              </TabPane>
              <TabPane tabId="2">
                {isLayoutGrid && this.renderNetworkGridView()}
              </TabPane>
            </TabContent>
            {activeTab === '1' && (
              <FabAdd className="fab-add" onClick={handleAddNew} />
            )}
          </Fragment>
        )}
      </div>
    );
  }
}

export default MainPage;

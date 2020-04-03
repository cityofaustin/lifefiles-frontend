import React, {Component, Fragment} from 'react';
import Chevron from '../common/Chevron';
import {Breadcrumb, BreadcrumbItem, Col, ModalBody, Nav, NavItem, NavLink, Row, TabContent, TabPane} from 'reactstrap';
import AddNewDocument from './document/AddNewDocument';
import DocumentSummary from './document/DocumentSummary';
import Document from '../../models/document/Document';
import Account from '../../models/Account';
import SvgButton, {SvgButtonTypes} from '../common/SvgButton';
import './MainPage.scss';
import ShareRequest from '../../models/ShareRequest';
import classNames from 'classnames';
import AccountSummary from './account/AccountSummary';

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

  toggleLayout = () => {
    const {isLayoutGrid} = {...this.state};
    this.setState({isLayoutGrid: !isLayoutGrid});
  };

  toggleTab = (tab: string) => {
    const {activeTab, setActiveTab} = {...this.props};
    if (activeTab !== tab) setActiveTab(tab);
  };

  renderDocumentGridView() {
    const {
      sortAsc, toggleSort, handleAddNew, searchedDocuments,
      handleSelectDocument, searchedAccounts, shareRequests
    } = {...this.props};
    return (
      <Fragment>
        <div className="sort-section">
          <div className="subtitle">Sort by</div>
          <div className="subtitle subtitle-key" onClick={toggleSort}>NAME</div>
          <Chevron isAscending={sortAsc} onClick={toggleSort}/>
        </div>
        <Row style={{marginRight: '0', minHeight: '480px'}}>
          <Col
            sm="12" md="6" lg="4"
            className="document-add-new document-item"
            onClick={handleAddNew}
          >
            <AddNewDocument handleAddNew={handleAddNew}/>
          </Col>
          {searchedDocuments.length <= 0 && (
            <Col
              sm="12" md="6" lg="4"
              className="document-summary-container"
            >
              <div style={{display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                <h4>No Documents.</h4>
              </div>
            </Col>
          )}
          {searchedDocuments.map((document, idx) => {
            const sharedAccounts: Account[] = searchedAccounts.filter(sharedAccount => {
              const matchedShareRequest = shareRequests.find(shareRequest => {
                return shareRequest.shareWithAccountId === sharedAccount.id
                  && shareRequest.documentType === document.type;
              });
              if (matchedShareRequest) {
                return sharedAccount;
              }
            });
            return (
              <Col
                key={idx}
                sm="12" md="6" lg="4"
                className="document-summary-container"
              >
                <div
                  style={{cursor: 'pointer', marginRight: '0'}}
                  onClick={() => handleSelectDocument(document)}>
                  <DocumentSummary
                    document={document}
                    documentIdx={idx++}
                    sharedAccounts={sharedAccounts}
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
      sortAsc, toggleSort, handleAddNew, searchedDocuments,
      handleSelectDocument, searchedAccounts, shareRequests
    } = {...this.props};
    return (
      <div>
        <table className="doc-table">
          <thead>
          <tr>
            <th>Name</th>
            <th>Shared With</th>
            <th>Uploaded</th>
            <th>Valid Until</th>
            <th>Notarized</th>
          </tr>
          </thead>
          <tbody>
          { searchedDocuments.map((document, idx) => {
            return (
              <tr key={document.type}>
                <td>{document.type}</td>
                <td>{document.sharedWithAccountIds.length}</td>
                <td>{document.uploadedBy} {document.updatedAt}</td>
                <td>{document.validateUntilDate}</td>
                <td>{document.notarized}</td>
              </tr>
            );
          })}
          </tbody>
        </table>
        {searchedDocuments.length <= 0 && (
          <Col
            sm="12"
            className="document-summary-container"
          >
            <div style={{display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
              <h4>No Documents.</h4>
            </div>
          </Col>
        )}
      </div>
    );
  }

  renderNetworkGridView() {
    const {
      sortAsc, toggleSort, searchedDocuments,
      searchedAccounts, shareRequests,
      myAccount, addShareRequest, removeShareRequest
    } = {...this.props};
    return (
      <Fragment>
        <div className="sort-section">
          <div className="subtitle">Sort by</div>
          <div className="subtitle subtitle-key" onClick={toggleSort}>NAME</div>
          <Chevron isAscending={sortAsc} onClick={toggleSort}/>
        </div>
        <Row className="network-row">
          {searchedAccounts.length <= 0 && (
            <div className="no-network">There are no contacts.</div>
          )}
          {searchedAccounts.map(account => {
              const matchedShareRequests = shareRequests
                .filter(shareRequest => shareRequest.shareWithAccountId === account.id);
              return (
                <Col
                  key={account.id}
                  sm="12" md="12" lg="6" xl="4"
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
            }
          )}
        </Row>
      </Fragment>
    );
  }

  renderNetworkListView() {
    // TODO
    return this.renderNetworkGridView();
  }

  render() {
    const {
      sortAsc, toggleSort, searchedDocuments, activeTab, myAccount,
      referencedAccount, goBack, searchedAccounts, shareRequests,
      addShareRequest, removeShareRequest
    } = {...this.props};
    const {isLayoutGrid} = {...this.state};
    return (
      <div className="main-content">
        {referencedAccount &&
        <Breadcrumb>
          <BreadcrumbItem className="breadcrumb-link" onClick={goBack}>My Clients</BreadcrumbItem>
          <BreadcrumbItem active>{referencedAccount?.username}</BreadcrumbItem>
        </Breadcrumb>
        }
        {!referencedAccount &&
        <Fragment>
          <div className="document-header">
            <Nav tabs className="large">
              <NavItem>
                <NavLink
                  className={classNames({active: activeTab === '1'})}
                  onClick={() => {
                    this.toggleTab('1');
                  }}
                >
                  My Documents
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classNames({active: activeTab === '2'})}
                  onClick={() => {
                    this.toggleTab('2');
                  }}
                >
                  My Network
                </NavLink>
              </NavItem>
            </Nav>
            <div className="document-toolbar">
              {isLayoutGrid && <SvgButton buttonType={SvgButtonTypes.LAYOUT_GRID} onClick={this.toggleLayout}/>}
              {!isLayoutGrid && <SvgButton buttonType={SvgButtonTypes.LAYOUT_LIST} onClick={this.toggleLayout}/>}
              <SvgButton buttonType={SvgButtonTypes.INFO}/>
            </div>
          </div>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              {isLayoutGrid && this.renderDocumentGridView()}
              {!isLayoutGrid && this.renderDocumentListView()}
            </TabPane>
            <TabPane tabId="2">
              {isLayoutGrid && this.renderNetworkGridView()}
              {!isLayoutGrid && this.renderNetworkListView()}
            </TabPane>
          </TabContent>
        </Fragment>
        }
      </div>
    );
  }
}

export default MainPage;

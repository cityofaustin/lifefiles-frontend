import React, {Component, Fragment} from 'react';
import Chevron from '../../common/Chevron';
import {Breadcrumb, BreadcrumbItem, Col, ModalBody, Nav, NavItem, NavLink, Row, TabContent, TabPane} from 'reactstrap';
import AddNewDocument from './AddNewDocument';
import DocumentSummary from './DocumentSummary';
import Document from '../../../models/document/Document';
import Account from '../../../models/Account';
import SvgButton, {SvgButtonTypes} from '../../common/SvgButton';
import './DocumentPage.scss';
import ShareRequest from '../../../models/ShareRequest';
import classNames from 'classnames';

interface DocumentPageProps {
  sortAsc: boolean;
  toggleSort: () => void;
  handleAddNew: () => void;
  searchedDocuments: Document[];
  handleSelectDocument: (document: Document) => void;
  referencedAccount?: Account;
  goBack?: () => void;
  shareRequests: ShareRequest[];
  accounts: Account[];
}

interface DocumentPageState {
  activeTab: string;
}

class DocumentPage extends Component<DocumentPageProps, DocumentPageState> {

  constructor(props: Readonly<DocumentPageProps>) {
    super(props);
    this.state = {
      activeTab: '1'
    };
  }

  toggleTab = (tab: string) => {
    const {activeTab} = {...this.state};
    if (activeTab !== tab) this.setState({activeTab: tab});
  };

  render() {
    const {
      sortAsc, toggleSort, handleAddNew, searchedDocuments,
      handleSelectDocument, referencedAccount, goBack, accounts, shareRequests
    } = {...this.props};
    const {activeTab} = {...this.state};
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
              <SvgButton buttonType={SvgButtonTypes.LAYOUT_GRID}/>
              <SvgButton buttonType={SvgButtonTypes.INFO}/>
            </div>
          </div>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              <div className="sort-section">
                <div className="subtitle">Sort by</div>
                <div className="subtitle subtitle-key" onClick={toggleSort}>NAME</div>
                <Chevron isAscending={sortAsc} onClick={toggleSort}/>
              </div>
              <Row style={{marginRight: '0', minHeight: '480px'}}>
                <Col
                  sm="12"
                  md="6"
                  lg="4"
                  className="document-add-new document-item"
                  onClick={handleAddNew}
                >
                  <AddNewDocument handleAddNew={handleAddNew}/>
                </Col>
                {searchedDocuments.length <= 0 && (
                  <Col
                    sm="12"
                    md="6"
                    lg="4"
                    className="document-summary-container"
                  >
                    <div style={{display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center'}}>
                      <h4>No Documents.</h4>
                    </div>
                  </Col>
                )}
                {searchedDocuments.map((document, idx) => {
                  const sharedAccounts: Account[] = accounts.filter(sharedAccount => {
                    const matchedShareRequest = shareRequests.find(shareRequest => {
                      return shareRequest.shareWithAccountId === sharedAccount.id
                        && shareRequest.documentType === document.type;
                    });
                    if (matchedShareRequest) {
                      return sharedAccount;
                    }
                  });
                  // debugger;
                  return (
                    <Col
                      sm="12"
                      md="6"
                      lg="4"
                      key={idx}
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
            </TabPane>
            <TabPane tabId="2">
              <Row>
                network
              </Row>
            </TabPane>
          </TabContent>
        </Fragment>
        }
      </div>
    );
  }
}

export default DocumentPage;

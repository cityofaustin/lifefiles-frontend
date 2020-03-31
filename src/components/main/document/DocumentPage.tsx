import React, {Component} from 'react';
import Chevron from '../../common/Chevron';
import {Breadcrumb, BreadcrumbItem, Col, Row} from 'reactstrap';
import AddNewDocument from './AddNewDocument';
import DocumentSummary from './DocumentSummary';
import Document from '../../../models/document/Document';
import Account from '../../../models/Account';
import SvgButton, {SvgButtonTypes} from '../../common/SvgButton';
import './DocumentPage.scss';
import ShareRequest from '../../../models/ShareRequest';

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

class DocumentPage extends Component<DocumentPageProps> {
  render() {
    const {sortAsc, toggleSort, handleAddNew, searchedDocuments,
      handleSelectDocument, referencedAccount, goBack, accounts, shareRequests} = {...this.props};
    return (
      <div className="main-content">
        { referencedAccount &&
        <Breadcrumb>
          <BreadcrumbItem className="breadcrumb-link" onClick={goBack}>My Clients</BreadcrumbItem>
          <BreadcrumbItem active>{referencedAccount?.username}</BreadcrumbItem>
        </Breadcrumb>
        }
        { !referencedAccount &&
          <div className="document-header">
            <div className="document-tabs">
              <div className="document-tab tab-active">My Documents</div>
              <div className="document-tab">My Network</div>
            </div>
            <div className="document-toolbar">
              <SvgButton buttonType={SvgButtonTypes.LAYOUT_GRID} />
              <SvgButton buttonType={SvgButtonTypes.INFO} />
            </div>
          </div>
        }
        <div className="sort-section">
          <div className="subtitle">Sort by</div>
          <div className="subtitle subtitle-key" onClick={toggleSort}>NAME </div>
          <Chevron isAscending={sortAsc} onClick={toggleSort} />
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
              if(matchedShareRequest) {
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
      </div>
    );
  }
}

export default DocumentPage;

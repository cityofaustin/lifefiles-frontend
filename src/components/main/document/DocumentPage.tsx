import React, {Component} from 'react';
import Chevron from '../../common/Chevron';
import {Breadcrumb, BreadcrumbItem, Col, Row} from 'reactstrap';
import AddNewDocument from './AddNewDocument';
import DocumentSummary from './DocumentSummary';
import Document from '../../../models/Document';
import Account from '../../../models/Account';
import SvgButton from '../../common/SvgButton';

interface DocumentPageProps {
  sortAsc: boolean;
  toggleSort: () => void;
  handleAddNew: () => void;
  searchedDocuments: Document[];
  handleSelectDocument: (document: Document) => void;
  referencedAccount?: Account;
  goBack?: () => void;
}

class DocumentPage extends Component<DocumentPageProps> {
  render() {
    const {sortAsc, toggleSort, handleAddNew, searchedDocuments,
      handleSelectDocument, referencedAccount, goBack} = {...this.props};
    return (
      <div className="main-content">
        { referencedAccount &&
        <Breadcrumb>
          <BreadcrumbItem className="breadcrumb-link" onClick={goBack}>My Clients</BreadcrumbItem>
          <BreadcrumbItem active>{referencedAccount?.username}</BreadcrumbItem>
        </Breadcrumb>
        }
        { !referencedAccount &&
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div className="big-title">My Documents</div>
            <SvgButton />
          </div>
        }
        <div className="subtitle">Sort by <span style={{cursor: 'pointer'}} onClick={toggleSort}>NAME <Chevron
          isAscending={sortAsc}/></span></div>
        <Row>
          <Col
            sm="12"
            md="6"
            lg="4"
            className="document-add-new"
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
                  onClick={() => handleSelectDocument(document)}>
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
}

export default DocumentPage;

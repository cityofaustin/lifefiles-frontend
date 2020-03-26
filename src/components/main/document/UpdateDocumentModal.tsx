import React, {ChangeEvent, Component, Fragment} from 'react';
import {
  Button,
  Card, CardTitle,
  Col, FormGroup, Input, Label, ListGroup, ListGroupItem,
  Modal,
  ModalBody, ModalFooter,
  ModalHeader, Nav, NavItem, NavLink, Row, TabContent, TabPane
} from 'reactstrap';
import classNames from 'classnames';
import Document from '../../../models/Document';
import documentImg from '../../../img/document.svg';
import './UpdateDocumentModal.scss';
import DocumentService from '../../../services/DocumentService';
import {ReactComponent as DeleteSvg} from '../../../img/delete.svg';
// import crossImg from '../../../img/cross.svg';
import {ReactComponent as EditDocSvg} from '../../../img/edit-doc.svg';
import {ReactComponent as CrossSvg} from '../../../img/cross2.svg';


interface UpdateDocumentModalProps {
  showModal: boolean;
  toggleModal: () => void;
  document?: Document;
  handleDeleteDocument: (document: Document) => Promise<void>;
  pendingShareRequests: string[];
}

interface UpdateDocumentModalState {
  activeTab: string;
  showConfirmDeleteSection: boolean;
  hasConfirmedDelete: boolean;
  deleteConfirmInput: string;
}

class UpdateDocumentModal extends Component<UpdateDocumentModalProps, UpdateDocumentModalState> {
  constructor(props: Readonly<UpdateDocumentModalProps>) {
    super(props);

    this.state = {
      activeTab: '1',
      showConfirmDeleteSection: false,
      hasConfirmedDelete: false,
      deleteConfirmInput: ''
    };
  }

  toggleTab = (tab: string) => {
    const {activeTab} = {...this.state};
    if (activeTab !== tab) this.setState({activeTab: tab, showConfirmDeleteSection: false});
  };

  handleDeleteDocument = async (document: Document) => {
    const {handleDeleteDocument} = {...this.props};
    await handleDeleteDocument(document);
  };

  handleDeleteConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    let hasConfirmedDelete = false;
    if (value === 'DELETE') {
      hasConfirmedDelete = true;
    }
    this.setState({deleteConfirmInput: value, hasConfirmedDelete});
  };

  confirmDelete = () => {
    this.setState({activeTab: '0', showConfirmDeleteSection: true});
  };

  toggleModal = () => {
    // clear state
    const {toggleModal} = {...this.props};
    this.setState({
      activeTab: '1',
      showConfirmDeleteSection: false,
      hasConfirmedDelete: false,
      deleteConfirmInput: ''
    });
    toggleModal();
  };

  render() {
    const {showModal, document, pendingShareRequests} = {...this.props};
    const {activeTab, showConfirmDeleteSection, hasConfirmedDelete, deleteConfirmInput} = {...this.state};
    const closeBtn = (<div className="modal-close" onClick={this.toggleModal}><CrossSvg/></div>);
    return (
      <Modal
        isOpen={showModal}
        toggle={this.toggleModal}
        backdrop={'static'}
        size={'xl'}
        className="update-doc-modal"
      >
        <ModalHeader toggle={this.toggleModal} close={closeBtn}>
          <EditDocSvg style={{marginLeft: '10.6px', marginRight: '30.9px'}}/>
          {document?.type}
        </ModalHeader>
        {/*<ModalHeader toggle={toggleModal} close={closeBtn}>*/}
        {/*  <img src={`${window.location.origin}/${documentImg}`} alt="Add New"/>*/}
        {/*  <span className="update-doc-modal-title">{document?.type}</span>*/}
        {/*</ModalHeader>*/}
        <ModalBody className="update-doc-container">
          <div className={classNames({'upload-doc-delete-container': true, active: showConfirmDeleteSection})}>
            <DeleteSvg
              className="delete-svg"
              style={{cursor: 'pointer', fill: 'white'}}
              onClick={() => this.confirmDelete()}
            />
          </div>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classNames({active: activeTab === '1'})}
                onClick={() => {
                  this.toggleTab('1');
                }}
              >
                Preview
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classNames({active: activeTab === '2'})}
                onClick={() => {
                  this.toggleTab('2');
                }}
              >
                Replace
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classNames({active: activeTab === '3'})}
                onClick={() => {
                  this.toggleTab('3');
                }}
              >
                Share
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={activeTab}>
            <TabPane tabId="1">
              <Row>
                <Col sm="12" className="update-doc-img-container">
                  {/*<h4>Tab 1 Contents</h4>*/}
                  {document &&
                  <img className="document-summary-image"
                       src={DocumentService.getDocumentURL(document!.url)}
                       alt="doc missing"
                  />
                  }
                </Col>
              </Row>
            </TabPane>
            <TabPane tabId="2">
              <div className="update-doc-tab-spacing">
                <Row>
                  <Col sm="12">
                    <h4>Replace Feature Coming Soon...</h4>
                  </Col>
                </Row>
              </div>
            </TabPane>
            <TabPane tabId="3">
              <div className="update-doc-tab-spacing">
                <Row>
                  <Col sm="12">
                    <Card body>
                      <CardTitle>Pending Share Requests</CardTitle>
                      <div>
                        {pendingShareRequests.length < 1 && (
                          <div>No pending shares.</div>
                        )}
                        <ListGroup>
                          {pendingShareRequests!.map((pendingShareRequest, idx) => {
                            return (
                              <ListGroupItem key={idx} className="justify-content-between">
                                <div style={{display: 'inline-block', wordBreak: 'break-all'}}>
                                  {`Account ID: ${pendingShareRequest}`}
                                </div>
                                <Button color="success" onClick={() => {
                                }}>Approve</Button>
                                <Button close/>
                              </ListGroupItem>
                            );
                          })}
                        </ListGroup>
                      </div>
                    </Card>
                  </Col>
                  <Col sm="12">
                    <Card body>
                      <CardTitle>Approved Shares</CardTitle>
                      {document &&
                      <div>
                        {document!.sharedWithAccountIds.length < 1 && (
                          <div>No approved shares.</div>
                        )}
                        <ListGroup>
                          {document!.sharedWithAccountIds.map((sharedWithAccountId, idx) => {
                            return (
                              <ListGroupItem key={idx} className="justify-content-between">
                                {/*<img className="shared-with-image-single"*/}
                                {/*     src={sharedWithItem.profileimgUrl}*/}
                                {/*     alt={`sharedWithItem${idx}`}*/}
                                {/*/>*/}
                                <div style={{display: 'inline-block', wordBreak: 'break-all'}}>
                                  {`Account ID: ${sharedWithAccountId}`}
                                </div>
                                <Button close/>
                              </ListGroupItem>
                            );
                          })}
                        </ListGroup>
                      </div>
                      }
                    </Card>
                  </Col>
                </Row>
              </div>
            </TabPane>
          </TabContent>
          {showConfirmDeleteSection && (
            <div className="confirm-delete-container">
              <div className="delete-prompt">Are you sure you want to permanently delete this file?</div>
              <div className="delete-section">
                <div className="delete-image-container">
                  {document &&
                  <img className="delete-image"
                       src={DocumentService.getDocumentURL(document!.url)}
                       alt="doc missing"
                  />
                  }
                </div>
                <div className="delete-info">
                  <div className="delete-info-prompt">
                    <p>Deleting this file will <span className="delete-info-danger">permanently revoke access to all users.</span>
                    </p>
                    <p>Are you sure?</p>
                  </div>
                  <FormGroup>
                    <Label for="documentDelete" className="other-prompt">Type DELETE to confirm</Label>
                    <Input type="text" name="documentDelete" id="documentDelete" value={deleteConfirmInput}
                           onChange={this.handleDeleteConfirmChange} placeholder="" autocomplete="off"
                    />
                    <span>Please enter the text exactly as displayed to confirm</span>
                  </FormGroup>
                </div>
              </div>
              <div className="delete-buttons">
                <Button
                  className="margin-wide"
                  outline
                  color="secondary"
                  onClick={this.toggleModal}>Cancel</Button>{' '}
                <Button
                  className="margin-wide"
                  color="danger"
                  onClick={() => this.handleDeleteDocument(document!)} disabled={!hasConfirmedDelete}>Delete</Button>
              </div>
            </div>
          )}
        </ModalBody>
        {!showConfirmDeleteSection && (
          <ModalFooter>
            <Button color="primary" onClick={this.toggleModal} disabled>Save</Button>
          </ModalFooter>
        )}
      </Modal>
    );
  }
}

export default UpdateDocumentModal;

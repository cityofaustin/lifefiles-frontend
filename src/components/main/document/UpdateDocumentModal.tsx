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
import './UpdateDocumentModal.scss';
import DocumentService from '../../../services/DocumentService';
import {ReactComponent as DeleteSvg} from '../../../img/delete.svg';
import {ReactComponent as EditDocSvg} from '../../../img/edit-doc.svg';
import {ReactComponent as CrossSvg} from '../../../img/cross2.svg';
import FileUploader from '../../common/FileUploader';
import {ReactComponent as DownloadBtnSvg} from '../../../img/download-btn.svg';
import {ReactComponent as FlipDocBtnSvg} from '../../../img/flip-doc-btn.svg';
import {ReactComponent as PrintBtnSvg} from '../../../img/print-btn.svg';
import {ReactComponent as ZoomBtnSvg} from '../../../img/zoom-btn.svg';
import Lightbox from 'react-image-lightbox';

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
  isZoomed: boolean;
}

class UpdateDocumentModal extends Component<UpdateDocumentModalProps, UpdateDocumentModalState> {
  constructor(props: Readonly<UpdateDocumentModalProps>) {
    super(props);

    this.state = {
      activeTab: '1',
      showConfirmDeleteSection: false,
      hasConfirmedDelete: false,
      deleteConfirmInput: '',
      isZoomed: false
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
      deleteConfirmInput: '',
      isZoomed: false
    });
    toggleModal();
  };

  setFile = () => {};

  printImg(url: string) {
    const win = window.open('');
    win?.document.write('<img src="' + url + '" onload="window.print();window.close()" />');
    win?.focus();
  }

  render() {
    const {showModal, document, pendingShareRequests} = {...this.props};
    const {activeTab, showConfirmDeleteSection, hasConfirmedDelete, deleteConfirmInput, isZoomed} = {...this.state};
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
                {document &&
                <Col sm="12" className="preview-container">
                  <div className="preview-img-container">
                    <div className="img-tools">
                      <FlipDocBtnSvg className="pointer" />
                    </div>
                    <div className="img-container">
                      <img className="doc-image"
                           src={DocumentService.getDocumentURL(document!.url)}
                           alt="doc missing"
                      />
                    </div>
                    <div className="img-access">
                      <a href={DocumentService.getDocumentURL(document!.url)} download target="_blank">
                        <DownloadBtnSvg className="pointer" />
                      </a>
                      <PrintBtnSvg className="pointer" onClick={() => this.printImg(DocumentService.getDocumentURL(document!.url))} />
                      <ZoomBtnSvg className="pointer" onClick={() => this.setState({ isZoomed: true })} />
                    </div>
                  </div>
                  <div className="preview-info">
                    <div className="preview-info-item">
                      <div className="attr">File</div>
                      <div className="attr-value">{document!.type}</div>
                    </div>
                    <div className="preview-info-item">
                      <div className="attr">Upload date</div>
                      <div className="attr-value">-</div>
                    </div>
                    <div className="preview-info-item">
                      <div className="attr">Uploaded by</div>
                      <div className="attr-value">{document!.uploadedBy}</div>
                    </div>
                    <div className="preview-info-item">
                      <div className="attr">Valid Until</div>
                      <div className="attr-value">-</div>
                    </div>
                  </div>
                </Col>
                }
              </Row>
            </TabPane>
            <TabPane tabId="2">
              <div className="update-doc-tab-spacing">
                <Row>
                  <Col sm="12">
                    <FileUploader setFile={this.setFile} />
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
                           onChange={this.handleDeleteConfirmChange} placeholder="" autoComplete="off"
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
          {isZoomed && (
            <Lightbox
              // reactModalStyle={{zIndex: '1060'}}
              mainSrc={DocumentService.getDocumentURL(document!.url)}
              onCloseRequest={() => this.setState({ isZoomed: false })}
            />
          )}
        </ModalBody>
        {activeTab === '2' && (
          <ModalFooter className="modal-footer-center">
            <Button color="primary" onClick={this.toggleModal} disabled>Save</Button>
            <span>(TBD)</span>
          </ModalFooter>
        )}
      </Modal>
    );
  }
}

export default UpdateDocumentModal;

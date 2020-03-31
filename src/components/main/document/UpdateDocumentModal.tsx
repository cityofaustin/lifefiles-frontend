import React, {ChangeEvent, Component, Fragment} from 'react';
import {
  Button,
  Col, FormGroup, Input, Label,
  Modal,
  ModalBody, ModalFooter,
  ModalHeader, Nav, NavItem, NavLink, Row, TabContent, TabPane
} from 'reactstrap';
import classNames from 'classnames';
import Document from '../../../models/document/Document';
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
import Select from 'react-select/base';
import Account from '../../../models/Account';
import AccountService from '../../../services/AccountService';
import AccountImpl from '../../../models/AccountImpl';
import {roleDisplayMap} from '../../../models/Role';
import {addMonths, format} from 'date-fns';
import Checkbox from '../../common/Checkbox';
import ShareRequest from '../../../models/ShareRequest';
import ShareRequestService from '../../../services/ShareRequestService';
import UpdateDocumentRequest from '../../../models/document/UpdateDocumentRequest';

interface UpdateDocumentModalProps {
  showModal: boolean;
  toggleModal: () => void;
  document?: Document;
  handleDeleteDocument: (document: Document) => Promise<void>;
  shareRequests: ShareRequest[];
  accounts: Account[];
  addShareRequest: (request: ShareRequest) => void;
  removeShareRequest: (request: ShareRequest) => void;
  myAccount: Account;
  handleUpdateDocument: (request: UpdateDocumentRequest) => void;
}

interface UpdateDocumentModalState {
  activeTab: string;
  showConfirmDeleteSection: boolean;
  hasConfirmedDelete: boolean;
  deleteConfirmInput: string;
  isZoomed: boolean;
  selectedContact?: Account;
  showConfirmShare: boolean;
  newFile?: File;
}

class UpdateDocumentModal extends Component<UpdateDocumentModalProps, UpdateDocumentModalState> {
  constructor(props: Readonly<UpdateDocumentModalProps>) {
    super(props);

    this.state = {
      activeTab: '1',
      showConfirmDeleteSection: false,
      hasConfirmedDelete: false,
      deleteConfirmInput: '',
      isZoomed: false,
      showConfirmShare: false
    };
  }

  toggleModal = () => {
    // clear state
    const {toggleModal} = {...this.props};
    this.setState({
      activeTab: '1',
      showConfirmDeleteSection: false,
      hasConfirmedDelete: false,
      deleteConfirmInput: '',
      isZoomed: false,
      selectedContact: undefined,
      showConfirmShare: false
    });
    toggleModal();
  };

  handleUpdateDocument = () => {
    const {newFile} = {...this.state};
    // clear state
    const {handleUpdateDocument, document} = {...this.props};
    handleUpdateDocument({
      id: document!._id!,
      img: newFile,
      validUntilDate: undefined // TODO add expired at form somewhere
    });
    this.setState({
      activeTab: '1',
      showConfirmDeleteSection: false,
      hasConfirmedDelete: false,
      deleteConfirmInput: '',
      isZoomed: false,
      selectedContact: undefined,
      showConfirmShare: false
    });
  };

  handleShareDocWithContact = async () => {
    const {document, addShareRequest, myAccount} = {...this.props};
    const {selectedContact} = {...this.state};
    // then add share and approve it api call
    let newShareRequest = await ShareRequestService.addShareRequest(document?.type!, myAccount.id, selectedContact?.id!);
    newShareRequest = await ShareRequestService.approveShareRequest(newShareRequest._id);
    addShareRequest(newShareRequest);
    this.setState({selectedContact, showConfirmShare: false});
  };

  handleShareDocCheck = () => {
    const {removeShareRequest} = {...this.props};
    const {selectedContact} = {...this.state};
    let showConfirmShare = false;
    if(this.getDocumentSharedWithContact()) {
      // TODO then just delete the share api call
      removeShareRequest(this.getDocumentSharedWithContact()!);
    } else {
      // show prompt
      showConfirmShare = true;
    }
    this.setState({selectedContact, showConfirmShare});
  };

  toggleConfirmShare = () => {
    const {showConfirmShare} = {...this.state};
    this.setState({showConfirmShare: !showConfirmShare});
  };

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

  setFile = (newFile: File) => {
    this.setState({newFile});
  };

  printImg(url: string) {
    const win = window.open('');
    win?.document.write('<img src="' + url + '" onload="window.print();window.close()" />');
    win?.focus();
  }

  getDocumentSharedWithContact = () => {
    const {selectedContact} = {...this.state};
    const {shareRequests} = {...this.props};
    const shareRequestMatch = shareRequests.find(shareRequest => selectedContact?.id === shareRequest.shareWithAccountId);
    if(shareRequestMatch) {
      return shareRequestMatch;
    }
    return undefined;
  };

  render() {
    const {showModal, document, accounts} = {...this.props};
    const {activeTab, showConfirmDeleteSection, hasConfirmedDelete,
      deleteConfirmInput, isZoomed, selectedContact, showConfirmShare, newFile} = {...this.state};
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
                      <FlipDocBtnSvg className="pointer"/>
                    </div>
                    <div className="img-container">
                      <img className="doc-image"
                           src={DocumentService.getDocumentURL(document!.url)}
                           alt="doc missing"
                      />
                    </div>
                    <div className="img-access">
                      <a href={DocumentService.getDocumentURL(document!.url)} download target="_blank">
                        <DownloadBtnSvg className="pointer"/>
                      </a>
                      <PrintBtnSvg className="pointer"
                                   onClick={() => this.printImg(DocumentService.getDocumentURL(document!.url))}/>
                      <ZoomBtnSvg className="pointer" onClick={() => this.setState({isZoomed: true})}/>
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
                      <div className="attr-value">N/A</div>
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
                    <FileUploader setFile={this.setFile}/>
                  </Col>
                </Row>
              </div>
            </TabPane>
            <TabPane tabId="3">
              <div>
                <div className="share-container">
                  <div className={classNames({'contact-details': true, active: selectedContact})}>
                    {selectedContact && (
                      <Fragment>
                        <img className="contact-detail-image"
                             src={AccountService.getProfileURL(selectedContact.profileImageUrl!)}
                             alt="Profile"/>
                        <div className="contact-detail-info">
                          <div className="info-item">
                            <div className="item-attr">Name</div>
                            <div className="item-value">
                              {AccountImpl.getFullName(selectedContact?.firstName, selectedContact?.lastName)}
                            </div>
                          </div>
                          <div className="info-item">
                            <div className="item-attr">Organization</div>
                            <div className="item-value">{selectedContact?.organization || '-'}</div>
                          </div>
                          <div className="info-item">
                            <div className="item-attr">Role</div>
                            <div className="item-value">{roleDisplayMap[selectedContact.role]}</div>
                          </div>
                          <div className="info-item">
                            <div className="item-attr">Phone</div>
                            <div className="item-value">{selectedContact?.phoneNumber || '-'}</div>
                          </div>
                          <div className="info-item">
                            <div className="item-attr">E-mail</div>
                            <div className="item-value">{selectedContact.email}</div>
                          </div>
                        </div>
                        <div className="contact-detail-share-doc">
                          <div className="prompt">
                            Share Social Security Card?
                          </div>
                          <Checkbox isChecked={!!this.getDocumentSharedWithContact()} onClick={this.handleShareDocCheck}/>
                          <div className="share-status">
                            This file is NOT currently shared with {selectedContact.username}
                          </div>
                        </div>
                      </Fragment>
                    )}
                  </div>

                  <div className="right-panel">
                    <div className="contact-list">
                      <div className="title">contacts</div>
                      <div className="subtitle">Select a contact to share this document with</div>
                      <div className="contact-grid">
                        {accounts.map(account => (
                          <div key={account.id}
                               className={classNames({
                                   contact: true,
                                   active: (selectedContact && selectedContact.id === account.id)
                                 }
                               )}
                               onClick={() => this.setState({selectedContact: account})}>
                            <img className="contact-image"
                                 src={AccountService.getProfileURL(account.profileImageUrl!)}
                                 alt="Profile"/>
                            <div className="contact-name">{account.username}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="share-time-limit">
                      <div className="share-time-disabled-overlay"/>
                      <div className="title">time limit</div>
                      <div className="subtitle">Specify how long this document will be shared</div>
                      <div className="share-for-container">
                        <div className="share-for-form-group">
                          <label>Share for...</label>
                          <div style={{width: '224px'}}>
                            <Select/>
                          </div>
                        </div>
                        <div className="date-container">
                          <div className="date-indicator">From</div>
                          <div className="date-value">{format(new Date(), 'MMMM d, y')}</div>
                        </div>
                        <div className="date-container">
                          <div className="date-indicator">To</div>
                          <div className="date-value">{format(addMonths(new Date(), 1), 'MMMM d, y')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
              onCloseRequest={() => this.setState({isZoomed: false})}
            />
          )}
          <Modal
            toggle={this.toggleConfirmShare}
            size={'lg'}
            isOpen={showConfirmShare}
          >
            {/*<ModalHeader>Nested Modal title</ModalHeader>*/}
            <ModalBody>
              { document && (
                <div className="confirm-share">
                  <div className="confirm-share-prompt">
                    You're about to share<br />{(document?.type)?.toUpperCase()} with{' '}
                    {AccountImpl.getFullName(selectedContact?.firstName, selectedContact?.lastName).toUpperCase()}.
                  </div>
                  <img className="share-doc-img"
                       src={DocumentService.getDocumentURL(document!.url)}
                       alt="doc missing"
                  />
                  <div className="confirm-prompt">
                    Are you sure you want to continue?
                  </div>
                  <div className="confirm-buttons">
                    <Button outline color="secondary" onClick={this.toggleConfirmShare}>No, take me back</Button>
                    <Button color="primary" onClick={this.handleShareDocWithContact}>Yes, share access</Button>
                  </div>
                </div>
              )}
            </ModalBody>
          </Modal>
        </ModalBody>
        {activeTab === '2' && (
          <ModalFooter className="modal-footer-center">
            <Button color="primary" onClick={this.handleUpdateDocument} disabled={!newFile}>Save</Button>
          </ModalFooter>
        )}
      </Modal>
    );
  }
}

export default UpdateDocumentModal;

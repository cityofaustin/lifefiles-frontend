import React, { Component, Fragment } from 'react';
import Chevron from '../common/Chevron';
import {
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
import './DocumentPage.scss';
import ShareRequest, {
  ShareRequestPermission,
} from '../../models/ShareRequest';
import classNames from 'classnames';
import AccountSummary from './account/AccountSummary';
import SortArrow from '../common/SortArrow';
import ImageWithStatus, { ImageViewTypes } from '../common/ImageWithStatus';
import DocumentService from '../../services/DocumentService';
import SharedWith from './document/SharedWith';
import StringUtil from '../../util/StringUtil';
import AccountImpl from '../../models/AccountImpl';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
// import AccountService from '../../services/AccountService';
import UserPreferenceUtil from '../../util/UserPreferenceUtil';

import SvgButton, { SvgButtonTypes } from '../common/SvgButton';
import { ReactComponent as NewDoc } from '../../img/new-document.svg';
import { ReactComponent as FabAdd } from '../../img/fab-add.svg';
import { ReactComponent as ChevronLeft } from '../../img/chevron-left.svg';
import { ReactComponent as ChevronRight } from '../../img/chevron-right.svg';
import { ReactComponent as NotSharedDoc } from '../../img/not-shared-doc.svg';
import { ReactComponent as NewContactSvg } from '../../img/new-contact.svg';
import Badge from '../common/Badge';
import AddContactModal from './account/AddContactModal';
import HelperContact from '../../models/HelperContact';
import { HelperContactRequest } from '../../services/HelperContactService';
import ProfileImage, { ProfileImageSizeEnum } from '../common/ProfileImage';
import { CoreFeatureEnum } from '../../models/admin/CoreFeature';
import Role from '../../models/Role';
import { ReactComponent as StampSvg } from '../../img/stamp.svg';

interface DocumentPageProps {
  sortAsc: boolean;
  toggleSort: () => void;
  handleAddNew: () => void;
  searchedDocuments: Document[];
  handleSelectDocument: (document: Document, goToClaim?: boolean) => void;
  referencedAccount?: Account;
  goBack?: () => void;
  shareRequests: ShareRequest[];
  accounts: Account[];
  addHelperContact: (req: HelperContactRequest) => Promise<void>;
  helperContacts: HelperContact[];
  searchedHelperContacts: HelperContact[];
  activeTab: string;
  setActiveTab: (activeTab: string) => void;
  myAccount: Account;
  addShareRequest: (request: ShareRequest) => void;
  removeShareRequest: (request: ShareRequest) => void;
  privateEncryptionKey?: string;
  handleClientSelected: (clientSelected: Account) => void;
  coreFeatures: string[];
  viewFeatures: string[];
  removeHelperContact: (account: Account) => void;
}

interface MainPageState {
  isLayoutGrid: boolean;
  showAddContactModal: boolean;
}

class DocumentPage extends Component<DocumentPageProps, MainPageState> {
  static defaultProps = {
    handleClientSelected: () => {},
  };

  constructor(props: Readonly<DocumentPageProps>) {
    super(props);
    this.state = {
      isLayoutGrid: UserPreferenceUtil.getIsLayoutGrid(),
      showAddContactModal: false,
    };
  }

  async componentDidUpdate(prevProps: Readonly<DocumentPageProps>) {
    if (this.props.referencedAccount) {
      if (
        prevProps.referencedAccount === undefined ||
        (this.props.referencedAccount &&
          prevProps.referencedAccount &&
          this.props.referencedAccount.id !== prevProps.referencedAccount.id)
      ) {
        // if there is a client that is selected that is new, then refetch the documents
        this.props.handleClientSelected(this.props.referencedAccount);
      }
    }
  }

  getSharedAccounts = (
    document: Document,
    searchedHelperContacts: HelperContact[],
    shareRequests: ShareRequest[]
  ): Account[] => {
    return searchedHelperContacts
      .filter((h: HelperContact) => {
        const matchedShareRequest = shareRequests.find((shareRequest) => {
          return (
            shareRequest.shareWithAccountId === h.helperAccount.id &&
            shareRequest.documentType === document.type &&
            shareRequest.approved
          );
        });
        if (matchedShareRequest) {
          return h;
        }
      })
      .map((s) => s.helperAccount);
  };

  toggleLayout = () => {
    const { isLayoutGrid } = { ...this.state };
    UserPreferenceUtil.setIsLayoutGrid(!isLayoutGrid);
    this.setState({ isLayoutGrid: !isLayoutGrid });
  };

  toggleTab = (tab: string) => {
    const { activeTab, setActiveTab } = { ...this.props };
    if (activeTab !== tab) setActiveTab(tab);
  };

  canAddDocs = () => {
    const { myAccount, coreFeatures, helperContacts, referencedAccount } = {
      ...this.props,
    };
    const referencedContact = referencedAccount
      ? helperContacts.find(
          (hc) => hc.ownerAccount.username === referencedAccount!.username
        )
      : undefined;
    return (
      myAccount.role === Role.owner ||
      (coreFeatures.indexOf(CoreFeatureEnum.UPLOAD_DOC_BEHALF_OWNER) > -1 &&
        referencedContact &&
        referencedContact.canAddNewDocuments)
    );
  };

  isAllowedShareRequestPermission = (
    srp: ShareRequestPermission,
    document: Document
  ) => {
    const {
      myAccount,
      // viewFeature, // NOTE: should handle admin view feature too.
      shareRequests,
    } = { ...this.props };
    let isAllowed = true;
    if (myAccount.role === Role.helper) {
      try {
        if(document.type) {
          const shareRequest = shareRequests.find(
            (sr) => sr.documentType === document?.type
          );
          isAllowed = shareRequest ? shareRequest[srp] : false;
        }
      } catch (err) {
        console.error('Unabled to get share request');
      }
    }
    return isAllowed;
  };

  renderGridSort() {
    const { isLayoutGrid } = { ...this.state };
    const { sortAsc, toggleSort, activeTab } = { ...this.props };
    return (
      <Fragment>
        {isLayoutGrid && (
          <div className="sort-section">
            <div className="subtitle">Sort by</div>
            <div className="subtitle subtitle-key" onClick={toggleSort}>
              NAME
            </div>
            <Chevron isAscending={sortAsc} onClick={toggleSort} />
          </div>
        )}
        <div className="sort-section-sm">
          <div className="sort-container" onClick={toggleSort}>
            <SortArrow isAscending={sortAsc} />
            <div className="subtitle subtitle-key">NAME</div>
          </div>
          {activeTab === '1' && isLayoutGrid && (
            <SvgButton
              buttonType={SvgButtonTypes.LAYOUT_GRID_MOBILE}
              onClick={this.toggleLayout}
            />
          )}
          {activeTab === '1' && !isLayoutGrid && (
            <SvgButton
              buttonType={SvgButtonTypes.LAYOUT_LIST_MOBILE}
              onClick={this.toggleLayout}
            />
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
      searchedHelperContacts,
      shareRequests,
      privateEncryptionKey,
      myAccount,
    } = { ...this.props };
    return (
      <Fragment>
        {this.renderGridSort()}
        <Row style={{ marginRight: '0', minHeight: '480px' }}>
          {this.canAddDocs() && (
            <Col
              sm="12"
              md="6"
              lg="4"
              className="document-add-new document-item"
              onClick={handleAddNew}
            >
              <AddNewDocument handleAddNew={handleAddNew} />
            </Col>
          )}

          {searchedDocuments.length <= 0 && (
            <Col sm="12" md="6" lg="4" className="document-summary-container">
              <div
                style={{
                  display: 'flex',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <h4>No Documents.</h4>
              </div>
            </Col>
          )}
          {searchedDocuments.map((document, idx) => {
            const sharedAccounts: Account[] = this.getSharedAccounts(
              document,
              searchedHelperContacts,
              shareRequests
            );
            const matchedShareRequests: ShareRequest[] = shareRequests.filter(
              (shareRequest) => shareRequest.documentType === document.type
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
                  {document.thumbnailUrl !== '' && (
                    <DocumentSummary
                      myAccount={myAccount}
                      document={document}
                      documentIdx={idx++}
                      sharedAccounts={sharedAccounts}
                      privateEncryptionKey={privateEncryptionKey}
                      shareRequests={matchedShareRequests}
                      handleSelectDocument={handleSelectDocument}
                    />
                  )}
                  {document.thumbnailUrl === '' && (
                    <div className="not-shared-doc-container">
                      <NotSharedDoc />
                      <div className="title">{document.type}</div>
                      <div className="subtitle">not shared</div>
                      {document.sharedWithAccountIds.length === 0 && (
                        <div className="request-action">
                          <button className="button btn-rounder">
                            Request Access
                          </button>
                        </div>
                      )}
                      {document.sharedWithAccountIds.length > 0 && (
                        <div className="caption">Access Pending</div>
                      )}
                    </div>
                  )}
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
      searchedHelperContacts,
      shareRequests,
      myAccount,
      privateEncryptionKey,
      referencedAccount,
    } = { ...this.props };
    return (
      <div>
        {this.renderGridSort()}
        <table className="doc-table">
          <thead>
            <tr>
              <th>
                <div className="header-cell" onClick={toggleSort}>
                  <SortArrow isAscending={sortAsc} />
                  <div>Name</div>
                </div>
              </th>
              <th>{referencedAccount ? 'Shared' : 'Shared With'}</th>
              <th>Updated</th>
              <th>Valid Until</th>
              <th>Notarized</th>
            </tr>
          </thead>
          <tbody>
            {this.canAddDocs() && (
              <tr className="add-new-tr" onClick={handleAddNew}>
                <td>
                  <div className="add-new">
                    <div>
                      <NewDoc />
                    </div>
                    <div>Add new</div>
                  </div>
                </td>
                <td />
                <td />
                <td />
                <td />
              </tr>
            )}
            {searchedDocuments.map((document, idx) => {
              const sharedAccounts: Account[] = this.getSharedAccounts(
                document,
                searchedHelperContacts,
                shareRequests
              );
              const accountProfileURL = AccountImpl.getProfileURLByIdAndList(
                [
                  myAccount,
                  ...searchedHelperContacts.map((s) => s.helperAccount),
                ],
                document.uploadedBy
              );
              const matchedAccount = AccountImpl.getAccountByIdAndList(
                [
                  myAccount,
                  ...searchedHelperContacts.map((s) => s.helperAccount),
                ],
                document.uploadedBy
              );
              return (
                <tr
                  key={document.type}
                  onClick={() => handleSelectDocument(document, false)}
                >
                  <td>
                    <div className="doc-name-cell">
                      {document.thumbnailUrl !== '' &&
                        this.isAllowedShareRequestPermission(
                          ShareRequestPermission.CAN_VIEW,
                          document
                        ) && (
                          <div className="image-container">
                            <ImageWithStatus
                              imageViewType={ImageViewTypes.LIST_LAYOUT}
                              imageUrl={DocumentService.getDocumentURL(
                                document.thumbnailUrl
                              )}
                              encrypted
                              privateEncryptionKey={privateEncryptionKey}
                            />
                            {this.containsBadge(document.type) && (
                              <div className="badge-container">
                                <Badge />
                              </div>
                            )}
                          </div>
                        )}
                      {!this.isAllowedShareRequestPermission(
                          ShareRequestPermission.CAN_VIEW,
                          document
                        ) && <NotSharedDoc />}
                      <div className="doc-info">
                        <div className="doc-type">{document.type}</div>
                        <div className="doc-upd">
                          {document.updatedAt &&
                            format(new Date(document.updatedAt), 'MMM d, y')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="doc-share-cell">
                      {referencedAccount && document.thumbnailUrl !== '' && (
                        <div className="subtitle">shared</div>
                      )}
                      {referencedAccount && document.thumbnailUrl === '' && (
                        <Fragment>
                          {document.sharedWithAccountIds.length === 0 && (
                            <div className="request-action">
                              <button className="button btn-rounder">
                                Request Access
                              </button>
                            </div>
                          )}
                          {document.sharedWithAccountIds.length > 0 && (
                            <div className="caption">Access Pending</div>
                          )}
                        </Fragment>
                      )}
                      {document.claimed !== undefined &&
                        document.claimed === false &&
                        sharedAccounts.length > 0 && (
                          <button
                            className="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectDocument(document, true);
                            }}
                          >
                            Claim
                          </button>
                        )}
                      {document.claimed && sharedAccounts.length > 0 && (
                        <SharedWith sharedAccounts={sharedAccounts} />
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="doc-updated-cell">
                      {accountProfileURL && (
                        <div className="image-container">
                          <img
                            className="profile-image"
                            src={accountProfileURL}
                            alt=""
                          />
                          {document.claimed !== undefined &&
                            document.claimed === false &&
                            sharedAccounts.length > 0 && <Badge />}
                        </div>
                      )}
                      {!accountProfileURL && (
                        <div className="account-circle">
                          {matchedAccount &&
                            StringUtil.getFirstUppercase(
                              matchedAccount!.username
                            )}
                        </div>
                      )}
                      <div>
                        {document.updatedAt &&
                          format(new Date(document.updatedAt), 'MMM d, y')}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="doc-valid-cell">
                      {document.validUntilDate
                        ? format(new Date(document.validUntilDate), 'MMM d, y')
                        : 'N/A'}
                    </div>
                  </td>
                  <td className="notarized">
                    {document.vcJwt && document.vpDocumentDidAddress && (
                      <StampSvg />
                    )}
                  </td>
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
                alignItems: 'center',
              }}
            >
              <h4>No Documents.</h4>
            </div>
          </Col>
        )}
      </div>
    );
  }

  containsBadge(documentType) {
    const { shareRequests } = { ...this.props };
    const pendingShareRequest = shareRequests.find(
      (shareRequest) =>
        shareRequest.approved === false &&
        shareRequest.documentType === documentType
    );
    return pendingShareRequest;
  }

  renderNetworkGridView() {
    const {
      searchedDocuments,
      searchedHelperContacts,
      shareRequests,
      myAccount,
      addShareRequest,
      removeShareRequest,
      privateEncryptionKey,
      accounts,
      removeHelperContact
    } = { ...this.props };
    return (
      <Fragment>
        {this.renderGridSort()}
        <Row className="network-row">
          {/* {searchedAccounts.length <= 0 && (
            <div className="no-network">There are no contacts.</div>
          )} */}
          <Col sm="12" md="6" lg="6" xl="4" className="network-container">
            <div
              className="network-item"
              onClick={() => {
                this.setState({ showAddContactModal: true });
              }}
            >
              <NewContactSvg />
            </div>
          </Col>
          {searchedHelperContacts.map((s) => {
            // NOTE: can't use s.helperAccount._id, it is not the same as the actual account id
            // so needing to join on other accounts
            const helperAccount = accounts.find(
              (a) => a.username === s.helperAccount.username
            );
            const ownerAccount = accounts.find(
              (a) => a.username === s.ownerAccount.username
            );
            const account =
              myAccount.role === Role.owner ? helperAccount : ownerAccount;
            const matchedShareRequests = shareRequests.filter(
              (shareRequest) => {
                return shareRequest.shareWithAccountId === account?.id;
              }
            );
            return (
              <Col
                key={account!.id}
                sm="12"
                md="6"
                lg="6"
                xl="4"
                className="network-container"
              >
                <AccountSummary
                  removeHelperContact={removeHelperContact}
                  account={account!}
                  shareRequests={matchedShareRequests}
                  searchedDocuments={searchedDocuments}
                  myAccount={myAccount}
                  addShareRequest={addShareRequest}
                  removeShareRequest={removeShareRequest}
                  privateEncryptionKey={privateEncryptionKey!}
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

  renderTabContent() {
    const { activeTab } = { ...this.props };
    const { isLayoutGrid } = { ...this.state };

    return (
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          {isLayoutGrid && this.renderDocumentGridView()}
          {!isLayoutGrid && this.renderDocumentListView()}
        </TabPane>
        <TabPane tabId="2">{this.renderNetworkGridView()}</TabPane>
      </TabContent>
    );
  }

  render() {
    const {
      activeTab,
      handleAddNew,
      referencedAccount,
      accounts,
      helperContacts,
      addHelperContact,
      myAccount,
    } = {
      ...this.props,
    };
    const { isLayoutGrid, showAddContactModal } = { ...this.state };

    return (
      <div className="main-content">
        <AddContactModal
          addHelperContact={addHelperContact}
          helperContacts={helperContacts}
          accounts={accounts}
          showModal={showAddContactModal}
          toggleModal={() =>
            this.setState({ showAddContactModal: !showAddContactModal })
          }
        />
        <Fragment>
          {!referencedAccount && this.renderNavSmall()}
          <div className="document-header">
            {!referencedAccount && this.renderNav()}
            {referencedAccount && (
              <Fragment>
                <div className="big-title bt-breadcrumb">
                  <Link to="/helper-login/clients">My Clients</Link>
                  <ChevronRight />
                  <span>
                    {AccountImpl.hasNameSet(referencedAccount) &&
                      AccountImpl.getFullName(
                        referencedAccount.firstName,
                        referencedAccount.lastName
                      )}
                    {!AccountImpl.hasNameSet(referencedAccount) &&
                      referencedAccount.username}
                  </span>
                </div>
              </Fragment>
            )}
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
              {/* <SvgButton buttonType={SvgButtonTypes.INFO} /> */}
            </div>
          </div>

          {!referencedAccount && this.renderTabContent()}
          {referencedAccount && (
            <div className="client-documents">
              <div className="header">
                <div className="client-section">
                  <Link to="/helper-login/clients">
                    <ChevronLeft />
                  </Link>
                  <ProfileImage
                    account={referencedAccount}
                    size={ProfileImageSizeEnum.SMALL}
                  />
                  {/* <img
                    src={AccountService.getProfileURL(
                      referencedAccount.profileImageUrl!
                    )}
                    alt=""
                  /> */}
                  <span>
                    {AccountImpl.hasNameSet(referencedAccount) &&
                      AccountImpl.getFullName(
                        referencedAccount.firstName,
                        referencedAccount.lastName
                      )}
                    {!AccountImpl.hasNameSet(referencedAccount) &&
                      referencedAccount.username}
                  </span>
                </div>
                <div className="permission-section">
                  <span className="title">permissions</span>
                </div>
              </div>
              <div className="documents-section">{this.renderTabContent()}</div>
            </div>
          )}

          {activeTab === '1' && this.canAddDocs() && (
            <FabAdd className="fab-add" onClick={handleAddNew} />
          )}
        </Fragment>
      </div>
    );
  }
}

export default DocumentPage;

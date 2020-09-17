import React, { Component } from 'react';
import { Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import {
  ReactComponent as CrossSvg,
  ReactComponent,
} from '../../../img/cross3.svg';
import { ReactComponent as ContactSvg } from '../../../img/contact-add.svg';
import { ReactComponent as LoginSvg } from '../../../img/login1.svg';
import { ReactComponent as AddDocSvg } from '../../../img/add-doc.svg';
import Account from '../../../models/Account';
import AccountImpl from '../../../models/AccountImpl';
import './AddContactModal.scss';
import AccountService from '../../../services/AccountService';
import HelperContact from '../../../models/HelperContact';
import { HelperContactRequest } from '../../../services/HelperContactService';
import SearchInput from '../../common/SearchInput';
import SortArrow from '../../common/SortArrow';
import Toggle from '../../common/Toggle';
import Chevron from '../../common/Chevron';

interface AddContactModalProps {
  addHelperContact: (req: HelperContactRequest) => Promise<void>;
  helperContacts: HelperContact[];
  showModal: boolean;
  toggleModal: () => void;
  accounts: Account[];
}

interface AddContactModalState {
  showContactModal: boolean;
  selectedAccount: any;
  isAscending: boolean;
  query: string;
  isSocialAttestationEnabled: boolean;
  canAddNewDocuments: boolean;
}

export default class AddContactModal extends Component<
  AddContactModalProps,
  AddContactModalState
> {
  state = {
    query: '',
    isAscending: true,
    selectedAccount: undefined,
    isSocialAttestationEnabled: true,
    canAddNewDocuments: true,
    showContactModal: false,
  };

  renderHelperAccount(a: Account) {
    const { helperContacts } = { ...this.props };
    const isContact = !!helperContacts.find(
      (hc) => hc.helperAccount.email === a.email
    );
    return (
      <Col sm="12" md="12" lg="6" xl="4" key={a.id}>
        <div className="helper-account">
          <img
            className="profile-img"
            src={AccountService.getProfileURL(a.profileImageUrl!)}
            alt="Profile"
          />
          <div className="helper-name">
            {AccountImpl.getFullName(a.firstName, a.lastName)}
          </div>
          <div className="helper-details">
            <div className="helper-attr">
              <div className="helper-key">Organization</div>
              <div className="helper-val">{a.organization}</div>
            </div>
            <div className="helper-attr">
              <div className="helper-key">Role</div>
              <div className="helper-val">{a.role}</div>
            </div>
            <div className="helper-attr">
              <div className="helper-key">E-mail</div>
              <div className="helper-val">{a.email}</div>
            </div>
          </div>
          <input
            type="button"
            value={isContact ? 'Contact Added' : 'Add Contact'}
            onClick={() =>
              this.setState({ showContactModal: true, selectedAccount: a })
            }
            disabled={isContact}
          />
        </div>
      </Col>
    );
  }
  render() {
    const {
      showContactModal,
      selectedAccount,
      isAscending,
      query,
      isSocialAttestationEnabled,
      canAddNewDocuments,
    } = {
      ...this.state,
    };
    const { toggleModal, showModal, accounts, addHelperContact } = {
      ...this.props,
    };
    // console.log(accounts[0]);
    const closeBtn = (
      <div className="modal-close" onClick={toggleModal}>
        <CrossSvg />
      </div>
    );
    const displayedAccounts = accounts
      .sort((a, b) => {
        const a1 = AccountImpl.getFullName(a?.firstName, a?.lastName);
        const b1 = AccountImpl.getFullName(b?.firstName, b?.lastName);
        if (a1 < b1) {
          return isAscending ? -1 : 1;
        }
        if (a1 > b1) {
          return isAscending ? 1 : -1;
        }
        return 0;
      })
      .filter(
        (a) =>
          AccountImpl.getFullName(a?.firstName, a?.lastName) &&
          AccountImpl.getFullName(a?.firstName, a?.lastName)
            .toLowerCase()
            .indexOf(query.toLowerCase()) !== -1
      );
    return (
      <Modal
        isOpen={showModal}
        toggle={toggleModal}
        backdrop={'static'}
        size={'xl'}
        className="account-share-modal"
      >
        <ModalHeader toggle={toggleModal} close={closeBtn}>
          <ContactSvg />
          <span>New Contact</span>
        </ModalHeader>
        <ModalBody className="helper-accounts-container">
          <Modal
            isOpen={showContactModal}
            backdrop={'static'}
            size={'md'}
            className="add-contact-confirm-modal"
          >
            {selectedAccount && (
              <ModalBody className="helper-accounts-container">
                <div className="helper-title">
                  Add this contact to your network?
                </div>
                <div className="profile-container">
                  <img
                    className="profile-img"
                    src={AccountService.getProfileURL(
                      (selectedAccount as any).profileImageUrl!
                    )}
                    alt="Profile"
                  />
                  <div className="helper-name-lg">
                    {AccountImpl.getFullName(
                      (selectedAccount as any).firstName,
                      (selectedAccount as any).lastName
                    )}
                  </div>
                </div>
                <div className="permission-container">
                  <div className="helper-permission-title">Permissions</div>
                  <div className="helper-permission-subtitle">
                    What can this contact help me with?
                  </div>
                  <div className="helper-permission">
                    <LoginSvg />
                    <div className="permission-title">Help me login</div>
                    <div className="toggle">
                      <Toggle
                        value={isSocialAttestationEnabled}
                        onToggle={() =>
                          this.setState({
                            isSocialAttestationEnabled: !isSocialAttestationEnabled,
                          })
                        }
                      />
                    </div>
                    <div className="toggle-lg">
                      <Toggle
                        isLarge
                        value={isSocialAttestationEnabled}
                        onToggle={() =>
                          this.setState({
                            isSocialAttestationEnabled: !isSocialAttestationEnabled,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="helper-permission">
                    <AddDocSvg />
                    <div className="permission-title">Add new documents</div>
                    <div className="toggle">
                      <Toggle
                        value={canAddNewDocuments}
                        onToggle={() =>
                          this.setState({
                            canAddNewDocuments: !canAddNewDocuments,
                          })
                        }
                      />
                    </div>
                    <div className="toggle-lg">
                      <Toggle
                        isLarge
                        value={canAddNewDocuments}
                        onToggle={() =>
                          this.setState({
                            canAddNewDocuments: !canAddNewDocuments,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
                <input
                  className="button-lg"
                  type="button"
                  value="Add Contact"
                  onClick={async () => {
                    await addHelperContact({
                      helperAccountId: (selectedAccount as any).id,
                      canAddNewDocuments,
                      isSocialAttestationEnabled,
                    });
                    this.setState({ showContactModal: false });
                  }}
                />
                <div
                  className="take-back"
                  onClick={() => this.setState({ showContactModal: false })}
                >
                  No, take me back
                </div>
              </ModalBody>
            )}
          </Modal>
          <div className="search-helper-container">
            <div className="search-input">
              <SearchInput
                handleSearch={(val) => this.setState({ query: val })}
              />
            </div>
            <div
              className="sort-container"
              onClick={() => this.setState({ isAscending: !isAscending })}
            >
              <SortArrow isAscending={isAscending} />
              <span>Name</span>
            </div>

            <div className="sort-container-lg">
              <div className="subtitle">Sort by</div>
              <div
                className="subtitle subtitle-key"
                onClick={() => this.setState({ isAscending: !isAscending })}
              >
                NAME
              </div>
              <Chevron
                isAscending={isAscending}
                onClick={() => this.setState({ isAscending: !isAscending })}
              />
            </div>
          </div>
          <div className="contacts-grid">
            <Row>
              {displayedAccounts.map((a) => this.renderHelperAccount(a))}
            </Row>
          </div>
        </ModalBody>
      </Modal>
    );
  }
}

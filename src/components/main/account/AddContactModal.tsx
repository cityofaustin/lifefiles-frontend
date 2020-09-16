import React, { Component } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
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
    // selectedAccount: undefined,
    selectedAccount: {
      accountType: '5f441fca3e34622ffea5bac3',
      canAddOtherAccounts: false,
      didAddress: '0x2a6F1D5083fb19b9f2C653B598abCb5705eD0439',
      didPublicEncryptionKey:
        '325c9be575a341edb837f0c89981844bd5a4fce79dd82f99d886c0928ee435499ef3109773053a37fb5634901f043dd425a7fdde42b8dbe45f3be50f1c8ad291',
      email: 'caseworker@caseworker.com',
      firstName: 'Billy',
      id: '5f441fcb3e34622ffea5bb41',
      lastName: 'Caseworker',
      organization: 'Banana Org',
      phoneNumber: '555-555-5555',
      profileImageUrl: 'billy.png',
      role: 'helper',
      username: 'caseworker',
    },
    isSocialAttestationEnabled: true,
    canAddNewDocuments: true,
    showContactModal: true,
  };

  renderHelperAccount(a: Account) {
    const { helperContacts } = { ...this.props };
    const isContact = !!helperContacts.find(
      (hc) => hc.helperAccount.email === a.email
    );
    return (
      <div key={a.id} className="helper-account">
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
            size={'xl'}
            className="add-contact-confirm-modal"
          >
            <ModalBody className="helper-accounts-container">
              <div className="helper-title">
                Add this contact to your network?
              </div>
              <div className="profile-container">
                <img
                  className="profile-img"
                  src={AccountService.getProfileURL(
                    selectedAccount.profileImageUrl!
                  )}
                  alt="Profile"
                />
                <div className="helper-name-lg">
                  {AccountImpl.getFullName(
                    selectedAccount.firstName,
                    selectedAccount.lastName
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
                  <Toggle
                    value={isSocialAttestationEnabled}
                    onToggle={() =>
                      this.setState({
                        isSocialAttestationEnabled: !isSocialAttestationEnabled,
                      })
                    }
                  />
                </div>
                <div className="helper-permission">
                  <AddDocSvg />
                  <div className="permission-title">Add new documents</div>
                  <Toggle
                    value={canAddNewDocuments}
                    onToggle={() =>
                      this.setState({
                        canAddNewDocuments: !canAddNewDocuments,
                      })
                    }
                  />
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
          </div>
          {displayedAccounts.map((a) => this.renderHelperAccount(a))}
        </ModalBody>
      </Modal>
    );
  }
}

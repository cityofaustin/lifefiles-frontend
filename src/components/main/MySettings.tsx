import React, { Component, Fragment } from 'react';
import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
} from 'reactstrap';
import { ReactComponent as CrossSvg } from '../../img/cross2.svg';
import { ReactComponent as CrossSmSvg } from '../../img/cross2-sm.svg';
import './MySettings.scss';
import Account from '../../models/Account';
import AccountImpl from '../../models/AccountImpl';
import ProfileImage, { ProfileImageSizeEnum } from '../common/ProfileImage';
import AccountService from '../../services/AccountService';
import { ReactComponent as LoginMethodsSvg } from '../../img/login-methods.svg';
import { ReactComponent as ExportDocSvg } from '../../img/export-doc.svg';
import ZipUtil from '../../util/ZipUtil';
import DocumentService from '../../services/DocumentService';
import CryptoUtil from '../../util/CryptoUtil';
import delay from '../../util/delay';
import ProgressIndicator from '../common/ProgressIndicator';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import AuthService from '../../services/AuthService';
import DocsUploadedSvg from '../svg/DocsUploadedSvg';
import Toggle, { ToggleSizeEnum } from '../common/Toggle';
import DocShared from '../main/document/DocShared';
import ContactShared from '../svg/ContactShared';
import cloneDeep from 'lodash.clonedeep';
import SharedWith from './document/SharedWith';
import HelperContact from '../../models/HelperContact';
import Role from '../../models/Role';

enum SettingOptionEnum {
  LOGIN_METHODS,
  PRIVACY,
  EXPORT_DOCUMENTS,
  DELETE_MY_ACCOUNT,
}

interface MySettingsProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  account: Account;
  setMyAccount: (account: Account) => void;
  privateEncryptionKey: string;
  helperContacts: HelperContact[];
}

interface MySettingsState {
  activeOption: number;
  isLoading: boolean;
  phoneNumber: string;
  fullname: string;
  isNotDisplayPhoto: boolean;
  isNotDisplayName: boolean;
  isNotDisplayPhone: boolean;
  isConfirmingDelete: boolean;
  confirmText: string;
}

export default class MySettings extends Component<
  MySettingsProps,
  MySettingsState
> {
  constructor(props) {
    super(props);
    const account = props.account;
    const phoneNumber = account.phoneNumber ? account.phoneNumber : '';
    const fullname =
      AccountImpl.getFullName(account.firstName, account.lastName) !== '- -' &&
      AccountImpl.getFullName(account.firstName, account.lastName) !== '-'
        ? AccountImpl.getFullName(account.firstName, account.lastName)
        : '';
    const isNotDisplayPhoto = !!account.isNotDisplayPhoto;
    const isNotDisplayName = !!account.isNotDisplayName;
    const isNotDisplayPhone = !!account.isNotDisplayPhone;
    const activeOption =
      account.role === Role.owner
        ? SettingOptionEnum.LOGIN_METHODS
        : SettingOptionEnum.PRIVACY;
    this.state = {
      activeOption,
      // activeOption: SettingOptionEnum.DELETE_MY_ACCOUNT,
      isLoading: false,
      phoneNumber,
      fullname,
      isNotDisplayPhoto,
      isNotDisplayName,
      isNotDisplayPhone,
      isConfirmingDelete: false,
      confirmText: '',
    };
  }

  exportAllDocuments = async () => {
    this.setState({ isLoading: true });
    const base64Images: string[] = [];

    for (const document of this.props.account.documents) {
      let base64Image = '';
      try {
        const encryptedString: string = await ZipUtil.unzip(
          DocumentService.getDocumentURL(document.url)
        );

        base64Image = await CryptoUtil.getDecryptedString(
          this.props.privateEncryptionKey!,
          encryptedString
        );

        base64Images.push(base64Image);
      } catch (err) {
        console.error(err);
      }
    }

    const zip = new JSZip();
    const img = zip.folder('documents');

    let counter = 0;
    for (const base64Image of base64Images) {
      counter++;
      const fileName = 'document-' + counter;
      const base64String = base64Image.split(',')[1];
      const fileType = base64Image.split(',')[0].split('/')[1].split(';')[0];
      img!.file(fileName + '.' + fileType, base64String, {
        base64: true,
      });
    }

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, 'mypass-documents.zip');
    });
    this.setState({ isLoading: false });
  };

  handleSaveSettings = async (e) => {
    e.preventDefault();
    const { account, setMyAccount, setOpen } = { ...this.props };
    const {
      fullname,
      phoneNumber,
      isNotDisplayPhoto,
      isNotDisplayName,
      isNotDisplayPhone,
    } = { ...this.state };
    const newAccount = cloneDeep(account);
    if (fullname.length > 0) {
      newAccount.firstName = AccountImpl.getFirstNameByFull(fullname);
      newAccount.lastName = AccountImpl.getLastNameByFull(fullname);
    } else {
      newAccount.firstName = '';
      newAccount.lastName = '';
    }
    newAccount.phoneNumber = phoneNumber;
    newAccount.isNotDisplayPhoto = isNotDisplayPhoto;
    newAccount.isNotDisplayName = isNotDisplayName;
    newAccount.isNotDisplayPhone = isNotDisplayPhone;
    this.setState({ isLoading: true });
    await AccountService.updateMyAccount(newAccount);
    setMyAccount(newAccount);
    this.setState({ isLoading: false });
    setOpen(false);
  };

  handleDeleteMyAccount = async () => {
    const { account } = { ...this.props };
    this.setState({ isLoading: true });

    await AccountService.deleteMyAccount();
    if (account.role === Role.owner) {
      AuthService.deleteOwnerAccount();
    }
    if (account.role === Role.helper) {
      AuthService.logOut();
    }
  };

  renderLoginMethodTab() {
    return (
      <div className="account-settings-content">
        <div className="account-content-title">Login Methods</div>
        <LoginMethodsSvg />
        <div className="account-content-excerpt">
          To change your password, security questions, phone number, set a
          private key, delete biometrics data or re-configure any of your login
          methods, click the link below...
        </div>
        <Button
          style={{ marginTop: '50px' }}
          outline
          color="primary"
          onClick={() => {
            // redirect to login page with all of the query string params
            const scope = '';
            const state = '';
            const jwt = AuthService.getAccessToken();
            window.location.replace(
              AccountService.getAuthApi() +
                `/settings?access_token=${jwt}&client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${location.origin}${location.pathname}&scope=${scope}&state=${state}`
            );
          }}
        >
          Configure
        </Button>
      </div>
    );
  }

  renderPrivacyTab() {
    const { account } = { ...this.props };
    const {
      phoneNumber,
      fullname,
      isNotDisplayPhoto,
      isNotDisplayName,
      isNotDisplayPhone,
    } = {
      ...this.state,
    };
    const a1 = cloneDeep(account);
    if (fullname.length > 0) {
      a1.firstName = AccountImpl.getFirstNameByFull(fullname);
      a1.lastName = AccountImpl.getLastNameByFull(fullname);
    }
    return (
      <div className="account-privacy-content">
        <div className="account-content-title">Privacy</div>
        {/* <LoginMethodsSvg /> */}
        <div className="account-privacy-excerpt">
          This is how {account.role === Role.owner ? 'helpers' : 'clients'} in
          your network see your profile
        </div>
        <div className="settings-preview">
          <div className="preview-title">Preview</div>
          <div className="preview-body">
            {/* <div className="preview-image"></div> */}
            <ProfileImage account={a1} size={ProfileImageSizeEnum.LARGE} />
            <div className="fullname">
              {!isNotDisplayName && fullname.length > 0
                ? fullname
                : account.username}
            </div>
            <div className="preview-item">
              <div className="preview-attr">E-mail</div>
              <div className="preview-val">{account.email}</div>
            </div>
            {!isNotDisplayPhone && (
              <div className="preview-item">
                <div className="preview-attr">Phone</div>
                <div className="preview-val">{phoneNumber}</div>
              </div>
            )}
            <div className="shared">
              <div className="shared-title">Shared</div>
              <DocShared numberOfShares={3} />
            </div>
          </div>
        </div>
        <Form
          className="profile-info-form"
          onSubmit={(e) => this.handleSaveSettings(e)}
        >
          <div className="form-title">Profile Information</div>
          <FormGroup>
            <Label for="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => this.setState({ phoneNumber: e.target.value })}
            />
          </FormGroup>
          <FormGroup className="form-input">
            <Label for="fullname">Name/Alias</Label>
            <Input
              id="fullname"
              type="text"
              value={fullname}
              onChange={(e) => this.setState({ fullname: e.target.value })}
            />
          </FormGroup>
          <div className="submit-section">
            <Button color="primary" type="submit">
              Save
            </Button>
          </div>
        </Form>
        <div className="display-options">
          <div className="option-title">Display Options</div>
          {account.role === Role.owner && (
            <Fragment>
              <FormGroup>
                <Label>Photo</Label>
                <Toggle
                  size={ToggleSizeEnum.LG}
                  value={!isNotDisplayPhoto}
                  onToggle={() =>
                    this.setState({ isNotDisplayPhoto: !isNotDisplayPhoto })
                  }
                />
              </FormGroup>
              <FormGroup>
                <Label>Name</Label>
                <Toggle
                  size={ToggleSizeEnum.LG}
                  value={!isNotDisplayName}
                  onToggle={() =>
                    this.setState({ isNotDisplayName: !isNotDisplayName })
                  }
                />
              </FormGroup>
            </Fragment>
          )}
          <FormGroup>
            <Label>Phone</Label>
            <Toggle
              size={ToggleSizeEnum.LG}
              value={!isNotDisplayPhone}
              onToggle={() =>
                this.setState({ isNotDisplayPhone: !isNotDisplayPhone })
              }
            />
          </FormGroup>
        </div>
      </div>
    );
  }

  renderExportDocuments() {
    const { account } = { ...this.props };
    return (
      <div className="account-settings-content bottom">
        <div className="account-content-title">Export Documents</div>
        <ExportDocSvg />
        <div className="account-content-excerpt">
          By clicking on the button below, you can zip, export and download all
          documents currently stored in your MyPass account.
        </div>
        <DocsUploadedSvg numberOfDocs={account.documents.length} />
        <Button onClick={this.exportAllDocuments} outline color="primary">
          Export all documents
        </Button>
      </div>
    );
  }

  renderConfirmDelete() {
    const { confirmText } = { ...this.state };
    return (
      <Row>
        <Col
          md={12}
          lg={6}
          style={{ display: 'flex', justifyContent: 'center' }}
        >
          <div className="confirm-delete">
            <div className="instruction">
              Type <strong>DELETE</strong> to Confirm
            </div>
            <Input
              type="text"
              value={confirmText}
              onChange={(e) => this.setState({ confirmText: e.target.value })}
            />
            <div className="confirm-excerpt">
              Please enter the text exactly as displayed to confirm
            </div>
          </div>
        </Col>
        <Col md={12} lg={6} className="delete-btn-col">
          <Button
            className="delete-account-btn"
            color="danger"
            onClick={this.handleDeleteMyAccount}
            disabled={confirmText !== 'DELETE'}
          >
            Delete Account
          </Button>
        </Col>
      </Row>
    );
  }

  renderDeleteMyAccount() {
    const { isConfirmingDelete } = { ...this.state };
    const { account, helperContacts } = { ...this.props };
    return (
      <div className="account-settings-content delete">
        <div className="account-content-title">Delete Account</div>
        <div className="account-content-excerpt">
          Once your account is deleted, it cannot be recovered. If you wish to
          use MyPass again, you will have to create a new account.
        </div>
        {account.role === Role.owner && (
          <Row style={{ alignItems: 'center' }}>
            <Col md={12} lg={6}>
              <div className="doc-shared-container">
                <DocsUploadedSvg numberOfDocs={account.documents.length} />
              </div>
            </Col>
            <Col md={12} lg={6}>
              <div className="export-btn-container">
                <Button
                  className="export-btn"
                  onClick={this.exportAllDocuments}
                >
                  <div className="export-container">
                    <ExportDocSvg />
                  </div>
                  <div className="export-text">Export my documents</div>
                </Button>
              </div>
            </Col>
          </Row>
        )}
        {account.role !== Role.owner && (
          <div className="doc-shared-container">
            <div className="contact-share-container">
              <ContactShared numberOfShares={helperContacts.length} />
            </div>
            <div className="contact-share">Contacts in your network</div>
          </div>
        )}
        {helperContacts.length > 0 && (
          <Fragment>
            <div className="account-content-excerpt">
              {account.role === Role.owner
                ? 'Additionally, all your documents will be deleted and unshared with helpers in your network.'
                : 'Additionally, all contacts in your network will be deleted and will have to be re-added'}
            </div>
            <div className="share-with-container">
              <SharedWith
                sharedAccounts={helperContacts.map((hc) =>
                  account.role === Role.owner
                    ? hc.helperAccount
                    : hc.ownerAccount
                )}
              />
            </div>
          </Fragment>
        )}
        <div className="account-content-excerpt">
          Are you sure you wish to continue?
        </div>
        {isConfirmingDelete && this.renderConfirmDelete()}
        {!isConfirmingDelete && (
          <Button
            className="confirm-btn"
            color="danger"
            outline
            onClick={() => this.setState({ isConfirmingDelete: true })}
          >
            Delete Account
          </Button>
        )}
      </div>
    );
  }

  render() {
    const { account, isOpen, setOpen } = { ...this.props };
    const { activeOption, isLoading } = { ...this.state };
    const closeBtn = (
      <div className="modal-close" onClick={() => setOpen(false)}>
        <CrossSvg className="lg" />
        <CrossSmSvg className="sm" />
      </div>
    );
    return (
      <Fragment>
        {isLoading && <ProgressIndicator isFullscreen />}
        <Modal
          isOpen={isOpen}
          toggle={() => setOpen(!isOpen)}
          backdrop={'static'}
          size={'xl'}
          className="my-settings-modal"
        >
          <ModalHeader toggle={() => setOpen(!isOpen)} close={closeBtn}>
            <div>
              {!account.profileImageUrl && (
                <div style={{ marginRight: '28.3px' }}>
                  <ProfileImage
                    account={account}
                    size={ProfileImageSizeEnum.SMALL}
                  />
                </div>
              )}
              {account.profileImageUrl && (
                <img
                  src={AccountService.getProfileURL(account.profileImageUrl!)}
                  alt=""
                />
              )}
            </div>
            <div className="my-settings-title">
              {AccountImpl.displayName(this.props.account)}
            </div>
          </ModalHeader>
          <ModalBody>
            <Row style={{ margin: '0 -15px' }}>
              <Col xs="12" xl="4">
                <div className="account-settings-title">Account Settings</div>
                {account.role === Role.owner && (
                  <div
                    onClick={() =>
                      this.setState({
                        activeOption: SettingOptionEnum.LOGIN_METHODS,
                      })
                    }
                    className={`account-settings-option${
                      activeOption === SettingOptionEnum.LOGIN_METHODS
                        ? ' active'
                        : ''
                    }`}
                  >
                    Login Methods
                  </div>
                )}
                <div
                  onClick={() =>
                    this.setState({ activeOption: SettingOptionEnum.PRIVACY })
                  }
                  className={`account-settings-option${
                    activeOption === SettingOptionEnum.PRIVACY ? ' active' : ''
                  }`}
                >
                  Privacy
                </div>
                {account.role === Role.owner && (
                  <div
                    onClick={() =>
                      this.setState({
                        activeOption: SettingOptionEnum.EXPORT_DOCUMENTS,
                      })
                    }
                    className={`account-settings-option${
                      activeOption === SettingOptionEnum.EXPORT_DOCUMENTS
                        ? ' active'
                        : ''
                    }`}
                  >
                    Export Documents
                  </div>
                )}
                <div className="delete-bottom-lg">
                  <Button
                    color="danger"
                    onClick={() =>
                      this.setState({
                        activeOption: SettingOptionEnum.DELETE_MY_ACCOUNT,
                      })
                    }
                  >
                    Delete Account
                  </Button>
                </div>
              </Col>
              <Col xs="12" xl="8">
                {activeOption === SettingOptionEnum.LOGIN_METHODS &&
                  this.renderLoginMethodTab()}
                {activeOption === SettingOptionEnum.PRIVACY &&
                  this.renderPrivacyTab()}
                {activeOption === SettingOptionEnum.EXPORT_DOCUMENTS &&
                  this.renderExportDocuments()}
                {activeOption === SettingOptionEnum.DELETE_MY_ACCOUNT &&
                  this.renderDeleteMyAccount()}
              </Col>
            </Row>
            {activeOption !== SettingOptionEnum.DELETE_MY_ACCOUNT && (
              <div className="delete-bottom">
                <Button
                  color="danger"
                  onClick={() =>
                    this.setState({
                      activeOption: SettingOptionEnum.DELETE_MY_ACCOUNT,
                    })
                  }
                >
                  Delete Account
                </Button>
              </div>
            )}
          </ModalBody>
        </Modal>
      </Fragment>
    );
  }
}

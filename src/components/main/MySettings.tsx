import React, { Component, Fragment } from 'react';
import { Button, Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
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

interface MySettingsProps {
  isOpen: boolean;
  setOpen: (isOpen: boolean) => void;
  account: Account;
  privateEncryptionKey: string;
}

interface MySettingsState {
  activeOption: number;
  isLoading: boolean;
}

export default class MySettings extends Component<
  MySettingsProps,
  MySettingsState
> {
  state = {
    activeOption: 1,
    isLoading: false,
  };

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
            <Row style={{margin: '0 -15px'}}>
              <Col xs="12" xl="4">
                <div className="account-settings-title">Account Settings</div>
                <div
                  onClick={() => this.setState({ activeOption: 1 })}
                  className={`account-settings-option${
                    activeOption === 1 ? ' active' : ''
                  }`}
                >
                  Login Methods
                </div>
                <div
                  onClick={() => this.setState({ activeOption: 3 })}
                  className={`account-settings-option${
                    activeOption === 3 ? ' active' : ''
                  }`}
                >
                  Export Documents
                </div>
              </Col>
              <Col xs="12" xl="8">
                {activeOption === 1 && (
                  <div className="account-settings-content">
                    <div className="account-content-title">Login Methods</div>
                    <LoginMethodsSvg />
                    <div className="account-content-excerpt">
                      To change your password, security questions, phone number,
                      set a private key, delete biometrics data or re-configure
                      any of your login methods, click the link below...
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
                            `/settings?access_token=${jwt}&client_id=${process.env.CLIENT_ID}&response_type=code&redirect_url=${location.origin}${location.pathname}&scope=${scope}&state=${state}`
                        );
                      }}
                    >
                      Configure
                    </Button>
                  </div>
                )}
                {activeOption === 3 && (
                  <div className="account-settings-content bottom">
                    <div className="account-content-title">
                      Export Documents
                    </div>
                    <ExportDocSvg />
                    <div className="account-content-excerpt">
                      By clicking on the button below, you can zip, export and
                      download all documents currently stored in your MyPass
                      account.
                    </div>
                    <DocsUploadedSvg numberOfDocs={account.documents.length} />
                    <Button
                      onClick={this.exportAllDocuments}
                      outline
                      color="primary"
                    >
                      Export all documents
                    </Button>
                  </div>
                )}
              </Col>
            </Row>
          </ModalBody>
        </Modal>
      </Fragment>
    );
  }
}

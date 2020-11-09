import React, { Component } from 'react';
import GoBackSvg from '../../svg/GoBackSvg';
import { Button, Toast, ToastBody, ToastHeader } from 'reactstrap';
import { ReactComponent as PasswordSvg } from '../../../img/password.svg';
import { ReactComponent as PrivateKeySvg } from '../../../img/private-key.svg';
import { ReactComponent as PrivateKey2Svg } from '../../../img/private-key2.svg';
import { ReactComponent as PrivateKeyOverviewSvg } from '../../../img/private-key-overview.svg';
import { ReactComponent as GenerateKeyBtnSvg } from '../../../img/generate-key-btn.svg';
import { ReactComponent as KeyMakeSureSvg } from '../../../img/key-make-sure.svg';
import { ReactComponent as PasteKeySvg } from '../../../img/paste-key.svg';
import { ReactComponent as CopyKeySvg } from '../../../img/copy-key.svg';
import { LoginOption } from '../../svg/HelperLoginOption';
import CryptoUtil from '../../../util/CryptoUtil';
import delay from '../../../util/delay';
import { handleIOSBrowser } from '../../../util/browser-util';
import { animateIn, getSectionClassName } from '../../../util/animation-util';
export interface HelperLoginSetupState {
  password: string;
  confirmPassword: string;
  errorMessage: string;
  isOverview: boolean;
  isDisplayMakeSure: boolean;
  isToastOpen: boolean;
  toastBody: string;
}
interface HelperLoginSetupProps {
  password: string;
  goBack: () => void;
  goForward: (prevCardState: HelperLoginSetupState) => void;
  selectedOption: LoginOption;
  position?: string;
}
export default class HelperLoginSetup extends Component<
  HelperLoginSetupProps,
  HelperLoginSetupState
> {
  static defaultProps = {
    password: '',
    selectedOption: LoginOption.Password,
  };
  constructor(props: Readonly<HelperLoginSetupProps>) {
    super(props);
    const { password } = { ...props };
    this.state = {
      password,
      confirmPassword: password,
      errorMessage: '',
      isOverview: true,
      // isOverview: false,
      isDisplayMakeSure: false,
      isToastOpen: false,
      toastBody: '',
    };
  }
  componentDidMount() {
    handleIOSBrowser();
    animateIn(this.refs.section);
  }
  goForward = () => {
    const { goForward, selectedOption } = { ...this.props };
    const { password, confirmPassword } = { ...this.state };
    if (selectedOption === LoginOption.Password) {
      if (password === confirmPassword) {
        goForward(this.state);
      } else {
        this.setState({ errorMessage: 'Passwords dont match' });
      }
    } else {
      if (CryptoUtil.isValidKey(password)) {
        goForward(this.state);
      } else {
        this.setState({ errorMessage: 'Key is invalid.' });
      }
    }
  };
  renderPasswordSetup() {
    const { password, confirmPassword, errorMessage } = { ...this.state };
    return (
      <div className="card owner1">
        <div className="card-body">
          <div className="card-body-section" style={{ marginTop: '0' }}>
            <div className="helper-login" style={{ margin: '0 0 13px 0' }}>
              Password
            </div>
            <PasswordSvg />
            <div className="helper-excerpt">
              Please choose a password to log into your account
            </div>
          </div>
          <div className="card-body-section1" style={{ marginTop: '23px' }}>
            {errorMessage && <div className="error">{errorMessage}</div>}
            <div className="form-control1">
              <label>Password</label>
              <input
                name="password"
                type="password"
                value={password}
                onChange={(e) => this.setState({ password: e.target.value })}
              />
            </div>
            <div className="form-control1" style={{ marginTop: '10px' }}>
              <label>Confirm Password</label>
              <input
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  this.setState({ confirmPassword: e.target.value })
                }
              />
            </div>
          </div>
          <div className="bottom">
            <input
              style={{ width: '210px', marginTop: '27px' }}
              type="button"
              value="Set Password"
              disabled={!password || !confirmPassword}
              onClick={this.goForward}
            />
          </div>
        </div>
      </div>
    );
  }
  renderPrivateKeyOverview() {
    return (
      <div className="card owner1">
        <div className="card-body">
          <div className="card-body-section" style={{ marginTop: '0' }}>
            <div className="helper-login" style={{ margin: '0 0 13px 0' }}>
              Private Key
            </div>
            <PrivateKeySvg />
            <div className="helper-excerpt">
              When registering with a private key, please keep in mind:
            </div>
          </div>
          <PrivateKeyOverviewSvg />
          <div className="bottom">
            <input
              style={{ width: '210px', marginTop: '27px' }}
              type="button"
              value="Continue"
              // disabled={true}
              onClick={() => this.setState({ isOverview: false })}
            />
          </div>
        </div>
      </div>
    );
  }
  renderPrivateKeySetup() {
    const {
      password,
      errorMessage,
      isDisplayMakeSure,
      isToastOpen,
      toastBody,
    } = { ...this.state };
    return (
      <div className="card owner1">
        <Toast className="toast-center" isOpen={isToastOpen}>
          <ToastBody>{toastBody}</ToastBody>
        </Toast>
        <div className="card-body" style={{ alignItems: 'center' }}>
          <div className="card-body-section" style={{ marginTop: '0' }}>
            <div className="helper-login" style={{ margin: '0' }}>
              Private Key
            </div>
            <PrivateKey2Svg />
            <div className="helper-excerpt" style={{ marginTop: '0' }}>
              Please set a private key to log into your account
            </div>
            <div
              className="helper-excerpt"
              style={{ marginTop: '16px', marginBottom: '8px' }}
            >
              Enter your private key or...
            </div>
            <div
              className="generate-key-btn"
              onClick={() =>
                this.setState({
                  password: CryptoUtil.generateKey(),
                  isDisplayMakeSure: true,
                })
              }
            >
              <GenerateKeyBtnSvg />
            </div>
          </div>
          <div className="card-body-section1" style={{ marginTop: '10px' }}>
            {errorMessage && <div className="error">{errorMessage}</div>}
            <div className="form-control1">
              <label>Private Key</label>
              <div className="key-container">
                <div
                  className="copy-paste"
                  onClick={async () => {
                    if (password.length < 64) {
                      const text = await navigator.clipboard.readText();
                      this.setState(
                        {
                          password: text,
                          isToastOpen: true,
                          toastBody: 'Pasted!',
                        },
                        async () => {
                          await delay(1000);
                          this.setState({ isToastOpen: false });
                        }
                      );
                    } else {
                      await navigator.clipboard.writeText(this.state.password);
                      this.setState(
                        { isToastOpen: true, toastBody: 'Copied!' },
                        async () => {
                          await delay(1000);
                          this.setState({ isToastOpen: false });
                        }
                      );
                    }
                  }}
                >
                  {password.length < 64 ? <PasteKeySvg /> : <CopyKeySvg />}
                </div>
                <input
                  name="password"
                  type="text"
                  value={password}
                  onChange={(e) => this.setState({ password: e.target.value })}
                />
              </div>
            </div>
          </div>
          {isDisplayMakeSure && <KeyMakeSureSvg />}
          <div className="bottom">
            <input
              style={{ width: '210px', marginTop: '27px' }}
              type="button"
              value="Set Private Key"
              disabled={password.length < 64}
              onClick={() => this.goForward()}
            />
          </div>
        </div>
      </div>
    );
  }
  render() {
    const { isOverview } = { ...this.state };
    const { goBack, selectedOption } = { ...this.props };
    return (
      <div
        ref="section"
        id="section-4-helper"
        className={getSectionClassName(this.props.position)}
      >
        <div className="section-contents">
          <div className="title1">Document Helper</div>
          <div className="subtitle">Creating an account</div>
          {selectedOption === LoginOption.Password &&
            this.renderPasswordSetup()}
          {selectedOption === LoginOption.PrivateKey &&
            isOverview &&
            this.renderPrivateKeyOverview()}
          {selectedOption === LoginOption.PrivateKey &&
            !isOverview &&
            this.renderPrivateKeySetup()}
          <GoBackSvg color="#4BA9D9" goBack={goBack} />
        </div>
      </div>
    );
  }
}

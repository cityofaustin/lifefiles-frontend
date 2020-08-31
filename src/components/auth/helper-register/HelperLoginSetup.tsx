import React, { Component } from 'react';
import GoBackSvg from '../../svg/GoBackSvg';
import { ReactComponent as PasswordSvg } from '../../../img/password.svg';
import { ReactComponent as PrivateKeySvg } from '../../../img/private-key.svg';
import { ReactComponent as PrivateKey2Svg } from '../../../img/private-key2.svg';
import { ReactComponent as PrivateKeyOverviewSvg } from '../../../img/private-key-overview.svg';
import { ReactComponent as GenerateKeyBtnSvg } from '../../../img/generate-key-btn.svg';
import { ReactComponent as KeyMakeSureSvg } from '../../../img/key-make-sure.svg';
import { LoginOption } from '../../svg/HelperLoginOption';
import CryptoUtil from '../../../util/CryptoUtil';
export interface HelperLoginSetupState {
  password: string;
  confirmPassword: string;
  errorMessage: string;
  isOverview: boolean;
  isDisplayMakeSure: boolean;
}
interface HelperLoginSetupProps {
  password: string;
  goBack: () => void;
  goForward: (prevCardState: HelperLoginSetupState) => void;
  selectedOption: LoginOption;
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
      isOverview: false,
      isDisplayMakeSure: false,
    };
  }
  goForward = () => {
    const { goForward, selectedOption } = { ...this.props };
    const { password, confirmPassword } = { ...this.state };
    if (selectedOption === LoginOption.Password) {
      if (password === confirmPassword) {
        goForward(this.state);
      } else {
        this.setState({ errorMessage: "Passwords don't match" });
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
    const { password, errorMessage, isDisplayMakeSure } = { ...this.state };
    return (
      <div className="card owner1">
        <div className="card-body" style={{ alignItems: 'center' }}>
          <div className="card-body-section" style={{ marginTop: '0' }}>
            <div className="helper-login" style={{ margin: '0 0 13px 0' }}>
              Private Key
            </div>
            <PrivateKey2Svg />
            <div className="helper-excerpt">
              Please set a private key to log into your account
            </div>
            <div className="helper-excerpt">Enter your private key or...</div>
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
          <div className="card-body-section1" style={{ marginTop: '23px' }}>
            {errorMessage && <div className="error">{errorMessage}</div>}
            <div className="form-control1">
              <label>Private Key</label>
              <input
                name="password"
                type="text"
                value={password}
                onChange={(e) => this.setState({ password: e.target.value })}
              />
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
      <section id="helper-register" className="container">
        <div ref="section" id="section-1-owner" className="section">
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
      </section>
    );
  }
}

import React, { ChangeEvent, Component, FormEvent, Fragment } from 'react';
import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
// import folderImage from '../../img/folder.png';
import { ReactComponent as MyPassLogoSvg } from '../../img/mypass-logo.svg';
import { ReactComponent as WaveSvg } from '../../img/wave.svg';
import { ReactComponent as HelperWelcomeSvg } from '../../img/helper-welcome.svg';
import { ReactComponent as PasswordBtnSvg } from '../../img/password-btn.svg';
import { ReactComponent as PrivateKeyBtnSvg } from '../../img/private-key-btn.svg';
import { ReactComponent as LoginSvg } from '../../img/login.svg';
import { ReactComponent as PrivateKeyLongBtnSvg } from '../../img/private-key-long-btn.svg';
import { ReactComponent as PasswordLongBtnSvg } from '../../img/password-long-btn.svg';
import AccountService from '../../services/AccountService';
// import APIError from '../../services/APIError';
import HttpStatusCode from '../../models/HttpStatusCode';
import Checkbox from '../common/Checkbox';
import SecureRegister from './secure-register/SecureRegister';
import GoBackSvg from '../svg/GoBackSvg';
// import img from '../../img/document-file.png';
import './SecureLoginPage.scss';

import EthCrypto from 'eth-crypto';
import AppSetting, { SettingNameEnum } from '../../models/AppSetting';
import Role from '../../models/Role';
// import { add } from 'date-fns';

export interface SecureLoginProps {
  appSettings: AppSetting[];
  role: Role;
  handleLogin: (loginResponse: any) => Promise<void>;
}

export interface SecureLoginState {
  email: string;
  password: string;
  errorMessage: string;
}

class SecureLoginPage extends Component<SecureLoginProps> {
  state = {
    email: '',
    password: '',
    errorMessage: '',
    secureAccount: false,
    isRegistering: false,
    // isRegistering: true,
    passwordSelected: false,
    privateKeySelected: false,
  };
  constructor(props: SecureLoginProps) {
    super(props);
  }

  componentDidMount() {
    document.body.classList.remove(
      'theme-helper',
      'theme-owner',
      'theme-admin'
    );
    document.body.classList.add(`theme-${this.props.role}`);
  }

  handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const key = e.target.name;

    if (Object.keys(this.state).includes(key)) {
      this.setState({ [key]: value } as Pick<
        SecureLoginState,
        keyof SecureLoginState
      >);
    }
  };

  handleLogin = async (
    e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLInputElement>
  ): Promise<void> => {
    e.preventDefault();
    const { email, password, secureAccount, privateKeySelected } = {
      ...this.state,
    };
    let { errorMessage } = { ...this.state };

    if (secureAccount || privateKeySelected) {
      let messageToSignResponse;
      let address;
      try {
        window.sessionStorage.setItem('bring-your-own-key', password);
        const publicKey = EthCrypto.publicKeyByPrivateKey('0x' + password);
        address = EthCrypto.publicKey.toAddress(publicKey);
        messageToSignResponse = await AccountService.secureLoginHelperAccount({
          account: { username: address },
        });
        if (messageToSignResponse.msg === 'Account not found') {
          throw new Error(String(HttpStatusCode.UNPROCESSABLE_ENTITY));
        }
      } catch (err) {
        if (
          err.message.includes('Cannot convert string to buffer') ||
          err.message === 'private key length is invalid'
        ) {
          errorMessage = 'Invalid key, must be 64 hex characters.';
        } else if (
          HttpStatusCode.UNPROCESSABLE_ENTITY === Number(err.message)
        ) {
          errorMessage = 'Unable to log in with provided credentials.';
        } else {
          errorMessage =
            'Oops, something went wrong. Please try again in a few minutes.';
        }
        this.setState({ errorMessage });
        return;
      }
      const message = messageToSignResponse.messageToSign;
      const messageHash = EthCrypto.hash.keccak256(message);
      const signature = EthCrypto.sign(
        password,
        messageHash // hash of message
      );

      const loginResponse = await AccountService.secureLoginHelperAccount({
        account: { username: address, signature },
      });

      await this.props.handleLogin(loginResponse);
      return;
    } else {
      try {
        const loginResponse = await AccountService.loginHelperAccount({
          account: { email, password },
        });
        if (loginResponse === undefined) {
          throw new Error('Server unavailable.');
        }
        if (loginResponse.errors && loginResponse.errors['email or password']) {
          throw new Error('422');
        }
        await this.props.handleLogin(loginResponse);
        return;
      } catch (err) {
        if (
          err &&
          [
            HttpStatusCode.UNPROCESSABLE_ENTITY,
            HttpStatusCode.INTERNAL_SERVER_ERROR,
          ].includes(Number(err.message))
        ) {
          errorMessage = 'Unable to log in with provided credentials.';
        } else {
          errorMessage =
            'Oops, something went wrong. Please try again in a few minutes.';
        }
      }
      this.setState({ errorMessage });
    }
  };

  secureAccountChange = () => {
    let secureAccount = !this.state.secureAccount;
    this.setState({ secureAccount });
  };

  renderOriginalLogin() {
    const { email, password, errorMessage, secureAccount } = { ...this.state };
    let placeholderText = 'Password';

    if (secureAccount) {
      placeholderText = 'Private Encryption Key';
    }
    return (
      <div className="login-background">
        <div className="login-container">
          <Card className="login-card">
            <CardBody>
              <MyPassLogoSvg />
              <div className="login-subtitle">Login</div>
              <Form onSubmit={this.handleLogin}>
                {errorMessage && <div className="error">{errorMessage}</div>}
                <FormGroup>
                  <Label> Secure Account</Label>
                  <Checkbox
                    isChecked={this.state.secureAccount}
                    onClick={this.secureAccountChange}
                  ></Checkbox>
                  <Label hidden={secureAccount} for="email">
                    Email
                  </Label>
                  <Input
                    hidden={secureAccount}
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={this.handleInputChange}
                    placeholder="Email"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="password">{placeholderText}</Label>
                  <Input
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={this.handleInputChange}
                    placeholder={placeholderText}
                  />
                </FormGroup>
                <Button className="login-btn mr-1" type="submit">
                  Login
                </Button>

                <Button
                  className="login-btn mr-3"
                  // onClick={this.handleRegister}
                  onClick={() => {}}
                >
                  Register
                </Button>
              </Form>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  renderLoginPrivateKey() {
    const { role } = { ...this.props };
    const { password, errorMessage } = { ...this.state };
    return (
      <section className="container">
        <div ref="section" id="section-1-owner" className="section">
          <div className="section-contents">
            <div className="title1" style={{ textTransform: 'capitalize' }}>Document {role}</div>
            <div className="subtitle">Help us find your account</div>
            <div className="card owner1">
              <div className="card-body">
                <div className="card-body-section" style={{ marginTop: 0 }}>
                  <LoginSvg />
                  <div className="helper-login" style={{textTransform: 'capitalize'}}>{role} Login</div>
                  <div className="helper-excerpt" style={{ padding: '0 10px' }}>
                    Advanced users that registered their account with a private
                    key may use it to login
                  </div>
                </div>
                <div
                  className="card-body-section1"
                  style={{ marginTop: '23px' }}
                >
                  {errorMessage && <div className="error">{errorMessage}</div>}
                  <div className="form-control1">
                    <label>Private Encryption Key</label>
                    <input
                      className="username-input"
                      name="password"
                      type="text"
                      value={password}
                      onChange={(e) =>
                        this.setState({ password: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="card-body-section1">
                  <div>
                    <span className="or">or </span>
                    <span className="advanced">(regular user)</span>
                  </div>
                  <div
                    className="private-key-lng"
                    onClick={() =>
                      this.setState({
                        passwordSelected: true,
                        privateKeySelected: false,
                        errorMessage: '',
                      })
                    }
                  >
                    <PasswordLongBtnSvg />
                  </div>
                </div>
                <div className="bottom">
                  <Button
                    color="primary"
                    style={{
                      width: '210px',
                      marginTop: '27px',
                      fontSize: '25px',
                      height: '50px',
                      borderRadius: '9px',
                    }}
                    disabled={password.length < 1}
                    onClick={this.handleLogin}
                  >
                    Login
                  </Button>
                  <div className="bottom-excerpt">Forgot your username?</div>
                </div>
              </div>
            </div>
            <GoBackSvg
              color={role === Role.owner ? '#2362C7' : '#4BA9D9'}
              goBack={() =>
                this.setState({ privateKeySelected: false, errorMessage: '' })
              }
            />
          </div>
        </div>
      </section>
    );
  }

  renderLoginPassword() {
    const { role } = { ...this.props };
    const { password, email, errorMessage } = { ...this.state };
    return (
      <section className="container">
        <div ref="section" id="section-1-owner" className="section">
          <div className="section-contents">
            <div className="title1" style={{ textTransform: 'capitalize' }}>Document {role}</div>
            <div className="subtitle">Help us find your account</div>
            <div className="card owner1">
              <div className="card-body">
                <div className="card-body-section" style={{ marginTop: 0 }}>
                  <LoginSvg />
                  <div className="helper-login" style={{textTransform: 'capitalize'}}>{role} Login</div>
                  <div className="helper-excerpt">
                    Please enter your credentials below...
                  </div>
                </div>
                <div
                  className="card-body-section1"
                  style={{ marginTop: '23px' }}
                >
                  {errorMessage && <div className="error">{errorMessage}</div>}
                  <div className="form-control1">
                    <label>E-mail</label>
                    <input
                      className="username-input"
                      name="username"
                      type="text"
                      // placeholder="..."
                      value={email}
                      onChange={(e) => this.setState({ email: e.target.value })}
                    />
                  </div>
                  <div className="form-control1" style={{ marginTop: '10px' }}>
                    <label>Password</label>
                    <input
                      name="password"
                      type="password"
                      value={password}
                      onChange={(e) =>
                        this.setState({ password: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="card-body-section1">
                  <div>
                    <span className="or">or </span>
                    <span className="advanced">(advanced user)</span>
                  </div>
                  <div
                    className="private-key-lng"
                    onClick={() =>
                      this.setState({
                        passwordSelected: false,
                        privateKeySelected: true,
                        errorMessage: '',
                      })
                    }
                  >
                    <PrivateKeyLongBtnSvg />
                  </div>
                </div>
                <div className="bottom">
                  <Button
                    color="primary"
                    style={{
                      width: '210px',
                      marginTop: '27px',
                      fontSize: '25px',
                      height: '50px',
                      borderRadius: '9px',
                    }}
                    disabled={password.length < 1 || email.length < 1}
                    onClick={this.handleLogin}
                  >
                    Login
                  </Button>
                  <div className="bottom-excerpt">Forgot your username?</div>
                </div>
              </div>
            </div>
            <GoBackSvg
              color={role === Role.owner ? '#2362C7' : '#4BA9D9'}
              goBack={() =>
                this.setState({ passwordSelected: false, errorMessage: '' })
              }
            />
          </div>
        </div>
      </section>
    );
  }

  renderWelcome() {
    const { appSettings } = { ...this.props };
    const titleSetting = appSettings.find(
      (a) => a.settingName === SettingNameEnum.TITLE
    );
    const title = titleSetting?.settingValue
      ? titleSetting.settingValue
      : 'This';
    return (
      <section className="welcome-container">
        <div className="section">
          <div className="title">Welcome!</div>
          <div className="subtitle">
            {title} is a secure &amp; private document storage solution.
          </div>
          <div className="sub-section">
            <HelperWelcomeSvg />
            <div className="already">
              Already a user?
              <br />
              Choose your login method
            </div>
            <div className="login-options">
              <div
                className="login-option"
                onClick={() => this.setState({ privateKeySelected: true })}
              >
                <PrivateKeyBtnSvg />
              </div>
              <div
                className="login-option"
                onClick={() => this.setState({ passwordSelected: true })}
              >
                <PasswordBtnSvg />
              </div>
            </div>
            <div className="or">or</div>
            <Button
              style={{
                fontSize: '23px',
                width: '210px',
                height: '50px',
                borderRadius: '9px',
              }}
              // className="sign-up"
              type="button"
              color="primary"
              onClick={() => this.setState({ isRegistering: true })}
            >
              Create Account
            </Button>
          </div>
        </div>
      </section>
    );
  }

  render() {
    const { role } = { ...this.props };
    const { passwordSelected, privateKeySelected, isRegistering } = {
      ...this.state,
    };
    const { appSettings } = { ...this.props };
    return (
      <main id="helper-login">
        <section className="wave-container">
          <WaveSvg />
        </section>
        {!isRegistering && (
          <Fragment>
            {passwordSelected && this.renderLoginPassword()}
            {privateKeySelected && this.renderLoginPrivateKey()}
            {!passwordSelected && !privateKeySelected && this.renderWelcome()}
          </Fragment>
        )}
        {isRegistering && (
          <SecureRegister
            role={role}
            appSettings={appSettings}
            handleLogin={this.props.handleLogin}
            goBack={() => this.setState({ isRegistering: false })}
          />
        )}
      </main>
    );
  }
}

export default SecureLoginPage;

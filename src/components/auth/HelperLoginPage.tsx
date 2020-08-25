import React, { ChangeEvent, Component, FormEvent } from 'react';
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
import AccountService from '../../services/AccountService';
// import APIError from '../../services/APIError';
import HttpStatusCode from '../../models/HttpStatusCode';
import Checkbox from '../common/Checkbox';
import GoBackSvg from '../svg/GoBackSvg';
import img from '../../img/document-file.png';
import './HelperLoginPage.scss';

import EthCrypto from 'eth-crypto';
// import { add } from 'date-fns';

export interface HelperLoginProps {
  handleLogin: (loginResponse: any) => Promise<void>;
}

export interface HelperLoginState {
  email: string;
  password: string;
  errorMessage: string;
}

class HelperLoginPage extends Component<HelperLoginProps> {
  state = {
    email: '',
    password: '',
    errorMessage: '',
    secureAccount: false,
    passwordSelected: true,
    privateKeySelected: false,
  };
  constructor(props: HelperLoginProps) {
    super(props);
  }

  handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const key = e.target.name;

    if (Object.keys(this.state).includes(key)) {
      this.setState({ [key]: value } as Pick<
        HelperLoginState,
        keyof HelperLoginState
      >);
    }
  };

  handleLogin = async (
    e: FormEvent<HTMLFormElement> | React.MouseEvent<HTMLInputElement>
  ): Promise<void> => {
    e.preventDefault();
    // const { handleLogin } = { ...this.props };
    const { email, password, secureAccount } = { ...this.state };
    let { errorMessage } = { ...this.state };

    if (secureAccount) {
      window.sessionStorage.setItem('bring-your-own-key', password);
      const publicKey = EthCrypto.publicKeyByPrivateKey('0x' + password);
      const address = EthCrypto.publicKey.toAddress(publicKey);
      const messageToSignResponse = await AccountService.secureLoginHelperAccount(
        {
          account: { username: address },
        }
      );

      const message = messageToSignResponse.messageToSign;
      const messageHash = EthCrypto.hash.keccak256(message);
      const signature = EthCrypto.sign(
        password,
        messageHash // hash of message
      );

      const loginResponse = await AccountService.secureLoginHelperAccount({
        account: { username: address, signature: signature },
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

  handleRegister = async () => {
    const { email, password, secureAccount } = { ...this.state };
    let { errorMessage } = { ...this.state };
    let username = this.state.email.split('@')[0];

    let accountBody = { email, password, username };
    let secureAccountbody;

    if (secureAccount) {
      window.sessionStorage.setItem('bring-your-own-key', password);
      const publicKey = EthCrypto.publicKeyByPrivateKey('0x' + password);
      const address = EthCrypto.publicKey.toAddress(publicKey);

      secureAccountbody = {
        email: address + '@eth.com',
        password: 'isnotused',
        username: address,
        publicEncryptionKey: publicKey,
      };
    }

    try {
      let registerResponse;
      if (secureAccount) {
        registerResponse = await AccountService.registerHelperAccount({
          account: secureAccountbody,
        });
      } else {
        registerResponse = await AccountService.registerHelperAccount({
          account: accountBody,
        });
      }

      if (registerResponse === undefined) {
        throw new Error('Server unavailable.');
      }

      await this.props.handleLogin(registerResponse);
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
                  onClick={this.handleRegister}
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

  renderLoginPassword() {
    const { password, email } = { ...this.state };
    return (
      <section className="container">
        <div
          ref="section"
          id="section-1-owner"
          className="section"
          // className={getSectionClassName(this.props.position)}
        >
          <div className="section-contents">
            <div className="title1">Document Helper</div>
            <div className="subtitle">Help us find your account</div>
            <div className="card owner1">
              {/* <div className="card-title">
          To create and setup your account you need to follow these 3 simple
          steps:
        </div> */}
              <div className="card-body">
                <div className="card-body-section" style={{ marginTop: 0 }}>
                  <LoginSvg />
                  <div className="helper-login">Helper Login</div>
                  <div className="helper-excerpt">
                    Please enter your credentials below...
                  </div>
                </div>
                <div className="card-body-section1">
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
                  <div className="form-control1">
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
                    <span>or </span>
                    <span>(advanced user)</span>
                  </div>
                  <PrivateKeyLongBtnSvg />
                </div>
                <div className="bottom">
                  <input
                    style={{ width: '210px', marginTop: '27px' }}
                    type="button"
                    value="Login"
                    disabled={false}
                    onClick={this.handleLogin}
                  />
                  <div className="bottom-excerpt">Forgot your username?</div>
                </div>
              </div>
            </div>
            <GoBackSvg
              color="#4BA9D9"
              goBack={() => this.setState({ passwordSelected: false })}
            />
          </div>
        </div>
      </section>
    );
  }

  renderWelcome() {
    return (
      <section className="welcome-container">
        <div className="section">
          <div className="title">Welcome!</div>
          <div className="subtitle">
            MyPass is a secure &amp; private document storage solution.
          </div>
          <div className="sub-section">
            <HelperWelcomeSvg />
            <div className="already">
              Already a user?
              <br />
              Choose your login method
            </div>
            <div className="login-options">
              <div className="login-option">
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
            {/* <form method="GET" action="register"> */}
            {/* {this.renderHiddenInputs()} */}
            <input className="sign-up" type="button" value="Create Account" />
            {/* </form> */}
          </div>
        </div>
      </section>
    );
  }

  render() {
    const { passwordSelected, privateKeySelected } = { ...this.state };
    return (
      <main id="helper-login">
        <section className="wave-container">
          <WaveSvg />
        </section>
        {passwordSelected && this.renderLoginPassword()}
        {!passwordSelected && !privateKeySelected && this.renderWelcome()}
      </main>
    );
  }
}

export default HelperLoginPage;

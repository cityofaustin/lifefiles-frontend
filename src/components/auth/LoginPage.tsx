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
import folderImage from '../../img/folder.png';
import { ReactComponent as MyPassLogoSvg } from '../../img/mypass-logo.svg';
import AccountService from '../../services/AccountService';
import './LoginPage.scss';
import APIError from '../../services/APIError';
import HttpStatusCode from '../../models/HttpStatusCode';
import Checkbox from '../common/Checkbox';

import EthCrypto from 'eth-crypto';
import { add } from 'date-fns';

export interface LoginProps {
  handleLogin: (loginResponse: any) => Promise<void>;
}

export interface LoginState {
  email: string;
  password: string;
  errorMessage: string;
}

class LoginPage extends Component<LoginProps> {
  state = {
    email: '',
    password: '',
    errorMessage: '',
    secureAccount: false,
  };
  constructor(props: LoginProps) {
    super(props);
  }

  handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const key = e.target.name;

    if (Object.keys(this.state).includes(key)) {
      this.setState({ [key]: value } as Pick<LoginState, keyof LoginState>);
    }
  };

  handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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

  render() {
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
              {/* <div>
                <img className="logo login-logo" src={folderImage} alt="Logo" />
                <div className="login-title">MyPass</div>
              </div> */}

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
}

export default LoginPage;

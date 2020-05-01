import React, { ChangeEvent, Component, FormEvent } from 'react';
import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Label
} from 'reactstrap';
import folderImage from '../../img/folder.png';
import { ReactComponent as MyPassLogoSvg } from '../../img/mypass-logo.svg';
import AccountService from '../../services/AccountService';
import './LoginPage.scss';
import APIError from '../../services/APIError';
import HttpStatusCode from '../../models/HttpStatusCode';

export interface LoginProps {
  handleLogin: (loginResponse: any) => Promise<void>;
}

export interface LoginState {
  email: string;
  password: string;
  errorMessage: string;
}

class LoginPage extends Component<LoginProps, LoginState> {

  constructor(props: LoginProps) {
    super(props);

    this.state = {
      email: '',
      password: '',
      errorMessage: ''
    };
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

    const { handleLogin } = { ...this.props };
    const { email, password } = { ...this.state };
    let { errorMessage } = { ...this.state };

    try {
      const loginResponse = await AccountService.login({ account: { email, password } });
      if(loginResponse === undefined) {
        throw(new Error('Server unavailable.'));
      }
      await handleLogin(loginResponse);
      return;
    } catch (err) {
      if (err &&
        [HttpStatusCode.UNPROCESSABLE_ENTITY, HttpStatusCode.INTERNAL_SERVER_ERROR].includes(Number(err.message))) {
        errorMessage = 'Unable to log in with provided credentials.';
      } else {
        errorMessage = 'Oops, something went wrong. Please try again in a few minutes.';
      }
    }
    this.setState({ errorMessage });
  };

  render() {
    const { email, password, errorMessage } = { ...this.state };

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
                  <Label for="email">Email</Label>
                  <Input type="email" name="email" id="email" value={email} onChange={this.handleInputChange}
                    placeholder="Email" />
                </FormGroup>
                <FormGroup>
                  <Label for="password">Password</Label>
                  <Input type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={this.handleInputChange}
                    placeholder="Password"
                  />
                </FormGroup>
                <Button className="login-btn" type="submit">Login</Button>
              </Form>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }
}

export default LoginPage;

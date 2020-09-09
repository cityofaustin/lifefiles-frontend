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
// import { ReactComponent as MyPassLogoSvg } from '../../img/mypass-logo.svg';
import AccountService from '../../services/AccountService';
import APIError from '../../services/APIError';
import HttpStatusCode from '../../models/HttpStatusCode';
import './AdminLoginPage.scss';
import AppSetting, { SettingNameEnum } from '../../models/AppSetting';

export interface AdminLoginProps {
  appSettings: AppSetting[];
  handleLogin: (loginResponse: any) => Promise<void>;
}

export interface AdminLoginState {
  email: string;
  password: string;
  errorMessage: string;
}

class AdminLoginPage extends Component<AdminLoginProps> {
  state = {
    email: '',
    password: '',
    errorMessage: '',
  };
  constructor(props: AdminLoginProps) {
    super(props);
  }

  handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const key = e.target.name;

    if (Object.keys(this.state).includes(key)) {
      this.setState({ [key]: value } as Pick<
        AdminLoginState,
        keyof AdminLoginState
      >);
    }
  };

  handleLogin = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // const { handleLogin } = { ...this.props };
    const { email, password } = { ...this.state };
    let { errorMessage } = { ...this.state };

    try {
      const loginResponse = await AccountService.loginAdminAccount({
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
  };

  render() {
    const { appSettings } = { ...this.props };
    const { email, password, errorMessage } = { ...this.state };
    const logoSetting = appSettings.find(
      (a) => a.settingName === SettingNameEnum.LOGO
    );
    return (
      <div className="admin-login-background">
        <div className="admin-login-container">
          <Card className="admin-login-card">
            <CardBody className="admin-card-body">
              {logoSetting && (
                <img
                  style={{ height: '130px' }}
                  // className="shared-with-image-single"
                  src={AccountService.getImageURL(logoSetting.settingValue)}
                  alt="Profile"
                />
              )}
              <div className="login-subtitle">Login</div>
              <Form onSubmit={this.handleLogin}>
                {errorMessage && <div className="error">{errorMessage}</div>}
                <FormGroup>
                  <Label for="email">Email</Label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={this.handleInputChange}
                    placeholder="Email"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="password">Password</Label>
                  <Input
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={this.handleInputChange}
                    placeholder="Password"
                  />
                </FormGroup>
                <Button className="login-btn" type="submit">
                  Login
                </Button>
              </Form>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }
}

export default AdminLoginPage;

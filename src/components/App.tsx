import React, { Component } from 'react';
import LoginPage from './auth/LoginPage';
import AdminLoginPage from './auth/AdminLoginPage';
import MainContainer from './main/MainContainer';
import Account from '../models/Account';
import AuthService from '../services/AuthService';
import LoginResponse from '../models/auth/LoginResponse';
import AccountService from '../services/AccountService';
import ProgressIndicator from './common/ProgressIndicator';
import './App.scss';
import Role from '../models/Role';
import ShareRequest from '../models/ShareRequest';
import EncryptionKeyResponse from '../models/EncryptionKeyResponse';
import UrlUtil from '../util/UrlUtil';

interface AppState {
  account?: Account;
  isLoading: boolean;
  helperLogin: boolean;
  adminLogin: boolean;
  theme: string;
  privateEncryptionKey?: string;
}

class App extends Component<{}, AppState> {
  constructor(props: Readonly<{}>) {
    super(props);

    this.state = {
      account: undefined,
      isLoading: false,
      helperLogin: false,
      adminLogin: false,
      theme: Role.owner,
    };
  }

  async componentDidMount(): Promise<void> {
    let { account, theme, privateEncryptionKey } = { ...this.state };
    this.setState({ isLoading: true });
    const code = UrlUtil.getQueryVariable('code');

    if (code) {
      // they are in the process of logging in, need to exchange auth code for access token
      const response = await AccountService.getToken(code);
      AuthService.logIn(response.access_token, response.refresh_token);
      window.location.replace(`${location.origin}/index.html`);
      return;
    }
    if (AuthService.isLoggedIn()) {
      // they have a jwt access token, use app as normal
      try {
        const loginResponse = await AccountService.getMyAccount();
        const encryptionKeyResponse: EncryptionKeyResponse = await AccountService.getEncryptionKey();
        privateEncryptionKey = encryptionKeyResponse.encryptionKey;
        ({ account } = { ...loginResponse });
        theme = account?.role;
        document.body.classList.remove('theme-helper', 'theme-owner');
        document.body.classList.add(`theme-${theme}`);
      } catch (err) {
        console.error(err.message);
      }
    } else {
      // Stop flow and allow helper to login
      if (window.location.href.indexOf('helper-login') > -1) {
        this.setState({ helperLogin: true });
      } else if (window.location.href.indexOf('admin-login') > -1) {
        this.setState({ adminLogin: true });
      } else {
        // redirect to login page with all of the query string params
        const scope = '';
        const state = '';
        window.location.replace(
          process.env.AUTH_API +
            `/?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_url=${location.origin}/index.html&scope=${scope}&state=${state}`
        );
      }
    }
    this.setState({ account, theme, isLoading: false, privateEncryptionKey });
  }

  handleLogin = async (response: any): Promise<void> => {
    let { account, theme, privateEncryptionKey, adminLogin } = {
      ...this.state,
    };
    this.setState({ isLoading: true });
    try {
      const loginResponse: LoginResponse = response as LoginResponse;

      ({ account } = { ...loginResponse });
      theme = account?.role;

      if (adminLogin) {
        theme = 'admin';
      }

      document.body.classList.remove(
        'theme-helper',
        'theme-owner',
        'theme-admin'
      );
      document.body.classList.add(`theme-${theme}`);

      AuthService.logIn(account?.token, '');
      const encryptionKeyResponse: EncryptionKeyResponse = await AccountService.getEncryptionKey();
      privateEncryptionKey = encryptionKeyResponse.encryptionKey;
    } catch (err) {
      console.error('failed to login.');
      console.error(err);
    }
    this.setState({ account, theme, isLoading: false, privateEncryptionKey });
  };

  handleLogout = () => {
    AuthService.logOut();
    this.setState({ account: undefined });
  };

  updateAccountShareRequests = (requests: ShareRequest[]) => {
    const { account } = { ...this.state };
    account!.shareRequests = requests;
    this.setState({ account });
  };

  render() {
    const {
      account,
      isLoading,
      privateEncryptionKey,
      helperLogin,
      adminLogin,
    } = {
      ...this.state,
    };

    let pageToRender = <ProgressIndicator isFullscreen />;

    if (helperLogin) {
      pageToRender = <LoginPage handleLogin={this.handleLogin} />;
    }

    if (adminLogin) {
      pageToRender = <AdminLoginPage handleLogin={this.handleLogin} />;
    }

    return (
      <div className="app-container">
        {process.env.NODE_ENV === 'development' && (
          <div className="screen-info" />
        )}
        {isLoading && <ProgressIndicator isFullscreen />}
        {!isLoading && (
          <div className="page-container">
            {account && (
              <MainContainer
                account={account}
                handleLogout={this.handleLogout}
                updateAccountShareRequests={this.updateAccountShareRequests}
                privateEncryptionKey={privateEncryptionKey}
              />
            )}
            {!account && pageToRender}
          </div>
        )}
      </div>
    );
  }
}

export default App;

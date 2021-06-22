import React, { Component, Fragment } from 'react';
import SecureLoginPage from './auth/SecureLoginPage';
import AdminLoginPage from './auth/AdminLoginPage';
import OauthFlow from './auth/OauthFlow';
import MainContainer from './main/MainContainer';
import Account from '../models/Account';
import AuthService from '../services/AuthService';
import LoginResponse from '../models/auth/LoginResponse';
import AccountService from '../services/AccountService';
import ApiService from '../services/APIService';
import ProgressIndicator from './common/ProgressIndicator';
import './App.scss';
import Role from '../models/Role';
import ShareRequest from '../models/ShareRequest';
import EncryptionKeyResponse from '../models/EncryptionKeyResponse';
import UrlUtil from '../util/UrlUtil';
import LogoSvg from './svg/logo-svg';
import AppSetting, { SettingNameEnum } from '../models/AppSetting';
import AdminService from '../services/AdminService';
import {
  HashRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from 'react-router-dom';

interface AppState {
  account?: Account;
  coreFeatures: string[];
  viewFeatures: string[];
  logoFile?: File;
  isLoading: boolean;
  theme: string;
  privateEncryptionKey?: string;
  appSettings: AppSetting[];
}

class App extends Component<{}, AppState> {
  constructor(props: Readonly<{}>) {
    super(props);

    this.state = {
      appSettings: [],
      logoFile: undefined,
      account: undefined,
      isLoading: true,
      theme: Role.owner,
      coreFeatures: [],
      viewFeatures: [],
    };
  }

  async componentDidMount(): Promise<void> {
    let { appSettings, account, theme, coreFeatures, viewFeatures } = {
      ...this.state,
    };

    setTimeout(() => {
      document.getElementById('splash')!.style.animation = 'fadeout 1s';
      document.getElementById('splash')!.style.opacity = '0';
      document.getElementById('main')!.style.animation = 'fadein 1s';
      document.getElementById('main')!.style.opacity = '1';
    }, 500);
    if (process.env.MYPASS_API === undefined) {
      if (window.location.href.indexOf('localhost') > -1) {
        ApiService.setApiEndpoint('http://localhost:5000/api');
      } else {
        ApiService.setApiEndpoint(location.origin + '/api');
      }
    } else {
      ApiService.setApiEndpoint(process.env.MYPASS_API);
    }
    if (process.env.AUTH_API === undefined) {
      const response = await AccountService.getOauthEndpoint();
      AccountService.setAuthApi(response.url);
    } else {
      AccountService.setAuthApi(process.env.AUTH_API);
    }

    if (AuthService.isLoggedIn()) {
      // they have a jwt access token, use app as normal
      try {
        const loginResponse = await AccountService.getMyAccount();
        ({ account, coreFeatures, viewFeatures } = { ...loginResponse });
        theme = account?.role;
        document.body.classList.remove('theme-helper', 'theme-owner');
        document.body.classList.add(`theme-${theme}`);
        await this.handleEncryptionKey(account?.role, account.isSecure);
      } catch (err) {
        console.error(err.message);
      }
    }
    try {
      appSettings = (await AdminService.getAppSettings()).map((a) => {
        return { settingName: a.settingName, settingValue: a.settingValue };
      });
      const titleSetting = appSettings.find(
        (a) => a.settingName === SettingNameEnum.TITLE
      );
      if (titleSetting) {
        document.title = titleSetting.settingValue;
      }
    } catch (err) {
      console.error('failed to get app settings.');
    }
    this.setState({
      account,
      theme,
      appSettings,
      isLoading: false,
      coreFeatures,
      viewFeatures,
    });
  }

  setBringYourOwnEncryptionKey = (key) => {
    let { privateEncryptionKey } = { ...this.state };
    privateEncryptionKey = key;
    this.setState({ privateEncryptionKey });
    window.sessionStorage.setItem('bring-your-own-key', key);
  };

  handleEncryptionKey = async (role, isSecure = false) => {
    let cookieValue;

    try {
      if (document.cookie !== undefined) {
        cookieValue = document.cookie
          .split('; ')
          .find((row) => row.startsWith('bring-your-own-key'))!
          .split('=')[1];
      }
    } catch (e) {}

    // Owner BYOK
    if (cookieValue !== undefined && cookieValue.length >= 64) {
      // this.setState({ privateEncryptionKey: cookieValue });
      this.setBringYourOwnEncryptionKey(cookieValue);
      document.cookie = 'bring-your-own-key=' + -1;
    }

    if (window.sessionStorage.getItem('bring-your-own-key') === null) {
      // If the user did not provider their own key we will provide one
      let encryptionKeyResponse: EncryptionKeyResponse;
      if (role === 'owner') {
        encryptionKeyResponse = await AccountService.getEncryptionKey(isSecure);
      } else {
        encryptionKeyResponse = await AccountService.getHelperEncryptionKey();
      }
      let key = encryptionKeyResponse.encryptionKey;
      this.setState({ privateEncryptionKey: key });
    } else {
      let key = window.sessionStorage.getItem('bring-your-own-key');
      this.setState({ privateEncryptionKey: key! });
    }
  };

  handleLogin = async (response: any): Promise<void> => {
    let { account, theme, coreFeatures, viewFeatures } = {
      ...this.state,
    };

    this.setState({ isLoading: true });
    try {
      const loginResponse: LoginResponse = response as LoginResponse;

      ({ account } = { ...loginResponse });
      theme = account?.role;

      document.body.classList.remove(
        'theme-helper',
        'theme-owner',
        'theme-admin'
      );
      document.body.classList.add(`theme-${theme}`);

      AuthService.logIn(account?.token, '');

      await this.handleEncryptionKey(account?.role, account.isSecure);
      const myAccountResponse = await AccountService.getMyAccount();
      ({ account, coreFeatures, viewFeatures } = { ...myAccountResponse });
    } catch (err) {
      console.error('failed to login.');
      console.error(err);
    }
    this.setState({
      account,
      theme,
      isLoading: false,
      coreFeatures,
      viewFeatures,
    });
  };

  handleLogout = () => {
    const {account} = {...this.state};
    if (account && account.role === Role.helper) {
      AuthService.logOut();
    } else {
      AuthService.logOut(account?.isSecure);
    }
    window.sessionStorage.removeItem('bring-your-own-key');
    this.setState({ account: undefined });
  };

  updateAccountShareRequests = (requests: ShareRequest[]) => {
    const { account } = { ...this.state };
    account!.shareRequests = requests;
    this.setState({ account });
  };

  saveAppSettings = async (title: string, logoImage?: File) => {
    const { appSettings } = { ...this.state };
    const savedAppSettings = await AdminService.saveAppSettings(
      title,
      logoImage
    );
    appSettings.map((a) => {
      const matchedSavedSetting = savedAppSettings.find(
        (s) => s.settingName === a.settingName
      );
      if (matchedSavedSetting) {
        a.settingValue = matchedSavedSetting.settingValue;
      }
      return a;
    });
    this.setState({ appSettings });
    alert('Successfully saved settings.');
  };

  handleSaveAdminAccount = async (email: string, password: string) => {
    const { account } = {...this.state};
    await AdminService.saveAdminAccount(email, password);
    account!.email = email;
    this.setState({account});
  };

  render() {
    const {
      account,
      isLoading,
      privateEncryptionKey,
      appSettings,
      coreFeatures,
      viewFeatures,
    } = {
      ...this.state,
    };
    let backgroundColor = '#2362c7';
    if (window.location.href.indexOf('helper-login') > -1) {
      backgroundColor = '#4ca9d8';
    }
    if (window.location.href.indexOf('admin-login') > -1) {
      backgroundColor = '#000';
    }
    return (
      <Fragment>
        <div
          id="splash"
          style={{
            backgroundColor,
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100vw',
          }}
        >
          <LogoSvg />
        </div>
        <div id="main" className="app-container">
          {process.env.NODE_ENV === 'development' && (
            <div className="screen-info" />
          )}
          {isLoading && <ProgressIndicator isFullscreen />}
          {!isLoading && (
            <div className="page-container">
              {!account && (
                <Router hashType="slash">
                  <Switch>
                    <Route path="/helper-login">
                      <SecureLoginPage
                        role={Role.helper}
                        appSettings={appSettings}
                        handleLogin={this.handleLogin}
                      />
                    </Route>
                    <Route path="/admin-login">
                      <AdminLoginPage
                        appSettings={appSettings}
                        handleLogin={this.handleLogin}
                      />
                    </Route>
                    <Route path="/secure-login">
                      <SecureLoginPage
                        role={Role.owner}
                        appSettings={appSettings}
                        handleLogin={this.handleLogin}
                      />
                    </Route>
                    <Route>
                      <OauthFlow />
                    </Route>
                  </Switch>
                </Router>
              )}
              {account && (
                <MainContainer
                  handleSaveAdminAccount={this.handleSaveAdminAccount}
                  appSettings={appSettings}
                  saveAppSettings={this.saveAppSettings}
                  account={account}
                  setMyAccount={(a) => this.setState({ account: a })}
                  coreFeatures={coreFeatures}
                  viewFeatures={viewFeatures}
                  handleLogout={this.handleLogout}
                  updateAccountShareRequests={this.updateAccountShareRequests}
                  privateEncryptionKey={privateEncryptionKey}
                  setBringYourOwnEncryptionKey={
                    this.setBringYourOwnEncryptionKey
                  }
                />
              )}
              {/* {!account && pageToRender} */}
            </div>
          )}
        </div>
      </Fragment>
    );
  }
}

export default App;

import React, {Component} from 'react';
import LoginPage from './auth/LoginPage';
import MainContainer from './main/MainContainer';
import Account from '../models/Account';
import AuthService from '../services/AuthService';
import LoginResponse from '../models/auth/LoginResponse';
import AccountService from '../services/AccountService';
import ProgressIndicator from './common/ProgressIndicator';
import './App.scss';
import Role from '../models/Role';

interface AppState {
  account?: Account;
  isLoading: boolean;
  theme: string;
}

class App extends Component<{}, AppState> {
  constructor(props: Readonly<{}>) {
    super(props);

    this.state = {
      account: undefined,
      isLoading: false,
      theme: Role.owner
    };
  }

  async componentDidMount(): Promise<void> {
    let {account, theme} = {...this.state};
    this.setState({isLoading: true});
    if (AuthService.isLoggedIn()) {
      const loginResponse = await AccountService.getMyAccount();
      ({account} = {...loginResponse});
      theme = account?.role;
    }
    this.setState({account, theme, isLoading: false});
  }

  handleLogin = async (response: any): Promise<void> => {
    let {account, theme} = {...this.state};
    this.setState({isLoading: true});
    try {
      const loginResponse: LoginResponse = response as LoginResponse;
      ({account} = {...loginResponse});
      theme = account?.role;
      AuthService.logIn(account?.token);
    } catch (err) {
      console.error('failed to login.');
    }
    this.setState({account, theme, isLoading: false});
  };

  handleLogout = () => {
    AuthService.logOut();
    this.setState({ account: undefined });
  };

  render() {
    const {account, isLoading, theme} = {...this.state};
    return (
      <div className={`app-container theme-${theme}`}>
        {isLoading &&
        <ProgressIndicator isFullscreen/>
        }
        {!isLoading &&
        <div className="page-container">
          {account && <MainContainer account={account} handleLogout={this.handleLogout}/>}
          {!account && <LoginPage handleLogin={this.handleLogin}/>}
        </div>
        }
      </div>
    );
  }
}

export default App;

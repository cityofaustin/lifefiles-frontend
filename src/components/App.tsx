import React, {Component} from 'react';
import LoginPage from './auth/LoginPage';
import HomePage from './home/HomePage';
import Account from '../models/Account';
import AuthService from '../services/AuthService';
import LoginResponse from '../models/auth/LoginResponse';
import AccountService from '../services/AccountService';
import ProgressIndicator from './common/ProgressIndicator';
import './App.scss';

export interface AppState {
  account?: Account;
  isLoading: boolean;
}

class App extends Component<{}, AppState> {
  constructor(props: Readonly<{}>) {
    super(props);

    this.state = {
      account: undefined,
      isLoading: false
    };
  }

  async componentDidMount(): Promise<void> {
    let {account} = {...this.state};
    this.setState({isLoading: true});
    if (AuthService.isLoggedIn()) {
      const loginResponse = await AccountService.getMyAccount();
      ({account} = {...loginResponse});
    }
    this.setState({account, isLoading: false});
  }

  handleLogin = async (response: any): Promise<void> => {
    let {account} = {...this.state};
    this.setState({isLoading: true});
    try {
      const loginResponse: LoginResponse = response as LoginResponse;
      ({account} = {...loginResponse});
      AuthService.logIn(account?.token);
    } catch (err) {
      console.error('failed to login.');
    }
    this.setState({account, isLoading: false});
  };

  handleLogout = () => {
    AuthService.logOut();
    this.setState({ account: undefined });
  };

  render() {
    const {account, isLoading} = {...this.state};
    return (
      <div className="app-container">
        {isLoading &&
        <ProgressIndicator isFullscreen/>
        }
        {!isLoading &&
        <div className="page-container">
          {account && <HomePage account={account} handleLogout={this.handleLogout}/>}
          {!account && <LoginPage handleLogin={this.handleLogin}/>}
        </div>
        }
      </div>
    );
  }
}

export default App;

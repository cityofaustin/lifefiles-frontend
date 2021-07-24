import React, { Component, Fragment } from 'react';
import AccountService from '../../services/AccountService';
import AuthService from '../../services/AuthService';
import UrlUtil from '../../util/UrlUtil';

export default class OauthFlow extends Component {
  async componentDidMount() {
    const code = UrlUtil.getQueryVariable('code');

    if (code) {
      // they are in the process of logging in, need to exchange auth code for access token
      const response = await AccountService.getToken(code);
      AuthService.logIn(response.access_token, response.refresh_token);
      window.location.replace(`${location.origin}${location.pathname}`);
      return;
    }
    if (AuthService.isLoggedIn()) {
      return;
    }

    const scope = '';
    const state = '';
    const authApi = AccountService.getAuthApi();
    window.location.replace(
      `${authApi}/?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=${location.origin}${location.pathname}&scope=${scope}&state=${state}`
    );
  }

  render() {
    return <Fragment />;
  }
}

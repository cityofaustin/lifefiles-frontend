import React, { Component, Fragment } from 'react';
import Account from '../../models/Account';
import AccountService from '../../services/AccountService';
import StringUtil from '../../util/StringUtil';

interface ProfileImageProps {
  account: Account;
}

export default class ProfileImage extends Component<ProfileImageProps> {
  hasNameSet(account) {
    return (
      account.firstName &&
      account.firstName.length > 0 &&
      account.firstName !== '-' &&
      account.lastName &&
      account.lastName.length > 0 &&
      account.lastName !== '-'
    );
  }

  render() {
    const { account } = { ...this.props };
    return (
      <Fragment>
        {account.profileImageUrl && (
          <img
            className="shared-with-image-single"
            src={AccountService.getProfileURL(account.profileImageUrl)}
            alt="Profile"
          />
        )}
        {!account.profileImageUrl && (
          <div className="account-circle">
            {this.hasNameSet(account) &&
              StringUtil.getFirstUppercase(account.firstName!) +
                StringUtil.getFirstUppercase(account.lastName!)}
            {!this.hasNameSet(account) &&
              StringUtil.getFirstUppercase(account.username) +
                StringUtil.getSecondLowercase(account.username)}
          </div>
        )}
      </Fragment>
    );
  }
}

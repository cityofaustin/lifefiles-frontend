import React, { Component, Fragment } from 'react';
import Account from '../../models/Account';
import AccountImpl from '../../models/AccountImpl';
import AccountService from '../../services/AccountService';
import StringUtil from '../../util/StringUtil';

interface ProfileImageProps {
  account: Account;
  size: ProfileImageSizeEnum;
}

export enum ProfileImageSizeEnum {
  XS='xs',
  SMALL='sm',
  MEDIUM='md',
  LARGE='lg'
}

export default class ProfileImage extends Component<ProfileImageProps> {
  static defaultProps = {
    size: ProfileImageSizeEnum.MEDIUM
  };

  render() {
    const { account, size } = { ...this.props };
    return (
      <Fragment>
        {!account.isNotDisplayPhoto && account.profileImageUrl && (
          <img
            className="shared-with-image-single"
            src={AccountService.getProfileURL(account.profileImageUrl)}
            alt="Profile"
          />
        )}
        {(account.isNotDisplayPhoto || !account.profileImageUrl) && (
          <div className={'account-circle ' + size}>
            {AccountImpl.hasNameSet(account) &&
              StringUtil.getFirstUppercase(account.firstName!) +
                StringUtil.getFirstUppercase(account.lastName!)}
            {!AccountImpl.hasNameSet(account) &&
              StringUtil.getFirstUppercase(account.username) +
                StringUtil.getSecondLowercase(account.username)}
          </div>
        )}
      </Fragment>
    );
  }
}

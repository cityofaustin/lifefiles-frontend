import React, {Component, Fragment} from 'react';
import Account from '../../../models/Account';
import classNames from 'classnames';
import StringUtil from '../../../util/StringUtil';
import AccountService from '../../../services/AccountService';
import './SharedWith.scss';

interface SharedWithProps {
  sharedAccounts: Account[];
}

class SharedWith extends Component<SharedWithProps> {

  renderFirstShare(sharedAccounts: Account[]) {
    const sharedAccount = sharedAccounts[0];
    // console.log(sharedAccount);
    return (
      <Fragment>
        {!sharedAccount.profileImageUrl && (
          <div className={classNames({'shared-with-other': true, 'shared-with-small': sharedAccounts.length > 1})}>
            {sharedAccount.firstName && StringUtil.getFirstUppercase(sharedAccount.firstName)}
            {sharedAccount.lastName && StringUtil.getFirstUppercase(sharedAccount.lastName)}
          </div>
        )}
        {sharedAccount.profileImageUrl && (
          <img className={classNames({'shared-with-other': true, 'shared-with-small': sharedAccounts.length > 1})}
               src={AccountService.getProfileURL(sharedAccount.profileImageUrl)}
               alt="sharedWithItemFirst"
          />
        )}
      </Fragment>
    );
  }

  renderOtherShare(sharedAccounts: Account[]) {
    if (sharedAccounts.length === 2) {
      const sharedAccount = sharedAccounts[1];
      return (
        <Fragment>
          {!sharedAccount.profileImageUrl && (
            <div className="shared-with-other">
              {sharedAccount.firstName && StringUtil.getFirstUppercase(sharedAccount.firstName)}
              {sharedAccount.lastName && StringUtil.getFirstUppercase(sharedAccount.lastName)}
            </div>
          )}
          {sharedAccount.profileImageUrl && (
            <img className="shared-with-other"
                 src={AccountService.getProfileURL(sharedAccount.profileImageUrl)}
                 alt="sharedWithItemFirst"
            />
          )}
        </Fragment>

      );
    }
    if (sharedAccounts.length > 2) {
      return (
        <div className="shared-with-other">+{sharedAccounts.length - 1}</div>
      );
    }
    return (
      <Fragment/>
    );
  }

  render() {
    const {sharedAccounts} = {...this.props};
    return (
      <div className={classNames({'shared-with-container': true, 'shared-multi': sharedAccounts.length > 1})}>
        {sharedAccounts.length > 0 && (
          <Fragment>
            {this.renderFirstShare(sharedAccounts)}
            {this.renderOtherShare(sharedAccounts)}
          </Fragment>
        )}
      </div>
    );
  }
}

export default SharedWith;

import './Sidebar.scss';
import React, { Component, Fragment } from 'react';
import { Swipeable } from 'react-swipeable';
import classNames from 'classnames';
import Account from '../../models/Account';
import AccountImpl from '../../models/AccountImpl';
import AccountService from '../../services/AccountService';
import { ReactComponent as EditSvg } from '../../img/edit.svg';
import { ReactComponent as Contact } from '../../img/contact.svg';
import { ReactComponent as ContactGroup } from '../../img/contact-grp.svg';
import { ReactComponent as Cog } from '../../img/cog.svg';
import { ReactComponent as Help } from '../../img/help.svg';
import { ReactComponent as MyPassLogoSvg } from '../../img/mypass-logo.svg';
import { Link } from 'react-router-dom';


interface SidebarProps {
  goToAccount: () => void;
  handleLogout: () => void;
  isOpen: boolean;
  setOpen: (b: boolean) => void;
  account: Account;
}

class SideBar extends Component<SidebarProps> {

  handleLogout = () => {
    const { handleLogout, setOpen } = { ...this.props };
    setOpen(false);
    handleLogout();
  };

  goToAccount = () => {
    const { goToAccount, setOpen } = { ...this.props };
    setOpen(false);
    goToAccount();
  };

  render() {
    const { isOpen, setOpen, account } = { ...this.props };
    return (
      <div className="sidebar">
        <Swipeable
          className="touchable-area"
          onSwipedRight={() => setOpen(true)}
          trackMouse
        />
        <div>
          <div
            className={classNames({ 'bm-overlay': true, 'opened': isOpen })}
            onClick={() => setOpen(false)}
          />
          <Swipeable
            onSwipedLeft={() => setOpen(false)}
            trackMouse
          >
            <div className={classNames({ 'bm-menu-wrap': true, 'opened': isOpen })}>
              <div className="bm-menu">
                <div className="top-section">
                  <div className="img-container">
                    <img
                      className="profile-img"
                      src={AccountService.getProfileURL(account.profileImageUrl!)}
                      alt="Profile"
                    />
                  </div>
                  <div className="fullname">{AccountImpl.getFullName(account.firstName, account.lastName)}</div>
                  <div className="email">{account.email}</div>
                  <div className="edit"><span>edit profile</span><EditSvg /></div>
                </div>
                <div className="bottom-section">
                  <nav className="bm-item-list">
                    <span className="bm-item menu-item" onClick={() => setOpen(false)}>
                        <span><Contact /></span><Link to="/account"><span>My Profile</span>
                      </Link>
                    </span>
                    <span className="bm-item menu-item">
                      <span><ContactGroup /></span><span>My Network</span>
                    </span>
                    <span className="bm-item menu-item">
                      <span><Cog /></span><span>My Settings</span>
                    </span>
                    <span className="bm-item menu-item">
                      <span><Help /></span><span>Help</span>
                    </span>
                    <span className="bm-item menu-item" onClick={this.handleLogout}>
                      <span /><span>Logout</span>
                    </span>
                  </nav>
                  <div className="sidemenu-footer">
                    <MyPassLogoSvg />
                    <ul>
                      <li>About</li>
                      <li>Privacy Notice</li>
                      <li>Terms of Service</li>
                      <li>Legal Rights</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Swipeable>
        </div>
      </div>
    );
  }
}

export default SideBar;

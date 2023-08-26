import "./Sidebar.scss";
import React, { Component, Fragment } from "react";
import { useSwipeable } from "react-swipeable";
import classNames from "classnames";
import Account from "../../models/Account";
import AccountImpl from "../../models/AccountImpl";
import AccountService from "../../services/AccountService";
import { ReactComponent as EditSvg } from "../../img/edit.svg";
import { ReactComponent as Contact } from "../../img/contact.svg";
import { ReactComponent as ContactGroup } from "../../img/contact-grp.svg";
import { ReactComponent as Cog } from "../../img/cog.svg";
import { ReactComponent as Help } from "../../img/help.svg";
import { ReactComponent as LogoutSvg } from "../../img/logout.svg";
// import { ReactComponent as MyPassLogoSvg } from '../../img/mypass-logo.svg';
import { Link } from "react-router-dom";
import AppSetting, { SettingNameEnum } from "../../models/AppSetting";
import ProfileImage from "../common/ProfileImage";
import Role from "../../models/Role";

interface SidebarProps {
  appSettings: AppSetting[];
  goToAccount: () => void;
  goToMySettings: () => void;
  handleLogout: () => void;
  isOpen: boolean;
  setOpen: (b: boolean) => void;
  account: Account;
}

const SideBar = (props: SidebarProps) => {
  const handleLogout = () => {
    const { handleLogout, setOpen } = { ...props };
    setOpen(false);
    handleLogout();
  };

  const goToAccount = () => {
    const { goToAccount, setOpen } = { ...props };
    setOpen(false);
    goToAccount();
  };

  const goToMySettings = () => {
    const { goToMySettings, setOpen } = { ...props };
    setOpen(false);
    goToMySettings();
  };

  const swipeHandlerLeft = useSwipeable({
    onSwipedRight: () => setOpen(true),
    trackMouse: true,
  });
  const swipeHandlerRight = useSwipeable({
    onSwipedLeft: () => setOpen(false),
    trackMouse: true,
  });

  const { isOpen, setOpen, account, appSettings } = { ...props };
  const logoSetting = appSettings.find(
    (a) => a.settingName === SettingNameEnum.LOGO
  );
  return (
    <div className="sidebar">
      <div className="touchable-area" {...swipeHandlerLeft} />
      <div>
        <div
          className={classNames({ "bm-overlay": true, opened: isOpen })}
          onClick={() => setOpen(false)}
        />
        <div
          {...swipeHandlerRight}
          className={classNames({ "bm-menu-wrap": true, opened: isOpen })}
        >
          <div className="bm-menu">
            <div className="top-section">
              <div className="img-container">
                <ProfileImage account={account} />
              </div>
              <div className="fullname">
                {AccountImpl.getFullName(account.firstName, account.lastName)}
              </div>
              <div className="email">{account.email}</div>
              <div className="edit">
                <span>edit profile</span>
                <EditSvg />
              </div>
            </div>
            <div className="bottom-section">
              <nav className="bm-item-list">
                <span
                  className="bm-item menu-item"
                  onClick={() => setOpen(false)}
                >
                  <span>
                    <Contact />
                  </span>
                  {account.role === Role.helper && (
                    <Link to="/helper-login/account">
                      <span>My Profile</span>
                    </Link>
                  )}
                  {account.role === Role.owner && (
                    <Link to="/account">
                      <span>My Profile</span>
                    </Link>
                  )}
                </span>
                <span className="bm-item menu-item">
                  <span>
                    <ContactGroup />
                  </span>
                  <span>My Network</span>
                </span>
                <span
                  className="bm-item menu-item"
                  onClick={goToMySettings}
                >
                  <span>
                    <Cog />
                  </span>
                  <span>My Settings</span>
                </span>
                <span className="bm-item menu-item">
                  <span>
                    <Help />
                  </span>
                  <span>Help</span>
                </span>
                <span className="bm-item menu-item" onClick={handleLogout}>
                  <span>
                    <LogoutSvg />
                  </span>
                  <span>Logout</span>
                </span>
              </nav>
              <div className="sidemenu-footer">
                {logoSetting && (
                  <img
                    style={{ height: "56px" }}
                    // className="shared-with-image-single"
                    src={AccountService.getImageURL(logoSetting.settingValue)}
                    alt="Profile"
                  />
                )}
                {/* <MyPassLogoSvg /> */}
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
      </div>
    </div>
  );
};

export default SideBar;

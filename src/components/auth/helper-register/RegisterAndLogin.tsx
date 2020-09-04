import React, { Component } from 'react';
import { ReactComponent as LoginSvg } from '../../../img/login.svg';
import { ReactComponent as LoaderSvg } from '../../../img/loader.svg';
import { handleIOSBrowser } from '../../../util/browser-util';
import { animateIn, getSectionClassName } from '../../../util/animation-util';
interface RegisterAndLoginProps {
  position?: string;
}
export default class RegisterAndLogin extends Component<RegisterAndLoginProps> {
  componentDidMount() {
    handleIOSBrowser();
    animateIn(this.refs.section);
  }
  render() {
    return (
      <div
        ref="section"
        id="section-6-helper"
        className={getSectionClassName(this.props.position)}
      >
        <div className="section-contents">
          <div className="title1">Congratulations!</div>
          <div className="subtitle">
            Your MyPass account has been successfully created
          </div>
          <div className="no-card">
            <LoginSvg />
            <div className="account-title">Your Account</div>
            <div className="rotate">
              <LoaderSvg />
            </div>
            <div className="helper-excerpt">
              Please wait while we log you in
            </div>
          </div>
        </div>
      </div>
    );
  }
}

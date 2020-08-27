import React, { Component } from 'react';
import GoBackSvg from '../../svg/GoBackSvg';
interface HelperLoginSetupProps {
  goBack: () => void;
  goForward: (prevCardState: any) => void;
}
export default class HelperLoginSetup extends Component<HelperLoginSetupProps> {
  render() {
    const { goForward, goBack } = { ...this.props };
    return (
      <section id="helper-register" className="container">
        <div ref="section" id="section-1-owner" className="section">
          <div className="section-contents">
            <div className="title1">Document Helper</div>
            <div className="subtitle">Creating an account</div>
            <div className="card owner1">
              <div className="card-body">
                <div className="card-body-section" style={{ marginTop: 0 }}>
                  <div className="helper-login" style={{ margin: '0 -2px' }}>
                    Please choose a password to log into your account
                  </div>
                </div>
                <div className="login-options"></div>
                <div className="bottom">
                  <input
                    style={{ width: '210px', marginTop: '27px' }}
                    type="button"
                    value="Set Password"
                    disabled={true}
                    onClick={() => goForward(this.state)}
                  />
                </div>
              </div>
            </div>
            <GoBackSvg color="#4BA9D9" goBack={goBack} />
          </div>
        </div>
      </section>
    );
  }
}

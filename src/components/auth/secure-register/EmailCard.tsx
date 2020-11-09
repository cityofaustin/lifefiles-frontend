import React, { Component, Fragment } from 'react';
import { ReactComponent as InfoTooltipSvg } from '../../../img/info-tooltip.svg';
import { ReactComponent as EmailPopupSvg } from '../../../img/email-popup.svg';
import GoBackSvg from '../../svg/GoBackSvg';
import { handleIOSBrowser } from '../../../util/browser-util';
import { animateIn, getSectionClassName } from '../../../util/animation-util';
import Role from '../../../models/Role';
import { Button } from 'reactstrap';
export interface EmailCardState {
  email: string;
  fullname: string;
}
interface EmailCardProps {
  role: Role;
  email: string;
  fullname: string;
  goBack: () => void;
  goForward: (prevCardState: EmailCardState) => void;
  errorMessage: string;
  position?: string;
}
export default class EmailCard extends Component<
  EmailCardProps,
  EmailCardState
> {
  constructor(props: Readonly<EmailCardProps>) {
    super(props);
    const { email, fullname } = { ...props };
    this.state = { email, fullname };
  }
  componentDidMount() {
    handleIOSBrowser();
    animateIn(this.refs.section);
  }
  render() {
    const { email, fullname } = { ...this.state };
    const { goBack, goForward, errorMessage, role } = { ...this.props };
    return (
      <div
        ref="section"
        id="section-0-helper"
        className={getSectionClassName(this.props.position)}
      >
        <div className="section-contents">
          <div className="title1" style={{ textTransform: 'capitalize' }}>Document {role}</div>
          <div className="subtitle">Ok, let's pick a username</div>
          <div className="card owner1">
            <div className="card-body">
              <div className="card-body-section" style={{ marginTop: 0 }}>
                {role === Role.helper && (
                  <Fragment>
                    <div
                      className="helper-login"
                      style={{ textTransform: 'none' }}
                    >
                      How can owners find you?
                    </div>
                    <div className="helper-excerpt">
                      Your name and e-mail are used by document owners to find
                      and add you to their network
                    </div>
                  </Fragment>
                )}
                {role === Role.owner && (
                  <div
                    className="helper-login"
                    style={{ textTransform: 'none' }}
                  >
                    What is your name and e-mail?
                  </div>
                )}
              </div>
              <div className="card-body-section1">
                {errorMessage && <div className="error">{errorMessage}</div>}
                <div className="form-control1">
                  <label>Full Name</label>
                  <input
                    className="username-input"
                    name="fullname"
                    type="text"
                    value={fullname}
                    onChange={(e) =>
                      this.setState({ fullname: e.target.value })
                    }
                  />
                </div>
                <div className="form-control1" style={{ marginTop: '10px' }}>
                  <div className="info-section">
                    <label>E-mail</label>
                    <div className="tooltip1">
                      <EmailPopupSvg />
                      <InfoTooltipSvg />
                    </div>
                  </div>
                  <input
                    name="email"
                    type="text"
                    value={email}
                    onChange={(e) => this.setState({ email: e.target.value })}
                  />
                </div>
              </div>
              <div className="bottom">
                <Button
                  color="primary"
                  style={{
                    width: '210px',
                    marginTop: '27px',
                    fontSize: '25px',
                    height: '50px',
                    borderRadius: '9px',
                  }}
                  disabled={email.length < 1 || fullname.length < 1}
                  onClick={() => goForward(this.state)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
          <GoBackSvg
            color={role === Role.owner ? '#2362C7' : '#4BA9D9'}
            goBack={goBack}
          />
        </div>
      </div>
    );
  }
}

import React, { Component, Fragment } from 'react';
import HelperLoginOption, { LoginOption } from '../../svg/HelperLoginOption';
import GoBackSvg from '../../svg/GoBackSvg';
import { handleIOSBrowser } from '../../../util/browser-util';
import { animateIn, getSectionClassName } from '../../../util/animation-util';
import Role from '../../../models/Role';
import { Button } from 'reactstrap';

interface SecureLoginMethodProps {
  role: Role;
  selectedOption?: LoginOption;
  goBack: () => void;
  goForward: (prevCardState: SecureLoginMethodState) => void;
  position?: string;
}
export interface SecureLoginMethodState {
  selectedOption?: string;
}
export default class SecureLoginMethod extends Component<
  SecureLoginMethodProps,
  SecureLoginMethodState
> {
  constructor(props) {
    super(props);
    const { selectedOption } = { ...this.props };
    this.state = {
      selectedOption,
    };
  }
  componentDidMount() {
    handleIOSBrowser();
    animateIn(this.refs.section);
  }
  render() {
    const { goForward, goBack, role } = { ...this.props };
    const { selectedOption } = { ...this.state };
    return (
      <div
        ref="section"
        id="section-3-helper"
        className={getSectionClassName(this.props.position)}
      >
        <div className="section-contents">
          <div className="title1" style={{ textTransform: 'capitalize' }}>
            Document {role}
          </div>
          <div className="subtitle">Choose your login method</div>
          <div className="card owner1">
            <div className="card-body">
              <div className="card-body-section" style={{ marginTop: 0 }}>
                <div className="helper-login" style={{ margin: '0 -2px' }}>
                  What method of login do you need?
                </div>
              </div>
              {role === Role.owner && (
                <Fragment />
              )}
              {role === Role.helper && (
                <div className="login-options">
                  <div
                    onClick={() =>
                      this.setState({ selectedOption: LoginOption.PrivateKey })
                    }
                  >
                    <HelperLoginOption
                      selected={selectedOption === LoginOption.PrivateKey}
                      option={LoginOption.PrivateKey}
                    />
                  </div>
                  <div
                    onClick={() =>
                      this.setState({ selectedOption: LoginOption.Password })
                    }
                  >
                    <HelperLoginOption
                      selected={selectedOption === LoginOption.Password}
                      option={LoginOption.Password}
                    />
                  </div>
                </div>
              )}
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
                  disabled={!selectedOption}
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

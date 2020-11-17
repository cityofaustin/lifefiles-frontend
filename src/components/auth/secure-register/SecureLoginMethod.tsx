import React, { Component, Fragment } from 'react';
import HelperLoginOption, { LoginOption } from '../../svg/HelperLoginOption';
import GoBackSvg from '../../svg/GoBackSvg';
import { handleIOSBrowser } from '../../../util/browser-util';
import { animateIn, getSectionClassName } from '../../../util/animation-util';
import Role from '../../../models/Role';
import { Button } from 'reactstrap';
import { ReactComponent as OwnerPasswordOptionSvg } from '../../../img/owner-password-option.svg';
import { ReactComponent as OwnerKeyOptionSvg } from '../../../img/owner-key-option.svg';

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
          <div className="card owner1" style={{ height: '468px' }}>
            <div className="card-body">
              <div className="card-body-section" style={{ marginTop: 0 }}>
                <div className="helper-login" style={{ margin: '0 -2px' }}>
                  How would you like to login?
                </div>
              </div>
              {/* {role === Role.owner && ( */}
                <div className="owner-login-option-container">
                  <p style={{ minHeight: '18px' }}>
                    {!selectedOption
                      ? 'Please select the login method that works best for you.'
                      : ''}
                  </p>
                  <div className="owner-login-options">
                    <div
                      className={
                        selectedOption === LoginOption.Password ? 'active' : ''
                      }
                      onClick={() =>
                        this.setState({
                          selectedOption: LoginOption.Password,
                        })
                      }
                    >
                      <OwnerPasswordOptionSvg />
                    </div>
                    <div
                      className={
                        selectedOption === LoginOption.PrivateKey
                          ? 'active'
                          : ''
                      }
                      onClick={() =>
                        this.setState({
                          selectedOption: LoginOption.PrivateKey,
                        })
                      }
                    >
                      <OwnerKeyOptionSvg />
                    </div>
                  </div>
                  {selectedOption === LoginOption.Password && (
                    <div className="owner-option-excerpt">
                      <p>
                        Your password is uniquely linked to a private key and
                        once set, it cannot be changed.
                      </p>
                      <p>
                        For security reasons,{' '}
                        <strong>if you forget your password</strong> you will{' '}
                        <span className="danger">
                          permanently loose access to your account.
                        </span>
                      </p>
                    </div>
                  )}
                  {selectedOption === LoginOption.PrivateKey && (
                    <div className="owner-option-excerpt">
                      <p>
                        A private key is a string of unique characters you can
                        use to encrypt and notarize documents.
                      </p>
                      <p>
                        For security reasons, we{' '}
                        <strong>do not store your private key.</strong> If you
                        loose your private key, you will{' '}
                        <span className="danger">
                          permanently loose access to your account.
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              {/* )} */}
              {/* {role === Role.helper && (
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
              )} */}
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

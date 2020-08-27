import React, { Component } from 'react';
import HelperLoginOption, { LoginOption } from '../../svg/HelperLoginOption';
import GoBackSvg from '../../svg/GoBackSvg';
interface HelperLoginMethodProps {
  selectedOption?: LoginOption;
  goBack: () => void;
  goForward: (prevCardState: HelperLoginMethodState) => void;
}
export interface HelperLoginMethodState {
  selectedOption?: string;
}
export default class HelperLoginMethod extends Component<
  HelperLoginMethodProps,
  HelperLoginMethodState
> {
  constructor(props) {
    super(props);
    const {selectedOption}  = {...this.props};
    this.state = {
      selectedOption
    };
  }
  render() {
    const { goForward, goBack } = { ...this.props };
    const { selectedOption } = { ...this.state };
    return (
      <section id="helper-register" className="container">
        <div ref="section" id="section-1-owner" className="section">
          <div className="section-contents">
            <div className="title1">Document Helper</div>
            <div className="subtitle">Choose your login method</div>
            <div className="card owner1">
              <div className="card-body">
                <div className="card-body-section" style={{ marginTop: 0 }}>
                  <div className="helper-login" style={{ margin: '0 -2px' }}>
                    What method of login do you need?
                  </div>
                </div>
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
                <div className="bottom">
                  <input
                    style={{ width: '210px', marginTop: '27px' }}
                    type="button"
                    value="Continue"
                    disabled={!selectedOption}
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

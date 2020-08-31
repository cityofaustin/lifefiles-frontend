import React, { Component } from 'react';
import GoBackSvg from '../../svg/GoBackSvg';
import { ReactComponent as SkipSvg } from '../../../img/skip.svg';
import MSelect from '../../common/MSelect';
import { OptionTypeBase } from 'react-select';
import UsStates, { UsState } from '../../../models/UsStates';

interface NotarySetupProps {
  goBack: () => void;
  goForward: (prevCardState?: any) => void;
}
export interface NotarySetupState {
  notaryState: string;
  notaryId: string;
  notaryName: string;
}
export default class NotarySetup extends Component<
  NotarySetupProps,
  NotarySetupState
> {
  state = {
    notaryName: '',
    notaryId: '',
    notaryState: '',
  };
  render() {
    const { goBack, goForward } = { ...this.props };
    const { notaryName, notaryId, notaryState } = { ...this.state };
    let options: OptionTypeBase[] = [];
    const usStates = new UsStates();
    options = usStates.states.map((usState: UsState) => {
      return {
        value: usState.abbreviation,
        label: usState.abbreviation,
      };
    });
    return (
      <section id="helper-register" className="container">
        <div ref="section" id="section-1-owner" className="section">
          <div className="section-contents">
            <div className="title1">Document Helper</div>
            <div className="subtitle">More ways to login</div>
            <div className="card owner1">
              <div className="card-body">
                <div className="card-body-section" style={{ marginTop: '0' }}>
                  <div
                    className="helper-login"
                    style={{ margin: '0 0 13px 0' }}
                  >
                    Are you a notary?
                  </div>
                  {/* <PasswordSvg /> */}
                  <div className="helper-excerpt">
                    To enable notarization features, please enter your notary
                    information below...
                  </div>
                </div>
                <div
                  className="card-body-section1"
                  style={{ marginTop: '23px' }}
                >
                  {/* {errorMessage && <div className="error">{errorMessage}</div>} */}
                  <div className="form-control1">
                    <label>Notary name</label>
                    <input
                      name="notaryName"
                      type="text"
                      value={notaryName}
                      onChange={(e) =>
                        this.setState({ notaryName: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-control-double">
                    <div className="form-control2">
                      <label>Notary #</label>
                      <input
                        name="notaryId"
                        type="text"
                        value={notaryId}
                        onChange={(e) =>
                          this.setState({ notaryId: e.target.value })
                        }
                      />
                    </div>
                    <div className="form-control2">
                      <label>State</label>
                      <div className="state-select">
                        <MSelect
                          value={{ value: notaryState, label: notaryState }}
                          options={options}
                          onChange={(option: OptionTypeBase) =>
                            this.setState({ notaryState: option.value })
                          }
                          isSearchable={false}
                          placeholder={''}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    If you're not a notary, you may skip this step at the bottom
                    of this screen
                  </div>
                </div>
                <div className="bottom">
                  <input
                    style={{ width: '210px', marginTop: '27px' }}
                    type="button"
                    value="Next"
                    disabled={!notaryName || !notaryId || !notaryState}
                    onClick={() => goForward(this.state)}
                  />
                </div>
              </div>
            </div>
            <div className="setup-nav">
              <GoBackSvg color="#4BA9D9" goBack={goBack} />
              <div onClick={() => goForward()}>
                <SkipSvg />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

import React, { Component } from 'react';
import GoBackSvg from '../../svg/GoBackSvg';
import { ReactComponent as SkipSvg } from '../../../img/skip.svg';
import MSelect from '../../common/MSelect';
import { OptionTypeBase } from 'react-select';
import UsStates, { UsState } from '../../../models/UsStates';
import { handleIOSBrowser } from '../../../util/browser-util';
import { animateIn, getSectionClassName } from '../../../util/animation-util';
interface NotarySetupProps {
  goBack: () => void;
  goForward: (prevCardState?: any) => void;
  notaryId: string;
  notaryState: string;
  position?: string;
}
export interface NotarySetupState {
  notaryState: string;
  notaryId: string;
}
export default class NotarySetup extends Component<
  NotarySetupProps,
  NotarySetupState
> {
  constructor(props) {
    super(props);
    const { notaryId, notaryState } = { ...this.props };
    this.state = {
      notaryId,
      notaryState,
    };
  }
  componentDidMount() {
    handleIOSBrowser();
    animateIn(this.refs.section);
  }
  render() {
    const { goBack, goForward } = { ...this.props };
    const { notaryId, notaryState } = { ...this.state };
    let options: OptionTypeBase[] = [];
    const usStates = new UsStates();
    options = usStates.states.map((usState: UsState) => {
      return {
        value: usState.abbreviation,
        label: usState.abbreviation,
      };
    });
    return (
      <div
        ref="section"
        id="section-5-helper"
        className={getSectionClassName(this.props.position)}
      >
        <div className="section-contents">
          <div className="title1">Document Helper</div>
          <div className="subtitle">More ways to login</div>
          <div className="card owner1">
            <div className="card-body">
              <div className="card-body-section" style={{ marginTop: '0' }}>
                <div className="helper-login" style={{ margin: '0 0 13px 0' }}>
                  Are you a notary?
                </div>
                <div className="skip-excerpt">
                  To enable notarization features, please enter your notary
                  information below...
                </div>
              </div>
              <div
                className="card-body-section1"
                style={{ marginTop: '23px', alignItems: 'start' }}
              >
                <div className="form-control1">
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
                </div>
                <div className="form-control-double">
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
                        isSmall
                      />
                    </div>
                  </div>
                </div>
                <div className="skip-excerpt">
                  If you're not a notary, you may skip this step at the bottom
                  of this screen
                </div>
              </div>
              <div className="bottom">
                <input
                  style={{ width: '210px', marginTop: '27px' }}
                  type="button"
                  value="Next"
                  disabled={!notaryId || !notaryState}
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
    );
  }
}

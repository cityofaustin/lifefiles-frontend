import React, { Component } from 'react';
import GoBackSvg from '../../svg/GoBackSvg';
import { ReactComponent as SkipSvg } from '../../../img/skip.svg';
import MSelect from '../../common/MSelect';
import { OptionTypeBase } from 'react-select';
import UsStates, { UsState } from '../../../models/UsStates';
import { handleIOSBrowser } from '../../../util/browser-util';
import { animateIn, getSectionClassName } from '../../../util/animation-util';
import { ReactComponent as LoaderSvg } from '../../../img/loader.svg';
import { ReactComponent as StampSvg } from '../../../img/stamp2.svg';
import NotaryService from '../../../services/NotaryService';

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
  isSearchingNotary: boolean;
  showCantOnboard: boolean;
  hasNotarySeal?: boolean;
  notaryIdError?: string;
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
      hasNotarySeal: undefined,
      isSearchingNotary: false,
      showCantOnboard: false,
    };
  }
  componentDidMount() {
    handleIOSBrowser();
    animateIn(this.refs.section);
  }

  checkNotaryDetails = async () => {
    const { goForward } = { ...this.props };
    const { notaryId, hasNotarySeal } = this.state;
    let { notaryIdError } = this.state;
    if (!hasNotarySeal) {
      this.setState({ showCantOnboard: true });
      return;
    }
    this.setState({ isSearchingNotary: true });
    try {
      const searchResult = await NotaryService.queryNotary({ id: notaryId });
      if (searchResult && Object.keys(searchResult).length) {
        notaryIdError = undefined;
        goForward();
      } else {
        notaryIdError =
          "Can't verify your notary number, please enter a valid notary number.";
      }
    } catch (err) {
      notaryIdError =
        'Oops, something went wrong. Please try again in a few minutes.';
    }
    this.setState({ notaryIdError, isSearchingNotary: false });
  };

  renderSearchingNotary = () => (
    <>
      <div className="title1">Document Helper</div>
      <div className="subtitle">Notarize documents</div>
      <div className="no-card">
        <StampSvg />
        <div className="account-title">Notary Details</div>
        <div className="rotate">
          <LoaderSvg />
        </div>
        <div className="helper-excerpt">
          Please wait while we check your notary details
        </div>
      </div>
    </>
  );

  renderCantOnboardAsNotary = () => {
    const { goForward } = { ...this.props };

    return (
      <>
        <div className="title1">Document Helper</div>
        <div className="subtitle">Notarize documents</div>
        <div className="no-card">
          <StampSvg />
          <div className="account-title ver2">
            Can't onboard you as digital notary
          </div>
          <div className="helper-excerpt">
            LifeFiles notary platform is available to digital notaries. We can't
            onboard you as a digital notary for the reason that you are not a
            digital notary. If you would like to be a digital notary, here
            is&nbsp;
            <a href="https://www.sos.state.tx.us/statdoc/gettingstarted.shtml">
              the link
            </a>
            &nbsp;to how you can become a digital notary and it just takes 2
            hours of time to become a digital notary!
          </div>
          <div className="helper-excerpt">
            You can continue to create a Helper account by skipping this step at
            the bottom of the screen
          </div>
        </div>
        <div className="setup-nav">
          <GoBackSvg
            color="#4BA9D9"
            goBack={() => this.setState({ showCantOnboard: false })}
          />
          <div onClick={() => goForward()}>
            <SkipSvg />
          </div>
        </div>
      </>
    );
  };

  renderNotaryForm = () => {
    const { goBack, goForward } = { ...this.props };
    const { notaryId, notaryState, hasNotarySeal, notaryIdError } = {
      ...this.state,
    };
    let options: OptionTypeBase[] = [];
    const usStates = new UsStates();
    options = usStates.states.map((usState: UsState) => {
      return {
        value: usState.abbreviation,
        label: usState.abbreviation,
      };
    });
    return (
      <>
        <div className="title1">Document Helper</div>
        <div className="subtitle">More ways to login</div>
        <div className="card owner1">
          <div className="card-body secure-register">
            <div className="card-body-section">
              <div className="helper-login">Are you a digital notary?</div>
              <div className="skip-excerpt">
                To enable notarization features, please enter your notary
                information below...
              </div>
            </div>
            <div className="card-body-section1">
              <div className="form-control1">
                <div className="form-control2">
                  <label>Notary Number</label>
                  <input
                    className={notaryIdError ? 'error' : ''}
                    name="notaryId"
                    type="text"
                    value={notaryId}
                    placeholder="Enter notary number here"
                    onChange={(e) =>
                      this.setState({ notaryId: e.target.value })
                    }
                  />
                  {notaryIdError && (
                    <div className="error">{notaryIdError}</div>
                  )}
                </div>
              </div>
              <div className="form-control-double">
                <div className="form-control2">
                  <label>Do you have electronic notary seal?</label>
                  <div className="state-select">
                    <MSelect
                      value={
                        hasNotarySeal === undefined
                          ? null
                          : {
                              value: hasNotarySeal,
                              label: hasNotarySeal ? 'Yes' : 'No',
                            }
                      }
                      options={[
                        {
                          value: true,
                          label: 'Yes',
                        },
                        {
                          value: false,
                          label: 'No',
                        },
                      ]}
                      onChange={(option: OptionTypeBase) =>
                        this.setState({ hasNotarySeal: option.value })
                      }
                      isSearchable={false}
                      placeholder={'Select'}
                      noStyles
                    />
                  </div>
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
                      noStyles
                      isDisabled
                    />
                  </div>
                </div>
              </div>
              <div className="skip-excerpt">
                If you're not a digital notary, you may skip this step at the
                bottom of this screen
              </div>
            </div>
            <div className="bottom">
              <input
                style={{ width: '210px', marginTop: '27px' }}
                type="button"
                value="Next"
                disabled={
                  !notaryId || !notaryState || hasNotarySeal === undefined
                }
                // onClick={() => goForward(this.state)}
                onClick={this.checkNotaryDetails}
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
      </>
    );
  };

  render() {
    const { isSearchingNotary, showCantOnboard } = {
      ...this.state,
    };
    return (
      <div
        ref="section"
        id="section-5-helper"
        className={getSectionClassName(this.props.position)}
      >
        <div className="section-contents">
          {showCantOnboard && this.renderCantOnboardAsNotary()}
          {!showCantOnboard && (
            <>
              {isSearchingNotary && this.renderSearchingNotary()}
              {!isSearchingNotary && this.renderNotaryForm()}
            </>
          )}
        </div>
      </div>
    );
  }
}

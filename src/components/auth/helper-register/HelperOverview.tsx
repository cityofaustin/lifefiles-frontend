import React, { Component } from 'react';
import GoBackSvg from '../../svg/GoBackSvg';
import { ReactComponent as HelperOverviewSvg } from '../../../img/helper-overview.svg';
import { handleIOSBrowser } from '../../../util/browser-util';
import { animateIn, getSectionClassName } from '../../../util/animation-util';
interface HelperOverviewProps {
  goBack: () => void;
  goForward: () => void;
  position?: string;
}
export default class HelperOverview extends Component<HelperOverviewProps> {
  componentDidMount() {
    handleIOSBrowser();
    animateIn(this.refs.section);
  }
  render() {
    const { goForward, goBack } = { ...this.props };
    return (
      <div
        ref="section"
        id="section-2-helper"
        className={getSectionClassName(this.props.position)}
      >
        <div className="section-contents">
          <div className="title1">Document Helper</div>
          <div className="subtitle">As a helper you can...</div>
          <div className="card owner1">
            <div className="card-body">
              <div className="card-body-section" style={{ marginTop: 0 }}>
                <HelperOverviewSvg />
              </div>
              <div className="bottom">
                <input
                  style={{ width: '210px', marginTop: '27px' }}
                  type="button"
                  value="Next"
                  onClick={() => goForward()}
                />
              </div>
            </div>
          </div>
          <GoBackSvg color="#4BA9D9" goBack={goBack} />
        </div>
      </div>
    );
  }
}

import React, { Component } from 'react';
import GoBackSvg from '../../svg/GoBackSvg';
import {ReactComponent as HelperOverviewSvg} from '../../../img/helper-overview.svg';

interface HelperOverviewProps {
  goBack: () => void;
  goForward: () => void;
}
export default class HelperOverview extends Component<HelperOverviewProps> {
  render() {
    const {goForward, goBack} = {...this.props};
    return (
      <section id="helper-register" className="container">
        <div ref="section" id="section-1-owner" className="section">
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
      </section>
    )
  }
}

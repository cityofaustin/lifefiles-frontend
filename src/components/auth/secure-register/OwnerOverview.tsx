import React, { Component } from 'react';
import GoBackSvg from '../../svg/GoBackSvg';
import { ReactComponent as OwnerOverviewSvg } from '../../../img/owner-overview.svg';
import { handleIOSBrowser } from '../../../util/browser-util';
import { animateIn, getSectionClassName } from '../../../util/animation-util';
import { Button } from 'reactstrap';
interface HelperOverviewProps {
  goBack: () => void;
  goForward: () => void;
  position?: string;
}
export default class OwnerOverview extends Component<HelperOverviewProps> {
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
          <div className="title1">Document Owner</div>
          <div className="subtitle">As an owner you can...</div>
          <div className="card owner1">
            <div className="card-body">
              <div className="card-body-section" style={{ marginTop: 0 }}>
                <OwnerOverviewSvg />
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
                  onClick={() => goForward()}
                >
                  Continue
                </Button>
              </div>
            </div>
          </div>
          <GoBackSvg
            color={'#2362C7'}
            goBack={goBack}
          />
        </div>
      </div>
    );
  }
}

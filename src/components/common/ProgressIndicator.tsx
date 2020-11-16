import React, {Component, Fragment} from 'react';
import './ProgressIndicator.scss';

interface ProgressIndicatorProps {
  isFullscreen?: boolean;
}

class ProgressIndicator extends Component<ProgressIndicatorProps> {
  renderCircularProgressIndicator() {
    return (
      <svg className="circular">
        <circle
          className="path"
          cx="24"
          cy="24"
          r="19"
          fill="none"
          strokeWidth="5"
          strokeMiterlimit="10"
        />
      </svg>
    );
  }

  render() {
    const { isFullscreen } = { ...this.props };
    return (
      <Fragment>
        {isFullscreen &&
          <div className="progress-fullscreen">
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              {this.renderCircularProgressIndicator()}
              <div>Loading Please do not reload this page</div>
            </div>
          </div>
        }
        {!isFullscreen && this.renderCircularProgressIndicator()}
      </Fragment>

    );
  }
}

export default ProgressIndicator;

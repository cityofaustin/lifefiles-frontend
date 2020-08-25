import React, { Component } from 'react';
import './GoBackSvg.scss';

interface GoBackSvgProps {
  goBack: () => void;
  color: string;
}

export default class GoBackSvg extends Component<GoBackSvgProps> {
  static defaultProps = {
    color: '#fff',
    goBack: () => {},
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="go-back" onClick={this.props.goBack}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="41.996"
          height="26.247"
          viewBox="0 0 41.996 26.247"
        >
          <g id="prefix__noun_Arrow_711843" transform="translate(-18 -982.365)">
            <path
              id="prefix__Path_1391"
              fill={this.props.color}
              d="M18 995.492a2.207 2.207 0 0 0 .533 1.354L29.032 1008a2.255 2.255 0 0 0 2.871.164 2.05 2.05 0 0 0-.02-2.871l-7.383-7.832h33.528a1.969 1.969 0 0 0 0-3.937H24.5l7.382-7.834a2.169 2.169 0 0 0 .02-2.871 2.226 2.226 0 0 0-2.871.164l-10.5 11.156a1.893 1.893 0 0 0-.531 1.353z"
              data-name="Path 1391"
            />
          </g>
        </svg>
        <div className="name" style={{ color: this.props.color }}>
          Go Back
        </div>
      </div>
    );
  }
}

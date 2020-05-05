import React, { Component } from 'react';

interface BadgeProps {
  width: string;
  height: string;
  content: string;
}

class Badge extends Component<BadgeProps> {

  static defaultProps = {
    width: '34px',
    height: '34px',
    content: '!'
  };

  render() {
    const {width, height, content} = {...this.props};

    return (
      <svg width={width} height={height} viewBox="0 0 34 34">
        <g transform="translate(-531 -396)">
          <circle cx="17" cy="17" r="17" transform="translate(531 396)" fill="#d95868"/>
          <text transform="translate(538 401)" fill="#fff" fontSize="20" fontFamily="Montserrat-Medium, Montserrat" fontWeight="500">
            <tspan x="6.3" y="19">
              {content}
            </tspan>
          </text>
        </g>
      </svg>
    );
  }
}

export default Badge;

import React, { Component, Fragment } from 'react';

interface DocSharedProps {
  numberOfShares: number;
  isNotary?: boolean;
}

class DocShared extends Component<DocSharedProps> {
  render() {
    const { numberOfShares, isNotary } = { ...this.props };
    return (
      <Fragment>
        {numberOfShares > 0 && (
          <svg width="36.521" height="46.375">
            <g transform="translate(0 0)">
              <path d="M33.1,46.375H3.422a3.426,3.426,0,0,1-2.412-.994A3.374,3.374,0,0,1,0,42.99V3.385A3.374,3.374,0,0,1,1.009.994,3.425,3.425,0,0,1,3.422,0H25.161V8.657a2.952,2.952,0,0,0,2.963,2.937h8.4v31.4a3.375,3.375,0,0,1-1.01,2.391A3.426,3.426,0,0,1,33.1,46.375ZM35.337,9.907H28.121a1.257,1.257,0,0,1-1.262-1.251V1.248l8.477,8.658Z"
              transform="translate(0 0)" fill={isNotary ? '#4ba9d9' : '#2362c7'} />
            </g>
            <text
              x="50%" y="60%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#fcfcfc"
              fontSize="30"
              fontFamily="Montserrat-Medium, Montserrat"
              fontWeight="500"
            >
              <tspan>{numberOfShares}</tspan>
            </text>
          </svg>
        )}
        {numberOfShares <= 0 && (
          <svg width="36.521" height="46.375">
            <g transform="translate(0 0)">
              <path d="M33.1,46.375H3.422a3.426,3.426,0,0,1-2.412-.994A3.374,3.374,0,0,1,0,42.99V3.385A3.374,3.374,0,0,1,1.009.994,3.425,3.425,0,0,1,3.422,0H25.161V8.657a2.952,2.952,0,0,0,2.963,2.937h8.4v31.4a3.375,3.375,0,0,1-1.01,2.391A3.426,3.426,0,0,1,33.1,46.375ZM35.337,9.907H28.121a1.257,1.257,0,0,1-1.262-1.251V1.248l8.477,8.658Z"
              transform="translate(0 0)" fill="#cecece" />
            </g>
            <text
              x="50%" y="60%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="#fcfcfc"
              fontSize="30"
              fontFamily="Montserrat-Medium, Montserrat"
              fontWeight="500"
            >
              <tspan>{numberOfShares}</tspan>
            </text>
          </svg>

        )}
      </Fragment>
    );
  }
}

export default DocShared;

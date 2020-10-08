import React, { Component } from 'react';

interface DocsUploadedSvgProps {
  numberOfDocs: number;
}

export default class DocsUploadedSvg extends Component<DocsUploadedSvgProps> {
  render() {
    const {numberOfDocs} = {...this.props};
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="234.999"
        height="81.038"
        viewBox="0 0 234.999 81.038"
      >
        <g
          id="Group_2774"
          data-name="Group 2774"
          transform="translate(-328.001 -843)"
        >
          <g
            id="Group_1602"
            data-name="Group 1602"
            transform="translate(328 832)"
          >
            <g
              id="Group_1602-2"
              data-name="Group 1602-2"
              transform="translate(0 11)"
            >
              <g id="Component_68_5" data-name="Component 68 5">
                <g
                  id="Group_977"
                  data-name="Group 977"
                  transform="translate(0.001)"
                >
                  <path
                    id="Subtraction_21"
                    data-name="Subtraction 21"
                    d="M1310,598.038h-51.619a5.967,5.967,0,0,1-5.958-5.915V522.915a5.964,5.964,0,0,1,5.958-5.915h37.847v15.127a5.139,5.139,0,0,0,5.14,5.132h14.572v54.87a5.944,5.944,0,0,1-5.94,5.908Zm4.043-63.79h-12.6a2.195,2.195,0,0,1-2.2-2.184V519.129l14.8,15.117Z"
                    transform="translate(-1252.427 -517)"
                    fill="#2362c7"
                  />
                </g>
                <g
                  id="_3"
                  data-name=" 3"
                  transform="translate(30 50)"
                >
                  <text
                    x="50%" y="60%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    id="_7"
                    data-name="7"
                    // transform="translate(-2.099 45.807)"
                    fill="#fff"
                    font-size="48"
                    font-family="Montserrat-Medium, Montserrat"
                    font-weight="500"
                  >
                    <tspan x="0" y="0">
                      {numberOfDocs}
                    </tspan>
                  </text>
                </g>
              </g>
            </g>
          </g>
          <text
            id="Documents_Uploaded"
            data-name="Documents
Uploaded"
            transform="translate(403 891)"
            fill="#2362c7"
            font-size="25"
            font-family="Montserrat-Bold, Montserrat"
            font-weight="700"
          >
            <tspan x="0" y="0">
              Document{numberOfDocs === 1 ? '' : 's'}{' '}
            </tspan>
            <tspan x="0" y="27">
              Uploaded
            </tspan>
          </text>
        </g>
      </svg>
    );
  }
}

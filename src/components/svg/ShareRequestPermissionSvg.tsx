import React, { Component, Fragment } from 'react';

interface ShareRequestPermissionSvgProps {
  permission: string;
  isOn: boolean;
}

export default class ShareRequestPermissionSvg extends Component<
  ShareRequestPermissionSvgProps
> {
  static defaultProps = {
    isOn: false,
  };
  render() {
    return srpObject(this.props.permission, this.props.isOn);
  }
}

const srpObject = (permission, isOn) => {
  if (permission === 'view') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="27.603"
        height="35.051"
        viewBox="0 0 27.603 35.051"
      >
        <g
          id="Group_2776"
          data-name="Group 2776"
          transform="translate(0 0.184)"
        >
          <g
            id="Group_2318"
            data-name="Group 2318"
            transform="translate(0 -0.184)"
          >
            <path
              id="Subtraction_21"
              data-name="Subtraction 21"
              d="M25.016,35.051H2.586A2.589,2.589,0,0,1,.763,34.3,2.55,2.55,0,0,1,0,32.493V2.558A2.55,2.55,0,0,1,.763.751,2.589,2.589,0,0,1,2.586,0H19.017V6.543a2.231,2.231,0,0,0,2.24,2.22H27.6v23.73a2.551,2.551,0,0,1-.763,1.807A2.589,2.589,0,0,1,25.016,35.051ZM26.708,7.488H21.254a.95.95,0,0,1-.954-.945V.943l6.407,6.544Z"
              fill={isOn ? '#2362c7' : '#D95868'}
            />
          </g>
          <g id="noun_Eye_2501659" transform="translate(4.943 12.789)">
            <path
              id="Path_1917"
              data-name="Path 1917"
              d="M.2,5.3c4.832-7.113,12.952-7.046,17.783.067a.909.909,0,0,1,0,1.141C13.153,13.621,5.033,13.554.2,6.441A.909.909,0,0,1,.2,5.3ZM9.127,1.475A4.411,4.411,0,0,1,13.489,5.9,4.4,4.4,0,0,1,4.7,5.9,4.425,4.425,0,0,1,9.127,1.475Z"
              transform="translate(0 0.002)"
              fill="#fff"
              fillRule="evenodd"
            />
          </g>
        </g>
      </svg>
    );
  }
  if (permission === 'replace') {
    return (
      <svg
        id="Group_2512"
        data-name="Group 2512"
        xmlns="http://www.w3.org/2000/svg"
        width="27.458"
        height="34.867"
        viewBox="0 0 27.458 34.867"
      >
        <g id="Group_2318" data-name="Group 2318" transform="translate(0 0)">
          <path
            id="Subtraction_21"
            data-name="Subtraction 21"
            d="M24.886,34.867H2.573A2.576,2.576,0,0,1,.759,34.12,2.537,2.537,0,0,1,0,32.322V2.545A2.537,2.537,0,0,1,.759.747,2.575,2.575,0,0,1,2.573,0H18.917V6.509a2.22,2.22,0,0,0,2.228,2.208h6.313V32.322a2.537,2.537,0,0,1-.759,1.8A2.576,2.576,0,0,1,24.886,34.867ZM26.569,7.449H21.143a.945.945,0,0,1-.949-.94V.939l6.374,6.51Z"
            fill={isOn ? '#2362c7' : '#D95868'}
          />
        </g>
        <g id="noun_replace_418805" transform="translate(3.497 10.654)">
          <g id="Group_2515" data-name="Group 2515" transform="translate(0 0)">
            <g
              id="Group_2514"
              data-name="Group 2514"
              transform="translate(0 0)"
            >
              <path
                id="Path_1918"
                data-name="Path 1918"
                d="M24.779,13.911H28.6a2.864,2.864,0,0,1,2.868,2.87V22.5h1.911V16.781A4.775,4.775,0,0,0,28.6,12H24.779l-.58.448-.158.58.158.554ZM28.6,27.285H24.779a2.872,2.872,0,0,1-2.868-2.866V19.642H20v4.777A4.783,4.783,0,0,0,24.779,29.2H28.6l.481-.347v-1.16l-.481-.4Z"
                transform="translate(-17.134 -12)"
                fill="#fff"
                fillRule="evenodd"
              />
              <path
                id="Path_1919"
                data-name="Path 1919"
                d="M12.5,36.28a.955.955,0,0,0-1.351,0L8.28,39.146A.955.955,0,0,0,9.631,40.5l2.19-2.108,2.19,2.108a.955.955,0,0,0,1.351-1.351Z"
                transform="translate(-8 -30.268)"
                fill="#fff"
                fillRule="evenodd"
              />
              <path
                id="Path_1920"
                data-name="Path 1920"
                d="M59.821,42.388l-2.19-2.108a.955.955,0,0,0-1.351,1.351L59.146,44.5a.955.955,0,0,0,1.351,0l2.866-2.866a.955.955,0,0,0-1.351-1.351Z"
                transform="translate(-44.536 -33.313)"
                fill="#fff"
                fillRule="evenodd"
              />
            </g>
          </g>
        </g>
      </svg>
    );
  }
  return (
    <svg
      id="Group_2513"
      data-name="Group 2513"
      xmlns="http://www.w3.org/2000/svg"
      width="27.651"
      height="35.113"
      viewBox="0 0 27.651 35.113"
    >
      <g id="Group_2318" data-name="Group 2318">
        <path
          id="Subtraction_21"
          data-name="Subtraction 21"
          d="M25.06,35.113H2.591A2.594,2.594,0,0,1,.764,34.36,2.555,2.555,0,0,1,0,32.55V2.563A2.555,2.555,0,0,1,.764.753,2.593,2.593,0,0,1,2.591,0H19.05V6.554a2.235,2.235,0,0,0,2.244,2.224h6.357V32.55a2.555,2.555,0,0,1-.764,1.81A2.594,2.594,0,0,1,25.06,35.113ZM26.755,7.5H21.292a.952.952,0,0,1-.955-.947V.945L26.755,7.5Z"
          fill={isOn ? '#2362c7' : '#D95868'}
        />
      </g>
      <g
        id="Group_2322"
        data-name="Group 2322"
        transform="translate(6.704 10.552)"
      >
        <path
          id="Path_1835"
          data-name="Path 1835"
          d="M101.707,401.934H89.89a.718.718,0,0,0,0,1.436h11.825a.718.718,0,1,0-.007-1.436Zm0,0"
          transform="translate(-89.172 -387.474)"
          fill="#fff"
          stroke="#fff"
          strokeWidth="0.3"
        />
        <path
          id="Path_1836"
          data-name="Path 1836"
          d="M119.637,175.675l2.958,3.181v-7.84a.718.718,0,1,1,1.436,0v7.84l2.958-3.181a.716.716,0,0,1,1.048.976l-4.207,4.516a.713.713,0,0,1-1.048,0l-4.207-4.516a.716.716,0,0,1,.036-1.012A.732.732,0,0,1,119.637,175.675Zm0,0"
          transform="translate(-116.688 -170.297)"
          fill="#fff"
          stroke="#fff"
          strokeWidth="0.3"
        />
      </g>
    </svg>
  );
};

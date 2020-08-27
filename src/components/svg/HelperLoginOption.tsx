import React, { Component, Fragment } from 'react';
export enum LoginOption {
  PrivateKey = 'privateKey',
  Password = 'password',
}
interface HelperLoginOptionProps {
  selected: boolean;
  option: LoginOption;
}
export default class HelperLoginOption extends Component<
  HelperLoginOptionProps
> {
  render() {
    const { selected, option } = { ...this.props };
    return loginOptionSvg[option][selected ? 'selected' : 'nonSelected'];
  }
}

const loginOptionSvg = {
  [LoginOption.Password]: {
    selected: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="250"
        height="109"
        viewBox="0 0 250 109"
      >
        <g
          id="Group_2543"
          data-name="Group 2543"
          transform="translate(-60 -365)"
        >
          <g
            id="Component_146_1"
            data-name="Component 146 – 1"
            transform="translate(64 375)"
          >
            <g
              id="Group_2505"
              data-name="Group 2505"
              transform="translate(-84 -532)"
            >
              <g
                id="Rectangle_1107"
                data-name="Rectangle 1107"
                transform="translate(84 532)"
                fill="#76b3ef"
                stroke="#76b3ef"
                strokeWidth="2"
              >
                <rect width="101" height="50" rx="10" stroke="none" />
                <rect x="1" y="1" width="99" height="48" rx="9" fill="none" />
              </g>
              <text
                id="Password"
                transform="translate(134 574)"
                fill="#fff"
                fontSize="16"
                fontFamily="Montserrat-Medium, Montserrat"
                fontWeight="500"
              >
                <tspan x="-39.168" y="0">
                  Password
                </tspan>
              </text>
            </g>
            <g
              id="Group_2414"
              data-name="Group 2414"
              transform="translate(-146 -230)"
            >
              <path
                id="Path_1527"
                data-name="Path 1527"
                d="M75.284,35.018H74.81V32.729A3.832,3.832,0,0,0,70.981,28.9H69.6a3.832,3.832,0,0,0-3.829,3.829v2.289H65.3a1.685,1.685,0,0,0-1.7,1.7v7.105a1.685,1.685,0,0,0,1.7,1.7h9.987a1.685,1.685,0,0,0,1.7-1.7V36.716A1.71,1.71,0,0,0,75.284,35.018Zm-3.868,7.5a.277.277,0,0,1-.276.355h-1.7a.291.291,0,0,1-.276-.355l.553-2.21a1.307,1.307,0,0,1-.789-1.224,1.342,1.342,0,0,1,2.684,0,1.307,1.307,0,0,1-.789,1.224Zm1.105-7.5H68.06V32.729A1.541,1.541,0,0,1,69.6,31.189h1.382a1.541,1.541,0,0,1,1.539,1.539Z"
                transform="translate(136.633 209.1)"
                fill="#fff"
              />
              <path
                id="Path_1528"
                data-name="Path 1528"
                d="M16.387,47.184a.678.678,0,0,0-.931-.233l-1.164.652V46.252a.652.652,0,0,0-1.3,0V47.6l-1.164-.652a.679.679,0,1,0-.7,1.164l1.164.652-1.164.652a.678.678,0,0,0-.233.931.608.608,0,0,0,.559.326.863.863,0,0,0,.326-.093l1.164-.652v1.351a.652.652,0,1,0,1.3,0V49.931l1.164.652a.863.863,0,0,0,.326.093.646.646,0,0,0,.559-.326.678.678,0,0,0-.233-.931L14.9,48.767l1.164-.652A.7.7,0,0,0,16.387,47.184Z"
                transform="translate(173.068 200.178)"
                fill="#fff"
              />
              <path
                id="Path_1529"
                data-name="Path 1529"
                d="M33.887,47.184a.678.678,0,0,0-.931-.233l-1.164.652V46.252a.652.652,0,0,0-1.3,0V47.6l-1.164-.652a.679.679,0,1,0-.7,1.164l1.164.652-1.164.652a.678.678,0,0,0-.233.931.608.608,0,0,0,.559.326.863.863,0,0,0,.326-.093l1.164-.652v1.351a.652.652,0,1,0,1.3,0V49.931l1.164.652a.863.863,0,0,0,.326.093.646.646,0,0,0,.559-.326.678.678,0,0,0-.233-.931L32.4,48.767l1.164-.652A.7.7,0,0,0,33.887,47.184Z"
                transform="translate(163.719 200.178)"
                fill="#fff"
              />
              <path
                id="Path_1530"
                data-name="Path 1530"
                d="M21.487,39.252c0-.373-.183-.652-.427-.652H4.912C3.568,38.6,2.5,40.277,2.5,42.279v5.449c0,2.049,1.1,3.679,2.412,3.679H19.381c.244,0,.427-.279.427-.652s-.183-.652-.427-.652H4.912c-.855,0-1.557-1.071-1.557-2.375V42.279c0-1.3.7-2.375,1.557-2.375H21.059C21.3,39.951,21.487,39.625,21.487,39.252Z"
                transform="translate(177.5 203.918)"
                fill="#fff"
              />
            </g>
          </g>
          <g
            id="Group_2523"
            data-name="Group 2523"
            transform="translate(63 -18)"
          >
            <g
              id="Group_2521"
              data-name="Group 2521"
              transform="translate(126.818 383)"
            >
              <g
                id="Group_2510"
                data-name="Group 2510"
                transform="translate(2.309 0)"
              >
                <g id="Group_2318" data-name="Group 2318">
                  <path
                    id="Subtraction_21"
                    data-name="Subtraction 21"
                    d="M36.729,51.462H3.8a3.8,3.8,0,0,1-2.677-1.1A3.744,3.744,0,0,1,0,47.706V3.756A3.744,3.744,0,0,1,1.12,1.1,3.8,3.8,0,0,1,3.8,0H27.921V9.606a3.276,3.276,0,0,0,3.288,3.259h9.317v34.84a3.745,3.745,0,0,1-1.12,2.653A3.8,3.8,0,0,1,36.729,51.462Zm2.484-40.468H31.206a1.395,1.395,0,0,1-1.4-1.388V1.385l9.407,9.608Z"
                    transform="translate(0 0)"
                    fill="#4ba9d9"
                  />
                </g>
                <g
                  id="Group_2322"
                  data-name="Group 2322"
                  transform="translate(9.826 16.95)"
                >
                  <path
                    id="Path_1835"
                    data-name="Path 1835"
                    d="M107.544,401.934H90.224a1.052,1.052,0,0,0,0,2.1h17.33a1.052,1.052,0,1,0-.011-2.1Zm0,0"
                    transform="translate(-89.172 -382.225)"
                    fill="#fff"
                    stroke="#fff"
                    strokeWidth="0.3"
                  />
                  <path
                    id="Path_1836"
                    data-name="Path 1836"
                    d="M120.221,178.683l4.335-4.662v11.49a1.052,1.052,0,0,0,2.1,0v-11.49L131,178.683a1.05,1.05,0,0,0,1.536-1.431l-6.166-6.618a1.044,1.044,0,0,0-1.536,0l-6.166,6.618a1.049,1.049,0,0,0,.052,1.484A1.073,1.073,0,0,0,120.221,178.683Zm0,0"
                    transform="translate(-115.897 -170.297)"
                    fill="#fff"
                    stroke="#fff"
                    strokeWidth="0.3"
                  />
                </g>
              </g>
              <g
                id="Group_2512"
                data-name="Group 2512"
                transform="translate(0 55.372)"
              >
                <text
                  id="Upload"
                  transform="translate(20 11)"
                  fill="#4ba9d9"
                  fontSize="11"
                  fontFamily="Montserrat-Medium, Montserrat"
                  fontWeight="500"
                >
                  <tspan x="-20.157" y="0">
                    Upload
                  </tspan>
                </text>
              </g>
            </g>
            <g
              id="Group_2522"
              data-name="Group 2522"
              transform="translate(182.502 383)"
            >
              <g
                id="Group_2325"
                data-name="Group 2325"
                transform="translate(0.885 0)"
              >
                <path
                  id="noun_Stamp_831862"
                  d="M98.168,35.788a5.218,5.218,0,0,0,0,6.232,5.218,5.218,0,0,1-2.659,8.108,5.218,5.218,0,0,0-3.663,5.018,5.208,5.208,0,0,1-6.884,5.018,5.218,5.218,0,0,0-5.921,1.927,5.218,5.218,0,0,1-8.51,0,5.218,5.218,0,0,0-5.921-1.927,5.208,5.208,0,0,1-6.884-5.018,5.218,5.218,0,0,0-3.713-5.018,5.218,5.218,0,0,1-2.629-8.088,5.218,5.218,0,0,0,0-6.232,5.218,5.218,0,0,1,2.629-8.119,5.218,5.218,0,0,0,3.663-5.018,5.208,5.208,0,0,1,6.884-5.018,5.218,5.218,0,0,0,5.921-1.927,5.218,5.218,0,0,1,8.51,0,5.218,5.218,0,0,0,5.921,1.927A5.208,5.208,0,0,1,91.8,22.672a5.218,5.218,0,0,0,3.663,5.018,5.218,5.218,0,0,1,2.71,8.1Zm-15.725-2.82a3.071,3.071,0,0,0-4.345,0l-5.339,5.339-1.274-1.274a3.073,3.073,0,1,0-4.345,4.345l1.274,1.274,2.178,2.178a3.081,3.081,0,0,0,4.345,0l2.158-2.178,5.339-5.339a3.071,3.071,0,0,0,.01-4.345Z"
                  transform="translate(-50.338 -13.53)"
                  fill="#4ba9d9"
                />
                <ellipse
                  id="Ellipse_675"
                  data-name="Ellipse 675"
                  cx="15.22"
                  cy="15.22"
                  rx="15.22"
                  ry="15.22"
                  transform="translate(8.902 9.038)"
                  fill="#4ba9d9"
                />
                <g
                  id="noun_Stamp_1471848_1_"
                  data-name="noun_Stamp_1471848 (1)"
                  transform="translate(14.066 11.397)"
                >
                  <path
                    id="Path_1829"
                    data-name="Path 1829"
                    d="M32.384,28.988v-4.4a4.884,4.884,0,1,0-3.943,0V28.81a1.6,1.6,0,0,1-1.208,1.563l-4.866,1.208A2.86,2.86,0,0,0,20.2,34.387v1.989H41.264V34.423a2.885,2.885,0,0,0-2.238-2.806l-5.577-1.279A1.369,1.369,0,0,1,32.384,28.988Z"
                    transform="translate(-20.2 -15.209)"
                    fill="#fff"
                  />
                  <rect
                    id="Rectangle_1282"
                    data-name="Rectangle 1282"
                    width="19.501"
                    height="1.705"
                    transform="translate(0.781 22.979)"
                    fill="#fff"
                  />
                </g>
              </g>
              <text
                id="Notarize"
                transform="translate(23 66.372)"
                fill="#4ba9d9"
                fontSize="11"
                fontFamily="Montserrat-Medium, Montserrat"
                fontWeight="500"
              >
                <tspan x="-23.463" y="0">
                  Notarize
                </tspan>
              </text>
            </g>
          </g>
          <text
            id="A_password_to_upload_and_notarize_owner_documents"
            data-name="A password to upload and notarize
  owner documents"
            transform="translate(185 452)"
            fill="#707070"
            fontSize="14"
            fontFamily="Montserrat-Regular, Montserrat"
          >
            <tspan x="-124.369" y="0">
              A password to{' '}
            </tspan>
            <tspan
              y="0"
              fontFamily="Montserrat-Medium, Montserrat"
              fontWeight="500"
            >
              upload and notarize{' '}
            </tspan>
            <tspan y="0"></tspan>
            <tspan x="-64.519" y="18">
              owner documents
            </tspan>
          </text>
        </g>
      </svg>
    ),

    nonSelected: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="250"
        height="109"
        viewBox="0 0 250 109"
      >
        <g
          id="Group_2542"
          data-name="Group 2542"
          transform="translate(-60 -365)"
        >
          <g
            id="Component_146_2"
            data-name="Component 146 – 2"
            transform="translate(64 375)"
          >
            <g
              id="Group_2505"
              data-name="Group 2505"
              transform="translate(-84 -532)"
            >
              <g
                id="Rectangle_1107"
                data-name="Rectangle 1107"
                transform="translate(84 532)"
                fill="none"
                stroke="#76b3ef"
                strokeWidth="2"
              >
                <rect width="101" height="50" rx="10" stroke="none" />
                <rect x="1" y="1" width="99" height="48" rx="9" fill="none" />
              </g>
              <text
                id="Password"
                transform="translate(134 574)"
                fill="#76b3ef"
                fontSize="16"
                fontFamily="Montserrat-Medium, Montserrat"
                fontWeight="500"
              >
                <tspan x="-39.168" y="0">
                  Password
                </tspan>
              </text>
            </g>
            <g
              id="Group_2414"
              data-name="Group 2414"
              transform="translate(-146 -230)"
            >
              <path
                id="Path_1527"
                data-name="Path 1527"
                d="M75.284,35.018H74.81V32.729A3.832,3.832,0,0,0,70.981,28.9H69.6a3.832,3.832,0,0,0-3.829,3.829v2.289H65.3a1.685,1.685,0,0,0-1.7,1.7v7.105a1.685,1.685,0,0,0,1.7,1.7h9.987a1.685,1.685,0,0,0,1.7-1.7V36.716A1.71,1.71,0,0,0,75.284,35.018Zm-3.868,7.5a.277.277,0,0,1-.276.355h-1.7a.291.291,0,0,1-.276-.355l.553-2.21a1.307,1.307,0,0,1-.789-1.224,1.342,1.342,0,0,1,2.684,0,1.307,1.307,0,0,1-.789,1.224Zm1.105-7.5H68.06V32.729A1.541,1.541,0,0,1,69.6,31.189h1.382a1.541,1.541,0,0,1,1.539,1.539Z"
                transform="translate(136.633 209.1)"
                fill="#76b3ef"
              />
              <path
                id="Path_1528"
                data-name="Path 1528"
                d="M16.387,47.184a.678.678,0,0,0-.931-.233l-1.164.652V46.252a.652.652,0,0,0-1.3,0V47.6l-1.164-.652a.679.679,0,1,0-.7,1.164l1.164.652-1.164.652a.678.678,0,0,0-.233.931.608.608,0,0,0,.559.326.863.863,0,0,0,.326-.093l1.164-.652v1.351a.652.652,0,1,0,1.3,0V49.931l1.164.652a.863.863,0,0,0,.326.093.646.646,0,0,0,.559-.326.678.678,0,0,0-.233-.931L14.9,48.767l1.164-.652A.7.7,0,0,0,16.387,47.184Z"
                transform="translate(173.068 200.178)"
                fill="#76b3ef"
              />
              <path
                id="Path_1529"
                data-name="Path 1529"
                d="M33.887,47.184a.678.678,0,0,0-.931-.233l-1.164.652V46.252a.652.652,0,0,0-1.3,0V47.6l-1.164-.652a.679.679,0,1,0-.7,1.164l1.164.652-1.164.652a.678.678,0,0,0-.233.931.608.608,0,0,0,.559.326.863.863,0,0,0,.326-.093l1.164-.652v1.351a.652.652,0,1,0,1.3,0V49.931l1.164.652a.863.863,0,0,0,.326.093.646.646,0,0,0,.559-.326.678.678,0,0,0-.233-.931L32.4,48.767l1.164-.652A.7.7,0,0,0,33.887,47.184Z"
                transform="translate(163.719 200.178)"
                fill="#76b3ef"
              />
              <path
                id="Path_1530"
                data-name="Path 1530"
                d="M21.487,39.252c0-.373-.183-.652-.427-.652H4.912C3.568,38.6,2.5,40.277,2.5,42.279v5.449c0,2.049,1.1,3.679,2.412,3.679H19.381c.244,0,.427-.279.427-.652s-.183-.652-.427-.652H4.912c-.855,0-1.557-1.071-1.557-2.375V42.279c0-1.3.7-2.375,1.557-2.375H21.059C21.3,39.951,21.487,39.625,21.487,39.252Z"
                transform="translate(177.5 203.918)"
                fill="#76b3ef"
              />
            </g>
          </g>
          <g
            id="Group_2523"
            data-name="Group 2523"
            transform="translate(63 -18)"
          >
            <g
              id="Group_2521"
              data-name="Group 2521"
              transform="translate(126.818 383)"
            >
              <g
                id="Group_2510"
                data-name="Group 2510"
                transform="translate(2.309 0)"
              >
                <g id="Group_2318" data-name="Group 2318">
                  <path
                    id="Subtraction_21"
                    data-name="Subtraction 21"
                    d="M36.729,51.462H3.8a3.8,3.8,0,0,1-2.677-1.1A3.744,3.744,0,0,1,0,47.706V3.756A3.744,3.744,0,0,1,1.12,1.1,3.8,3.8,0,0,1,3.8,0H27.921V9.606a3.276,3.276,0,0,0,3.288,3.259h9.317v34.84a3.745,3.745,0,0,1-1.12,2.653A3.8,3.8,0,0,1,36.729,51.462Zm2.484-40.468H31.206a1.395,1.395,0,0,1-1.4-1.388V1.385l9.407,9.608Z"
                    transform="translate(0 0)"
                    fill="#ececec"
                  />
                </g>
                <g
                  id="Group_2322"
                  data-name="Group 2322"
                  transform="translate(9.826 16.95)"
                >
                  <path
                    id="Path_1835"
                    data-name="Path 1835"
                    d="M107.544,401.934H90.224a1.052,1.052,0,0,0,0,2.1h17.33a1.052,1.052,0,1,0-.011-2.1Zm0,0"
                    transform="translate(-89.172 -382.225)"
                    fill="#fff"
                    stroke="#fff"
                    strokeWidth="0.3"
                  />
                  <path
                    id="Path_1836"
                    data-name="Path 1836"
                    d="M120.221,178.683l4.335-4.662v11.49a1.052,1.052,0,0,0,2.1,0v-11.49L131,178.683a1.05,1.05,0,0,0,1.536-1.431l-6.166-6.618a1.044,1.044,0,0,0-1.536,0l-6.166,6.618a1.049,1.049,0,0,0,.052,1.484A1.073,1.073,0,0,0,120.221,178.683Zm0,0"
                    transform="translate(-115.897 -170.297)"
                    fill="#fff"
                    stroke="#fff"
                    strokeWidth="0.3"
                  />
                </g>
              </g>
              <g
                id="Group_2512"
                data-name="Group 2512"
                transform="translate(0 55.372)"
              >
                <text
                  id="Upload"
                  transform="translate(20 11)"
                  fill="#ececec"
                  fontSize="11"
                  fontFamily="Montserrat-Medium, Montserrat"
                  fontWeight="500"
                >
                  <tspan x="-20.157" y="0">
                    Upload
                  </tspan>
                </text>
              </g>
            </g>
            <g
              id="Group_2522"
              data-name="Group 2522"
              transform="translate(182.502 383)"
            >
              <g
                id="Group_2325"
                data-name="Group 2325"
                transform="translate(0.885 0)"
              >
                <path
                  id="noun_Stamp_831862"
                  d="M98.168,35.788a5.218,5.218,0,0,0,0,6.232,5.218,5.218,0,0,1-2.659,8.108,5.218,5.218,0,0,0-3.663,5.018,5.208,5.208,0,0,1-6.884,5.018,5.218,5.218,0,0,0-5.921,1.927,5.218,5.218,0,0,1-8.51,0,5.218,5.218,0,0,0-5.921-1.927,5.208,5.208,0,0,1-6.884-5.018,5.218,5.218,0,0,0-3.713-5.018,5.218,5.218,0,0,1-2.629-8.088,5.218,5.218,0,0,0,0-6.232,5.218,5.218,0,0,1,2.629-8.119,5.218,5.218,0,0,0,3.663-5.018,5.208,5.208,0,0,1,6.884-5.018,5.218,5.218,0,0,0,5.921-1.927,5.218,5.218,0,0,1,8.51,0,5.218,5.218,0,0,0,5.921,1.927A5.208,5.208,0,0,1,91.8,22.672a5.218,5.218,0,0,0,3.663,5.018,5.218,5.218,0,0,1,2.71,8.1Zm-15.725-2.82a3.071,3.071,0,0,0-4.345,0l-5.339,5.339-1.274-1.274a3.073,3.073,0,1,0-4.345,4.345l1.274,1.274,2.178,2.178a3.081,3.081,0,0,0,4.345,0l2.158-2.178,5.339-5.339a3.071,3.071,0,0,0,.01-4.345Z"
                  transform="translate(-50.338 -13.53)"
                  fill="#ececec"
                />
                <ellipse
                  id="Ellipse_675"
                  data-name="Ellipse 675"
                  cx="15.22"
                  cy="15.22"
                  rx="15.22"
                  ry="15.22"
                  transform="translate(8.902 9.038)"
                  fill="#ececec"
                />
                <g
                  id="noun_Stamp_1471848_1_"
                  data-name="noun_Stamp_1471848 (1)"
                  transform="translate(14.066 11.397)"
                >
                  <path
                    id="Path_1829"
                    data-name="Path 1829"
                    d="M32.384,28.988v-4.4a4.884,4.884,0,1,0-3.943,0V28.81a1.6,1.6,0,0,1-1.208,1.563l-4.866,1.208A2.86,2.86,0,0,0,20.2,34.387v1.989H41.264V34.423a2.885,2.885,0,0,0-2.238-2.806l-5.577-1.279A1.369,1.369,0,0,1,32.384,28.988Z"
                    transform="translate(-20.2 -15.209)"
                    fill="#fff"
                  />
                  <rect
                    id="Rectangle_1282"
                    data-name="Rectangle 1282"
                    width="19.501"
                    height="1.705"
                    transform="translate(0.781 22.979)"
                    fill="#fff"
                  />
                </g>
              </g>
              <text
                id="Notarize"
                transform="translate(23 66.372)"
                fill="#ececec"
                fontSize="11"
                fontFamily="Montserrat-Medium, Montserrat"
                fontWeight="500"
              >
                <tspan x="-23.463" y="0">
                  Notarize
                </tspan>
              </text>
            </g>
          </g>
          <text
            id="A_password_to_upload_and_notarize_owner_documents"
            data-name="A password to upload and notarize
  owner documents"
            transform="translate(185 452)"
            fill="#707070"
            fontSize="14"
            fontFamily="Montserrat-Regular, Montserrat"
          >
            <tspan x="-124.369" y="0">
              A password to{' '}
            </tspan>
            <tspan
              y="0"
              fontFamily="Montserrat-Medium, Montserrat"
              fontWeight="500"
            >
              upload and notarize{' '}
            </tspan>
            <tspan y="0"></tspan>
            <tspan x="-64.519" y="18">
              owner documents
            </tspan>
          </text>
        </g>
      </svg>
    ),
  },
  [LoginOption.PrivateKey]: {
    selected: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="230"
        height="178"
        viewBox="0 0 230 178"
      >
        <g
          id="Group_2540"
          data-name="Group 2540"
          transform="translate(-64 -181)"
        >
          <g id="Group_2538" data-name="Group 2538">
            <g
              id="Component_145_7"
              data-name="Component 145 – 7"
              transform="translate(64 220.244)"
            >
              <g
                id="Group_1591"
                data-name="Group 1591"
                transform="translate(-84 -530.244)"
              >
                <g
                  id="Rectangle_1107"
                  data-name="Rectangle 1107"
                  transform="translate(84 532)"
                  fill="#76b3ef"
                  stroke="#76b3ef"
                  strokeWidth="2"
                >
                  <rect width="101" height="50" rx="10" stroke="none" />
                  <rect x="1" y="1" width="99" height="48" rx="9" fill="none" />
                </g>
                <text
                  id="Private_Key"
                  data-name="Private Key"
                  transform="translate(134 574)"
                  fill="#fff"
                  fontSize="16"
                  fontFamily="Montserrat-Medium, Montserrat"
                  fontWeight="500"
                >
                  <tspan x="-45.272" y="0">
                    Private Key
                  </tspan>
                </text>
              </g>
              <path
                id="Path_1345"
                data-name="Path 1345"
                d="M8.372,25.921A8.37,8.37,0,1,1,11.762,9.9L21.508.151A.513.513,0,0,1,21.876,0a.194.194,0,0,1,.057.005L25.09.379a.523.523,0,0,1,.451.456l.373,3.152a.5.5,0,0,1-.145.425L23.727,6.455a.513.513,0,0,1-.736,0l-.529-.529-1.192,1.2.529.529a.513.513,0,0,1,.15.368.5.5,0,0,1-.15.363L20.254,9.928a.516.516,0,0,1-.731,0L18.994,9.4l-1.2,1.192.529.529a.518.518,0,0,1,.156.368.527.527,0,0,1-.156.368l-2.3,2.3a8.269,8.269,0,0,1,.715,3.39,8.3,8.3,0,0,1-2.452,5.92A8.309,8.309,0,0,1,8.372,25.921Zm.886-9.259a2.563,2.563,0,0,0-4.375,1.814,2.563,2.563,0,0,0,5.127,0A2.566,2.566,0,0,0,9.259,16.662Z"
                transform="translate(50.98 0) rotate(45)"
                fill="#fff"
              />
            </g>
            <g
              id="Group_2524"
              data-name="Group 2524"
              transform="translate(85 -1)"
            >
              <g
                id="Group_2518"
                data-name="Group 2518"
                transform="translate(99.818 249)"
              >
                <g
                  id="Group_2510"
                  data-name="Group 2510"
                  transform="translate(2.309 0)"
                >
                  <g id="Group_2318" data-name="Group 2318">
                    <path
                      id="Subtraction_21"
                      data-name="Subtraction 21"
                      d="M36.729,51.462H3.8a3.8,3.8,0,0,1-2.677-1.1A3.744,3.744,0,0,1,0,47.706V3.756A3.744,3.744,0,0,1,1.12,1.1,3.8,3.8,0,0,1,3.8,0H27.921V9.606a3.276,3.276,0,0,0,3.288,3.259h9.317v34.84a3.745,3.745,0,0,1-1.12,2.653A3.8,3.8,0,0,1,36.729,51.462Zm2.484-40.468H31.206a1.395,1.395,0,0,1-1.4-1.388V1.385l9.407,9.608Z"
                      transform="translate(0 0)"
                      fill="#4ba9d9"
                    />
                  </g>
                  <g
                    id="Group_2322"
                    data-name="Group 2322"
                    transform="translate(9.826 16.95)"
                  >
                    <path
                      id="Path_1835"
                      data-name="Path 1835"
                      d="M107.544,401.934H90.224a1.052,1.052,0,0,0,0,2.1h17.33a1.052,1.052,0,1,0-.011-2.1Zm0,0"
                      transform="translate(-89.172 -382.225)"
                      fill="#fff"
                      stroke="#fff"
                      strokeWidth="0.3"
                    />
                    <path
                      id="Path_1836"
                      data-name="Path 1836"
                      d="M120.221,178.683l4.335-4.662v11.49a1.052,1.052,0,0,0,2.1,0v-11.49L131,178.683a1.05,1.05,0,0,0,1.536-1.431l-6.166-6.618a1.044,1.044,0,0,0-1.536,0l-6.166,6.618a1.049,1.049,0,0,0,.052,1.484A1.073,1.073,0,0,0,120.221,178.683Zm0,0"
                      transform="translate(-115.897 -170.297)"
                      fill="#fff"
                      stroke="#fff"
                      strokeWidth="0.3"
                    />
                  </g>
                </g>
                <g
                  id="Group_2512"
                  data-name="Group 2512"
                  transform="translate(3 55.372)"
                >
                  <text
                    id="Upload"
                    transform="translate(20 11)"
                    fill="#4ba9d9"
                    fontSize="11"
                    fontFamily="Montserrat-Medium, Montserrat"
                    fontWeight="500"
                  >
                    <tspan x="-20.157" y="0">
                      Upload
                    </tspan>
                  </text>
                </g>
              </g>
              <g
                id="Group_2520"
                data-name="Group 2520"
                transform="translate(135.691 182)"
              >
                <g
                  id="Group_2511"
                  data-name="Group 2511"
                  transform="translate(0 0)"
                >
                  <g
                    id="Group_2318-2"
                    data-name="Group 2318"
                    transform="translate(0)"
                  >
                    <path
                      id="Subtraction_21-2"
                      data-name="Subtraction 21"
                      d="M36.729,51.462H3.8a3.8,3.8,0,0,1-2.677-1.1A3.744,3.744,0,0,1,0,47.706V3.756A3.744,3.744,0,0,1,1.12,1.1,3.8,3.8,0,0,1,3.8,0H27.921V9.606a3.276,3.276,0,0,0,3.288,3.259h9.317v34.84a3.745,3.745,0,0,1-1.12,2.653A3.8,3.8,0,0,1,36.729,51.462Zm2.484-40.468H31.206a1.395,1.395,0,0,1-1.4-1.388V1.385l9.407,9.608Z"
                      transform="translate(0 0)"
                      fill="#4ba9d9"
                    />
                  </g>
                  <g id="noun_Eye_2501659" transform="translate(7.258 19.047)">
                    <path
                      id="Path_1917"
                      data-name="Path 1917"
                      d="M.3,7.782c7.094-10.444,19.016-10.345,26.11.1a1.334,1.334,0,0,1,0,1.675C19.311,20,7.39,19.9.3,9.457A1.334,1.334,0,0,1,.3,7.782ZM13.4,2.166a6.476,6.476,0,0,1,6.4,6.5,6.454,6.454,0,0,1-12.907,0A6.5,6.5,0,0,1,13.4,2.166Z"
                      transform="translate(0 0.002)"
                      fill="#fff"
                      fillRule="evenodd"
                    />
                  </g>
                </g>
                <g
                  id="Group_2513"
                  data-name="Group 2513"
                  transform="translate(5.116 55.372)"
                >
                  <text
                    id="View"
                    transform="translate(14 11)"
                    fill="#4ba9d9"
                    fontSize="11"
                    fontFamily="Montserrat-Medium, Montserrat"
                    fontWeight="500"
                  >
                    <tspan x="-13.629" y="0">
                      View
                    </tspan>
                  </text>
                </g>
              </g>
              <g
                id="Group_2519"
                data-name="Group 2519"
                transform="translate(155.502 249)"
              >
                <g
                  id="Group_2325"
                  data-name="Group 2325"
                  transform="translate(0.885 0)"
                >
                  <path
                    id="noun_Stamp_831862"
                    d="M98.168,35.788a5.218,5.218,0,0,0,0,6.232,5.218,5.218,0,0,1-2.659,8.108,5.218,5.218,0,0,0-3.663,5.018,5.208,5.208,0,0,1-6.884,5.018,5.218,5.218,0,0,0-5.921,1.927,5.218,5.218,0,0,1-8.51,0,5.218,5.218,0,0,0-5.921-1.927,5.208,5.208,0,0,1-6.884-5.018,5.218,5.218,0,0,0-3.713-5.018,5.218,5.218,0,0,1-2.629-8.088,5.218,5.218,0,0,0,0-6.232,5.218,5.218,0,0,1,2.629-8.119,5.218,5.218,0,0,0,3.663-5.018,5.208,5.208,0,0,1,6.884-5.018,5.218,5.218,0,0,0,5.921-1.927,5.218,5.218,0,0,1,8.51,0,5.218,5.218,0,0,0,5.921,1.927A5.208,5.208,0,0,1,91.8,22.672a5.218,5.218,0,0,0,3.663,5.018,5.218,5.218,0,0,1,2.71,8.1Zm-15.725-2.82a3.071,3.071,0,0,0-4.345,0l-5.339,5.339-1.274-1.274a3.073,3.073,0,1,0-4.345,4.345l1.274,1.274,2.178,2.178a3.081,3.081,0,0,0,4.345,0l2.158-2.178,5.339-5.339a3.071,3.071,0,0,0,.01-4.345Z"
                    transform="translate(-50.338 -13.53)"
                    fill="#4ba9d9"
                  />
                  <ellipse
                    id="Ellipse_675"
                    data-name="Ellipse 675"
                    cx="15.22"
                    cy="15.22"
                    rx="15.22"
                    ry="15.22"
                    transform="translate(8.902 9.038)"
                    fill="#4ba9d9"
                  />
                  <g
                    id="noun_Stamp_1471848_1_"
                    data-name="noun_Stamp_1471848 (1)"
                    transform="translate(14.066 11.397)"
                  >
                    <path
                      id="Path_1829"
                      data-name="Path 1829"
                      d="M32.384,28.988v-4.4a4.884,4.884,0,1,0-3.943,0V28.81a1.6,1.6,0,0,1-1.208,1.563l-4.866,1.208A2.86,2.86,0,0,0,20.2,34.387v1.989H41.264V34.423a2.885,2.885,0,0,0-2.238-2.806l-5.577-1.279A1.369,1.369,0,0,1,32.384,28.988Z"
                      transform="translate(-20.2 -15.209)"
                      fill="#fff"
                    />
                    <rect
                      id="Rectangle_1282"
                      data-name="Rectangle 1282"
                      width="19.501"
                      height="1.705"
                      transform="translate(0.781 22.979)"
                      fill="#fff"
                    />
                  </g>
                </g>
                <text
                  id="Notarize"
                  transform="translate(25 66.372)"
                  fill="#4ba9d9"
                  fontSize="11"
                  fontFamily="Montserrat-Medium, Montserrat"
                  fontWeight="500"
                >
                  <tspan x="-23.463" y="0">
                    Notarize
                  </tspan>
                </text>
              </g>
            </g>
          </g>
          <text
            id="A_password_to_upload_view_and_notarize_owner_documents"
            data-name="A password to upload, view and
  notarize owner documents"
            transform="translate(180 337)"
            fill="#707070"
            fontSize="14"
            fontFamily="Montserrat-Regular, Montserrat"
          >
            <tspan x="-113.365" y="0">
              A password to{' '}
            </tspan>
            <tspan
              y="0"
              fontFamily="Montserrat-Medium, Montserrat"
              fontWeight="500"
            >
              upload, view and{' '}
            </tspan>
            <tspan
              fontFamily="Montserrat-Medium, Montserrat"
              fontWeight="500"
            >
              <tspan x="-95.368" y="18">
                notarize{' '}
              </tspan>
              <tspan
                y="18"
                fontFamily="Montserrat-Regular, Montserrat"
                fontWeight="400"
              >
                owner documents
              </tspan>
            </tspan>
          </text>
        </g>
      </svg>
    ),
    nonSelected: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="230"
        height="181"
        viewBox="0 0 230 181"
      >
        <g
          id="Group_2541"
          data-name="Group 2541"
          transform="translate(-64 -178)"
        >
          <g id="Group_2539" data-name="Group 2539">
            <g
              id="Component_145_6"
              data-name="Component 145 – 6"
              transform="translate(64 214.244)"
            >
              <g
                id="Group_1591"
                data-name="Group 1591"
                transform="translate(-84 -530.244)"
              >
                <g
                  id="Rectangle_1107"
                  data-name="Rectangle 1107"
                  transform="translate(84 532)"
                  fill="none"
                  stroke="#76b3ef"
                  strokeWidth="2"
                >
                  <rect width="101" height="50" rx="10" stroke="none" />
                  <rect x="1" y="1" width="99" height="48" rx="9" fill="none" />
                </g>
                <text
                  id="Private_Key"
                  data-name="Private Key"
                  transform="translate(134 574)"
                  fill="#76b3ef"
                  fontSize="16"
                  fontFamily="Montserrat-Medium, Montserrat"
                  fontWeight="500"
                >
                  <tspan x="-45.272" y="0">
                    Private Key
                  </tspan>
                </text>
              </g>
              <path
                id="Path_1345"
                data-name="Path 1345"
                d="M8.372,25.921A8.37,8.37,0,1,1,11.762,9.9L21.508.151A.513.513,0,0,1,21.876,0a.194.194,0,0,1,.057.005L25.09.379a.523.523,0,0,1,.451.456l.373,3.152a.5.5,0,0,1-.145.425L23.727,6.455a.513.513,0,0,1-.736,0l-.529-.529-1.192,1.2.529.529a.513.513,0,0,1,.15.368.5.5,0,0,1-.15.363L20.254,9.928a.516.516,0,0,1-.731,0L18.994,9.4l-1.2,1.192.529.529a.518.518,0,0,1,.156.368.527.527,0,0,1-.156.368l-2.3,2.3a8.269,8.269,0,0,1,.715,3.39,8.3,8.3,0,0,1-2.452,5.92A8.309,8.309,0,0,1,8.372,25.921Zm.886-9.259a2.563,2.563,0,0,0-4.375,1.814,2.563,2.563,0,0,0,5.127,0A2.566,2.566,0,0,0,9.259,16.662Z"
                transform="translate(50.98 0) rotate(45)"
                fill="#76b3ef"
              />
            </g>
            <g
              id="Group_2524"
              data-name="Group 2524"
              transform="translate(85 -2)"
            >
              <g
                id="Group_2518"
                data-name="Group 2518"
                transform="translate(99.818 249)"
              >
                <g
                  id="Group_2510"
                  data-name="Group 2510"
                  transform="translate(2.309 0)"
                >
                  <g id="Group_2318" data-name="Group 2318">
                    <path
                      id="Subtraction_21"
                      data-name="Subtraction 21"
                      d="M36.729,51.462H3.8a3.8,3.8,0,0,1-2.677-1.1A3.744,3.744,0,0,1,0,47.706V3.756A3.744,3.744,0,0,1,1.12,1.1,3.8,3.8,0,0,1,3.8,0H27.921V9.606a3.276,3.276,0,0,0,3.288,3.259h9.317v34.84a3.745,3.745,0,0,1-1.12,2.653A3.8,3.8,0,0,1,36.729,51.462Zm2.484-40.468H31.206a1.395,1.395,0,0,1-1.4-1.388V1.385l9.407,9.608Z"
                      transform="translate(0 0)"
                      fill="#ececec"
                    />
                  </g>
                  <g
                    id="Group_2322"
                    data-name="Group 2322"
                    transform="translate(9.826 16.95)"
                  >
                    <path
                      id="Path_1835"
                      data-name="Path 1835"
                      d="M107.544,401.934H90.224a1.052,1.052,0,0,0,0,2.1h17.33a1.052,1.052,0,1,0-.011-2.1Zm0,0"
                      transform="translate(-89.172 -382.225)"
                      fill="#fff"
                      stroke="#fff"
                      strokeWidth="0.3"
                    />
                    <path
                      id="Path_1836"
                      data-name="Path 1836"
                      d="M120.221,178.683l4.335-4.662v11.49a1.052,1.052,0,0,0,2.1,0v-11.49L131,178.683a1.05,1.05,0,0,0,1.536-1.431l-6.166-6.618a1.044,1.044,0,0,0-1.536,0l-6.166,6.618a1.049,1.049,0,0,0,.052,1.484A1.073,1.073,0,0,0,120.221,178.683Zm0,0"
                      transform="translate(-115.897 -170.297)"
                      fill="#fff"
                      stroke="#fff"
                      strokeWidth="0.3"
                    />
                  </g>
                </g>
                <g
                  id="Group_2512"
                  data-name="Group 2512"
                  transform="translate(3 55.372)"
                >
                  <text
                    id="Upload"
                    transform="translate(20 11)"
                    fill="#ececec"
                    fontSize="11"
                    fontFamily="Montserrat-Medium, Montserrat"
                    fontWeight="500"
                  >
                    <tspan x="-20.157" y="0">
                      Upload
                    </tspan>
                  </text>
                </g>
              </g>
              <g
                id="Group_2520"
                data-name="Group 2520"
                transform="translate(135.691 180)"
              >
                <g
                  id="Group_2511"
                  data-name="Group 2511"
                  transform="translate(0 0)"
                >
                  <g
                    id="Group_2318-2"
                    data-name="Group 2318"
                    transform="translate(0)"
                  >
                    <path
                      id="Subtraction_21-2"
                      data-name="Subtraction 21"
                      d="M36.729,51.462H3.8a3.8,3.8,0,0,1-2.677-1.1A3.744,3.744,0,0,1,0,47.706V3.756A3.744,3.744,0,0,1,1.12,1.1,3.8,3.8,0,0,1,3.8,0H27.921V9.606a3.276,3.276,0,0,0,3.288,3.259h9.317v34.84a3.745,3.745,0,0,1-1.12,2.653A3.8,3.8,0,0,1,36.729,51.462Zm2.484-40.468H31.206a1.395,1.395,0,0,1-1.4-1.388V1.385l9.407,9.608Z"
                      transform="translate(0 0)"
                      fill="#ececec"
                    />
                  </g>
                  <g id="noun_Eye_2501659" transform="translate(7.258 19.047)">
                    <path
                      id="Path_1917"
                      data-name="Path 1917"
                      d="M.3,7.782c7.094-10.444,19.016-10.345,26.11.1a1.334,1.334,0,0,1,0,1.675C19.311,20,7.39,19.9.3,9.457A1.334,1.334,0,0,1,.3,7.782ZM13.4,2.166a6.476,6.476,0,0,1,6.4,6.5,6.454,6.454,0,0,1-12.907,0A6.5,6.5,0,0,1,13.4,2.166Z"
                      transform="translate(0 0.002)"
                      fill="#fff"
                      fillRule="evenodd"
                    />
                  </g>
                </g>
                <g
                  id="Group_2513"
                  data-name="Group 2513"
                  transform="translate(6.116 55.372)"
                >
                  <text
                    id="View"
                    transform="translate(14 11)"
                    fill="#ececec"
                    fontSize="11"
                    fontFamily="Montserrat-Medium, Montserrat"
                    fontWeight="500"
                  >
                    <tspan x="-13.629" y="0">
                      View
                    </tspan>
                  </text>
                </g>
              </g>
              <g
                id="Group_2519"
                data-name="Group 2519"
                transform="translate(155.502 249)"
              >
                <g
                  id="Group_2325"
                  data-name="Group 2325"
                  transform="translate(0.885 0)"
                >
                  <path
                    id="noun_Stamp_831862"
                    d="M98.168,35.788a5.218,5.218,0,0,0,0,6.232,5.218,5.218,0,0,1-2.659,8.108,5.218,5.218,0,0,0-3.663,5.018,5.208,5.208,0,0,1-6.884,5.018,5.218,5.218,0,0,0-5.921,1.927,5.218,5.218,0,0,1-8.51,0,5.218,5.218,0,0,0-5.921-1.927,5.208,5.208,0,0,1-6.884-5.018,5.218,5.218,0,0,0-3.713-5.018,5.218,5.218,0,0,1-2.629-8.088,5.218,5.218,0,0,0,0-6.232,5.218,5.218,0,0,1,2.629-8.119,5.218,5.218,0,0,0,3.663-5.018,5.208,5.208,0,0,1,6.884-5.018,5.218,5.218,0,0,0,5.921-1.927,5.218,5.218,0,0,1,8.51,0,5.218,5.218,0,0,0,5.921,1.927A5.208,5.208,0,0,1,91.8,22.672a5.218,5.218,0,0,0,3.663,5.018,5.218,5.218,0,0,1,2.71,8.1Zm-15.725-2.82a3.071,3.071,0,0,0-4.345,0l-5.339,5.339-1.274-1.274a3.073,3.073,0,1,0-4.345,4.345l1.274,1.274,2.178,2.178a3.081,3.081,0,0,0,4.345,0l2.158-2.178,5.339-5.339a3.071,3.071,0,0,0,.01-4.345Z"
                    transform="translate(-50.338 -13.53)"
                    fill="#ececec"
                  />
                  <ellipse
                    id="Ellipse_675"
                    data-name="Ellipse 675"
                    cx="15.22"
                    cy="15.22"
                    rx="15.22"
                    ry="15.22"
                    transform="translate(8.902 9.038)"
                    fill="#ececec"
                  />
                  <g
                    id="noun_Stamp_1471848_1_"
                    data-name="noun_Stamp_1471848 (1)"
                    transform="translate(14.066 11.397)"
                  >
                    <path
                      id="Path_1829"
                      data-name="Path 1829"
                      d="M32.384,28.988v-4.4a4.884,4.884,0,1,0-3.943,0V28.81a1.6,1.6,0,0,1-1.208,1.563l-4.866,1.208A2.86,2.86,0,0,0,20.2,34.387v1.989H41.264V34.423a2.885,2.885,0,0,0-2.238-2.806l-5.577-1.279A1.369,1.369,0,0,1,32.384,28.988Z"
                      transform="translate(-20.2 -15.209)"
                      fill="#fff"
                    />
                    <rect
                      id="Rectangle_1282"
                      data-name="Rectangle 1282"
                      width="19.501"
                      height="1.705"
                      transform="translate(0.781 22.979)"
                      fill="#fff"
                    />
                  </g>
                </g>
                <text
                  id="Notarize"
                  transform="translate(25 66.372)"
                  fill="#ececec"
                  fontSize="11"
                  fontFamily="Montserrat-Medium, Montserrat"
                  fontWeight="500"
                >
                  <tspan x="-23.463" y="0">
                    Notarize
                  </tspan>
                </text>
              </g>
            </g>
          </g>
          <text
            id="A_password_to_upload_view_and_notarize_owner_documents"
            data-name="A password to upload, view and
  notarize owner documents"
            transform="translate(180 337)"
            fill="#707070"
            fontSize="14"
            fontFamily="Montserrat-Regular, Montserrat"
          >
            <tspan x="-113.365" y="0">
              A password to{' '}
            </tspan>
            <tspan
              y="0"
              fontFamily="Montserrat-Medium, Montserrat"
              fontWeight="500"
            >
              upload, view and{' '}
            </tspan>
            <tspan
              fontFamily="Montserrat-Medium, Montserrat"
              fontWeight="500"
            >
              <tspan x="-95.368" y="18">
                notarize{' '}
              </tspan>
              <tspan
                y="18"
                fontFamily="Montserrat-Regular, Montserrat"
                fontWeight="400"
              >
                owner documents
              </tspan>
            </tspan>
          </text>
        </g>
      </svg>
    ),
  },
};

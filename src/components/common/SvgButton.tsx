import * as React from 'react';
import {Component, Fragment} from 'react';
import './SvgButton.scss';

export enum SvgButtonTypes {
  LAYOUT_GRID,
  LAYOUT_LIST,
  INFO,
  LAYOUT_GRID_MOBILE
}

interface SvgButtonProps {
  buttonType?: SvgButtonTypes;
  onClick?: () => void;
}

class SvgButton extends Component<SvgButtonProps> {

  static defaultProps = {
    buttonType: SvgButtonTypes.LAYOUT_GRID,
    onClick: () => {}
  };

  renderInfo() {
    return (
      <svg width="54" height="54" viewBox="0 0 54 54">
        <g transform="translate(0.272 0)">
          <rect width="54" height="54" rx="11" transform="translate(-0.272 0)" fill="#e8ecf1"/>
          <g transform="translate(10.228 10.538)">
            <g fill="#e8ecf1" stroke="#95a3b9" strokeWidth="2.5">
              <circle cx="16.5" cy="16.5" r="16.5" stroke="none"/>
              <circle cx="16.5" cy="16.5" r="15.25" fill="none"/>
            </g>
            <text id="i" transform="translate(13.965 25)" fill="#95a3b9" fontSize="24"
                  fontFamily="GloucesterMT, Helvetica">
              <tspan x="0" y="0">i</tspan>
            </text>
          </g>
        </g>
      </svg>
    );
  }

  renderLayoutGrid() {
    const {onClick} = {...this.props};
    return (
        <svg onClick={onClick} className="layout-grid svg-button" width="54" height="54" viewBox="0 0 54 54">
          <rect className="button-square" width="54" height="54" rx="11"/>
          <g className="grid-lines" transform="translate(13.5 13.885)">
            <g fill="none" stroke="#95a3b9" strokeWidth="2.5">
              <rect width="12.239" height="12.239" rx="2" stroke="none"/>
              <rect x="1.25" y="1.25" width="9.739" height="9.739" rx="0.75" fill="none"/>
            </g>
            <g transform="translate(0 14.862)" fill="none" stroke="#95a3b9" strokeWidth="2.5">
              <rect width="12.239" height="12.239" rx="2" stroke="none"/>
              <rect x="1.25" y="1.25" width="9.739" height="9.739" rx="0.75" fill="none"/>
            </g>
            <g transform="translate(14.862 14.862)" fill="none" stroke="#95a3b9" strokeWidth="2.5">
              <rect width="12.239" height="12.239" rx="2" stroke="none"/>
              <rect x="1.25" y="1.25" width="9.739" height="9.739" rx="0.75" fill="none"/>
            </g>
            <g transform="translate(14.862)" fill="none" stroke="#95a3b9" strokeWidth="2.5">
              <rect width="12.239" height="12.239" rx="2" stroke="none"/>
              <rect x="1.25" y="1.25" width="9.739" height="9.739" rx="0.75" fill="none"/>
            </g>
          </g>
          <g className="list-lines" transform="translate(11.998 17.082)">
            <line x2="29.685" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="3"/>
            <line x2="29.685" transform="translate(0 10.042)" fill="none" stroke="#fff" strokeLinecap="round"
                  strokeWidth="3"/>
            <line x2="29.685" transform="translate(0 20.085)" fill="none" stroke="#fff" strokeLinecap="round"
                  strokeWidth="3"/>
          </g>
        </svg>
    );
  }

  renderLayoutList() {
    const {onClick} = {...this.props};
    return (
        <svg onClick={onClick} className="svg-button layout-list" width="54" height="54" viewBox="0 0 54 54">
          <rect className="button-square" width="54" height="54" rx="11" />
          <g className="list-lines" transform="translate(11.998 17.081)">
            <line x2="29.685" fill="none" stroke="#95a3b9" strokeLinecap="round" strokeWidth="3"/>
            <line x2="29.685" transform="translate(0 10.042)" fill="none" stroke="#95a3b9" strokeLinecap="round"
                  strokeWidth="3"/>
            <line x2="29.685" transform="translate(0 20.085)" fill="none" stroke="#95a3b9" strokeLinecap="round"
                  strokeWidth="3"/>
          </g>
          <g className="grid-lines" transform="translate(13.5 13.885)">
            <g fill="none" stroke="#fff" strokeWidth="2.5">
              <rect width="12.239" height="12.239" rx="2" stroke="none"/>
              <rect x="1.25" y="1.25" width="9.739" height="9.739" rx="0.75" fill="none"/>
            </g>
            <g transform="translate(0 14.862)" fill="none" stroke="#fff" strokeWidth="2.5">
              <rect width="12.239" height="12.239" rx="2" stroke="none"/>
              <rect x="1.25" y="1.25" width="9.739" height="9.739" rx="0.75" fill="none"/>
            </g>
            <g transform="translate(14.862 14.862)" fill="none" stroke="#fff" strokeWidth="2.5">
              <rect width="12.239" height="12.239" rx="2" stroke="none"/>
              <rect x="1.25" y="1.25" width="9.739" height="9.739" rx="0.75" fill="none"/>
            </g>
            <g transform="translate(14.862)" fill="none" stroke="#fff" strokeWidth="2.5">
              <rect width="12.239" height="12.239" rx="2" stroke="none"/>
              <rect x="1.25" y="1.25" width="9.739" height="9.739" rx="0.75" fill="none"/>
            </g>
          </g>
        </svg>
    );
  }

  renderLayoutGridMobile() {
    return (
      <svg width="27.101" height="27.101" viewBox="0 0 27.101 27.101">
        <g>
          <g fill="none" stroke="#95a3b9" strokeWidth="2.5">
            <rect width="12.239" height="12.239" rx="2" stroke="none"/>
            <rect x="1.25" y="1.25" width="9.739" height="9.739" rx="0.75" fill="none"/>
          </g>
          <g transform="translate(0 14.862)" fill="#f3f3f3" stroke="#95a3b9" strokeWidth="2.5">
            <rect width="12.239" height="12.239" rx="2" stroke="none"/>
            <rect x="1.25" y="1.25" width="9.739" height="9.739" rx="0.75" fill="none"/>
          </g>
          <g transform="translate(14.862 14.862)" fill="none" stroke="#95a3b9" strokeWidth="2.5">
            <rect width="12.239" height="12.239" rx="2" stroke="none"/>
            <rect x="1.25" y="1.25" width="9.739" height="9.739" rx="0.75" fill="none"/>
          </g>
          <g transform="translate(14.862)" fill="none" stroke="#95a3b9" strokeWidth="2.5">
            <rect width="12.239" height="12.239" rx="2" stroke="none"/>
            <rect x="1.25" y="1.25" width="9.739" height="9.739" rx="0.75" fill="none"/>
          </g>
        </g>
      </svg>
    );
  }

  render() {
    const {buttonType} = {...this.props};
    switch (buttonType) {
      case SvgButtonTypes.LAYOUT_GRID:
        return this.renderLayoutGrid();
      case SvgButtonTypes.LAYOUT_LIST:
        return this.renderLayoutList();
      case SvgButtonTypes.INFO:
        return this.renderInfo();
      case SvgButtonTypes.LAYOUT_GRID_MOBILE:
        return this.renderLayoutGridMobile();
      default:
        return this.renderLayoutGrid();
    }
  }
}

export default SvgButton;

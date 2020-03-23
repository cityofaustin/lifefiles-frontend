import * as React from 'react';
import {Component} from 'react';

export enum SvgButtonTypes {
  LAYOUT_GRID,
  INFO
}

interface SvgButtonProps {
  buttonType?: number;
}

class SvgButton extends Component<SvgButtonProps> {

  static defaultProps = {
    buttonType: SvgButtonTypes.LAYOUT_GRID
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
            <text id="i" transform="translate(13.965 25)" fill="#95a3b9" fontSize="24" fontFamily="GloucesterMT, Helvetica">
              <tspan x="0" y="0">i</tspan>
            </text>
          </g>
        </g>
      </svg>
    );
  }

  renderLayoutGrid() {
    return (
      <svg width="54" height="54" viewBox="0 0 54 54">
        <rect width="54" height="54" rx="11" fill="#e8ecf1"/>
        <g transform="translate(13.5 13.885)">
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
        <g transform="translate(11.998 17.082)" opacity="0">
          <line id="Line_28" data-name="Line 28" x2="29.685" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="3"/>
          <line id="Line_29" data-name="Line 29" x2="29.685" transform="translate(0 10.042)" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="3"/>
          <line id="Line_30" data-name="Line 30" x2="29.685" transform="translate(0 20.085)" fill="none" stroke="#fff" strokeLinecap="round" strokeWidth="3"/>
        </g>
      </svg>
    );
  }

  render() {
    const {buttonType} = {...this.props};
    switch (buttonType) {
      case SvgButtonTypes.LAYOUT_GRID:
        return this.renderLayoutGrid();
      case SvgButtonTypes.INFO:
        return this.renderInfo();
      default:
        return this.renderLayoutGrid();
    }
  }
}

export default SvgButton;

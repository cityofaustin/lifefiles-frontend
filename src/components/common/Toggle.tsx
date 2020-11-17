import React, { Component } from 'react';
import './Toggle.scss';

export enum ToggleSizeEnum {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
}

interface ToggleProps {
  value: boolean;
  onToggle: () => void;
  // isLarge: boolean;
  // TODO: change to size, xs, sm, md, lg, xl probably
  size: ToggleSizeEnum;
}

class Toggle extends Component<ToggleProps> {
  static defaultProps = {
    value: false,
    size: ToggleSizeEnum.MD,
    onToggle: () => {},
  };

  render() {
    const { value, onToggle, size } = { ...this.props };
    return (
      <label className={'switch ' + size}>
        <input type="checkbox" checked={value} readOnly />
        <span className="slider" />
        <span
          className="yes"
          onClick={() => {
            if (!value) {
              onToggle();
            }
            return;
          }}
        />
        <span
          className="no"
          onClick={() => {
            if (value) {
              return onToggle();
            }
            return;
          }}
        />
      </label>
    );
  }
}

export default Toggle;

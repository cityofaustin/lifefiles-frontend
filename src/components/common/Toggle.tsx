import React, {Component} from 'react';
import './Toggle.scss';

export enum ToggleSizeEnum {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg'
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
    onToggle: () => {}
  };

  render() {
    const {value, onToggle, size} = {...this.props};
    return (
      <label className={'switch ' + size}>
        <input type="checkbox" checked={value} onChange={onToggle} />
        <span className="slider"/>
        <span className="yes" />
        <span className="no" />
      </label>
    );
  }
}

export default Toggle;

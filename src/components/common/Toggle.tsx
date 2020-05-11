import React, {Component} from 'react';
import './Toggle.scss';

interface ToggleProps {
  value: boolean;
  onToggle: () => void;
  isLarge: boolean;
}

class Toggle extends Component<ToggleProps> {

  static defaultProps = {
    value: false,
    isLarge: false,
    onToggle: () => {}
  };

  render() {
    const {value, onToggle, isLarge} = {...this.props};
    return (
      <label className={'switch' + (isLarge ? ' lg' : '')}>
        <input type="checkbox" checked={value} onChange={onToggle} />
        <span className="slider"/>
        <span className="yes" />
        <span className="no" />
      </label>
    );
  }
}

export default Toggle;

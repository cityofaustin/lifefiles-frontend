import React, {Component} from 'react';
import './Toggle.scss';

class Toggle extends Component {
  render() {
    return (
      <label className="switch">
        <input type="checkbox"/>
        <span className="slider"/>
        <span className="yes" />
        <span className="no" />
      </label>
    );
  }
}

export default Toggle;

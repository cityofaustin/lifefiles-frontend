import React, {Component} from 'react';
import {ReactComponent as CheckboxChecked} from '../../img/checkbox-checked.svg';
import {ReactComponent as CheckboxUnchecked} from '../../img/checkbox-unchecked.svg';
import './Checkbox.scss';

interface CheckboxProps {
  isChecked?: boolean;
  onClick: () => void;
}

class Checkbox extends Component<CheckboxProps> {

  render() {
    const {isChecked, onClick} = {...this.props};
    return (
      <div className="check-box" onClick={onClick}>
        { isChecked && (
          <CheckboxChecked />
        )}
        { !isChecked && (
          <CheckboxUnchecked />
        )}
      </div>
    );
  }
}

export default Checkbox;

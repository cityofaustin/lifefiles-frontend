import React, {Component} from 'react';
import {ReactComponent as CheckboxCheckedLg} from '../../img/checkbox-checked-lg.svg';
import {ReactComponent as CheckboxUncheckedLg} from '../../img/checkbox-unchecked-lg.svg';
import {ReactComponent as CheckboxChecked} from '../../img/checkbox-checked.svg';
import {ReactComponent as CheckboxUnchecked} from '../../img/checkbox-unchecked.svg';
import './Checkbox.scss';

interface CheckboxProps {
  isChecked?: boolean;
  onClick: () => void;
  isLarge?: boolean;
}

class Checkbox extends Component<CheckboxProps> {
  render() {
    const {isChecked, onClick, isLarge} = {...this.props};
    return (
      <div className="check-box" onClick={onClick}>
        {isLarge && isChecked && <CheckboxCheckedLg/>}
        {isLarge && !isChecked && <CheckboxUncheckedLg/>}
        {!isLarge && isChecked && <CheckboxChecked/>}
        {!isLarge && !isChecked && <CheckboxUnchecked/>}
      </div>
    );
  }
}

export default Checkbox;

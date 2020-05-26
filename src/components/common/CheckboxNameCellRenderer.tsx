import React, { Component } from 'react';
import Checkbox from './Checkbox';

interface CheckboxNameCellRendererProps {
  value: string; // json string {"label": "gridView", "isChecked": "true"}
  setValue: (value) => void;
}

export default class CheckboxNameCellRenderer extends Component<CheckboxNameCellRendererProps> {
  state = {
    isChecked: false,
    label: ''
  };

  componentDidMount() {
    const {value} = {...this.props};
    const newState = JSON.parse(value);
    const isChecked = newState.isChecked.toString() === 'true';
    this.setState({ isChecked, label: newState.label });
  }

  onChanged = () => {
    const {isChecked, label} = {...this.state};
    const newState = {
      isChecked: !isChecked,
      label
    };
    this.setState({ isChecked: newState.isChecked }, () => {
      this.props.setValue(JSON.stringify(newState));
    });
  };

  render() {
    const {isChecked, label} = {...this.state};
    return (
      <div className="grid grid-left">
        <Checkbox isChecked={isChecked} onClick={this.onChanged} /><span style={{paddingLeft: '10px'}}>{label}</span>
      </div>
    );
  }
}

import React, { Component } from 'react';
import Checkbox from './Checkbox';

interface CheckboxCellRendererProps {
  value: boolean;
  setValue: (value) => void;
}

export default class CheckboxCellRenderer extends Component<
  CheckboxCellRendererProps
> {
  state = { isChecked: false };

  componentDidMount() {
    const boolValue = this.props.value.toString() === 'true';
    this.setState({ isChecked: boolValue });
  }

  onChanged = () => {
    const checked = !this.state.isChecked;
    this.setState({ isChecked: checked });
    this.props.setValue(checked);
  };

  render() {
    const {isChecked} = {...this.state};
    return (
      <div className="grid">
        {/* <input
          type={'checkbox'}
          checked={this.state.isChecked}
          onChange={this.onChanged}
        /> */}
        <Checkbox isChecked={isChecked} onClick={this.onChanged} />
      </div>
    );
  }
}

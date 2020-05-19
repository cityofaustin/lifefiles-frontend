import React, { Component } from 'react';

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
    return (
      <div>
        <input
          type={'checkbox'}
          checked={this.state.isChecked}
          onChange={this.onChanged}
        />
      </div>
    );
  }
}

import React, { Component } from 'react';

interface RoleCellRendererProps {
  value: string;
  setValue: (value) => void;
}

export default class RoleCellRenderer extends Component<RoleCellRendererProps> {
  constructor(props) {
    super(props);
  }
  state = { value: 'owner' };

  componentDidMount() {
    this.setState({ value: this.props.value });
  }

  onChange = (event) => {
    this.setState({ value: event.target.value });
    this.props.setValue(event.target.value);
  };

  render() {
    const {value} = {...this.props};
    return (
      <span>
        <select value={value} onChange={this.onChange}>
          <option value="owner">Owner</option>
          <option value="helper">Helper</option>
        </select>
      </span>
    );
  }
}

import React, { Component } from 'react';

interface AccountTypeCellRendererProps {
  value: string;
  setValue: (value) => void;
  accountTypes: any;
}

export default class AccountTypeCellRenderer extends Component<
  AccountTypeCellRendererProps
> {
  constructor(props) {
    super(props);
  }
  state = { value: 'accounttype1' };

  componentDidMount() {
    this.setState({ value: this.props.value });
  }

  onChange = (event) => {
    this.setState({ value: event.target.value });
    this.props.setValue(event.target.value);
  };

  render() {
    const { value } = { ...this.props };

    const options = [] as any;

    for (let accountType of this.props.accountTypes) {
      options.push(
        <option
          key={accountType.accountTypeName}
          value={accountType.accountTypeName}
        >
          {accountType.accountTypeName}
        </option>
      );
    }
    return (
      <span>
        <select value={value} onChange={this.onChange}>
          {options}
        </select>
      </span>
    );
  }
}

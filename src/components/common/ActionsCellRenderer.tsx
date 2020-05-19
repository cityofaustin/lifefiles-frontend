import React, { Component } from 'react';
import {ReactComponent as DeleteSvg} from '../../img/delete-unbound.svg';
import {ReactComponent as SaveSvg} from '../../img/save.svg';
import './ActionsCellRenderer.scss';

interface ActionsCellRendererProps {
  value: boolean;
  setValue: (value) => void;
}

export default class ActionsCellRenderer extends Component<
ActionsCellRendererProps
> {
  componentDidMount() {
    const boolValue = this.props.value.toString() === 'true';
    this.setState({ isChecked: boolValue });
  }

  onUpdate = () => {
    this.props.setValue('update');
  };

  onDelete = () => {
    this.props.setValue('delete');
  }

  render() {
    return (
      <div className="actions-cell">
        <DeleteSvg onClick={this.onDelete} />
        <SaveSvg onClick={this.onUpdate} />
      </div>
    );
  }
}

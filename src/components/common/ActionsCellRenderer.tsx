import React, { Component } from 'react';
import {ReactComponent as DeleteSvg} from '../../img/delete-unbound.svg';
import {ReactComponent as SaveSvg} from '../../img/save.svg';
import './ActionsCellRenderer.scss';

interface ActionsCellRendererProps {
  data: any;
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

  onSave = () => {
    this.props.setValue('save');
  };

  onDelete = () => {
    const id = this.props.data._id;
    this.props.setValue('delete');
  };

  render() {
    return (
      <div className="actions-cell">
        <DeleteSvg onClick={this.onDelete} />
        <SaveSvg onClick={this.onSave} />
      </div>
    );
  }
}

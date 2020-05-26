import React, { Component, Fragment } from 'react';
import './AdminDocumentType.scss';

interface AdminDocumentTypeProps {
  documentTypeName?: string;
  isTwoSided?: boolean;
  hasExpirationDate?: boolean;
  isProtectedDoc?: boolean;
  isRecordableDoc?: boolean;
  fields?: any;
  edit: boolean;
  handleSubmitNewDocumentType: (event) => void;
  handleDeleteDocumentType?: () => void;
}

class AdminDocumentType extends Component<AdminDocumentTypeProps> {
  state = {
    newName: '',
    newFieldKeys: [] as string[],
    newFieldValues: [] as string[],
    checks: {},
  };

  handleNewNameChange = (e) => {
    // e.target.value;
    this.setState({ newName: e.target.value });
  };

  renderEdit() {
    return (
      <div>
        <form onSubmit={this.props.handleSubmitNewDocumentType}>
          <label>Document Type Name:</label>
          <input
            key={'name-key'}
            name="name"
            value={this.state.newName}
            onChange={this.handleNewNameChange}
          />
          <label>isTwoSided:</label>
          <input
            name="isTwoSided"
            type="checkbox"
            defaultChecked={this.props.isTwoSided}
          />
          <label>hasExpirationDate:</label>
          <input
            name="hasExpirationDate"
            type="checkbox"
            defaultChecked={this.props.hasExpirationDate}
          />
          <label>isProtectedDoc:</label>
          <input
            name="isProtectedDoc"
            type="checkbox"
            defaultChecked={this.props.isProtectedDoc}
          />
          <label>isRecordableDoc:</label>
          <input
            name="isRecordableDoc"
            type="checkbox"
            defaultChecked={this.props.isRecordableDoc}
          />
          <input type="submit" value="Add New Doc Type" />
        </form>
      </div>
    );
  }

  renderDisplay() {
    return (
      <Fragment>
        <p>{this.props.documentTypeName}</p>

        <label>isTwoSided:</label>
        <input
          name="isTwoSided"
          type="checkbox"
          defaultChecked={this.props.isTwoSided}
        />
        <label>hasExpirationDate:</label>
        <input
          name="hasExpirationDate"
          type="checkbox"
          defaultChecked={this.props.hasExpirationDate}
        />
        <label>isProtectedDoc:</label>
        <input
          name="isProtectedDoc"
          type="checkbox"
          defaultChecked={this.props.isProtectedDoc}
        />
        <label>isRecordableDoc:</label>
        <input
          name="isRecordableDoc"
          type="checkbox"
          defaultChecked={this.props.isRecordableDoc}
        />
        <button onClick={this.props.handleDeleteDocumentType}>Delete</button>
        <input type="submit" value="Update" />
      </Fragment>
    );
  }

  render() {
    const {
      documentTypeName,
      isTwoSided,
      isProtectedDoc,
      isRecordableDoc,
      fields,
      edit
    } = { ...this.props };

    if (this.props.edit) {
      return this.renderEdit();
    } else {
      return this.renderDisplay();
    }
  }
}

export default AdminDocumentType;

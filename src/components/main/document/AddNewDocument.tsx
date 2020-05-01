import React, {Component, FormEvent} from 'react';
import {Button} from 'reactstrap';
import './AddNewDocument.scss';
// NOTE: you can import svg's as react components this way
// import newDocumentSvg from '../../../img/new-document.svg';
// import newDocumentSvg, {ReactComponent as NewDoc} from '../../../img/new-document.svg';
import {ReactComponent as NewDoc} from '../../../img/new-document.svg';

interface AddNewDocumentProps {
  handleAddNew: () => void;
}

class AddNewDocument extends Component<AddNewDocumentProps> {

  constructor(props: Readonly<AddNewDocumentProps>) {
    super(props);
  }

  render() {
    // const {handleAddNew} = {...this.props};
    return (
      <div className="add-doc-container">
        <NewDoc />
        <div className="title">Add New</div>
      </div>
    );
  }
}

export default AddNewDocument;

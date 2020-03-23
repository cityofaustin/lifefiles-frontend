import React, {Component, FormEvent} from 'react';
import {Button} from 'reactstrap';
import newDocumentSvg from '../../../img/new-document.svg';
// NOTE: you can import svg's as react components this way
// import newDocumentSvg, {ReactComponent as NewDoc} from '../../../img/new-document.svg';

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
      <div>
        <img style={{width: '165px', height: '205px', display: 'block', margin: 'auto'}}
             src={newDocumentSvg} alt="Add New"/>
        <div className="title padding-top-44">Add New</div>
      </div>
    );
  }
}

export default AddNewDocument;

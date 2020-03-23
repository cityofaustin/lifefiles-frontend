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

  handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const {handleAddNew} = {...this.props};
    handleAddNew();
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <img style={{width: '165px', height: '205px', display: 'block', margin: 'auto'}}
             src={newDocumentSvg} alt="Add New"/>
        <div className="document-title padding-top-12">Add New</div>
        <div className="subtitle padding-bottom-12">NOT UPLOADED</div>
        <Button color="secondary" type="submit">Upload</Button>
      </form>
    );
  }
}

export default AddNewDocument;

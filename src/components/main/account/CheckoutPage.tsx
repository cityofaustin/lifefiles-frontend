import React, { Component, ChangeEvent } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  DropdownToggle,
  ListGroup,
  ListGroupItem,
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Input,
  Label,
} from 'reactstrap';
import Account from '../../../models/Account';
import StringUtil from '../../../util/StringUtil';
import AccountService from '../../../services/AccountService';
import { Link } from 'react-router-dom';
import ZipUtil from '../../../util/ZipUtil';
import CryptoUtil from '../../../util/CryptoUtil';
import DocumentService from '../../../services/DocumentService';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { countReset } from 'console';

interface CheckoutPageProps {
  account: Account;
  privateEncryptionKey?: string;
  goBack: () => void;
}

class CheckoutPage extends Component<CheckoutPageProps> {
  state = {
    encryptionKey: '',
  };

  constructor(props: Readonly<CheckoutPageProps>) {
    super(props);
  }

  async componentDidMount(): Promise<void> {}

  handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value;
    this.setState({ encryptionKey: key });
  };

  downloadDocuments = async () => {
    let base64Images: string[] = [];

    for (let document of this.props.account.documents) {
      let base64Image = '';
      try {
        const encryptedString: string = await ZipUtil.unzip(
          DocumentService.getDocumentURL(document.url)
        );

        base64Image = await CryptoUtil.getDecryptedString(
          this.props.privateEncryptionKey!,
          encryptedString
        );

        base64Images.push(base64Image);
      } catch (err) {
        console.error(err);
      }
    }

    var zip = new JSZip();
    var img = zip.folder('documents');

    let counter = 0;
    for (let base64Image of base64Images) {
      counter++;
      let fileName = 'document-' + counter;
      let base64String = base64Image.split(',')[1];
      let fileType = base64Image.split(',')[0].split('/')[1].split(';')[0];
      img!.file(fileName + '.' + fileType, base64String, {
        base64: true,
      });
    }

    zip.generateAsync({ type: 'blob' }).then(function (content) {
      saveAs(content, 'mypass-documents.zip');
    });
  };

  render() {
    const { account, goBack } = { ...this.props };

    return (
      <div className="main-content" style={{ marginTop: '20px' }}>
        <Breadcrumb>
          <BreadcrumbItem className="breadcrumb-link">
            <Link to={account.role === 'owner' ? '/documents' : './clients'}>
              {account.role === 'owner' ? 'My Documents' : 'My Clients'}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem active>Checkout</BreadcrumbItem>
        </Breadcrumb>
        <ListGroup>
          <ListGroupItem className="justify-content-between">
            {/*<img className="shared-with-image-single"*/}
            {/*     src={account.profileimgUrl}*/}
            {/*     alt="profile"*/}
            {/*/>*/}
            {account.profileImageUrl && (
              <img
                className="shared-with-image-single"
                src={AccountService.getProfileURL(account.profileImageUrl)}
                alt="Profile"
              />
            )}
            {!account.profileImageUrl && (
              <div className="account-circle">
                {StringUtil.getFirstUppercase(account.username)}
              </div>
            )}
            <div style={{ marginLeft: '24px', display: 'inline-block' }}>
              {/*{`${account.firstName} ${account.lastName}`}*/}
              {/* {account.username} */}
            </div>

            <Button className="login-btn" onClick={this.downloadDocuments}>
              Download Documents
            </Button>
          </ListGroupItem>
        </ListGroup>
      </div>
    );
  }
}

export default CheckoutPage;

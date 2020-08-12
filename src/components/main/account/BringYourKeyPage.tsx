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

interface BringYourKeyPageProps {
  account: Account;
  goBack: () => void;
  setBringYourOwnEncryptionKey: (key) => void;
}

class BringYourKeyPage extends Component<BringYourKeyPageProps> {
  state = {
    encryptionKey: '',
  };

  constructor(props: Readonly<BringYourKeyPageProps>) {
    super(props);
  }

  handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value;
    this.setState({ encryptionKey: key });
  };

  render() {
    const { account, goBack } = { ...this.props };

    return (
      <div className="main-content" style={{ marginTop: '20px' }}>
        <Breadcrumb>
          <BreadcrumbItem className="breadcrumb-link">
            <Link to={account.role === 'owner' ? '/documents' : '/clients'}>
              {account.role === 'owner' ? 'My Documents' : 'My Clients'}
            </Link>
          </BreadcrumbItem>
          <BreadcrumbItem active>Bring Your Key</BreadcrumbItem>
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

            <FormGroup>
              <Label for="password">Encryption Key</Label>
              <Input
                type="password"
                name="password"
                id="password"
                value={this.state.encryptionKey}
                onChange={this.handleInputChange}
                placeholder="Your Encryption Key"
              />
            </FormGroup>

            <Button
              className="login-btn"
              type="submit"
              onClick={() =>
                this.props.setBringYourOwnEncryptionKey(
                  this.state.encryptionKey
                )
              }
            >
              Update Encryption Key
            </Button>
          </ListGroupItem>
        </ListGroup>
      </div>
    );
  }
}

export default BringYourKeyPage;

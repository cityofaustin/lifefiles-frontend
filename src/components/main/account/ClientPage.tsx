import * as React from 'react';
import {Component, Fragment} from 'react';
import {ListGroup, ListGroupItem} from 'reactstrap';
import Account from '../../../models/Account';
import MainPage from '../MainPage';
import Document from '../../../models/document/Document';
import ShareRequestService from '../../../services/ShareRequestService';
import ShareRequest from '../../../models/ShareRequest';

interface ClientPageProps {
  otherOwnerAccounts: Account[];
  sortAsc: boolean;
  toggleSort: () => void;
  handleAddNew: () => void;
  searchedDocuments: Document[];
  handleSelectDocument: (document: Document) => void;
  myAccount: Account;
  addShareRequest: (request: ShareRequest) => void;
  removeShareRequest: (request: ShareRequest) => void;
}

interface ClientPageState {
  accountSelected?: Account;
}

class ClientPage extends Component<ClientPageProps, ClientPageState> {
  constructor(props: Readonly<ClientPageProps>) {
    super(props);
    this.state = {
      accountSelected: undefined
    };
  }

  goBack = () => {
    this.setState({accountSelected: undefined});
  };

  handleSelectAccount = async (otherOwnerAccount: Account) => {
    try {
      await ShareRequestService.get(otherOwnerAccount.id);
    } catch (err) {
      console.error(err.message);
    }
    this.setState({accountSelected: otherOwnerAccount});
  };

  render() {
    const {sortAsc, toggleSort, handleAddNew, searchedDocuments,
      handleSelectDocument, otherOwnerAccounts, myAccount, addShareRequest, removeShareRequest} = {...this.props};
    const {accountSelected} = {...this.state};
    return (
      <div className="main-content">
        { !accountSelected && (
          <Fragment>
            <div className="big-title">My Clients</div>
            <div className="other-owner-list">
              {otherOwnerAccounts.length < 1 && (
                <div>No clients found.</div>
              )}
              <ListGroup>
                {otherOwnerAccounts!.map((otherOwnerAccount, idx) => {
                  return (
                    <ListGroupItem
                      key={idx}
                      onClick={() => this.handleSelectAccount(otherOwnerAccount)}
                      className="justify-content-between other-owner-listitem"
                    >
                      <div>
                        <div>{otherOwnerAccount.username}</div>
                        <div>shared: {otherOwnerAccount.shareRequests ? otherOwnerAccount.shareRequests.length : 0}</div>
                      </div>
                    </ListGroupItem>
                  );
                })}
              </ListGroup>
            </div>
          </Fragment>
        )}
        { accountSelected && (
          <MainPage sortAsc={sortAsc} toggleSort={toggleSort} handleAddNew={handleAddNew}
                    referencedAccount={accountSelected} searchedDocuments={searchedDocuments}
                    handleSelectDocument={handleSelectDocument} goBack={this.goBack}
                    searchedAccounts={[]} shareRequests={[]} myAccount={myAccount}
                    addShareRequest={addShareRequest} removeShareRequest={removeShareRequest}
           activeTab={'1'} setActiveTab={() => {}}/>
        )}
      </div>
    );
  }
}

export default ClientPage;

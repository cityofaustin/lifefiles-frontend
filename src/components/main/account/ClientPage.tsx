import * as React from 'react';
import {Component, Fragment} from 'react';
import {ListGroup, ListGroupItem} from 'reactstrap';
import Account from '../../../models/Account';
import DocumentPage from '../document/DocumentPage';
import Document from '../../../models/Document';
import ShareRequestService from '../../../services/ShareRequestService';

interface ClientPageProps {
  otherOwnerAccounts: Account[];
  sortAsc: boolean;
  toggleSort: () => void;
  handleAddNew: () => void;
  searchedDocuments: Document[];
  handleSelectDocument: (document: Document) => void;
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
    await ShareRequestService.get(otherOwnerAccount.id);
    this.setState({accountSelected: otherOwnerAccount});
  };

  render() {
    const {sortAsc, toggleSort, handleAddNew, searchedDocuments,
      handleSelectDocument, otherOwnerAccounts} = {...this.props};
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
          <DocumentPage sortAsc={sortAsc} toggleSort={toggleSort} handleAddNew={handleAddNew}
                        referencedAccount={accountSelected} searchedDocuments={searchedDocuments}
                        handleSelectDocument={handleSelectDocument} goBack={this.goBack}
          />
        )}
      </div>
    );
  }
}

export default ClientPage;

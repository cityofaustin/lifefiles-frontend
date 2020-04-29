import * as React from 'react';
import { Component, Fragment } from 'react';
import { ListGroup, ListGroupItem, Row, Col } from 'reactstrap';
import Account from '../../../models/Account';
import MainPage from '../DocumentPage';
import Document from '../../../models/document/Document';
import ShareRequestService from '../../../services/ShareRequestService';
import ShareRequest from '../../../models/ShareRequest';
import AccountSummary from './AccountSummary';
import './ClientPage.scss';

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
  privateEncryptionKey: string;
  clientShares: Map<string, ShareRequest[]>;
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

  // async componentDidMount() {
  //   const { clientShares } = {...this.state};
  //   const { otherOwnerAccounts } = {...this.props};
  //   try {
  //     for(const otherOwnerAccount of otherOwnerAccounts) {
  //       const shareRequests = await ShareRequestService.get(otherOwnerAccount.id);
  //       clientShares.set(otherOwnerAccount.id, shareRequests);
  //     }
  //   }
  //   catch(err) {
  //     console.error(err);
  //   }
  //   this.setState({clientShares});
  // }

  goBack = () => {
    this.setState({ accountSelected: undefined });
  };

  handleSelectAccount = async (otherOwnerAccount: Account) => {
    try {
      await ShareRequestService.get(otherOwnerAccount.id);
    } catch (err) {
      console.error(err.message);
    }
    this.setState({ accountSelected: otherOwnerAccount });
  };

  render() {
    const { sortAsc, toggleSort, handleAddNew, searchedDocuments, clientShares,
      handleSelectDocument, otherOwnerAccounts, myAccount, addShareRequest, removeShareRequest, privateEncryptionKey } = { ...this.props };
    const { accountSelected } = { ...this.state };
    return (
      <div className="main-content">
        {!accountSelected && (
          <Fragment>
            <div className="big-title">My Clients</div>
            <div className="other-owner-list">
              {otherOwnerAccounts.length < 1 && (
                <div>No clients found.</div>
              )}
              <Fragment>
                <Row className="network-row">
                  {otherOwnerAccounts.length <= 0 && (
                    <div className="no-network">There are no clients.</div>
                  )}
                  {otherOwnerAccounts.map((account) => {
                    let shareRequests: ShareRequest[] = [];
                    if (clientShares.get(account.id) !== undefined) {
                      shareRequests = clientShares.get(account.id)!;
                      shareRequests = shareRequests.filter(shareRequest => {
                        return shareRequest.shareWithAccountId === myAccount.id;
                      });
                    }
                    return (
                      <Col
                        key={account.id}
                        sm="12"
                        md="6"
                        lg="6"
                        xl="4"
                        className="network-container"
                      >
                        <AccountSummary
                          isNotary
                          account={account}
                          shareRequests={shareRequests}
                          searchedDocuments={searchedDocuments}
                          myAccount={myAccount}
                          addShareRequest={addShareRequest}
                          removeShareRequest={removeShareRequest}
                          privateEncryptionKey={privateEncryptionKey!}
                        />
                      </Col>
                    );
                  })}
                </Row>
              </Fragment>
            </div>
          </Fragment>
        )}
        {/* {accountSelected && (
          <MainPage sortAsc={sortAsc} toggleSort={toggleSort} handleAddNew={handleAddNew}
            referencedAccount={accountSelected} searchedDocuments={searchedDocuments}
            handleSelectDocument={handleSelectDocument} goBack={this.goBack}
            searchedAccounts={[]} shareRequests={[]} myAccount={myAccount}
            addShareRequest={addShareRequest} removeShareRequest={removeShareRequest}
            activeTab={'1'} setActiveTab={() => { }} />
        )} */}
      </div>
    );
  }
}

export default ClientPage;

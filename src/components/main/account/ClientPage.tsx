import * as React from 'react';
import { Component, Fragment } from 'react';
import { Row, Col } from 'reactstrap';
import Account from '../../../models/Account';
import Document from '../../../models/document/Document';
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
  handleClientSelected: (clientSelected: Account) => void;
}

class ClientPage extends Component<ClientPageProps, {}> {
  constructor(props: Readonly<ClientPageProps>) {
    super(props);
    this.state = {
      accountSelected: undefined
    };
  }

  render() {
    const { searchedDocuments, clientShares, handleClientSelected,
      otherOwnerAccounts, myAccount, addShareRequest, removeShareRequest, privateEncryptionKey } = { ...this.props };
    return (
      <div className="main-content">
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
                        handleClientSelected={handleClientSelected}
                      />
                    </Col>
                  );
                })}
              </Row>
            </Fragment>
          </div>
        </Fragment>
      </div>
    );
  }
}

export default ClientPage;

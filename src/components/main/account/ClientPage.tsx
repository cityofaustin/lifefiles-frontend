import * as React from 'react';
import { Component, Fragment } from 'react';
import { Row, Col } from 'reactstrap';
import Account from '../../../models/Account';
import Document from '../../../models/document/Document';
import ShareRequest from '../../../models/ShareRequest';
import AccountSummary from './AccountSummary';
import { ReactComponent as StampSvg } from '../../../img/stamp.svg';

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
  isLoading: boolean;
}

class ClientPage extends Component<ClientPageProps, {}> {
  constructor(props: Readonly<ClientPageProps>) {
    super(props);
    this.state = {
      accountSelected: undefined,
    };
  }

  render() {
    const {
      searchedDocuments,
      clientShares,
      handleClientSelected,
      otherOwnerAccounts,
      myAccount,
      addShareRequest,
      removeShareRequest,
      privateEncryptionKey,
      isLoading,
    } = { ...this.props };
    return (
      <div className="main-content">
        <Fragment>
          <div className="big-title">My Clients</div>
          <div className="other-owner-list">
            <Fragment>
              <Row className="network-row">
                {!isLoading && otherOwnerAccounts.length <= 0 && (
                  <div className="no-network">
                    <StampSvg />
                    <div>
                      Welcome {myAccount.firstName}! You have succesfully
                      on-boarded to LifeFiles! Currently, you are not connected
                      to Owners in LifeFiles.
                    </div>
                    <div className="title2">
                      How do I add Owners to my client list?
                    </div>
                    <div>
                      Ask Owners to add you to their network list to start
                      sharing documents with you. If you are not in their
                      network you can't see them in your client list to help
                      them.
                    </div>
                    <div>
                      We are doing this to give the choice to Owners to decide
                      with whom they can share documents.
                    </div>
                  </div>
                )}
                {otherOwnerAccounts.map((account) => {
                  let shareRequests: ShareRequest[] = [];
                  if (clientShares.get(account.id) !== undefined) {
                    shareRequests = clientShares.get(account.id)!;
                    shareRequests = shareRequests.filter((shareRequest) => {
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
                        unshareAllWithHelperContact={() => {}}
                        removeHelperContact={() => {}}
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

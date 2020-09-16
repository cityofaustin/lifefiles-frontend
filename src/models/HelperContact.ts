import Account from './Account';

export default interface HelperContact {
  _id: string;
  ownerAccount: Account;
  helperAccount: Account;
  isSocialAttestationEnabled: boolean;
  canAddNewDocuments: boolean;
}

import Account from './Account';
import Role from './Role';
import ShareRequest from './ShareRequest';
import Document from './document/Document';
import AccountService from '../services/AccountService';

class AccountImpl implements Account {
  firstName: string;
  lastName: string;
  id: string;
  didAddress: string;
  documents: Document[];
  email: string;
  role: Role;
  shareRequests: ShareRequest[];
  token: string;
  username: string;

  public static getFullName(firstName?: string, lastName?: string) {
    firstName = firstName ? firstName : '';
    lastName = lastName ? lastName : '';
    if (firstName.length > 0 && lastName.length <= 0) {
      return firstName;
    }
    if (lastName.length > 0 && firstName.length <= 0) {
      return lastName;
    }
    return ((firstName + lastName).length > 0) ? `${firstName} ${lastName}` : '-';
  }

  public static getProfileURLByIdAndList(accounts: Account[], accountId: any) {
    const account = this.getAccountByIdAndList(accounts, accountId);
    if(account) {
      return AccountService.getProfileURL(account.profileImageUrl!);
    }
  }

  public static getAccountByIdAndList(accounts: Account[], accountId: any): Account | undefined {
    return accounts.find(accountItem => accountItem.id === accountId);
  }
}

export default AccountImpl;

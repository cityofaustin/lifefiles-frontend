import Account from './Account';
import Role from './Role';
import ShareRequest from './ShareRequest';
import Document from './Document';

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
}

export default AccountImpl;

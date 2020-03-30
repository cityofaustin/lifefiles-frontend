import Account from './Account';
import Role from './Role';
import AccountImpl from './AccountImpl';

describe('Account', () => {
  it('should get full name based on first and last name', () => {
    const account1: Account = {
      didAddress: '', documents: [], email: '', id: '',
      role: Role.owner, shareRequests: [], token: '', username: '', firstName: 'sally', lastName: 'owner'
    };
    const account2: Account = {
      didAddress: '', documents: [], email: '', id: '',
      role: Role.owner, shareRequests: [], token: '', username: ''
    };
    const account3: Account = {
      didAddress: '', documents: [], email: '', id: '',
      role: Role.owner, shareRequests: [], token: '', username: '', firstName: 'sally'
    };
    const account4: Account = {
      didAddress: '', documents: [], email: '', id: '',
      role: Role.owner, shareRequests: [], token: '', username: '', lastName: 'owner'
    };
    expect(AccountImpl.getFullName(account1.firstName, account1.lastName)).toBe('sally owner');
    expect(AccountImpl.getFullName(account2.firstName, account2.lastName)).toBe('-');
    expect(AccountImpl.getFullName(account3.firstName, account3.lastName)).toBe('sally');
    expect(AccountImpl.getFullName(account4.firstName, account4.lastName)).toBe('owner');
  });
});

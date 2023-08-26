import Account from "./Account";
import Role from "./Role";
import ShareRequest from "./ShareRequest";
import Document from "./document/Document";
import AccountService from "../services/AccountService";

class AccountImpl implements Account {
  firstName: string = "";
  lastName: string = "";
  id: string = "";
  didAddress: string = "";
  documents: Document[] = [];
  email: string = "";
  role: Role = Role.owner;
  shareRequests: ShareRequest[] = [];
  token: string = "";
  username: string = "";

  public static getFullName(firstName?: string, lastName?: string) {
    firstName = firstName && firstName !== "-" ? firstName : "";
    lastName = lastName && lastName !== "-" ? lastName : "";
    if (firstName.length > 0 && lastName.length <= 0) {
      return firstName;
    }
    if (lastName.length > 0 && firstName.length <= 0) {
      return lastName;
    }
    return (firstName + lastName).length > 0 ? `${firstName} ${lastName}` : "";
  }

  public static getFirstNameByFull(fullname) {
    if (fullname.length > 0) {
      const names = fullname.split(" ");
      if (names.length > 0) {
        return names[0];
      }
    }
    return "";
  }

  public static getLastNameByFull(fullname) {
    if (fullname.length > 0) {
      const names = fullname.split(" ");
      if (names.length > 1) {
        return names[names.length - 1];
      }
    }
    return "";
  }

  public static hasNameSet(account) {
    return (
      account.firstName &&
      account.firstName.length > 0 &&
      account.firstName !== "-" &&
      account.lastName &&
      account.lastName.length > 0 &&
      account.lastName !== "-"
    );
  }

  public static displayName(account) {
    return this.hasNameSet(account)
      ? this.getFullName(account.firstName, account.lastName)
      : account.username;
  }

  public static getProfileURLByIdAndList(accounts: Account[], accountId: any) {
    const account = this.getAccountByIdAndList(accounts, accountId);
    if (account && account.profileImageUrl) {
      return AccountService.getProfileURL(account.profileImageUrl!);
    } else {
      return undefined;
    }
  }

  public static getAccountByIdAndList(
    accounts: Account[],
    accountId: any
  ): Account | undefined {
    return accounts.find((accountItem) => accountItem.id === accountId);
  }
}

export default AccountImpl;

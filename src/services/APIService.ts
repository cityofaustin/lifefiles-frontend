import AuthService from './AuthService';
import StringUtil from '../util/StringUtil';
import fetch from '../util/fetchWithTimeout';
import APIError from './APIError';
import HttpStatusCode from '../models/HttpStatusCode';
import UpdateDocumentRequest from '../models/document/UpdateDocumentRequest';
import { format } from 'date-fns';
import HelperRegisterRequest from '../models/auth/HelperRegisterRequest';
import { ShareRequestPermissions } from './ShareRequestService';
import Account from '../models/Account';

let API_ENDPOINT;

class APIService {
  static getHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (AuthService.isLoggedIn()) {
      headers.Authorization = `Bearer ${AuthService.getAccessToken()}`;
    }
    return headers;
  }

  static handleErrorStatusCodes(responseStatus: number, responseJson: any) {
    const errorStatusCodes = [
      // 4xx Client errors
      HttpStatusCode.UNAUTHORIZED,
      HttpStatusCode.FORBIDDEN,
      HttpStatusCode.UNPROCESSABLE_ENTITY,
      // 5xx Server errors
      HttpStatusCode.INTERNAL_SERVER_ERROR,
    ];
    if (errorStatusCodes.includes(responseStatus)) {
      throw new APIError(responseStatus + '', responseJson);
    }
  }

  static setApiEndpoint(apiEndpoint) {
    API_ENDPOINT = apiEndpoint;
  }

  static getAPIEndpoint() {
    return API_ENDPOINT;
  }

  static async get(path: string) {
    return await this.getWithEndpoint(API_ENDPOINT, path);
  }

  static async getWithEndpoint(endpoint, path: string) {
    const input: RequestInfo = `${endpoint}${path}`;
    const headers: HeadersInit = await this.getHeaders();
    const init: RequestInit = {
      method: 'GET',
      headers,
    };
    try {
      const response = await fetch(input, init);
      const responseJson = await response.json();
      this.handleErrorStatusCodes(response.status, responseJson);
      return responseJson;
    } catch (err) {
      console.error(err.message);
      AuthService.logOut();
      location.reload();
    }
  }

  static async getText(url: string) {
    const input: RequestInfo = `${url}`;
    const headers: HeadersInit = await this.getHeaders();
    const init: RequestInit = {
      method: 'GET',
      headers,
    };
    try {
      const response = await fetch(input, init);
      const responseText = await response.text();
      // this.handleErrorStatusCodes(response.status, responseJson);
      return responseText;
    } catch (err) {
      console.error(err.message);
      AuthService.logOut();
      location.reload();
    }
  }

  static async post(path: any, entity: any) {
    const input = `${API_ENDPOINT}${path}`;
    const headers = await this.getHeaders();
    const init = {
      method: 'POST',
      headers,
      body: JSON.stringify(entity),
    };
    let responseJson;
    try {
      const response = await fetch(input, init);
      responseJson = await response.json();
      this.handleErrorStatusCodes(response.status, responseJson);
      return responseJson;
    } catch (err) {
      console.error(err.message);
      return responseJson;
    }
  }

  static async postDocVC(path, vc, helperFile, ownerFile, network) {
    const input = `${API_ENDPOINT}${path}`;
    const headers = {
      Authorization: `Bearer ${AuthService.getAccessToken()}`,
    };
    const formdata = new FormData();
    formdata.append('img', helperFile, helperFile.name);
    formdata.append('img', ownerFile, ownerFile.name);
    formdata.append('vc', vc);
    formdata.append('network', network);
    const init = {
      method: 'POST',
      headers,
      body: formdata,
    };
    const response = await fetch(input, init, 60000);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }

  static async saveAppSettings(title: string, logoImage?: File) {
    const path = '/admin/app-settings';
    const input = `${API_ENDPOINT}${path}`;
    const headers = {
      Authorization: `Bearer ${AuthService.getAccessToken()}`,
    };
    const formdata = new FormData();
    if (logoImage) {
      formdata.append('img', logoImage, logoImage.name);
    }
    formdata.append('title', title);
    const init = {
      method: 'POST',
      headers,
      body: formdata,
    };
    const response = await fetch(input, init, 60000);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }

  static async registerSecure(request: HelperRegisterRequest) {
    const path = '/secure-accounts';
    const input = `${API_ENDPOINT}${path}`;
    const headers = {
      // Authorization: `Bearer ${AuthService.getAccessToken()}`,
    };
    const formdata = new FormData();
    // const blob = await StringUtil.fileToText(request.file!);
    // const base64String2 = await StringUtil.fileContentsToString(thumbnailFile!);
    let lastname = request.account.lastname;

    if (lastname === '' || lastname === undefined) {
      lastname = '-';
    }

    formdata.append('email', request.account.email);
    formdata.append('password', request.account.password);
    formdata.append('username', request.account.username);
    formdata.append('firstname', request.account.firstname);
    formdata.append('lastname', lastname);
    formdata.append('role', request.account.role);

    if(request.file) {
      formdata.append('img', request.file, request.file.name);
    }
    if (request.account.publicEncryptionKey) {
      formdata.append(
        'publicEncryptionKey',
        request.account.publicEncryptionKey
      );
    }
    if (request.account.notaryId) {
      formdata.append('notaryId', request.account.notaryId);
    }
    if (request.account.notaryState) {
      formdata.append('notaryState', request.account.notaryState);
    }
    const init = {
      method: 'POST',
      headers,
      body: formdata,
    };
    // NOTE: putting a longer timeout over here since uploading files can take longer.
    const response = await fetch(input, init, 60000);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }

  static async postDocument(
    file: File,
    thumbnailFile: File,
    documentType: string,
    encryptionPubKey: string,
    validUntilDate?: Date
  ) {
    const path = '/documents';
    const input = `${API_ENDPOINT}${path}`;
    const headers = {
      Authorization: `Bearer ${AuthService.getAccessToken()}`,
    };
    const formdata = new FormData();
    formdata.append('img', file, file.name);
    formdata.append('img', thumbnailFile, thumbnailFile.name);
    formdata.append('type', documentType);
    formdata.append('encryptionPubKey', encryptionPubKey);
    if (validUntilDate) {
      formdata.append('validuntildate', validUntilDate.toISOString());
    }
    const init = {
      method: 'POST',
      headers,
      body: formdata,
    };
    // NOTE: putting a longer timeout over here since uploading files can take longer.
    const response = await fetch(input, init, 60000);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }

  static async uploadDocumentOnBehalfOfUser(
    newCaseworkerFile: File,
    newCaseworkerThumbnail: File,
    newOwnerFile: File,
    newOwnerThumbnail: File,
    documentType: string,
    ownerId: string,
    validUntilDate?: Date
  ) {
    const path = '/upload-document-on-behalf-of-user';
    const input = `${API_ENDPOINT}${path}`;
    const headers = {
      Authorization: `Bearer ${AuthService.getAccessToken()}`,
    };
    const formdata = new FormData();
    formdata.append('img', newCaseworkerFile, newCaseworkerFile.name);
    formdata.append('img', newCaseworkerThumbnail, newCaseworkerThumbnail.name);
    formdata.append('img', newOwnerFile, newOwnerFile.name);
    formdata.append('img', newOwnerThumbnail, newOwnerThumbnail.name);
    formdata.append('type', documentType);
    formdata.append('uploadForAccountId', ownerId);
    if(validUntilDate) {
      formdata.append('validuntildate', validUntilDate.toUTCString());
    }
    const init = {
      method: 'POST',
      headers,
      body: formdata,
    };
    // NOTE: putting a longer timeout over here since uploading files can take longer.
    const response = await fetch(input, init, 60000);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }

  static async postShareRequestFile(
    file: File | undefined,
    thumbnailFile: File | undefined,
    documentType: string,
    fromAccountId: string,
    toAccountId: string,
    permissions: ShareRequestPermissions,
    replaceId
  ) {
    const path = replaceId ? `/share-requests/${replaceId}/replace` : '/share-requests';
    const input = `${API_ENDPOINT}${path}`;
    const headers = {
      Authorization: `Bearer ${AuthService.getAccessToken()}`,
    };
    const formdata = new FormData();
    if (file) {
      formdata.append('img', file, file.name);
    }
    if (thumbnailFile) {
      formdata.append('img', thumbnailFile, thumbnailFile.name);
    }
    formdata.append('fromAccountId', fromAccountId);
    formdata.append('toAccountId', toAccountId);
    formdata.append('documentType', documentType);
    formdata.append('canView', String(permissions.canView));
    formdata.append('canReplace', String(permissions.canReplace));
    formdata.append('canDownload', String(permissions.canDownload));
    // formdata.append('shareRequest', {fromAccountId: fromAccountId, toAccountId, documentType});
    const init = {
      method: 'POST',
      headers,
      body: formdata,
    };
    // NOTE: putting a longer timeout over here since uploading files can take longer.
    const response = await fetch(input, init, 20000);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }

  static async putShareRequestFile(path, file: File, thumbnailFile: File) {
    const input = `${API_ENDPOINT}${path}`;
    const headers = {
      Authorization: `Bearer ${AuthService.getAccessToken()}`,
    };
    const formdata = new FormData();
    if (file) {
      formdata.append('img', file, file.name);
    }
    if (thumbnailFile) {
      formdata.append('img', thumbnailFile, thumbnailFile.name);
    }
    formdata.append('approved', 'true');
    const init = {
      method: 'PUT',
      headers,
      body: formdata,
    };
    // NOTE: putting a longer timeout over here since uploading files can take longer.
    const response = await fetch(input, init, 20000);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }

  static async updateDocument(request: UpdateDocumentRequest): Promise<any> {
    const path = '/documents';
    const input = `${API_ENDPOINT}${path}/${request.id}`;
    const headers = {
      Authorization: `Bearer ${AuthService.getAccessToken()}`,
    };
    const formdata = new FormData();
    if (request.img && request.thumbnail) {
      formdata.append('img', request.img, request.img.name);
      formdata.append('img', request.thumbnail, request.thumbnail.name);
    }
    if (request.validUntilDate) {
      formdata.append(
        'validuntildate',
        format(request.validUntilDate, 'yyyy/dd/MM')
      );
    }
    if (request.claimed) {
      formdata.append('claimed', request.claimed + '');
    }
    const init = {
      method: 'PUT',
      headers,
      body: formdata,
    };
    // NOTE: putting a longer timeout over here since uploading files can take longer.
    const response = await fetch(input, init, 20000);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }

  static async updateMyAccount(account: Account) {
    const path = '/accounts';
    const input = `${API_ENDPOINT}${path}`;
    const headers = {
      Authorization: `Bearer ${AuthService.getAccessToken()}`,
    };
    const formdata = new FormData();
    // if (request.img && request.thumbnail) {
    //   formdata.append('img', request.img, request.img.name);
    //   formdata.append('img', request.thumbnail, request.thumbnail.name);
    // }
    if (account.phoneNumber && account.phoneNumber.length > 0) {
      formdata.append('phonenumber', account.phoneNumber);
    }
    if (account.firstName && account.firstName.length > 0) {
      formdata.append('firstname', account.firstName);
    }
    if (account.lastName && account.lastName.length > 0) {
      formdata.append('lastname', account.lastName);
    }
    if (account.isNotDisplayPhoto) {
      formdata.append('isnotdisplayphoto', String(account.isNotDisplayPhoto));
    }
    if (account.isNotDisplayName) {
      formdata.append('isnotdisplayname', String(account.isNotDisplayName));
    }
    if (account.isNotDisplayPhone) {
      formdata.append('isnotdisplayphone', String(account.isNotDisplayPhone));
    }
    const init = {
      method: 'PUT',
      headers,
      body: formdata,
    };
    // NOTE: putting a longer timeout over here since uploading files can take longer.
    const response = await fetch(input, init, 20000);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }

  static async put(path: any, entity: any) {
    const input = `${API_ENDPOINT}${path}`;
    const headers = await this.getHeaders();
    const init = {
      method: 'PUT',
      headers,
      body: JSON.stringify(entity),
    };
    const response = await fetch(input, init);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }

  static async delete(path: any) {
    const input = `${API_ENDPOINT}${path}`;
    const headers = await this.getHeaders();
    const init = {
      method: 'DELETE',
      headers,
    };
    const response = await fetch(input, init);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }
}

export default APIService;

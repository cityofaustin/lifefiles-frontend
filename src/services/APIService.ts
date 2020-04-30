import AuthService from './AuthService';
import StringUtil from '../util/StringUtil';
import fetch from '../util/fetchWithTimeout';
import APIError from './APIError';
import HttpStatusCode from '../models/HttpStatusCode';
import UpdateDocumentRequest from '../models/document/UpdateDocumentRequest';
import {format} from 'date-fns';
import UpdateDocumentResponse from '../models/document/UpdateDocumentResponse';

const MYPASS_API = process.env.MYPASS_API;

class APIService {
  static getHeaders(): HeadersInit {
      const headers: HeadersInit = {'Content-Type': 'application/json'};
      if(AuthService.isLoggedIn()) {
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
      HttpStatusCode.INTERNAL_SERVER_ERROR
    ];
    if (errorStatusCodes.includes(responseStatus)) {
      throw new APIError(responseStatus+'', responseJson);
    }
  }

  static getAPIEndpoint() {
    return MYPASS_API;
  }

  static async get(path: string) {
    const input: RequestInfo = `${MYPASS_API}${path}`;
    const headers: HeadersInit = await this.getHeaders();
    const init: RequestInit = {
      method: 'GET',
      headers
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
      headers
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
    const input = `${MYPASS_API}${path}`;
    const headers = await this.getHeaders();
    const init = {
      method: 'POST',
      headers,
      body: JSON.stringify(entity)
    };
    try {
      const response = await fetch(input, init);
      const responseJson = await response.json();
      this.handleErrorStatusCodes(response.status, responseJson);
      return responseJson;
    } catch (err) {
      console.error(err.message);
    }
  }

  static async postDocument(file: File, thumbnailFile: File, documentType: string, encryptionPubKey: string) {
    const path = '/documents';
    const input = `${MYPASS_API}${path}`;
    const headers = {
      Authorization: `Bearer ${AuthService.getAccessToken()}`
    };
    const formdata = new FormData();
    formdata.append('img', file, file.name);
    formdata.append('img', thumbnailFile, thumbnailFile.name);
    formdata.append('type', documentType);
    formdata.append('encryptionPubKey', encryptionPubKey);
    const init = {
      method: 'POST',
      headers,
      body: formdata
    };
    // NOTE: putting a longer timeout over here since uploading files can take longer.
    const response = await fetch(input, init, 60000);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }

  static async postShareRequestFile(file: File, thumbnailFile: File, documentType: string, fromAccountId: string, toAccountId: string) {
    const path = '/share-requests';
    const input = `${MYPASS_API}${path}`;
    const headers = {
      Authorization: `Bearer ${AuthService.getAccessToken()}`
    };
    const formdata = new FormData();
    formdata.append('img', file, file.name);
    formdata.append('img', thumbnailFile, thumbnailFile.name);
    formdata.append('fromAccountId', fromAccountId);
    formdata.append('toAccountId', toAccountId);
    formdata.append('documentType', documentType);
    // formdata.append('shareRequest', {fromAccountId: fromAccountId, toAccountId, documentType});
    const init = {
      method: 'POST',
      headers,
      body: formdata
    };
    // NOTE: putting a longer timeout over here since uploading files can take longer.
    const response = await fetch(input, init, 20000);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }

  static async updateDocument(request: UpdateDocumentRequest): Promise<any> {
    const path = '/documents';
    const input = `${MYPASS_API}${path}/${request.id}`;
    const headers = {
      Authorization: `Bearer ${AuthService.getAccessToken()}`
    };
    const formdata = new FormData();
    if(request.img && request.thumbnail) {
      formdata.append('img', request.img, request.img.name);
      formdata.append('img', request.thumbnail, request.thumbnail.name);
    }
    if(request.validUntilDate) {
      formdata.append('validuntildate', format(request.validUntilDate, 'yyyy/dd/MM'));
    }
    const init = {
      method: 'PUT',
      headers,
      body: formdata
    };
    // NOTE: putting a longer timeout over here since uploading files can take longer.
    const response = await fetch(input, init, 20000);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }

  static async put(path: any, entity: any) {
    const input = `${MYPASS_API}${path}`;
    const headers = await this.getHeaders();
    const init = {
      method: 'PUT',
      headers,
      body: JSON.stringify(entity)
    };
    const response = await fetch(input, init);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }

  static async delete(path: any) {
    const input = `${MYPASS_API}${path}`;
    const headers = await this.getHeaders();
    const init = {
      method: 'DELETE',
      headers
    };
    const response = await fetch(input, init);
    const responseJson = await response.json();
    this.handleErrorStatusCodes(response.status, responseJson);
    return responseJson;
  }
}

export default APIService;

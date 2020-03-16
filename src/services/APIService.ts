import AuthService from './AuthService';

const MYPASS_API = process.env.MYPASS_API;

class APIService {
  static getHeaders(): HeadersInit {
      const headers: HeadersInit = {'Content-Type': 'application/json'};
      if(AuthService.isLoggedIn()) {
        headers.Authorization = `Bearer ${AuthService.getAccessToken()}`;
      }
      return headers;
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
    const response = await fetch(input, init);
    if (response.status === 403) {
      throw new Error('Access Forbidden');
    }
    return response.json();
  }

  static async post(path: any, entity: any, json = true) {
    const input = `${MYPASS_API}${path}`;
    const headers = await this.getHeaders();
    const init = {
      method: 'POST',
      headers,
      body: JSON.stringify(entity)
    };
    const response = await fetch(input, init);
    if (json) {
      return response.json();
    }
    return response;
  }

  static async postDocument(file: File) {
    const path = '/documents';
    const input = `${MYPASS_API}${path}`;
    // const headers = await this.getHeaders(true);
    const headers = {
      Authorization: `Bearer ${AuthService.getAccessToken()}`
      // 'Content-Type': 'multipart/form-data'
    };
    const formdata = new FormData();
    formdata.append('img', file, file.name);
    // TODO pass in variables for this
    formdata.append('payload.id', '5e66c791a055d78324d059e5');
    formdata.append('body.type', 'Driver\'s License');
    const init = {
      method: 'POST',
      headers,
      body: formdata
    };
    const response = await fetch(input, init);
    return response.json();
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
    return response.json();
  }

  static async delete(path: any) {
    const input = `${MYPASS_API}${path}`;
    const headers = await this.getHeaders();
    const init = {
      method: 'DELETE',
      headers
    };
    const response = await fetch(input, init);
    return response.json();
  }
}

export default APIService;

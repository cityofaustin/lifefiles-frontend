import APIErrorResponse from '../models/APIErrorResponse';

class APIError extends Error {
  private response: APIErrorResponse;

  constructor(message: string, response: APIErrorResponse) {
    super(message);
    this.response = response;
    // Set the prototype explicitly.
    Object.setPrototypeOf(this, APIError.prototype);
  }

  // Just an example of how to use class function
  // getMessage() {
  //   return this.message;
  // }
}

export default APIError;

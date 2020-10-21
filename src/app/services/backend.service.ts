import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { authkeep } from '../../assets/configs.json';

const defaultResponse = new Error('Please try again later.');

const backendCustomCodes = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
  UNAUTHORIZED_OPERATION: 'UNAUTHORIZED_OPERATION',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  PASSWORD_RESET_ID_NOT_FOUND: 'PASSWORD_RESET_ID_NOT_FOUND',
};

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(private httpClient: HttpClient) {}

  async getToken(email: string, password: string): Promise<any> {
    const endpoint = `${authkeep.address}${authkeep.getToken}`;

    try {
      const response = await this.httpClient
        .get(endpoint, {
          headers: { 'x-email': email, 'x-password': password },
        })
        .toPromise()
        // This line converts 'res' from type Object to type any.
        .then((res: any) => res);

      if (!response || !response.data || !response.data.token) {
        throw defaultResponse;
      }
      return response;
    } catch (err) {
      const customCode = err.error && err.error.customCode;
      if (!customCode) {
        console.warn('No customCode present in Backend error response.');
        throw defaultResponse;
      }
      if (customCode === backendCustomCodes.USER_NOT_FOUND) {
        throw new Error('Invalid Credentials.');
      }
      if (customCode === backendCustomCodes.UNAUTHORIZED_OPERATION) {
        throw new Error('Invalid Credentials.');
      }
      console.warn('Unexpected response from backend:', err);
      throw defaultResponse;
    }
  }

  async initPasswordReset(email: string): Promise<any> {
    const endpoint = `${authkeep.address}${authkeep.initPasswordReset}`;

    try {
      return await this.httpClient.post(endpoint, { email }).toPromise();
    } catch (err) {
      const customCode = err.error && err.error.customCode;
      if (!customCode) {
        console.warn('No customCode present in Backend error response.');
        throw defaultResponse;
      }
      if (customCode === backendCustomCodes.USER_NOT_FOUND) {
        throw new Error('No account found with this mail.');
      }
      console.warn('Unexpected response from backend:', err);
      throw defaultResponse;
    }
  }

  async finishedPasswordReset(passwordResetID: string, newPassword: string): Promise<any> {
    const endpoint = `${authkeep.address}${authkeep.finishPasswordReset}/${passwordResetID}`;

    try {
      return await this.httpClient.patch(endpoint, { newPassword }).toPromise();
    } catch (err) {
      const customCode = err.error && err.error.customCode;
      if (!customCode) {
        console.warn('No customCode present in Backend error response.');
        throw defaultResponse;
      }
      if (customCode === backendCustomCodes.PASSWORD_RESET_ID_NOT_FOUND) {
        throw new Error('Expired or corrupt password change request.');
      }
      console.warn('Unexpected response from backend:', err);
      throw defaultResponse;
    }
  }

  async initSignup(
    email: string,
    firstName: string,
    lastName: string,
    password: string,
  ): Promise<any> {
    const endpoint = `${authkeep.address}${authkeep.initSignup}`;

    try {
      return await this.httpClient
        .post(endpoint, { email, firstName, lastName, password })
        .toPromise();
    } catch (err) {
      const customCode = err.error && err.error.customCode;
      if (!customCode) {
        console.warn('No customCode present in Backend error response.');
        throw defaultResponse;
      }
      if (customCode === backendCustomCodes.USER_ALREADY_EXISTS) {
        throw new Error('This Email is already in use.');
      }
      console.warn('Unexpected response from backend:', err);
      throw defaultResponse;
    }
  }
}

// Import necessary modules and types
import axios, { AxiosInstance, AxiosResponse } from "axios";
import jwt, { VerifyErrors, Secret } from "jsonwebtoken";
import Endpoints from "./Endpoints";
import ApiError from "./ApiError";
import { IncomingHttpHeaders } from "http";

// Define the CubeContext interface for the Cube.js context object
interface CubeContext {
  contextToAppId: (context: any) => string;
  contextToOrchestratorId: (context: any) => string;
}

// Define the ZammadApiOptions interface for ZammadApi class options
interface ZammadApiOptions {
  host: string;
  cubeContext: CubeContext;
}

// Define the UserData interface
interface UserData {
  active: boolean;
  login_failed: number;
  verified: boolean;
  source: null | string;
  login: string;
  last_login: string;
  id: number;
  updated_by_id: number;
  organization_id: number;
  firstname: string;
  lastname: string;
  email: string;
  image: string;
  image_source: null | string;
  web: string;
  phone: string;
  fax: string;
  mobile: string;
  department: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  address: string;
  vip: boolean;
  note: string;
  out_of_office: boolean;
  out_of_office_start_at: null | string;
  out_of_office_end_at: null | string;
  out_of_office_replacement_id: null | number;
  preferences: {
    notification_config: {
      matrix: {
        create: {
          criteria: {
            owned_by_me: boolean;
            owned_by_nobody: boolean;
            subscribed: boolean;
            no: boolean;
          };
          channel: {
            email: boolean;
            online: boolean;
          };
        };
        update: {
          criteria: {
            owned_by_me: boolean;
            owned_by_nobody: boolean;
            subscribed: boolean;
            no: boolean;
          };
          channel: {
            email: boolean;
            online: boolean;
          };
        };
        reminder_reached: {
          criteria: {
            owned_by_me: boolean;
            owned_by_nobody: boolean;
            no: boolean;
          };
          channel: {
            email: boolean;
            online: boolean;
          };
        };
        escalation: {
          criteria: {
            owned_by_me: boolean;
            owned_by_nobody: boolean;
            no: boolean;
          };
          channel: {
            email: boolean;
            online: boolean;
          };
        };
      };
      group_ids: string[];
    };
    locale: string;
    intro: boolean;
    notification_sound: {
      file: string;
      enabled: boolean;
    };
    cti: boolean;
    tickets_closed: number;
    tickets_open: number;
  };
  created_by_id: number;
  created_at: string;
  updated_at: string;
  role_ids: number[];
  organization_ids: number[];
  authorization_ids: number[];
  karma_user_ids: number[];
  group_ids: {
    [groupId: string]: string[];
  };
}

// Define the ZammadApi class
class ZammadApi {
  private host: string;
  private token: string | null;
  private appId: string;
  private orchestratorId: string;
  private axiosInstance: AxiosInstance;

  /**
   * Connect to a Zammad API.
   * @param {string} host - Hostname of the Zammad instance with protocol and port.
   * @param {CubeContext} cubeContext - Cube.js context object containing user information.
   */
  constructor(host: string, cubeContext: CubeContext) {
    // Class properties initialization
    this.host = host;
    this.token = process.env.ZAMMAD_TOKEN as string;
    this.appId = cubeContext.contextToAppId(cubeContext);
    this.orchestratorId = cubeContext.contextToOrchestratorId(cubeContext);

    // Axios instance configuration
    this.axiosInstance = axios.create({
      baseURL: `${this.host}${Endpoints.PREFIX}`,
      headers: {
        "User-Customer": "Zammad Mobile by Exanion/1.0",
        "Cube-App-Id": this.appId,
        "Cube-Orchestrator-Id": this.orchestratorId,
      },
    });
  }

  /**
   * Validate and set the API token.
   * @param {string} token - Zammad API token.
   * @param {CubeContext} cubeContext - Cube.js context object containing user information.
   * @throws {Error} Throws an error if the token is invalid.
   */
  setToken(token: string, cubeContext: CubeContext): void {
    if (!token || typeof token !== "string") {
      throw new Error(
        "Invalid token format. Token is required for authentication."
      );
    }

    // Verify the token format using a regular expression
    const tokenFormatRegex =
      /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/;
    if (!tokenFormatRegex.test(token)) {
      throw new Error(
        "Invalid token format. Token does not match the expected format."
      );
    }

    // Check if the token is expired
    const isTokenExpired = this.checkTokenExpiration(token);
    if (isTokenExpired) {
      throw new Error("Token has expired.");
    }

    // Set the validated token and update Axios headers
    this.token = token;
    this.updateAxiosHeaders(cubeContext);
  }

  async getMyInformation(): Promise<UserData> {
    const res = await this.axiosInstance.get("/users/me", {
      headers: {
        Authorization: `Token token=${this.token}`,
      },
    });
    return res.data;
  }

  /**
   * Throws an error if the given data is not an object.
   * @param {any} data - Data to be checked.
   * @throws {ApiError.UnexpectedResponse} Throws if not an object.
   */
  isObjectOrError(data: any): void {
    if (typeof data !== "object" || data === null) {
      throw new ApiError.UnexpectedResponse(
        "Unexpected response format. Expected an object."
      );
    }
  }

  /**
   * Check axios HTTP response code.
   * @param {AxiosResponse} res - Axios response.
   * @throws {ApiError.UnexpectedResponse} Throws if the response code is unexpected.
   */
  checkResponseCode(res: AxiosResponse): void {
    // TODO: Add logic to check for expected response codes and handle errors accordingly
    // Implement your logic here
    if (res.status < 200 || res.status >= 300) {
      throw new ApiError.UnexpectedResponse(
        `Unexpected response code: ${res.status}`
      );
    }
  }

  /**
   * Validate a Zammad webhook payload.
   * @param {object} payload - Zammad webhook payload received in the request.
   * @returns {boolean} Returns true if the payload is valid, false otherwise.
   * @throws {Error} Throws an error for invalid payloads.
   */
  validateWebhookPayload(
    headers: IncomingHttpHeaders,
    payload: object
  ): boolean {
    // Validate headers signature and delivery
    // Example
    // X-Zammad-Trigger: Name of the Trigger
    // X-Zammad-Delivery: xxxx-xx-xxx-xx
    // X-Hub-Signature: sha1=xxx
    const isValidSignature =
      headers["x-zammad-trigger"] === Endpoints.delivery &&
      headers["x-hub-signature"] === Endpoints.signature;
    if (!isValidSignature) {
      throw new Error("Invalid Zammad webhook signature.");
    }

    const isValidPayload =
      payload && (payload as any).ticket && (payload as any).article;

    if (!isValidPayload) {
      throw new Error(
        "Invalid Zammad webhook payload. Required fields are missing."
      );
    }

    return true;
  }

  /**
   * Update Axios headers with the current Cube.js context information.
   * @param {CubeContext} cubeContext - Cube.js context object containing user information.
   */
  private updateAxiosHeaders(cubeContext: CubeContext): void {
    this.appId = cubeContext.contextToAppId(cubeContext);
    this.orchestratorId = cubeContext.contextToOrchestratorId(cubeContext);
    this.axiosInstance.defaults.headers.common["Cube-App-Id"] = this.appId;
    this.axiosInstance.defaults.headers.common["Cube-Orchestrator-Id"] =
      this.orchestratorId;
    this.axiosInstance.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${this.token}`;
  }

  /**
   * Check if the provided token is expired.
   * @param {string} token - Zammad API token.
   * @returns {boolean} Returns true if the token is expired, false otherwise.
   */
  private checkTokenExpiration(token: string): boolean {
    // Replace with your actual implementation
    const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds
    const decodedToken = this.decodeToken(token);

    // Check if the token has an expiration time
    if (decodedToken && typeof decodedToken.exp === "number") {
      return decodedToken.exp < currentTimestamp; // Token is expired if expiration time is in the past
    }

    // If the token does not have an expiration time, consider it as not expired
    return false;
  }

  private decodeToken(token: string) {
    return {
      exp: 0,
    };
  }
}

export default ZammadApi;

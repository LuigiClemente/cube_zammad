// Import necessary modules and types
import axios, { AxiosInstance, AxiosResponse } from "axios";
import Endpoints from "./Endpoints";
import ApiError from "./ApiError";

// Define CubeContext interface for Cube.js context object
interface CubeContext {
  contextToAppId: (context: any) => string;
  contextToOrchestratorId: (context: any) => string;
}

// Define ZammadApiOptions interface for ZammadApi class options
interface ZammadApiOptions {
  host: string;
  cubeContext: CubeContext;
}

/**
 * Class representing the Zammad API client.
 */
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
    this.token = null;
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
    if (!token || typeof token !== 'string') {
      throw new Error("Invalid token format. Token is required for authentication.");
    }

    // Check if the token is expired
    const isTokenExpired = this.checkTokenExpiration(token);
    if (isTokenExpired) {
      throw new Error("Token has expired.");
    }

    // Add more robust token validation logic, verify format, etc.
    this.token = token;
    this.updateAxiosHeaders(cubeContext);
  }

  /**
   * Throws an error if the given data is not an object.
   * @param {*} data - Data to be checked.
   * @throws {ApiError.UnexpectedResponse} Throws if not an object.
   */
  isObjectOrError(data: any): void {
    if (typeof data !== 'object' || data === null) {
      throw new ApiError.UnexpectedResponse("Unexpected response format. Expected an object.");
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
      throw new ApiError.UnexpectedResponse(`Unexpected response code: ${res.status}`);
    }
  }

  /**
   * Validate a Zammad webhook payload.
   * @param {object} payload - Zammad webhook payload received in the request.
   * @returns {boolean} Returns true if the payload is valid, false otherwise.
   * @throws {Error} Throws an error for invalid payloads.
   */
  validateWebhookPayload(payload: object): boolean {
    // TODO: Add your validation logic here based on the Zammad webhook payload structure
    // For example, you can check the presence of required fields or verify the signature
    // Replace the following with your actual validation logic
    const isValidPayload = payload && (payload as any).ticket && (payload as any).article;

    if (!isValidPayload) {
      throw new Error("Invalid Zammad webhook payload. Required fields are missing.");
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
    this.axiosInstance.defaults.headers.common['Cube-App-Id'] = this.appId;
    this.axiosInstance.defaults.headers.common['Cube-Orchestrator-Id'] = this.orchestratorId;
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
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
    if (decodedToken && typeof decodedToken.exp === 'number') {
      return decodedToken.exp < currentTimestamp; // Token is expired if expiration time is in the past
    }

    // If the token does not have an expiration time, consider it as not expired
    return false;
  }

  /**
   * Decode a JWT token.
   * @param {string} token - JWT token to be decoded.
   * @returns {object | null} Decoded token payload or null if decoding fails.
   */
  private decodeToken(token: string): object | null {
    try {
      // Replace with your actual JWT decoding library or implementation
      // Example: const decoded = jwt.decode(token);
      // Ensure to handle potential decoding errors gracefully
      return null;
    } catch (error) {
      return null;
    }
  }
}

export default ZammadApi;

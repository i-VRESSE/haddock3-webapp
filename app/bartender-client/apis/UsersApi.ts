/* tslint:disable */
/* eslint-disable */
/**
 * bartender
 * Job middleware for i-VRESSE
 *
 * The version of the OpenAPI document: 0.2.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import * as runtime from "../runtime";
import type {
  ErrorModel,
  HTTPValidationError,
  UserAsListItem,
  UserProfileInputDTO,
  UserRead,
  UserUpdate,
} from "../models";
import {
  ErrorModelFromJSON,
  ErrorModelToJSON,
  HTTPValidationErrorFromJSON,
  HTTPValidationErrorToJSON,
  UserAsListItemFromJSON,
  UserAsListItemToJSON,
  UserProfileInputDTOFromJSON,
  UserProfileInputDTOToJSON,
  UserReadFromJSON,
  UserReadToJSON,
  UserUpdateFromJSON,
  UserUpdateToJSON,
} from "../models";

export interface ListUsersRequest {
  limit?: number;
  offset?: number;
}

export interface UsersDeleteUserRequest {
  id: any;
}

export interface UsersPatchCurrentUserRequest {
  userUpdate: UserUpdate;
}

export interface UsersPatchUserRequest {
  id: any;
  userUpdate: UserUpdate;
}

export interface UsersUserRequest {
  id: any;
}

/**
 *
 */
export class UsersApi extends runtime.BaseAPI {
  /**
   * List of users.  Requires super user powers.  Args:     limit: Number of users to return. Defaults to 50.     offset: Offset. Defaults to 0.     super_user: Check if current user is super.     user_db: User db.  Returns:     List of users.
   * List Users
   */
  async listUsersRaw(
    requestParameters: ListUsersRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<Array<UserAsListItem>>> {
    const queryParameters: any = {};

    if (requestParameters.limit !== undefined) {
      queryParameters["limit"] = requestParameters.limit;
    }

    if (requestParameters.offset !== undefined) {
      queryParameters["offset"] = requestParameters.offset;
    }

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token("HTTPBearer", []);

      if (tokenString) {
        headerParameters["Authorization"] = `Bearer ${tokenString}`;
      }
    }
    if (this.configuration && this.configuration.accessToken) {
      // oauth required
      headerParameters["Authorization"] = await this.configuration.accessToken(
        "OAuth2PasswordBearer",
        []
      );
    }

    const response = await this.request(
      {
        path: `/api/users/`,
        method: "GET",
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      jsonValue.map(UserAsListItemFromJSON)
    );
  }

  /**
   * List of users.  Requires super user powers.  Args:     limit: Number of users to return. Defaults to 50.     offset: Offset. Defaults to 0.     super_user: Check if current user is super.     user_db: User db.  Returns:     List of users.
   * List Users
   */
  async listUsers(
    requestParameters: ListUsersRequest = {},
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<Array<UserAsListItem>> {
    const response = await this.listUsersRaw(requestParameters, initOverrides);
    return await response.value();
  }

  /**
   * Retrieve profile of currently logged in user.  Args:     user: Current active user.  Returns:     user profile.
   * Profile
   */
  async profileRaw(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<UserProfileInputDTO>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token("HTTPBearer", []);

      if (tokenString) {
        headerParameters["Authorization"] = `Bearer ${tokenString}`;
      }
    }
    if (this.configuration && this.configuration.accessToken) {
      // oauth required
      headerParameters["Authorization"] = await this.configuration.accessToken(
        "OAuth2PasswordBearer",
        []
      );
    }

    const response = await this.request(
      {
        path: `/api/users/profile`,
        method: "GET",
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      UserProfileInputDTOFromJSON(jsonValue)
    );
  }

  /**
   * Retrieve profile of currently logged in user.  Args:     user: Current active user.  Returns:     user profile.
   * Profile
   */
  async profile(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<UserProfileInputDTO> {
    const response = await this.profileRaw(initOverrides);
    return await response.value();
  }

  /**
   * Users:Current User
   */
  async usersCurrentUserRaw(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<UserRead>> {
    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token("HTTPBearer", []);

      if (tokenString) {
        headerParameters["Authorization"] = `Bearer ${tokenString}`;
      }
    }
    if (this.configuration && this.configuration.accessToken) {
      // oauth required
      headerParameters["Authorization"] = await this.configuration.accessToken(
        "OAuth2PasswordBearer",
        []
      );
    }

    const response = await this.request(
      {
        path: `/users/me`,
        method: "GET",
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      UserReadFromJSON(jsonValue)
    );
  }

  /**
   * Users:Current User
   */
  async usersCurrentUser(
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<UserRead> {
    const response = await this.usersCurrentUserRaw(initOverrides);
    return await response.value();
  }

  /**
   * Users:Delete User
   */
  async usersDeleteUserRaw(
    requestParameters: UsersDeleteUserRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<void>> {
    if (requestParameters.id === null || requestParameters.id === undefined) {
      throw new runtime.RequiredError(
        "id",
        "Required parameter requestParameters.id was null or undefined when calling usersDeleteUser."
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token("HTTPBearer", []);

      if (tokenString) {
        headerParameters["Authorization"] = `Bearer ${tokenString}`;
      }
    }
    if (this.configuration && this.configuration.accessToken) {
      // oauth required
      headerParameters["Authorization"] = await this.configuration.accessToken(
        "OAuth2PasswordBearer",
        []
      );
    }

    const response = await this.request(
      {
        path: `/users/{id}`.replace(
          `{${"id"}}`,
          encodeURIComponent(String(requestParameters.id))
        ),
        method: "DELETE",
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.VoidApiResponse(response);
  }

  /**
   * Users:Delete User
   */
  async usersDeleteUser(
    requestParameters: UsersDeleteUserRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<void> {
    await this.usersDeleteUserRaw(requestParameters, initOverrides);
  }

  /**
   * Users:Patch Current User
   */
  async usersPatchCurrentUserRaw(
    requestParameters: UsersPatchCurrentUserRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<UserRead>> {
    if (
      requestParameters.userUpdate === null ||
      requestParameters.userUpdate === undefined
    ) {
      throw new runtime.RequiredError(
        "userUpdate",
        "Required parameter requestParameters.userUpdate was null or undefined when calling usersPatchCurrentUser."
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters["Content-Type"] = "application/json";

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token("HTTPBearer", []);

      if (tokenString) {
        headerParameters["Authorization"] = `Bearer ${tokenString}`;
      }
    }
    if (this.configuration && this.configuration.accessToken) {
      // oauth required
      headerParameters["Authorization"] = await this.configuration.accessToken(
        "OAuth2PasswordBearer",
        []
      );
    }

    const response = await this.request(
      {
        path: `/users/me`,
        method: "PATCH",
        headers: headerParameters,
        query: queryParameters,
        body: UserUpdateToJSON(requestParameters.userUpdate),
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      UserReadFromJSON(jsonValue)
    );
  }

  /**
   * Users:Patch Current User
   */
  async usersPatchCurrentUser(
    requestParameters: UsersPatchCurrentUserRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<UserRead> {
    const response = await this.usersPatchCurrentUserRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }

  /**
   * Users:Patch User
   */
  async usersPatchUserRaw(
    requestParameters: UsersPatchUserRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<UserRead>> {
    if (requestParameters.id === null || requestParameters.id === undefined) {
      throw new runtime.RequiredError(
        "id",
        "Required parameter requestParameters.id was null or undefined when calling usersPatchUser."
      );
    }

    if (
      requestParameters.userUpdate === null ||
      requestParameters.userUpdate === undefined
    ) {
      throw new runtime.RequiredError(
        "userUpdate",
        "Required parameter requestParameters.userUpdate was null or undefined when calling usersPatchUser."
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    headerParameters["Content-Type"] = "application/json";

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token("HTTPBearer", []);

      if (tokenString) {
        headerParameters["Authorization"] = `Bearer ${tokenString}`;
      }
    }
    if (this.configuration && this.configuration.accessToken) {
      // oauth required
      headerParameters["Authorization"] = await this.configuration.accessToken(
        "OAuth2PasswordBearer",
        []
      );
    }

    const response = await this.request(
      {
        path: `/users/{id}`.replace(
          `{${"id"}}`,
          encodeURIComponent(String(requestParameters.id))
        ),
        method: "PATCH",
        headers: headerParameters,
        query: queryParameters,
        body: UserUpdateToJSON(requestParameters.userUpdate),
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      UserReadFromJSON(jsonValue)
    );
  }

  /**
   * Users:Patch User
   */
  async usersPatchUser(
    requestParameters: UsersPatchUserRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<UserRead> {
    const response = await this.usersPatchUserRaw(
      requestParameters,
      initOverrides
    );
    return await response.value();
  }

  /**
   * Users:User
   */
  async usersUserRaw(
    requestParameters: UsersUserRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<runtime.ApiResponse<UserRead>> {
    if (requestParameters.id === null || requestParameters.id === undefined) {
      throw new runtime.RequiredError(
        "id",
        "Required parameter requestParameters.id was null or undefined when calling usersUser."
      );
    }

    const queryParameters: any = {};

    const headerParameters: runtime.HTTPHeaders = {};

    if (this.configuration && this.configuration.accessToken) {
      const token = this.configuration.accessToken;
      const tokenString = await token("HTTPBearer", []);

      if (tokenString) {
        headerParameters["Authorization"] = `Bearer ${tokenString}`;
      }
    }
    if (this.configuration && this.configuration.accessToken) {
      // oauth required
      headerParameters["Authorization"] = await this.configuration.accessToken(
        "OAuth2PasswordBearer",
        []
      );
    }

    const response = await this.request(
      {
        path: `/users/{id}`.replace(
          `{${"id"}}`,
          encodeURIComponent(String(requestParameters.id))
        ),
        method: "GET",
        headers: headerParameters,
        query: queryParameters,
      },
      initOverrides
    );

    return new runtime.JSONApiResponse(response, (jsonValue) =>
      UserReadFromJSON(jsonValue)
    );
  }

  /**
   * Users:User
   */
  async usersUser(
    requestParameters: UsersUserRequest,
    initOverrides?: RequestInit | runtime.InitOverrideFunction
  ): Promise<UserRead> {
    const response = await this.usersUserRaw(requestParameters, initOverrides);
    return await response.value();
  }
}

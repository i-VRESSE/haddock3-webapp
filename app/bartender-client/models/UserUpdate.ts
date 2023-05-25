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

import { exists, mapValues } from "../runtime";
/**
 * DTO to update user.
 * @export
 * @interface UserUpdate
 */
export interface UserUpdate {
  /**
   *
   * @type {string}
   * @memberof UserUpdate
   */
  password?: string;
  /**
   *
   * @type {string}
   * @memberof UserUpdate
   */
  email?: string;
  /**
   *
   * @type {boolean}
   * @memberof UserUpdate
   */
  isActive?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof UserUpdate
   */
  isSuperuser?: boolean;
  /**
   *
   * @type {boolean}
   * @memberof UserUpdate
   */
  isVerified?: boolean;
}

/**
 * Check if a given object implements the UserUpdate interface.
 */
export function instanceOfUserUpdate(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function UserUpdateFromJSON(json: any): UserUpdate {
  return UserUpdateFromJSONTyped(json, false);
}

export function UserUpdateFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): UserUpdate {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    password: !exists(json, "password") ? undefined : json["password"],
    email: !exists(json, "email") ? undefined : json["email"],
    isActive: !exists(json, "is_active") ? undefined : json["is_active"],
    isSuperuser: !exists(json, "is_superuser")
      ? undefined
      : json["is_superuser"],
    isVerified: !exists(json, "is_verified") ? undefined : json["is_verified"],
  };
}

export function UserUpdateToJSON(value?: UserUpdate | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    password: value.password,
    email: value.email,
    is_active: value.isActive,
    is_superuser: value.isSuperuser,
    is_verified: value.isVerified,
  };
}

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
 *
 * @export
 * @interface Detail
 */
export interface Detail {}

/**
 * Check if a given object implements the Detail interface.
 */
export function instanceOfDetail(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function DetailFromJSON(json: any): Detail {
  return DetailFromJSONTyped(json, false);
}

export function DetailFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): Detail {
  return json;
}

export function DetailToJSON(value?: Detail | null): any {
  return value;
}

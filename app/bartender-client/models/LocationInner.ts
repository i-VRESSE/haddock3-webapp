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
 * @interface LocationInner
 */
export interface LocationInner {}

/**
 * Check if a given object implements the LocationInner interface.
 */
export function instanceOfLocationInner(value: object): boolean {
  let isInstance = true;

  return isInstance;
}

export function LocationInnerFromJSON(json: any): LocationInner {
  return LocationInnerFromJSONTyped(json, false);
}

export function LocationInnerFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): LocationInner {
  return json;
}

export function LocationInnerToJSON(value?: LocationInner | null): any {
  return value;
}

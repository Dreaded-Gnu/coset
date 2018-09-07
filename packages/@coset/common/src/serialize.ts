// Package dependencies
import * as Debug from "debug";

// Local dependencies
import { constant } from "./constant";
import { Size } from "./size";

/**
 * Internal helper to determine expected object byte length by serialization object
 *
 * @param serialize serialize object to count bytes of
 * @return amount of bytes for array buffer
 */
const expectedObjectByteLength: (serialize: object) => number = (
  serialize: object,
): number => {
  // Initialize initial length with empty
  let byteLength: number = Size.Empty;

  // Loop recursively through object
  for (const key in serialize) {
    // Skip invalid
    if (!serialize.hasOwnProperty(key)) {
      continue;
    }

    // Handle object in object
    if (typeof serialize[key] !== "number") {
      byteLength += expectedObjectByteLength(serialize[key]);
      continue;
    }

    // Skip strings due to no fix size
    if (serialize[key] === Size.String) {
      continue;
    }

    // Normal byte amount
    byteLength += parseInt(serialize[key], 10);
  }

  return byteLength;
};

/**
 * Serialization class
 */
export class Serialize {
  /**
   * Debugging utility
   */
  private readonly debug: Debug.IDebugger;

  /**
   * Constructor
   */
  public constructor() {
    // Initialize attributes
    this.debug = Debug(`${constant.packageName}:serialize`);
    this.debug("Serialize constructor initialized");
  }

  /**
   * Method to parse data object with strategy to array buffer
   *
   * @param strategy strategy containing serialization information and data order
   * @param data data object to parse to array buffer
   */
  public ToBuffer(strategy: object, data: object): ArrayBuffer {
    this.debug("ToBuffer(%o, %o) called", strategy, data);

    return new ArrayBuffer(Size.Empty);
  }

  /**
   * Method to parse buffer with strategy to object
   *
   * @param strategy strategy containing deserialize information
   * @param buffer data array buffer
   */
  public ToObject(strategy: object, buffer: ArrayBuffer): object {
    this.debug("Parse(%o, %o) called", strategy, buffer);

    return {};
  }
}

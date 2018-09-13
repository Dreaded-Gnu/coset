// Package dependencies
import * as Debug from "debug";

// Local dependencies
import { constant } from "./constant";
import { Size } from "./size";
import { Type } from "./type";

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

    // Determine byte length by type
    switch (serialize[key]) {
      case Type.Byte:
        byteLength += Size.Byte;
        break;

      case Type.UByte:
        byteLength += Size.UByte;
        break;

      case Type.ShortInt:
        byteLength += Size.ShortInt;
        break;

      case Type.UShortInt:
        byteLength += Size.UShortInt;
        break;

      case Type.Int:
        byteLength += Size.Int;
        break;

      case Type.UInt:
        byteLength += Size.UInt;
        break;

      case Type.Float:
        byteLength += Size.Float;
        break;

      case Type.Double:
        byteLength += Size.Double;
        break;

      default:
        throw new Error("Invalid size!");
    }
  }

  return byteLength;
};

/**
 * Method to convert object to buffer
 *
 * @param view view to be extended
 * @param serialize serialize object
 * @param data data object
 * @param offset byte offset
 */
const toBufferRecursive: (
  view: DataView,
  serialize: object,
  data: object,
  offset: number,
) => DataView = (
  view: DataView,
  serialize: object,
  data: object,
  offset: number,
): DataView => {
  let tmpView: DataView = view;
  let tmpOffset: number = offset;

  // Loop recursively through object
  for (const key in serialize) {
    // Skip invalid
    if (!serialize.hasOwnProperty(key)) {
      continue;
    }

    // Handle object in object
    if (typeof serialize[key] !== "number") {
      tmpView = toBufferRecursive(view, serialize[key], data[key], tmpOffset);
      tmpOffset += expectedObjectByteLength(serialize[key]);
      continue;
    }

    switch (serialize[key]) {
      case Type.Byte:
        tmpView.setInt8(tmpOffset, data[key]);
        tmpOffset += Size.Byte;
        break;

      case Type.UByte:
        tmpView.setUint8(tmpOffset, data[key]);
        tmpOffset += Size.Byte;
        break;

      case Type.ShortInt:
        tmpView.setInt16(tmpOffset, data[key]);
        tmpOffset += Size.ShortInt;
        break;

      case Type.UShortInt:
        tmpView.setUint16(tmpOffset, data[key]);
        tmpOffset += Size.UShortInt;
        break;

      case Type.Int:
        tmpView.setInt32(tmpOffset, data[key]);
        tmpOffset += Size.Int;
        break;

      case Type.UInt:
        tmpView.setUint32(tmpOffset, data[key]);
        tmpOffset += Size.UInt;
        break;

      case Type.Float:
        tmpView.setFloat32(tmpOffset, data[key]);
        tmpOffset += Size.Float;
        break;

      case Type.Double:
        tmpView.setFloat64(tmpOffset, data[key]);
        tmpOffset += Size.Double;
        break;

      default:
        throw new Error("Invalid size for serialization");
    }
  }

  return tmpView;
};

/**
 * Method to convert buffer to object
 *
 * @param obj object
 * @param serialize serialization strategy
 * @param buffer array buffer
 * @param offset byte offset
 */
const toObjectRecursive: (
  obj: object,
  serialize: object,
  buffer: ArrayBuffer,
  offset: number,
) => object = (
  obj: object,
  serialize: object,
  buffer: ArrayBuffer,
  offset: number,
): object => {
  const tmpView: DataView = new DataView(buffer, offset);
  let tmpOffset: number = Size.Empty;
  const tmpObj: object = obj;

  // Loop recursively through object
  for (const key in serialize) {
    // Skip invalid
    if (!serialize.hasOwnProperty(key)) {
      continue;
    }

    // Handle object in object
    if (typeof serialize[key] !== "number") {
      // Initialize nested object
      tmpObj[key] = {};

      // Call recursive
      tmpObj[key] = toObjectRecursive(
        tmpObj[key],
        serialize[key],
        buffer,
        tmpOffset,
      );

      // Increment offset and skip rest
      tmpOffset += expectedObjectByteLength(serialize[key]);
      continue;
    }

    // Set correct type at object
    switch (serialize[key]) {
      case Type.Byte:
        tmpObj[key] = tmpView.getInt8(tmpOffset);
        tmpOffset += Size.Byte;
        break;

      case Type.UByte:
        tmpObj[key] = tmpView.getUint8(tmpOffset);
        tmpOffset += Size.Byte;
        break;

      case Type.ShortInt:
        tmpObj[key] = tmpView.getInt16(tmpOffset);
        tmpOffset += Size.ShortInt;
        break;

      case Type.UShortInt:
        tmpObj[key] = tmpView.getUint16(tmpOffset);
        tmpOffset += Size.UShortInt;
        break;

      case Type.Int:
        tmpObj[key] = tmpView.getInt32(tmpOffset);
        tmpOffset += Size.Int;
        break;

      case Type.UInt:
        tmpObj[key] = tmpView.getUint32(tmpOffset);
        tmpOffset += Size.UInt;
        break;

      case Type.Float:
        tmpObj[key] = tmpView.getFloat32(tmpOffset);
        tmpOffset += Size.Float;
        break;

      case Type.Double:
        tmpObj[key] = tmpView.getFloat64(tmpOffset);
        tmpOffset += Size.Double;
        break;

      default:
        throw new Error("Invalid size for serialization");
    }
  }

  return tmpObj;
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
    // Throw error when no strategy is set but data
    if (typeof strategy === "undefined" && typeof data !== "undefined") {
      throw new Error("No strategy passed for data!");
    }

    // Skip if no strategy is set
    if (typeof strategy === "undefined") {
      return new ArrayBuffer(Size.Empty);
    }

    // Handle strategy without data
    if (typeof strategy !== "undefined" && typeof data === "undefined") {
      throw new Error("No data given for ToBuffer");
    }

    // Debug output
    this.debug("ToBuffer(%o, %o) called", strategy, data);

    // Object length
    const len: number = expectedObjectByteLength(strategy);

    // Generate array buffer
    const buffer: ArrayBuffer = new ArrayBuffer(len);
    let view: DataView = new DataView(buffer);

    // Transfer to buffer recursive
    view = toBufferRecursive(view, strategy, data, 0);

    // Return buffer filled via view
    return view.buffer;
  }

  /**
   * Method to parse buffer with strategy to object
   *
   * @param strategy strategy containing deserialize information
   * @param buffer data array buffer
   */
  public ToObject(strategy: object, buffer: ArrayBuffer): object {
    const obj: object = {};

    // Throw error when no strategy is set but buffer
    if (typeof strategy === "undefined" && typeof buffer !== "undefined") {
      throw new Error("No strategy passed for buffer!");
    }

    // Skip if no strategy is set
    if (typeof strategy === "undefined") {
      return obj;
    }

    // Handle strategy without data
    if (typeof strategy !== "undefined" && typeof buffer === "undefined") {
      throw new Error("No buffer given for ToObject");
    }

    // Debug output
    this.debug("Parse(%o, %o) called", strategy, buffer);

    // Object length
    const len: number = expectedObjectByteLength(strategy);

    // Check length
    if (len !== buffer.byteLength) {
      throw new Error("Invalid buffer length");
    }

    return toObjectRecursive(obj, strategy, buffer, 0);
  }
}

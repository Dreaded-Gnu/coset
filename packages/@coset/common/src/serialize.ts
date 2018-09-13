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
    this.debug("Parse(%o, %o) called", strategy, buffer);

    return {};
  }
}

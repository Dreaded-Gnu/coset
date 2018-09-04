// Package dependencies
import * as Debug from "debug";

// Local dependencies
import { constant } from "./constant";

/**
 * Deserialization class
 */
export class Deserialize {
  /**
   * Debugging utility
   */
  private readonly debug: Debug.IDebugger;

  /**
   * Constructor
   */
  public constructor() {
    // Initialize attributes
    this.debug = Debug(`${constant.packageName}:deserialize`);

    // TODO: Add more here
    this.debug("Deserialize constructor initialized");
  }
}

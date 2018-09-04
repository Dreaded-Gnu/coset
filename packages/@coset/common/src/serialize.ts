// Package dependencies
import * as Debug from "debug";

// Local dependencies
import { constant } from "./constant";

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

    // TODO: Add more here
    this.debug("Serialize constructor initialized");
  }
}

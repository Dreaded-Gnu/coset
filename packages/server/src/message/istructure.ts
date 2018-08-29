/**
 * Message structure
 *
 * @export
 * @interface IMessageStructure
 */
export interface IMessageStructure {
  /**
   * Message type
   *
   * @type {string}
   * @memberof IMessageStructure
   */
  type?: string;

  /**
   * Message payload
   *
   * @type {*}
   * @memberof IMessageStructure
   */
  payload: any;
}

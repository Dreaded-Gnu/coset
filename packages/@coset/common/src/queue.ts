/**
 * Queue class
 */
export class Queue<T> {
  /**
   * Queue array consisting of objects
   */
  private readonly queue: T[];

  /**
   * Constructor
   */
  public constructor() {
    this.queue = [];
  }

  /**
   * Method to get length of Queue
   */
  public Count(): number {
    return this.queue.length;
  }

  /**
   * Method get last element from queue
   */
  public Pop(): T {
    return this.queue.pop();
  }

  /**
   * Push to queue
   *
   * @param o object to add to queue
   */
  public Push(o: T): void {
    this.queue.push(o);
  }

  /**
   * Method get first element from queue
   */
  public Shift(): T {
    return this.queue.shift();
  }
}

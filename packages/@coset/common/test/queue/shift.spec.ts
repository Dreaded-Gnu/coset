import { Queue } from "../../src/queue";
import { Size } from "../../src/size";

// tslint:disable:no-magic-numbers

test("Queue count", () => {
  const q: Queue<number> = new Queue<number>();
  let check: number = Size.Empty;

  // Expect to be empty
  expect(q.Count()).toBe(check);

  // Prepare check value
  check += 3;

  // Push some data
  q.Push(1);
  q.Push(2);
  q.Push(3);

  // Compare after push
  expect(q.Count()).toBe(check);

  // Prepare check value
  check -= 1;
  const shiftCheck: number = q.Shift();

  // Compare after pop
  expect(q.Count()).toBe(check);
  expect(shiftCheck).toBe(1);
});

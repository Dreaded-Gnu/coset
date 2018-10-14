import { Queue } from "../../src/queue";
import { Size } from "../../src/size";

// tslint:disable:no-magic-numbers

test("Queue count", () => {
  const q: Queue<number> = new Queue<number>();
  let check: number = Size.Empty;

  // Expect to be empty
  expect(q.Count()).toBe(check);

  // Push some data
  q.Push(1);
  check += 1;
  expect(q.Count()).toBe(check);

  q.Push(2);
  check += 1;
  expect(q.Count()).toBe(check);

  q.Push(3);
  check += 1;
  expect(q.Count()).toBe(check);
});

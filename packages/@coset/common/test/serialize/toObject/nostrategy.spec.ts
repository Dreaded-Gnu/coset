import { Serialize } from "../../../src/serialize";

test("No strategy to object", () => {
  const srz: Serialize = new Serialize();
  expect(() => srz.ToObject(undefined, new ArrayBuffer(4))).toThrow();
});

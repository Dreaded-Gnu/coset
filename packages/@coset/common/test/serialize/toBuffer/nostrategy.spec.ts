import { Serialize } from "../../../src/serialize";

test("No strategy to buffer", () => {
  const srz: Serialize = new Serialize();
  expect(() => srz.ToBuffer(undefined, {})).toThrow();
});

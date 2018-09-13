import { Serialize } from "../../../src/serialize";
import { Type } from "../../../src/type";

test("Strategy to buffer without data", () => {
  const srz: Serialize = new Serialize();
  expect(() => srz.ToObject({ a: Type.Byte }, undefined)).toThrow();
});

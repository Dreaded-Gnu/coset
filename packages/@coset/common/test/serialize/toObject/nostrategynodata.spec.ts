import { Serialize } from "../../../src/serialize";

test("No strategy to buffer", () => {
  const srz: Serialize = new Serialize();
  const checkObj: object = {};

  const obj: object = srz.ToObject(undefined, undefined);
  expect(obj).toEqual(checkObj);
});

import { Serialize } from "../../../src/serialize";

// tslint:disable:no-magic-numbers

test("No strategy to buffer", () => {
  const srz: Serialize = new Serialize();
  const checkObj: object = {};

  // Serialize and check
  const obj: object = srz.ToObject(undefined, undefined);

  // Compare objects
  expect(obj).toEqual(checkObj);
});

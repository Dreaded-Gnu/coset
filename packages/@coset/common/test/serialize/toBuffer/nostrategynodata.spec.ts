import { Serialize } from "../../../src/serialize";

// tslint:disable:no-magic-numbers

test("No strategy to buffer", () => {
  const srz: Serialize = new Serialize();
  const checkBuffer: ArrayBuffer = new ArrayBuffer(0);

  const buff: ArrayBuffer = srz.ToBuffer(undefined, undefined);
  expect(buff.byteLength).toBe(checkBuffer.byteLength);
  expect(Buffer.from(buff).equals(Buffer.from(checkBuffer))).toBe(true);
});

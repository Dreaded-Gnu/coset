import { Serialize } from "../../../src/serialize";
import { Size } from "../../../src/size";
import { Type } from "../../../src/type";

// tslint:disable:no-magic-numbers

test("Nested object to buffer", () => {
  const srz: Serialize = new Serialize();
  const checkBuffer: ArrayBuffer = new ArrayBuffer(25);
  const checkView: DataView = new DataView(checkBuffer);
  let offset: number = Size.Empty;

  // Build check view
  checkView.setInt8(offset, 1);
  offset += Size.Byte;
  checkView.setInt16(offset, 2);
  offset += Size.ShortInt;
  checkView.setUint16(offset, 3);
  offset += Size.UShortInt;
  checkView.setInt32(offset, 4);
  offset += Size.Int;
  checkView.setUint32(offset, 5);
  offset += Size.UInt;
  checkView.setFloat32(offset, 6);
  offset += Size.Float;
  checkView.setFloat64(offset, 7);

  // Serialize and check
  const buff: ArrayBuffer = srz.ToBuffer(
    {
      a: Type.Byte,
      b: {
        ba: Type.ShortInt,
        bb: Type.UShortInt,
      },
      c: Type.Int,
      d: Type.UInt,
      e: Type.Float,
      f: Type.Double,
    },
    {
      a: 1,
      b: {
        ba: 2,
        bb: 3,
      },
      c: 4,
      d: 5,
      e: 6,
      f: 7,
    },
  );

  // Compare length
  expect(buff.byteLength).toBe(checkBuffer.byteLength);

  // Compare content
  expect(Buffer.from(buff).equals(Buffer.from(checkBuffer))).toBe(true);
});

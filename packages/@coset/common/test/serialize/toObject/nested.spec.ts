import { Serialize } from "../../../src/serialize";
import { Size } from "../../../src/size";
import { Type } from "../../../src/type";

// tslint:disable:no-magic-numbers

test("Nested buffer to object", () => {
  const srz: Serialize = new Serialize();
  const buffer: ArrayBuffer = new ArrayBuffer(26);
  const view: DataView = new DataView(buffer);
  const checkObj: object = {
    a: 1,
    b: 1,
    c: {
      ca: 2,
      cb: 3,
    },
    d: 4,
    e: 5,
    f: 6,
    g: 7,
  };
  let offset: number = Size.Empty;

  // Build check view
  view.setInt8(offset, 1);
  offset += Size.Byte;
  view.setInt8(offset, 1);
  offset += Size.UByte;
  view.setInt16(offset, 2);
  offset += Size.ShortInt;
  view.setUint16(offset, 3);
  offset += Size.UShortInt;
  view.setInt32(offset, 4);
  offset += Size.Int;
  view.setUint32(offset, 5);
  offset += Size.UInt;
  view.setFloat32(offset, 6);
  offset += Size.Float;
  view.setFloat64(offset, 7);

  // Serialize and check
  const obj: object = srz.ToObject(
    {
      a: Type.Byte,
      b: Type.UByte,
      c: {
        ca: Type.ShortInt,
        cb: Type.UShortInt,
      },
      d: Type.Int,
      e: Type.UInt,
      f: Type.Float,
      g: Type.Double,
    },
    view.buffer,
  );

  // Compare objects
  expect(obj).toEqual(checkObj);
});

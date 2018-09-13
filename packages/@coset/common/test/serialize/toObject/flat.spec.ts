import { Serialize } from "../../../src/serialize";
import { Size } from "../../../src/size";
import { Type } from "../../../src/type";

// tslint:disable:no-magic-numbers

test("Flat buffer to object", () => {
  const srz: Serialize = new Serialize();
  const buffer: ArrayBuffer = new ArrayBuffer(26);
  const view: DataView = new DataView(buffer);
  const checkObj: object = {
    a: 1,
    b: 1,
    c: 2,
    d: 3,
    e: 4,
    f: 5,
    g: 6,
    h: 7,
  };
  let offset: number = Size.Empty;

  // Build check view
  view.setInt8(offset, 1);
  offset += Size.Byte;
  view.setUint8(offset, 1);
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
      b: Type.Byte,
      c: Type.ShortInt,
      d: Type.UShortInt,
      e: Type.Int,
      f: Type.UInt,
      g: Type.Float,
      h: Type.Double,
    },
    view.buffer,
  );

  // Compare objects
  expect(obj).toEqual(checkObj);
});

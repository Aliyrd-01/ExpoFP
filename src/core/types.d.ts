type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];
type Triangle = [Vec2, Vec2, Vec2];

type MutableRequired<T> = { -readonly [P in keyof T]-?: T[P] };

type Serializable<T> = T extends Set<infer X>
    ? X[]
    : T extends Map<infer K, infer V>
    ? [K, V][]
    : {
          [P in keyof T]: Serializable<T[P]>;
      };

// type MakeSerializable<T> = {
//     [P in keyof T]: Serializable<T[P]>;
// };

declare module "*.txt";

type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];
type Triangle = [Vec2, Vec2, Vec2];

type MutableRequired<T> = { -readonly [P in keyof T]-?: T[P] }; 
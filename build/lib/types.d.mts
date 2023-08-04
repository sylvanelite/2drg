declare const CONTROLS: {
    LEFT: number;
    RIGHT: number;
    JUMP: number;
    SHOOT: number;
    MINE: number;
};
declare enum EntityKind {
    Player = 1,
    Enemy = 10,
    Bullet = 100,
    Resource = 1000,
    Conductor = 10000
}
declare enum EuqippedKind {
    WEAPON_FLAMETHROWER = 1,
    WEAPON_SNIPER = 2,
    WEAPON_MACHINEGUN = 3,
    WEAPON_SHOTGUN = 4,
    WEAPON_MINE = 5,
    ENEMY_GRUNT = 10,
    ENEMY_WINGED = 11,
    RESOURCE_BISMORE_TOP = 100,
    RESOURCE_BISMORE_BOTTOM = 101,
    RESOURCE_CROPPA_TOP = 102,
    RESOURCE_CROPPA_BOTTOM = 103,
    RESOURCE_NITRA_TOP = 104,
    RESOURCE_NITRA_BOTTOM = 105,
    RESOURCE_RED_SUGAR_TOP = 106,
    RESOURCE_RED_SUGAR_BOTTOM = 107,
    RESOURCE_GOLD_TOP = 108,
    RESOURCE_GOLD_BOTTOM = 109,
    RESOURCE_EGG = 200,
    RESOURCE_AQUARQ = 201,
    RESOURCE_FOSSIL = 202,
    WAVE_LOCKED_ROOM = 10000,
    WAVE_OPEN_ROOM = 10001
}
declare class PRNG {
    static RNG_A: number;
    static RNG_B: number;
    static RNG_C: number;
    static RNG_D: number;
    static prng(seed?: number): number;
}
declare const hash: (x: number) => number;
declare const xyToIdx: (x: number, y: number, width: number) => number;
declare const idxToXy: (idx: number, width: number) => number[];
declare class Bit {
    static BIT_CHECK(a: number, b: number): boolean;
    static BIT_SET(a: number, b: number): number;
    static BIT_CLEAR(a: number, b: number): number;
}
declare const SIZE_OF_INT = 32;
export { Bit, hash, xyToIdx, idxToXy, PRNG, CONTROLS, EntityKind, EuqippedKind, SIZE_OF_INT };

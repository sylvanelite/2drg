const CONTROLS = {
    LEFT: 1,
    RIGHT: 2,
    JUMP: 3,
    SHOOT: 4,
    MINE: 5
};
var EntityKind;
(function (EntityKind) {
    EntityKind[EntityKind["Player"] = 1] = "Player";
    EntityKind[EntityKind["Enemy"] = 10] = "Enemy";
    EntityKind[EntityKind["Bullet"] = 100] = "Bullet";
    EntityKind[EntityKind["Resource"] = 1000] = "Resource";
    EntityKind[EntityKind["Conductor"] = 10000] = "Conductor";
})(EntityKind || (EntityKind = {}));
var EuqippedKind;
(function (EuqippedKind) {
    EuqippedKind[EuqippedKind["WEAPON_FLAMETHROWER"] = 1] = "WEAPON_FLAMETHROWER";
    EuqippedKind[EuqippedKind["WEAPON_SNIPER"] = 2] = "WEAPON_SNIPER";
    EuqippedKind[EuqippedKind["WEAPON_MACHINEGUN"] = 3] = "WEAPON_MACHINEGUN";
    EuqippedKind[EuqippedKind["WEAPON_SHOTGUN"] = 4] = "WEAPON_SHOTGUN";
    EuqippedKind[EuqippedKind["WEAPON_MINE"] = 5] = "WEAPON_MINE";
    EuqippedKind[EuqippedKind["ENEMY_GRUNT"] = 10] = "ENEMY_GRUNT";
    EuqippedKind[EuqippedKind["ENEMY_WINGED"] = 11] = "ENEMY_WINGED";
    EuqippedKind[EuqippedKind["RESOURCE_BISMORE_TOP"] = 100] = "RESOURCE_BISMORE_TOP";
    EuqippedKind[EuqippedKind["RESOURCE_BISMORE_BOTTOM"] = 101] = "RESOURCE_BISMORE_BOTTOM";
    EuqippedKind[EuqippedKind["RESOURCE_CROPPA_TOP"] = 102] = "RESOURCE_CROPPA_TOP";
    EuqippedKind[EuqippedKind["RESOURCE_CROPPA_BOTTOM"] = 103] = "RESOURCE_CROPPA_BOTTOM";
    EuqippedKind[EuqippedKind["RESOURCE_NITRA_TOP"] = 104] = "RESOURCE_NITRA_TOP";
    EuqippedKind[EuqippedKind["RESOURCE_NITRA_BOTTOM"] = 105] = "RESOURCE_NITRA_BOTTOM";
    EuqippedKind[EuqippedKind["RESOURCE_RED_SUGAR_TOP"] = 106] = "RESOURCE_RED_SUGAR_TOP";
    EuqippedKind[EuqippedKind["RESOURCE_RED_SUGAR_BOTTOM"] = 107] = "RESOURCE_RED_SUGAR_BOTTOM";
    EuqippedKind[EuqippedKind["RESOURCE_GOLD_TOP"] = 108] = "RESOURCE_GOLD_TOP";
    EuqippedKind[EuqippedKind["RESOURCE_GOLD_BOTTOM"] = 109] = "RESOURCE_GOLD_BOTTOM";
    EuqippedKind[EuqippedKind["RESOURCE_EGG"] = 200] = "RESOURCE_EGG";
    EuqippedKind[EuqippedKind["RESOURCE_AQUARQ"] = 201] = "RESOURCE_AQUARQ";
    EuqippedKind[EuqippedKind["RESOURCE_FOSSIL"] = 202] = "RESOURCE_FOSSIL";
    EuqippedKind[EuqippedKind["WAVE_LOCKED_ROOM"] = 10000] = "WAVE_LOCKED_ROOM";
    EuqippedKind[EuqippedKind["WAVE_OPEN_ROOM"] = 10001] = "WAVE_OPEN_ROOM";
})(EuqippedKind || (EuqippedKind = {}));
class PRNG {
    static RNG_A = 42;
    static RNG_B = 1234;
    static RNG_C = 5678;
    static RNG_D = 9001;
    static prng(seed = null) {
        if (seed) {
            PRNG.RNG_A = seed;
            PRNG.RNG_B = seed * 10;
            PRNG.RNG_C = seed * 100;
            PRNG.RNG_D = seed * 1000;
        }
        PRNG.RNG_A |= 0;
        PRNG.RNG_B |= 0;
        PRNG.RNG_C |= 0;
        PRNG.RNG_D |= 0;
        const t = PRNG.RNG_A - (PRNG.RNG_B << 23 | PRNG.RNG_B >>> 9) | 0;
        PRNG.RNG_A = PRNG.RNG_B ^ (PRNG.RNG_C << 16 | PRNG.RNG_C >>> 16) | 0;
        PRNG.RNG_B = PRNG.RNG_C + (PRNG.RNG_D << 11 | PRNG.RNG_D >>> 21) | 0;
        PRNG.RNG_B = PRNG.RNG_C + PRNG.RNG_D | 0;
        PRNG.RNG_C = PRNG.RNG_D + t | 0;
        PRNG.RNG_D = PRNG.RNG_A + t | 0;
        return (PRNG.RNG_D >>> 0) / 4294967296;
    }
}
const hash = (x) => {
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = (x >> 16) ^ x;
    return x;
};
const xyToIdx = (x, y, width) => {
    return y * width + x;
};
const idxToXy = (idx, width) => {
    return [
        Math.floor(idx % width),
        Math.floor(idx / width)
    ];
};
class Bit {
    static BIT_CHECK(a, b) { return (!!((a) & (0x01 << (b)))); }
    static BIT_SET(a, b) { ((a) |= (0x01 << (b))); return a; }
    static BIT_CLEAR(a, b) { ((a) &= ~(0x01 << (b))); return a; }
}
const SIZE_OF_INT = 32;
export { Bit, hash, xyToIdx, idxToXy, PRNG, CONTROLS, EntityKind, EuqippedKind, SIZE_OF_INT };
//# sourceMappingURL=types.mjs.map
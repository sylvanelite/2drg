declare const IMAGE_WIDTH = 512;
declare const IMAGE_HEIGHT = 512;
declare const sprites: {
    driller_stand1: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    driller_jet1: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    driller_fall1: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    heart: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    carry: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    ammo: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    mine1: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    mine2: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    enemy_grunt: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    enemy_grunt_attack: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    enemy_winged: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    enemy_winged_attack: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    driller_stand2: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    driller_jet2: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    driller_fall2: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    scout_stand1: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    scout_jet1: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    scout_fall1: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    scout_stand2: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    scout_jet2: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    scout_fall2: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    engineer_stand1: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    engineer_jet1: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    engineer_fall1: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    engineer_stand2: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    engineer_jet2: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    engineer_fall2: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    gunner_stand1: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    gunner_jet1: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    gunner_fall1: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    gunner_stand2: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    gunner_jet2: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    gunner_fall2: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    egg: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    aquarq: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    fossil: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    bismore_top: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    croppa_top: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    bismore_bottom: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    croppa_bottom: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    nitra_top: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    red_sugar_top: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    gold_top: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    nitra_bottom: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    red_sugar_bottom: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    gold_bottom: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    player_driller: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    player_gunner: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    player_engineer: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    player_scout: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    player_bg: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    player1: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    player2: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    player3: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    player4: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
};
declare const FONT_WIDTH = 128;
declare const FONT_HEIGHT = 64;
declare const LETTER_W = 7;
declare const LETTER_H = 9;
declare const font: {
    ' ': {
        x: number;
        y: number;
    };
    '!': {
        x: number;
        y: number;
    };
    '"': {
        x: number;
        y: number;
    };
    '#': {
        x: number;
        y: number;
    };
    $: {
        x: number;
        y: number;
    };
    '%': {
        x: number;
        y: number;
    };
    '&': {
        x: number;
        y: number;
    };
    "'": {
        x: number;
        y: number;
    };
    '(': {
        x: number;
        y: number;
    };
    ')': {
        x: number;
        y: number;
    };
    '*': {
        x: number;
        y: number;
    };
    '+': {
        x: number;
        y: number;
    };
    ',': {
        x: number;
        y: number;
    };
    '-': {
        x: number;
        y: number;
    };
    '.': {
        x: number;
        y: number;
    };
    '/': {
        x: number;
        y: number;
    };
    '0': {
        x: number;
        y: number;
    };
    '1': {
        x: number;
        y: number;
    };
    '2': {
        x: number;
        y: number;
    };
    '3': {
        x: number;
        y: number;
    };
    '4': {
        x: number;
        y: number;
    };
    '5': {
        x: number;
        y: number;
    };
    '6': {
        x: number;
        y: number;
    };
    '7': {
        x: number;
        y: number;
    };
    '8': {
        x: number;
        y: number;
    };
    "9": {
        x: number;
        y: number;
    };
    ':': {
        x: number;
        y: number;
    };
    ';': {
        x: number;
        y: number;
    };
    '<': {
        x: number;
        y: number;
    };
    '=': {
        x: number;
        y: number;
    };
    '>': {
        x: number;
        y: number;
    };
    '?': {
        x: number;
        y: number;
    };
    '@': {
        x: number;
        y: number;
    };
    A: {
        x: number;
        y: number;
    };
    B: {
        x: number;
        y: number;
    };
    C: {
        x: number;
        y: number;
    };
    D: {
        x: number;
        y: number;
    };
    E: {
        x: number;
        y: number;
    };
    F: {
        x: number;
        y: number;
    };
    G: {
        x: number;
        y: number;
    };
    H: {
        x: number;
        y: number;
    };
    I: {
        x: number;
        y: number;
    };
    J: {
        x: number;
        y: number;
    };
    K: {
        x: number;
        y: number;
    };
    L: {
        x: number;
        y: number;
    };
    M: {
        x: number;
        y: number;
    };
    N: {
        x: number;
        y: number;
    };
    O: {
        x: number;
        y: number;
    };
    P: {
        x: number;
        y: number;
    };
    Q: {
        x: number;
        y: number;
    };
    R: {
        x: number;
        y: number;
    };
    S: {
        x: number;
        y: number;
    };
    T: {
        x: number;
        y: number;
    };
    U: {
        x: number;
        y: number;
    };
    V: {
        x: number;
        y: number;
    };
    W: {
        x: number;
        y: number;
    };
    X: {
        x: number;
        y: number;
    };
    Y: {
        x: number;
        y: number;
    };
    Z: {
        x: number;
        y: number;
    };
    '[': {
        x: number;
        y: number;
    };
    '\\': {
        x: number;
        y: number;
    };
    "]": {
        x: number;
        y: number;
    };
    '^': {
        x: number;
        y: number;
    };
    _: {
        x: number;
        y: number;
    };
    '`': {
        x: number;
        y: number;
    };
    a: {
        x: number;
        y: number;
    };
    b: {
        x: number;
        y: number;
    };
    c: {
        x: number;
        y: number;
    };
    d: {
        x: number;
        y: number;
    };
    e: {
        x: number;
        y: number;
    };
    f: {
        x: number;
        y: number;
    };
    g: {
        x: number;
        y: number;
    };
    h: {
        x: number;
        y: number;
    };
    i: {
        x: number;
        y: number;
    };
    j: {
        x: number;
        y: number;
    };
    k: {
        x: number;
        y: number;
    };
    l: {
        x: number;
        y: number;
    };
    m: {
        x: number;
        y: number;
    };
    n: {
        x: number;
        y: number;
    };
    o: {
        x: number;
        y: number;
    };
    p: {
        x: number;
        y: number;
    };
    q: {
        x: number;
        y: number;
    };
    r: {
        x: number;
        y: number;
    };
    s: {
        x: number;
        y: number;
    };
    t: {
        x: number;
        y: number;
    };
    u: {
        x: number;
        y: number;
    };
    v: {
        x: number;
        y: number;
    };
    w: {
        x: number;
        y: number;
    };
    x: {
        x: number;
        y: number;
    };
    y: {
        x: number;
        y: number;
    };
    z: {
        x: number;
        y: number;
    };
    '{': {
        x: number;
        y: number;
    };
    '|': {
        x: number;
        y: number;
    };
    '}': {
        x: number;
        y: number;
    };
    '\u201C': {
        x: number;
        y: number;
    };
};
export { IMAGE_HEIGHT, IMAGE_WIDTH, sprites, FONT_HEIGHT, FONT_WIDTH, LETTER_H, LETTER_W, font };

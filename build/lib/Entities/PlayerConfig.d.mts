declare class PlayerConfig {
    static CLASSES: {
        DRILLER: number;
        SCOUT: number;
        ENGINEER: number;
        GUNNER: number;
    };
    chosenClass: number;
    constructor();
}
export { PlayerConfig };

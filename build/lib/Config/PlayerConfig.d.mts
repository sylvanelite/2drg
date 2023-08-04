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
declare class PlayerLiveCount {
    roomId: number;
    roomIdx: number;
    reviveCount: number;
}
export { PlayerConfig, PlayerLiveCount };

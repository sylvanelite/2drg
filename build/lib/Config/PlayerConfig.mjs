class PlayerConfig {
    static CLASSES = {
        DRILLER: 0,
        SCOUT: 1,
        ENGINEER: 2,
        GUNNER: 3,
    };
    chosenClass;
    constructor() {
        this.chosenClass = PlayerConfig.CLASSES.DRILLER;
    }
}
class PlayerLiveCount {
    roomId = 0;
    roomIdx = 0;
    reviveCount = 0;
}
export { PlayerConfig, PlayerLiveCount };
//# sourceMappingURL=PlayerConfig.mjs.map
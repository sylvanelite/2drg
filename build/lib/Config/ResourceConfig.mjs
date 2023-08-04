class ResourceConfig {
    static PRIMARY_OBJECTIVE = {
        MINING_EXPEDITION: 0,
        EGG_HUNT: 1,
        POINT_EXTRACTION: 2,
    };
    static SECONDARY_OBJECTIVE = {
        FOSSIL: 0
    };
    chosenPrimary;
    chosenSecondary;
    seed;
    goalPrimary;
    goalSecondary;
    constructor() {
        this.chosenPrimary = ResourceConfig.PRIMARY_OBJECTIVE.MINING_EXPEDITION;
        this.chosenSecondary = ResourceConfig.SECONDARY_OBJECTIVE.FOSSIL;
        this.seed = 42;
        this.goalPrimary = 4;
        this.goalSecondary = 10;
    }
}
class ResourceLiveCount {
    bismore = 0;
    croppa = 0;
    nitra = 0;
    gold = 0;
    egg = 0;
    aquarq = 0;
    fossil = 0;
}
export { ResourceConfig, ResourceLiveCount };
//# sourceMappingURL=ResourceConfig.mjs.map
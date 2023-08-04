declare class ResourceConfig {
    static PRIMARY_OBJECTIVE: {
        MINING_EXPEDITION: number;
        EGG_HUNT: number;
        POINT_EXTRACTION: number;
    };
    static SECONDARY_OBJECTIVE: {
        FOSSIL: number;
    };
    chosenPrimary: number;
    chosenSecondary: number;
    seed: number;
    goalPrimary: number;
    goalSecondary: number;
    constructor();
}
declare class ResourceLiveCount {
    bismore: number;
    croppa: number;
    nitra: number;
    gold: number;
    egg: number;
    aquarq: number;
    fossil: number;
}
export { ResourceConfig, ResourceLiveCount };

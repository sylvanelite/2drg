
//mission data attached to a game instance
class ResourceConfig{
    static PRIMARY_OBJECTIVE={
        MINING_EXPEDITION:0,
        EGG_HUNT:1,
        POINT_EXTRACTION:2,
    }
    static SECONDARY_OBJECTIVE={
        FOSSIL:0
    }
    chosenPrimary:number;
    chosenSecondary:number;
    seed:number;
    constructor(){
        this.chosenPrimary= ResourceConfig.PRIMARY_OBJECTIVE.MINING_EXPEDITION;
        this.chosenSecondary= ResourceConfig.SECONDARY_OBJECTIVE.FOSSIL;
        this.seed=42;
    }
}
class ResourceLiveCount{
    bismore = 0;
    croppa = 0;
    nitra = 0;
    //redSugar (not a collectable)
    gold = 0;
    egg = 0;
    aquarq = 0;
    fossil = 0;
}
export {ResourceConfig,ResourceLiveCount}

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
    constructor(){
        this.chosenPrimary= ResourceConfig.PRIMARY_OBJECTIVE.MINING_EXPEDITION;
        this.chosenSecondary= ResourceConfig.SECONDARY_OBJECTIVE.FOSSIL;
    }
}
export {ResourceConfig}
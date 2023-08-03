
//global data attached to each player upon join
class PlayerConfig{
    static CLASSES={
        DRILLER:0,
        SCOUT:1,
        ENGINEER:2,
        GUNNER:3,
    }
    chosenClass:number;
    constructor(){
        this.chosenClass= PlayerConfig.CLASSES.DRILLER;
    }
}
class PlayerLiveCount{
    roomId:number=0;
    roomIdx:number=0;
    reviveCount:number=0;
}
export {PlayerConfig,PlayerLiveCount}
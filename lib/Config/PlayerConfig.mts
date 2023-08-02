
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
export {PlayerConfig}
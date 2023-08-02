
//not an entity class, used to set up players on game init (e.g. apply chosen classes, etc)
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
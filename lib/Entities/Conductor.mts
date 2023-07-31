import { EntityKind,EuqippedKind,PRNG} from "../types.mjs";
import { Entity } from "../Entity.mjs";
import { Room } from "../Room.mjs";
class Conductor{
    static TiggerWave(room:Room,waveKind:number){
        const waveSpwaner = new Entity();
        waveSpwaner.kind = EntityKind.Conductor;
        waveSpwaner.euqipped = waveKind;
        waveSpwaner.cooldown = 3000;//duration of the wave
        waveSpwaner.position.x = Math.floor(PRNG.prng()*room.terrain.width);
        waveSpwaner.position.y = Math.floor(PRNG.prng()*room.terrain.height);
        if(waveKind==EuqippedKind.WAVE_LOCKED_ROOM){
            room.locked_L = true;
            room.locked_R = true;
            room.locked_U = true;
            room.locked_D = true;
        }
        Room.AddEntity(room,waveSpwaner);
    }

    static update(room:Room,entity:Entity){
        //wave updating
        if(PRNG.prng()<0.2){//rate of spawn per frame
            const enemy = new Entity();
            enemy.kind = EntityKind.Enemy;
            enemy.euqipped = EuqippedKind.ENEMY_GRUNT;
            enemy.hp=100;
            enemy.maxHp=100;
            if(PRNG.prng()>0.5){
                enemy.euqipped = EuqippedKind.ENEMY_WINGED;
            }
            enemy.position.x=Math.floor(PRNG.prng()*room.terrain.width);
            enemy.position.y=Math.floor(PRNG.prng()*room.terrain.height);
            Room.AddEntity(room,enemy);
        }

        //wave ending
        entity.cooldown-=1;
        if(entity.cooldown<1){
            room.locked_L = false;
            room.locked_R = false;
            room.locked_U = false;
            room.locked_D = false;
            Room.RemoveEntity(room,entity);
        }
    }
    //NOTE: There is currently no draw method for conductors
}
export {Conductor}
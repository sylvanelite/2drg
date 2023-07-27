
import { KeyboardAndMouseInputReader } from "./inputController.mjs";
import { NetplayInput, NetplayState } from "./netPeer/netplayInput.mjs";
import { idxToXy,CONTROLS,EntityKind,PRNG,EuqippedKind } from "./types.mjs";
import { Entity,Collision } from "./Entity.mjs";
import { Room } from "./Room.mjs";
import { Terrain } from "./Terrain.mjs";

class Game extends NetplayState{
    static gameInstance:Game;
//TODO: serialise rooms->entities->terrain
    serialize(): any { 
        const rooms = [];
        for(const r of this.rooms){
            const ents = [];
            for(let i=0;i<r.maxEntities;i+=1){
                const e = r.entities[i];
                if(e.roomId<0){console.warn("neg ID alive!",r)};
                ents.push({
                    uid:e.uid,
                    roomId:e.roomId,
                    kind:e.kind,
                    euqipped:e.euqipped,
                    hp:e.hp,
                    maxHp:e.maxHp,
                    cooldown:e.cooldown,
                    sprite:e.sprite,
                    spriteFrame:e.spriteFrame,
                    position_x:e.position.x,
                    position_y:e.position.y,
                    velocity_x:e.velocity.x,
                    velocity_y:e.velocity.y,
                    size_x:e.size.x,
                    size_y:e.size.y
                });
            }
            const rSerial = {
                idx:r.idx,
                x:r.x,
                y:r.y,
                players:Array.from(r.players),
                maxEntities:r.maxEntities,
                ents
                //TODO: terrain
                //TODO: entities...
            };
            //if(r.players.size>0){//TODO: serialise only if needed? 
            rooms.push(rSerial);
            //}
        }
        return {
            currentRoom:this.currentRoom,
            EnityUid:Entity.uid,
            rooms
            //these shouldn't change after init(), so don't need to be serialised
            //playerUid:this.playerUid,
            //worldWidth:this.worldWidth,
            //tickRate:this.tickRate
        };
    }
    deserialize(value: any) { 
        Entity.uid = value.EnityUid;
        this.currentRoom = value.currentRoom;
        for(const r of value.rooms){
            const tgt = this.rooms[r.idx];
            tgt.x = r.x;
            tgt.y = r.y;
            tgt.players = new Set(r.players);
            tgt.maxEntities = r.maxEntities;
            let entId = 0;
            for(const e of r.ents){
                const ent = tgt.entities[entId];
                ent.roomId = e.roomId;//note: e.roomId could be negative if it's deleted?
                ent.uid=e.uid;
                ent.roomId=e.roomId;
                ent.kind=e.kind;
                ent.euqipped=e.euqipped;
                ent.hp=e.hp;
                ent.maxHp=e.maxHp;
                ent.cooldown=e.cooldown;
                ent.sprite=e.sprite;
                ent.spriteFrame=e.spriteFrame;
                ent.position.x=e.position_x;
                ent.position.y=e.position_y;
                ent.velocity.x=e.velocity_x;
                ent.velocity.y=e.velocity_y;
                ent.size.x=e.size_x;
                ent.size.y=e.size_y;
                entId+=1;
            }
        }
    }

    inputReader:KeyboardAndMouseInputReader;
    ctx:CanvasRenderingContext2D;
    rooms:Array<Room>;
    currentRoom:number;//room for the local player
    worldWidth:number;
    playerUid:number;
    tickRate:number;//time until the next update() is called
    constructor(canvas:HTMLCanvasElement) {
        super();
        this.tickRate = 30/1000;
        this.ctx = canvas.getContext("2d");
        this.inputReader = new KeyboardAndMouseInputReader(canvas);
        this.rooms = [];
        this.worldWidth = 24;
        for(let i=0;i<this.worldWidth;i+=1){
            for(let j=0;j<24;j+=1){
                const r = new Room();
                r.idx = this.rooms.length;
                const [x,y] = idxToXy(r.idx,this.worldWidth);
                r.x = x;
                r.y = y;
                r.terrain = new Terrain();
                Terrain.fillRect(r.terrain,0,50,300,100);
                this.rooms.push(r);
            }
        }
    }
    init(playerId:number,playerCount:number){
        //note:bindings is a bitmask, should cap at ~32 
        this.inputReader.bindings.set('ArrowRight', CONTROLS.RIGHT);
        this.inputReader.bindings.set('ArrowLeft', CONTROLS.LEFT);
        this.inputReader.bindings.set('ArrowUp', CONTROLS.JUMP);
        this.inputReader.bindings.set('KeyD', CONTROLS.RIGHT);
        this.inputReader.bindings.set('KeyA', CONTROLS.LEFT);
        this.inputReader.bindings.set('KeyW', CONTROLS.JUMP);
        this.inputReader.bindings.set('Space', CONTROLS.SHOOT);
        this.inputReader.bindings.set('mouse_0', CONTROLS.SHOOT);
        //set up objects
        
        this.currentRoom = 500;
        const startingRoom  = this.rooms[this.currentRoom];
        for(let i=0;i<playerCount;i+=1){
            const playerEntity = new Entity();//TODO: real init...
            playerEntity.kind = EntityKind.Player;
            if(playerEntity.uid == playerId){
                //note: 'if' is not really needed. Assumes that players are the 1st entity 
                //since playerId will be 0,1,2,3,4...
                this.playerUid = playerEntity.uid;
            }
            playerEntity.euqipped = EuqippedKind.WEAPON_FLAMETHROWER;
            Room.AddEntity(startingRoom,playerEntity);
        }
        //enemies
        for(const r of this.rooms){
            const eCount = 1+Math.floor(PRNG.prng()*3);
            for(let i=0;i<eCount;i+=1){
                const enemy = new Entity();//TODO: real init...
                enemy.kind = EntityKind.Enemy;
                enemy.euqipped = EuqippedKind.ENEMY_GRUNT;
                enemy.hp=100;
                enemy.maxHp=100;
                if(PRNG.prng()>0.5){
                    enemy.euqipped = EuqippedKind.ENEMY_WINGED;
                }
                enemy.position.x=Math.floor(PRNG.prng()*r.terrain.width);
                enemy.position.y=Math.floor(PRNG.prng()*r.terrain.height);
                Room.AddEntity(r,enemy);
            }
        }
    }
    static inputs: Map<number, NetplayInput>;
    tick(playerInputs: Map<number, NetplayInput>): void {
        Game.inputs= playerInputs;
        //--update loop below
        for(const room of Game.gameInstance.rooms){
            if(room.players.size>0){
                Collision.preExecute();
                Collision.populateCollisions(room);
                Room.update(room);
            }
        }
    }
    draw() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        const currentRoom = this.rooms[this.currentRoom];
        Room.draw(this.ctx,currentRoom);
    }

}
export {Game}
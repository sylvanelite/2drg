
import { KeyboardAndMouseInputReader } from "./inputController.mjs";
import { NetplayInput, NetplayState } from "./netPeer/netplayInput.mjs";
import { idxToXy,CONTROLS,EntityKind,PRNG,EuqippedKind, xyToIdx } from "./types.mjs";
import { Entity,Collision } from "./Entity.mjs";
import { Room } from "./Room.mjs";
import { TERRAIN_WIDTH,TERRAIN_HEIGHT, Terrain } from "./Terrain.mjs";
import { ConvChain } from "./ConvChain.mjs";
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
            const terr = Array(r.terrain.terrain.length);
            for(let i=0;i<r.terrain.terrain.length;i+=1){
                terr[i] = r.terrain.terrain[i];
            }
            const rSerial = {
                idx:r.idx,
                x:r.x,
                y:r.y,
                players:Array.from(r.players),
                maxEntities:r.maxEntities,
                ents,
                terr
            };
            //if(r.players.size>0){//TODO: serialise only if needed? 
            rooms.push(rSerial);
            //}
        }
        return {
            currentRoom:this.currentRoom,
            EnityUid:Entity.uid,
            rooms,
            //these shouldn't change after init(), so don't need to be serialised
            //playerUid:this.playerUid,
            //worldWidth:this.worldWidth,
            //tickRate:this.tickRate
            RNG_A:PRNG.RNG_A,
            RNG_B:PRNG.RNG_B,
            RNG_C:PRNG.RNG_C,
            RNG_D:PRNG.RNG_D,
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
            for(let i=0;i<tgt.terrain.terrain.length;i+=1){
                tgt.terrain.terrain[i] = r.terr[i];//assumes w/h/length are correct
            }
        }
        PRNG.RNG_A = value.RNG_A;
        PRNG.RNG_B = value.RNG_B;
        PRNG.RNG_C = value.RNG_C;
        PRNG.RNG_D = value.RNG_D;
    }

    inputReader:KeyboardAndMouseInputReader;
    ctx:CanvasRenderingContext2D;
    rooms:Array<Room>;
    currentRoom:number;//room for the local player
    worldSize:number;
    playerUid:number;
    tickRate:number;//time until the next update() is called
    constructor(canvas:HTMLCanvasElement) {
        super();
        this.tickRate = 30/1000;
        this.ctx = canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled= false;
        this.inputReader = new KeyboardAndMouseInputReader(canvas);
        this.rooms = [];
        this.worldSize = 12;
    }
    init(playerId:number,playerCount:number){
        Entity.uid = 0;//reset the ID count so that playerIds are kept in sync
        //note:bindings is a bitmask, should cap at ~32 
        this.inputReader.bindings.set('ArrowRight', CONTROLS.RIGHT);
        this.inputReader.bindings.set('ArrowLeft', CONTROLS.LEFT);
        this.inputReader.bindings.set('ArrowUp', CONTROLS.JUMP);
        this.inputReader.bindings.set('KeyD', CONTROLS.RIGHT);
        this.inputReader.bindings.set('KeyA', CONTROLS.LEFT);
        this.inputReader.bindings.set('KeyW', CONTROLS.JUMP);
        this.inputReader.bindings.set('Space', CONTROLS.MINE);
        this.inputReader.bindings.set('mouse_0', CONTROLS.SHOOT);
        this.inputReader.bindings.set('ArrowDown', CONTROLS.MINE);
        this.inputReader.bindings.set('KeyS', CONTROLS.MINE);
        //set up rooms
        for(let i=0;i<this.worldSize;i+=1){
            for(let j=0;j<this.worldSize;j+=1){
                const r = new Room();
                r.idx = this.rooms.length;
                const [x,y] = idxToXy(r.idx,this.worldSize);
                r.x = x;
                r.y = y;
                r.terrain = new Terrain();
                this.rooms.push(r);
            }
        }
        //set up terrain
        const sample = new Uint8Array([
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,1,0,0,0,1,1,0,1,1,1,0,0,
            0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,
            0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,
            0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,
            0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,
            0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,
            0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
            0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,
            0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,
            0,0,0,1,1,1,1,1,1,1,0,0,1,0,0,0,
            0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,0,
            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
        ]);
        const conv = new ConvChain(sample);
        const dims = 8;//scale factor, convChain will be scaled up to blocks of this size
        const generated = conv.generate(
                (this.worldSize*TERRAIN_WIDTH)/dims,
                (this.worldSize*TERRAIN_HEIGHT)/dims,
                3,2,6);
        for(const r of this.rooms){
            r.terrain = new Terrain();
            //first pass, fill in solid terrain
            for(let x=0;x<r.terrain.width;x+=dims){
                for(let y=0;y<r.terrain.height;y+=dims){
                    const generated_x = r.x*r.terrain.width/dims+x/dims;
                    const generated_y = r.y*r.terrain.height/dims+y/dims;
                    const idx = xyToIdx(generated_x,generated_y, (this.worldSize*TERRAIN_WIDTH)/dims);
                    if(generated[idx]==1){
                        Terrain.fillRect(r.terrain,x,y,dims,dims);
                    }
                }
            }
            //second pass, smooth out edges
            //needs to be done in 2 passes, otherwise fillRect will re-fill cleared terrain on the right with sharp edges
            for(let x=0;x<r.terrain.width;x+=dims){
                for(let y=0;y<r.terrain.height;y+=dims){
                    const generated_x = r.x*r.terrain.width/dims+x/dims;
                    const generated_y = r.y*r.terrain.height/dims+y/dims;
                    const idx = xyToIdx(generated_x,generated_y, (this.worldSize*TERRAIN_WIDTH)/dims);
                    if(generated[idx]==0){
                        Terrain.clearCircle(r.terrain,
                            Math.floor(x+PRNG.prng()*8),
                            Math.floor(y+PRNG.prng()*8),
                            Math.floor(10+PRNG.prng()*20));
                    }
                }
            }
        }
        //set up objects
        this.currentRoom = this.worldSize+Math.floor(this.worldSize/2);//start 1/2 down the second row
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
            //TODO: real init...
            //enemies (NOTE: should probably be generated via events/waves)
            const eCount = 1+Math.floor(PRNG.prng()*3);
            for(let i=0;i<eCount;i+=1){
                const enemy = new Entity();
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
            //resources
            const rCount = 1+Math.floor(PRNG.prng()*6);
            for(let i=0;i<rCount;i+=1){
                const resource = new Entity();
                resource.kind = EntityKind.Resource;
                const resources = [
                    EuqippedKind.RESOURCE_BISMORE_BOTTOM,
                    EuqippedKind.RESOURCE_CROPPA_BOTTOM,
                    EuqippedKind.RESOURCE_NITRA_BOTTOM,
                    EuqippedKind.RESOURCE_RED_SUGAR_BOTTOM,
                    EuqippedKind.RESOURCE_GOLD_BOTTOM
                ];
                resource.euqipped = resources[Math.floor(resources.length*PRNG.prng())];
                resource.sprite = resource.euqipped;
                resource.position.x=Math.floor(PRNG.prng()*r.terrain.width);
                resource.position.y=Math.floor(PRNG.prng()*r.terrain.height);
                //grow resource height +1
                if(PRNG.prng()>0.6){
                    const grow = new Entity();
                    grow.kind = EntityKind.Resource;
                    if(resource.euqipped == EuqippedKind.RESOURCE_BISMORE_BOTTOM){
                        grow.euqipped = EuqippedKind.RESOURCE_BISMORE_TOP;
                    }
                    if(resource.euqipped == EuqippedKind.RESOURCE_CROPPA_BOTTOM){
                        grow.euqipped = EuqippedKind.RESOURCE_CROPPA_TOP;
                    }
                    if(resource.euqipped == EuqippedKind.RESOURCE_NITRA_BOTTOM){
                        grow.euqipped = EuqippedKind.RESOURCE_NITRA_TOP;
                    }
                    if(resource.euqipped == EuqippedKind.RESOURCE_RED_SUGAR_BOTTOM){
                        grow.euqipped = EuqippedKind.RESOURCE_RED_SUGAR_TOP;
                    }
                    if(resource.euqipped == EuqippedKind.RESOURCE_GOLD_BOTTOM){
                        grow.euqipped = EuqippedKind.RESOURCE_GOLD_TOP;
                    }
                    grow.sprite = grow.euqipped;
                    grow.position.x=resource.position.x;
                    grow.position.y=resource.position.y-resource.size.y;
                    Room.AddEntity(r,grow);
                }
                Room.AddEntity(r,resource);
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
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0,0,this.ctx.canvas.width, this.ctx.canvas.height);
        const currentRoom = this.rooms[this.currentRoom];
        Room.draw(this.ctx,currentRoom);
    }

}
export {Game}
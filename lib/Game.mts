
import { KeyboardAndMouseInputReader } from "./inputController.mjs";
import { NetplayInput, NetplayState } from "./netPeer/netplayInput.mjs";
import { idxToXy,CONTROLS,EntityKind,PRNG,EuqippedKind, xyToIdx } from "./types.mjs";
import { Entity,Collision } from "./Entity.mjs";
import { Room } from "./Room.mjs";
import { TERRAIN_WIDTH,TERRAIN_HEIGHT, Terrain } from "./Terrain.mjs";
import { ConvChain } from "./ConvChain.mjs";
import { PlayerConfig, PlayerLiveCount } from "./Config/PlayerConfig.mjs";
import { ResourceConfig,ResourceLiveCount } from "./Config/ResourceConfig.mjs";
import { UI } from "./UI.mjs";
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
                    secondaryCooldown:e.secondaryCooldown,
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
                lock_L:r.locked_L,
                lock_R:r.locked_R,
                lock_U:r.locked_U,
                lock_D:r.locked_D,
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
        const resources = {
            bismore:this.resourceLiveCount.bismore,
            croppa:this.resourceLiveCount.croppa,
            nitra:this.resourceLiveCount.nitra,
            gold:this.resourceLiveCount.gold, 
            egg:this.resourceLiveCount.egg,
            aquarq:this.resourceLiveCount.aquarq,
            fossil:this.resourceLiveCount.fossil,
        };
        const players = [];
        for(const [uid,player] of this.playerLiveCount){
            players.push({
                uid,
                roomId :player.roomId,
                roomIdx:player.roomIdx,
                reviveCount:player.reviveCount
            });
        }
        return {
            currentRoom:this.currentRoom,
            EnityUid:Entity.uid,
            rooms,
            //these shouldn't change after init(), so don't need to be serialised
            //playerUid:this.playerUid,
            //worldWidth:this.worldWidth,
            //tickRate:this.tickRate
            //playerConfig
            //missionConfig
            resources,
            players,
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
            tgt.locked_L = r.lock_L;
            tgt.locked_R = r.lock_R;
            tgt.locked_U = r.lock_U;
            tgt.locked_D = r.lock_D;
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
                ent.secondaryCooldown=e.secondaryCooldown;
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
        this.resourceLiveCount.bismore = value.resources.bismore;
        this.resourceLiveCount.croppa = value.resources.croppa;
        this.resourceLiveCount.nitra = value.resources.nitra;
        this.resourceLiveCount.gold = value.resources.gold; 
        this.resourceLiveCount.egg = value.resources.egg;
        this.resourceLiveCount.aquarq = value.resources.aquarq;
        this.resourceLiveCount.fossil = value.resources.fossil;
        for(const p of value.players){
            const cfg = this.playerLiveCount.get(p.uid);
            cfg.roomId = p.roomId;
            cfg.roomIdx= p.roomIdx;
            cfg.reviveCount= p.reviveCount;
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
    playerConfig:Map<number,PlayerConfig>;
    missionConfig:ResourceConfig;
    resourceLiveCount:ResourceLiveCount;
    playerLiveCount:Map<number,PlayerLiveCount>;
    constructor(canvas:HTMLCanvasElement) {
        super();
        this.tickRate = 40;//time between ticks, i.e. 1000/this.tickRate = fps
        this.ctx = canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled= false;
        this.inputReader = new KeyboardAndMouseInputReader(canvas);
        this.rooms = [];
        this.worldSize = 12;
        this.playerConfig = new Map();
        this.missionConfig = new ResourceConfig();
        this.resourceLiveCount = new ResourceLiveCount();
        this.playerLiveCount = new Map();
    }
    init(playerId:number,players:Array<PlayerConfig>,mission:ResourceConfig){
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
        //set up objectives
        this.missionConfig = mission;
        PRNG.prng(mission.seed);
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
        //NOTE: players MUST be the first entities created
        //      RB is assuming that ids start from 0, and the UIDs assigned must therefore also start from 0 
        for(let i=0;i<players.length;i+=1){
            const playerEntity = new Entity();
            playerEntity.hp = playerEntity.maxHp;
            playerEntity.kind = EntityKind.Player;
            playerEntity.position.x=Math.floor(startingRoom.terrain.width/2);
            playerEntity.position.y=Math.floor(startingRoom.terrain.height/4);
            if(playerEntity.uid == playerId){
                //note: 'if' is not really needed. Could instead write this.playerUid = playerId outside the loop
                //the 'if' is really only used so that in case the entity is NOT created, 
                //unit tests can detect this and fail their assert
                this.playerUid = playerEntity.uid;
            }
            this.playerConfig.set(playerEntity.uid,players[i]);
            playerEntity.euqipped = EuqippedKind.WEAPON_FLAMETHROWER;
            if(players[i].chosenClass == PlayerConfig.CLASSES.DRILLER){
                playerEntity.euqipped = EuqippedKind.WEAPON_FLAMETHROWER;
            }
            if(players[i].chosenClass == PlayerConfig.CLASSES.SCOUT){
                playerEntity.euqipped = EuqippedKind.WEAPON_SNIPER;
            }
            if(players[i].chosenClass == PlayerConfig.CLASSES.ENGINEER){
                playerEntity.euqipped = EuqippedKind.WEAPON_SHOTGUN;
            }
            if(players[i].chosenClass == PlayerConfig.CLASSES.GUNNER){
                playerEntity.euqipped = EuqippedKind.WEAPON_MACHINEGUN;
            }
            const playerLive = new PlayerLiveCount();//will be populated on add()
            this.playerLiveCount.set(playerEntity.uid,playerLive);
            Room.AddEntity(startingRoom,playerEntity);
        }
        const startingResource = new Entity();//for testing, triggers wave
        startingResource.kind = EntityKind.Resource;
        startingResource.euqipped = EuqippedKind.RESOURCE_EGG;
        startingResource.position.x=Math.floor(startingRoom.terrain.width/2);
        startingResource.position.y=Math.floor(startingRoom.terrain.height/2);
        startingResource.hp=100;
        Room.AddEntity(startingRoom,startingResource);
        //enemies
        let primaryCount = 0;
        let secondaryCount = 0;
        /*
        this.chosenPrimary= ResourceConfig.PRIMARY_OBJECTIVE.MINING_EXPEDITION;
        this.chosenSecondary= ResourceConfig.SECONDARY_OBJECTIVE.FOSSIL; */
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
                    EuqippedKind.RESOURCE_GOLD_BOTTOM,
                    
                    EuqippedKind.RESOURCE_EGG,
                    EuqippedKind.RESOURCE_AQUARQ,
                    EuqippedKind.RESOURCE_FOSSIL,
                ];
                resource.euqipped = resources[Math.floor(resources.length*PRNG.prng())];
                resource.sprite = resource.euqipped;
                resource.position.x=Math.floor(PRNG.prng()*r.terrain.width);
                resource.position.y=Math.floor(PRNG.prng()*r.terrain.height);
                resource.hp=100;
                if(mission.chosenPrimary==ResourceConfig.PRIMARY_OBJECTIVE.MINING_EXPEDITION){
                    if(resource.euqipped == EuqippedKind.RESOURCE_BISMORE_BOTTOM||
                        resource.euqipped == EuqippedKind.RESOURCE_BISMORE_TOP){
                            primaryCount+=1;
                    }
                }
                if(mission.chosenPrimary==ResourceConfig.PRIMARY_OBJECTIVE.EGG_HUNT){
                    if(resource.euqipped == EuqippedKind.RESOURCE_EGG){
                            primaryCount+=1;
                    }
                }
                if(mission.chosenPrimary==ResourceConfig.PRIMARY_OBJECTIVE.POINT_EXTRACTION){
                    if(resource.euqipped == EuqippedKind.RESOURCE_AQUARQ){
                            primaryCount+=1;
                    }
                }
                if(mission.chosenSecondary==ResourceConfig.SECONDARY_OBJECTIVE.FOSSIL){
                    if(resource.euqipped == EuqippedKind.RESOURCE_FOSSIL){
                            secondaryCount+=1;
                    }
                }
                //grow resource height +1
                if(PRNG.prng()>0.6 && resource.euqipped!= EuqippedKind.RESOURCE_EGG
                                   && resource.euqipped!= EuqippedKind.RESOURCE_AQUARQ
                                   && resource.euqipped!= EuqippedKind.RESOURCE_FOSSIL){
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
                    if(mission.chosenPrimary==ResourceConfig.PRIMARY_OBJECTIVE.MINING_EXPEDITION){
                        if(grow.euqipped == EuqippedKind.RESOURCE_BISMORE_BOTTOM||
                            grow.euqipped == EuqippedKind.RESOURCE_BISMORE_TOP){
                                primaryCount+=1;
                        }
                    }
                    grow.sprite = grow.euqipped;
                    grow.position.x=resource.position.x;
                    grow.position.y=resource.position.y-resource.size.y;
                    grow.hp = 100;
                    Room.AddEntity(r,grow);
                }
                Room.AddEntity(r,resource);
            }
        }
        //ensure missionscan be cleared
        for(let i=primaryCount;i<mission.goalPrimary+3;i+=1){//+3 so there's a bit exta
            const rIdx = Math.floor(PRNG.prng()*this.rooms.length);
            const r = this.rooms[rIdx];
            const resource = new Entity();
            resource.kind = EntityKind.Resource;
            if(mission.chosenPrimary==ResourceConfig.PRIMARY_OBJECTIVE.MINING_EXPEDITION){
                resource.euqipped = EuqippedKind.RESOURCE_BISMORE_BOTTOM;
            }
            if(mission.chosenPrimary==ResourceConfig.PRIMARY_OBJECTIVE.EGG_HUNT){
                resource.euqipped = EuqippedKind.RESOURCE_EGG;
            }
            if(mission.chosenPrimary==ResourceConfig.PRIMARY_OBJECTIVE.POINT_EXTRACTION){
                resource.euqipped = EuqippedKind.RESOURCE_AQUARQ;
            }
            resource.sprite = resource.euqipped;
            resource.position.x=Math.floor(PRNG.prng()*r.terrain.width);
            resource.position.y=Math.floor(PRNG.prng()*r.terrain.height);
            resource.hp=100;
            Room.AddEntity(r,resource);
        }
        //ensure secondary missions can be cleared
        for(let i=secondaryCount;i<mission.goalSecondary+3;i+=1){//+3 so there's a bit exta
            const rIdx = Math.floor(PRNG.prng()*this.rooms.length);
            const r = this.rooms[rIdx];
            const resource = new Entity();
            resource.kind = EntityKind.Resource;
            if(mission.chosenSecondary==ResourceConfig.SECONDARY_OBJECTIVE.FOSSIL){
                resource.euqipped = EuqippedKind.RESOURCE_FOSSIL;
            }
            resource.sprite = resource.euqipped;
            resource.position.x=Math.floor(PRNG.prng()*r.terrain.width);
            resource.position.y=Math.floor(PRNG.prng()*r.terrain.height);
            resource.hp=100;
            Room.AddEntity(r,resource);
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
        UI.draw(this.ctx);
    }

}
export {Game}
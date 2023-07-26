
import { KeyboardAndMouseInputReader } from "./inputController.mjs";
import { NetplayInput, NetplayState } from "./netPeer/types.mjs";

//https://burtleburtle.net/bob/rand/smallprng.html (I wrote this PRNG. I place it in the public domain. )
//https://github.com/bryc/code/blob/master/jshash/PRNGs.md (License: Public domain. )
//https://gist.github.com/imneme/85cff47d4bad8de6bdeb671f9c76c814 - The MIT License (MIT)
//JSF / smallprng
// 3-rotate version, improves randomness.

class PRNG{
	static RNG_A=42;//TODO: remove from beind global
	static RNG_B=1234;
	static RNG_C=5678;
	static RNG_D=9001;

	static prng(seed:number=null){
		if(seed){
			PRNG.RNG_A=seed;
			PRNG.RNG_B=seed*10;
			PRNG.RNG_C=seed*100;
			PRNG.RNG_D=seed*1000;
		}
		PRNG.RNG_A |= 0; PRNG.RNG_B |= 0; PRNG.RNG_C |= 0; PRNG.RNG_D |= 0;
		const t = PRNG.RNG_A - (PRNG.RNG_B << 23 | PRNG.RNG_B >>> 9) | 0;
		PRNG.RNG_A = PRNG.RNG_B ^ (PRNG.RNG_C << 16 | PRNG.RNG_C >>> 16) | 0;
		PRNG.RNG_B = PRNG.RNG_C + (PRNG.RNG_D << 11 | PRNG.RNG_D >>> 21) | 0;
		PRNG.RNG_B = PRNG.RNG_C + PRNG.RNG_D | 0;
		PRNG.RNG_C = PRNG.RNG_D + t | 0;
		PRNG.RNG_D = PRNG.RNG_A + t | 0;
		
		return (PRNG.RNG_D >>> 0) / 4294967296;//remove divide to make an int instead of float?
	}
}


//https://stackoverflow.com/questions/664014/what-integer-hash-function-are-good-that-accepts-an-integer-hash-key
const hash = function (x:number) {
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = (x >> 16) ^ x;
    return x;
};

//collision detection algorithm:
//hold a bunch of buckets. For each element, hash their X,Y with an avalance function to get a bucket
//insert that element ID into its bucket, scanning through to see if there's anything else in it
//each frame, the buckets need to be cleared.
//to do this, let the buckets grow indefinitely (capped by max elemes in scene), but reset by just updating an 'end' pointer
//this gives O(1) clearing, and means allocation/memory pressure is reduced
//the number of bins needed depends on number of elements in scene and the quality of the hash function
class CacheArray{
    #backingArray:Array<number> = [];
    #length:number = 0;
    clear(){ this.#length = 0; }
    push(elem:number){
        if(this.#backingArray.length==this.#length){
            this.#backingArray.push(elem);//no more space, grow
        }else{
            this.#backingArray[this.#length] = elem;//space exists, insert
        }
        this.#length+=1;
    }
    get length(){return this.#length; }
    get(idx:number){return this.#backingArray[idx];}
}
//pre-bake collision cells
class CollisionCells {
    static get hashLength(){
        return 512;
    }
    //map of collision type->collision
    static collisionCells:Array<CacheArray> = null;
    static clear(){
        for(const cells of CollisionCells.collisionCells){
            cells.clear();
        }
    }
    static init(){//init is called at the end of this file, it's not dependent on game state to work
        CollisionCells.collisionCells = [];
        for(let i=0;i<CollisionCells.hashLength;i+=1){
            CollisionCells.collisionCells.push(new CacheArray());
        }
    }
}
CollisionCells.init();

//collision class is for entity-entity collisions
class Collision {
    static cellSize = 32;
    static preExecute(){
        CollisionCells.clear();
	}
	static populateCollisions(room:Room){
		// Insert all entities into a spatial hash and check them against any
		// other entity that already resides in the same cell. Entities that are
		// bigger than a single cell, are inserted into each one they intersect
		// with.

		// A list of entities, which the current one was already checked with,
		// is maintained for each entity.
		
		// Skip entities that don't check, don't get checked and don't collide
        for(let i=room.maxEntities-1;i>=0;i-=1){
            const ent = room.entities[i];   
            const xmin = Math.floor(ent.position.x / Collision.cellSize);
            const ymin = Math.floor(ent.position.y / Collision.cellSize);
            const xmax = Math.floor((ent.position.x + ent.size.x) / Collision.cellSize) + 1;
            const ymax = Math.floor((ent.position.y + ent.size.y) / Collision.cellSize) + 1;
            for (let x = xmin; x < xmax; x++) {
                for (let y = ymin; y < ymax; y++) {
                    const key = ((hash(x)%CollisionCells.hashLength)+hash(y))%CollisionCells.hashLength;
                    const hashCell =CollisionCells.collisionCells[key];
                    hashCell.push(ent.roomId);
                } // end for y size
            } // end for x size
        }
	}
    static touches(entity:Entity, other:Entity) {
        return !(
            entity.position.x >=other.position.x + other.size.x ||
            entity.position.x + entity.size.x <= other.position.x ||
            entity.position.y >= other.position.y + other.size.y ||
            entity.position.y + entity.size.y <= other.size.y
        )
    }
	static checkCollisions(room:Room,entity:Entity,collideCallback:Function){
        //use a set to prevent duplicates across cell bounds
        //e.g. if A and B are overlapping 2 cells then collision will trigger for each cell
        //     set stores results before triggering to ensure results are unique
        const collisionResults = new Set<number>();

        const xmin = Math.floor(entity.position.x / Collision.cellSize);
        const ymin = Math.floor(entity.position.y / Collision.cellSize);
        const xmax = Math.floor((entity.position.x + entity.size.x) / Collision.cellSize) + 1;
        const ymax = Math.floor((entity.position.y + entity.size.y) / Collision.cellSize) + 1;
        for (let x = xmin; x < xmax; x++) {
            for (let y = ymin; y < ymax; y++) {
                const key = ((hash(x)%CollisionCells.hashLength)+hash(y))%CollisionCells.hashLength;
                const hashCell = CollisionCells.collisionCells[key];
                    for (let i=0;i<hashCell.length;i+=1) {
                        const otherId = hashCell.get(i);
                        if(entity.roomId==otherId){continue;}
                        const other = room.entities[otherId];
                        // Intersection test needed and trigger callback if found
                        if (Collision.touches(entity, other) ) {
                            collisionResults.add(otherId);
                        }
                    }
                }
            }
        for(const collision of collisionResults){
            collideCallback(collision);
        }
	}
	
}

CollisionCells.init();
/*
TODO:
mobs, peer, rollback, bullets,
movement that doesn't snap Y
input per player
mouse aiming
test cases
better rendering
UI
terrain generation
*/

const CONTROLS={
    LEFT:1,
    RIGHT:2,
    JUMP:3,
    SHOOT:4
};
enum EntityKind{
    Player = 1,
    Enemy = 10,
    Bullet = 100,
    Resource = 1000,
}
enum EuqippedKind{
    WEAPON_FLAMETHROWER=1,
    WEAPON_PIERCE=2,
    WEAPON_MACHINEGUN=3,

    ENEMY_GRUNT=10,
    ENEMY_WINGED=11,

    MINERAL_HP=100,
    MINERAL_RESOURCE_1=101
}
class Entity{
    static uid=0;
    uid:number;//globally unique id, preserved across room boundaries
    roomId:number;//index location in the room array, changes with room operations: insert/delete/move
    kind:EntityKind;//how the entity is controlled
    euqipped:EuqippedKind;//subtype, e.g. player class, bullet type, enemy type
    hp:number;
    maxHp:number;
    cooldown:number;//TODO: other vars, ammo, etc
    sprite:number;
    spriteFrame:number;
    position:{x:number,y:number};
    velocity:{x:number,y:number};
    size:{x:number,y:number};
    constructor(){
        this.uid = Entity.uid;
        Entity.uid+=1;
        this.roomId=0;
        this.kind = EntityKind.Enemy;
        this.hp=0;
        this.maxHp=100;
        this.cooldown=0;
        this.sprite=0;
        this.spriteFrame=0;
        this.position={x:0,y:0};
        this.velocity={x:0,y:0};
        this.size={x:10,y:20};
    }
    static update(room:Room,entity:Entity){
        //TODO:options for all ent.kind
        if(entity.kind == EntityKind.Player){
            Entity.updateCharacter(room,entity);
        }
        if(entity.kind == EntityKind.Bullet){
            Entity.updateBullet(room,entity);
        }
        if(entity.kind == EntityKind.Enemy){
            Entity.updateEnemy(room,entity);
        }
    }
    static draw(ctx:CanvasRenderingContext2D,entity:Entity){
        //TODO:ent.kind
        if(entity.kind == EntityKind.Player){
            ctx.fillStyle = "#FF0000";
        }
        if(entity.kind == EntityKind.Bullet){
            ctx.fillStyle = "#000000";
            if(entity.euqipped==EuqippedKind.WEAPON_FLAMETHROWER){
                ctx.fillStyle = "#FFA366";
            }
        }
        if(entity.kind == EntityKind.Enemy){
            ctx.fillStyle = "#0000FF";
            if(entity.euqipped == EuqippedKind.ENEMY_WINGED){
                ctx.fillStyle = "#54D7FF";
            }
        }
        if(entity.kind == EntityKind.Resource){
            ctx.fillStyle = "#FF00FF";
        }
        ctx.fillRect(entity.position.x,entity.position.y,entity.size.x,entity.size.y);
    }
    static updateCharacter(room:Room,entity:Entity) {
        const controls =Game.inputs.get(entity.uid);
        let i = 0;
        for (i = 0; i < 3; i+=1) {    
            if ( NetplayInput.getPressed(controls,CONTROLS.LEFT)) {
                if (!Terrain.hitTest(room.terrain, entity.position.x , entity.position.y, 1, 1)) {
                    entity.position.x -= 1;
                }
                while (Terrain.hitTest(room.terrain, entity.position.x, entity.position.y + 20, 10, 1)) {
                    entity.position.y -= 1;
                }
            }
            if (NetplayInput.getPressed(controls,CONTROLS.RIGHT)) {
                if (!Terrain.hitTest(room.terrain, entity.position.x + 10, entity.position.y, 1, 1)) {
                    entity.position.x += 1;
                }
                while (Terrain.hitTest(room.terrain, entity.position.x, entity.position.y + 20, 10, 1)) {
                    entity.position.y -= 1;
                }
            }
        }
        if (NetplayInput.getPressed(controls,CONTROLS.JUMP)) {
            entity.velocity.y = -10;
            //gameInstance.jumping = true;//TODO: fix jumping
        }
        entity.velocity.y+=1; //is this going to work prooperly?
        if (entity.velocity.y > 0) {
            //check ground
            for (i = 0; i < entity.velocity.y; i+=1) {
                if (!Terrain.hitTest(room.terrain, entity.position.x, entity.position.y + 20, 10, 1)) {
                    entity.position.y += 1;
                } else {
                    //gameInstance.jumping = false;//TODO: fix jumping
                    entity.velocity.y = 0;
                }
            }
        } else {
            for (i = 0; i < Math.abs(entity.velocity.y); i+=1) {
                if (!Terrain.hitTest(room.terrain, entity.position.x, entity.position.y, 10, 1)) {
                    entity.position.y -= 1;
                } else {
                    entity.velocity.y = 0;
                }
            }
        }
        //move between rooms, going off one side means going onto another
        const buffer = 3;
        if(entity.position.x<0 && room.x>0){
            const idx = xyToIdx(room.x-1,room.y,gameInstance.worldWidth);
            const targetRoom = gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.x=room.terrain.width-entity.size.x-buffer;
            if(entity.uid==gameInstance.playerUid){ gameInstance.currentRoom = idx; }
        }
        if(entity.position.x+entity.size.x > room.terrain.width&& room.x<gameInstance.worldWidth-1){
            const idx = xyToIdx(room.x+1,room.y,gameInstance.worldWidth);
            const targetRoom = gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.x=buffer;
            if(entity.uid==gameInstance.playerUid){ gameInstance.currentRoom = idx; }
        }
        if(entity.position.y<0 && room.y>0){
            const idx = xyToIdx(room.x,room.y-1,gameInstance.worldWidth);
            const targetRoom = gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.y=room.terrain.height-entity.size.y-buffer;
            if(entity.uid==gameInstance.playerUid){ gameInstance.currentRoom = idx; }
        }
        if(entity.position.y+entity.size.y > room.terrain.height&& room.y<gameInstance.worldWidth-1){
            const idx = xyToIdx(room.x,room.y+1,gameInstance.worldWidth);
            const targetRoom = gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.y =buffer;
            if(entity.uid==gameInstance.playerUid){ gameInstance.currentRoom = idx; }
        }
        //==shooting (TODO: spawn bullet & bresenham)
        if(entity.cooldown>0){//canshoot
            entity.cooldown-=1;
        }
        if (controls.mousePosition&& NetplayInput.getPressed(controls,CONTROLS.SHOOT) ) {
            if(entity.cooldown==0){//canshoot
                const mousePos =controls.mousePosition;
                const bulletEntity = new Entity();//TODO: real init...
                bulletEntity.kind = EntityKind.Bullet;
                bulletEntity.euqipped = entity.euqipped;//bullet type match the weapon that shot it
                bulletEntity.size.x = 2;
                bulletEntity.size.y = 2;
                bulletEntity.position.x = entity.position.x;
                bulletEntity.position.y = entity.position.y;
                const aimingAngleRads = Math.atan2(mousePos.y-entity.position.y,mousePos.x-entity.position.x) ;//* 180 / Math.PI to get deg
                switch(entity.euqipped){
                    case EuqippedKind.WEAPON_FLAMETHROWER:
                        entity.cooldown = 1;//cooldown 
                        bulletEntity.hp = 1;//damage
                        bulletEntity.cooldown = 20;//bullet lifetime
                        //TODO: spread...
                        bulletEntity.velocity.x = Math.cos(aimingAngleRads)*5;//speed
                        bulletEntity.velocity.y = Math.sin(aimingAngleRads)*5;//speed
                        Room.AddEntity(room,bulletEntity);
                        break;
                    case EuqippedKind.WEAPON_MACHINEGUN:
                        entity.cooldown = 5;//cooldown 
                        bulletEntity.hp = 5;//damage
                        bulletEntity.cooldown = 100;//bullet lifetime
                        bulletEntity.velocity.x = Math.cos(aimingAngleRads)*10;//speed
                        bulletEntity.velocity.y = Math.sin(aimingAngleRads)*10;//speed
                        Room.AddEntity(room,bulletEntity);
                        break;
                    case EuqippedKind.WEAPON_PIERCE:
                        entity.cooldown = 50;//cooldown 
                        bulletEntity.hp = 50;//damage
                        bulletEntity.cooldown = 100;//bullet lifetime
                        bulletEntity.velocity.x = Math.cos(aimingAngleRads)*10;//speed
                        bulletEntity.velocity.y = Math.sin(aimingAngleRads)*10;//speed
                        Room.AddEntity(room,bulletEntity);
                        break;
                }
            }
        }

    }
    
    static updateBullet(room:Room,entity:Entity) {
        //bresenham
        //https://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
        let x1 = entity.position.x;
        let y1 = entity.position.y;
        const x2 = x1+Math.ceil(entity.velocity.x);
        const y2 = y1+Math.ceil(entity.velocity.y);
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? 1 : -1;
        const sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;
        // Main loop
        while (!((x1 == x2) && (y1 == y2))) {
            var e2 = err << 1;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
            //update coordinates
            //TODO: if solid.... (if need to check terrain...)
            entity.position.x = x1;
            entity.position.y = y1;
            if (Terrain.hitTest(room.terrain, entity.position.x, entity.position.y, entity.size.x, entity.size.y)) {
                Entity.destroyBullet(room,entity);
                break;
            }
        }
        if(entity.position.x<0||entity.position.x>room.terrain.width||
            entity.position.y<0||entity.position.y>room.terrain.height){
            Room.RemoveEntity(room,entity);//if going out of bounds, remove without destroy (explode)
        }
        entity.cooldown-=1;
        if(entity.cooldown<0){
            Room.RemoveEntity(room,entity);//bullet timed out
        }
    }
    static destroyBullet(room:Room,entity:Entity){
        if(entity.euqipped == EuqippedKind.WEAPON_FLAMETHROWER){
            Terrain.clearCircle(room.terrain,entity.position.x,entity.position.y,30);
        }
        if(entity.euqipped == EuqippedKind.WEAPON_MACHINEGUN){
            Terrain.clearCircle(room.terrain,entity.position.x,entity.position.y,30);
        }
        if(entity.euqipped == EuqippedKind.WEAPON_PIERCE){
            Terrain.clearCircle(room.terrain,entity.position.x,entity.position.y,30);
        }
        Room.RemoveEntity(room,entity);
    }
    static updateEnemy(room:Room,entity:Entity){
        //collision check for bullets
        Collision.checkCollisions(room,entity,(collisionId:number)=>{
            const ent = room.entities[collisionId];
            if(ent.kind == EntityKind.Bullet){
                //bullet collide
                entity.hp-=ent.hp;
                if(ent.euqipped == EuqippedKind.WEAPON_MACHINEGUN){
                    Room.RemoveEntity(room,ent);//for type=machinegun, destroy bullet on collide
                }
            }
        });
        if(entity.hp<1){
            Room.RemoveEntity(room,entity);
        }
        if(entity.cooldown==0){
            //TODO: cooldown==0, do attack
            entity.cooldown+=30;//TODO: add a random amount
        }
        //update AI
        let tgtX = entity.position.x;
        let tgtY = entity.position.y;
        for(const pid of room.players){
            tgtX = room.entities[pid].position.x+Math.floor(entity.size.x/2);
            tgtY = room.entities[pid].position.y;
        }
        //movement, if overlapping terrain, move slower
        let moveSpeed = 1;
        if (Terrain.hitTest(room.terrain, entity.position.x, entity.position.y, entity.size.x, entity.size.y)) {
            moveSpeed = 0.2;
        }
        if(entity.euqipped == EuqippedKind.ENEMY_GRUNT){
            //linear move towards
            if(tgtX<entity.position.x){
                entity.position.x-=moveSpeed;
            }
            if(tgtX>entity.position.x){
                entity.position.x+=moveSpeed;
            }
            if(tgtY<entity.position.y){
                entity.position.y-=moveSpeed;
            }
            if(tgtY>entity.position.y){
                entity.position.y+=moveSpeed;
            }
        }
        if(entity.euqipped == EuqippedKind.ENEMY_WINGED){
            //linear move towards, but stay at current Y
            
            if(tgtX<entity.position.x){
                entity.position.x-=moveSpeed;
            }
            if(tgtX>entity.position.x){
                entity.position.x+=moveSpeed;
            }
            if(tgtY<entity.position.y){
                entity.position.y-=moveSpeed;
            }
            if(tgtY>entity.position.y){
                entity.position.y+=moveSpeed;
            }
        }
    }
    static apply(source:Entity,destination:Entity){
        //copies one entitie's values into another
        destination.roomId = source.roomId;
        destination.uid=source.uid;
        destination.roomId=source.roomId;
        destination.kind=source.kind;
        destination.euqipped=source.euqipped;
        destination.hp=source.hp;
        destination.maxHp=source.maxHp;
        destination.cooldown=source.cooldown;
        destination.sprite=source.sprite;
        destination.spriteFrame=source.spriteFrame;
        destination.position.x=source.position.x;
        destination.position.y=source.position.y;
        destination.velocity.x=source.velocity.x;
        destination.velocity.y=source.velocity.y;
        destination.size.x=source.size.x;
        destination.size.y=source.size.y;
    }
}
class Room{
    idx:number;
    x:number;
    y:number;
    entities:Array<Entity>;
    maxEntities:number;
    terrain:Terrain;
    players:Set<number>;//record which players are in the room for fast lookup
    static MAX_ENTIES = 500;
    constructor(){
        this.entities = [];
        this.maxEntities = 0;
        this.players = new Set();
    }
    static MoveEntity(startRoom:Room,endRoom:Room,entity:Entity){
        //note: if moving in one direction, 
        //can be processed multiple times per frame depending on how rooms are sweept in update() 
        Room.RemoveEntity(startRoom,entity);
        Room.AddEntity(endRoom,entity);
    }
    static AddEntity(room:Room,entity:Entity){
        if(room.maxEntities==room.entities.length){
            room.entities.push(entity);
        }else{
            room.entities[room.maxEntities] = entity;// Entity.apply(entity,room.entities[room.maxEntities]);
        }
        entity.roomId = room.maxEntities;
        room.maxEntities+=1;
        if(entity.kind==EntityKind.Player){room.players.add(entity.roomId);}
    }
    static RemoveEntity(room:Room,entity:Entity){
        const idxToRemove = entity.roomId;
        const lastEnt = room.entities[room.maxEntities-1];
        if(lastEnt.roomId!= entity.roomId){//if it's already at the end, can skip the swap
            room.entities[idxToRemove] = lastEnt;//swap element
            room.entities[room.maxEntities-1] = entity;
            lastEnt.roomId = idxToRemove;
        }
        if(entity.kind==EntityKind.Player){room.players.delete(entity.roomId);}
        entity.roomId = -1;
        if(room.maxEntities>0){
            room.maxEntities-=1;
        }
    }
    static update(room:Room){
        for(let i=room.maxEntities-1;i>=0;i-=1){
            const ent = room.entities[i];
            Entity.update(room,ent);
        }
    }
    static draw(ctx:CanvasRenderingContext2D,room:Room){
        Terrain.draw(ctx,room.terrain);
        for(let i=room.maxEntities-1;i>=0;i-=1){
            const ent = room.entities[i];
            Entity.draw(ctx,ent);
        }
        if(Game.inputs){
            const controls =Game.inputs.get(gameInstance.playerUid);
            if(controls.mousePosition){
                ctx.strokeStyle = '1px solid black';
                ctx.beginPath();
                ctx.arc(controls.mousePosition.x,controls.mousePosition.y,10,0,Math.PI*2);
                ctx.stroke();
            }
        }
    }

}


//bit manipulation helper functions 
class Bit {
	static BIT_CHECK(a:number,b:number):boolean{return  (!!((a) & (0x01<<(b))));}
	static BIT_SET(a:number,b:number):number{ ((a) |= (0x01<<(b)));return a;}
	static BIT_CLEAR(a:number,b:number):number{ ((a) &= ~(0x01<<(b)));return a;}
}
class Terrain {
    terrain:Uint8Array;
    width:number;
    height:number;
    #isRendered:boolean;
    #imageData:ImageData;
    constructor(){
        this.width = 300;
        this.height = 150;
        this.terrain = new Uint8Array(Math.floor(this.width*this.height )/ 8);
        this.#isRendered = false;
    }
    static getBit(x:number,y:number,terrain:Terrain){
        const idx = xyToIdx(x,y,terrain.width);
		const bitIdx = Math.floor(idx/8);
        const remainder = idx%(8);
        return Bit.BIT_CHECK(terrain.terrain[bitIdx],remainder);
    }
    static #setBit(value:boolean,x:number,y:number,terrain:Terrain){
        const idx = xyToIdx(x,y,terrain.width);
		const bitIdx = Math.floor(idx/8);
        const remainder = idx%(8);
        if(value){//set
            terrain.terrain[bitIdx] = Bit.BIT_SET(terrain.terrain[bitIdx],remainder);
        }else{//clear
            terrain.terrain[bitIdx] = Bit.BIT_CLEAR(terrain.terrain[bitIdx],remainder);
        }
    }
    static hitTest(terrain:Terrain,x:number,y:number,w:number,h:number) {
        x=Math.floor(x);
        y=Math.floor(y);
        w=Math.floor(w);
        h=Math.floor(h);
		for (let x_ = 0; x_ < w; x_+=1) {
			for (let y_ = 0; y_ < h; y_+=1) {
                const pixel = Terrain.getBit(x + x_, y+ y_, terrain);
                if (pixel ) return true;
			}
		}
        return false;
    }
    static clearCircle(terrain:Terrain,x:number,y:number,diameter:number){
        terrain.#isRendered = false;
        //TODO: use bitmasks instead?
        const radius = Math.floor(diameter/2);
        const radiusSquared = radius*radius;
        for(let i=x-radius;i<x+radius;i+=1){
            for(let j=y-radius;j<y+radius;j+=1){
                if(i>0&&i<terrain.width-1&& j>0&&j<terrain.height-1){
                        const distSquared = (x-i)*(x-i) + (y-j)*(y-j);
                        if(distSquared<radiusSquared){//clear pixels in 30px radius
                            Terrain.#setBit(false,i,j,terrain);
                        }
                    }
            }
        }
    }
    static fillRect(terrain:Terrain,x:number,y:number,w:number,h:number){
        terrain.#isRendered = false;
        for(let i=x;i<x+w;i+=1){
            for(let j=y;j<y+h;j+=1){
                if(i>0&&i<terrain.width-1&& j>0&&j<terrain.height-1){
                        Terrain.#setBit(true,i,j,terrain);
                    }
            }
        }
    }
    static draw(ctx:CanvasRenderingContext2D,terrain:Terrain){
        //if there's a cached copy of the image to render, use that
        if(terrain.#isRendered){
            ctx.putImageData(terrain.#imageData,0,0);
            return;
        }
        //otherwise, regenerate
        const imageData =  ctx.createImageData(300, 150);
        for (let x = 0; x < imageData.width; x+=1) {
            for (let y = 0; y < imageData.height; y+=1) {
                // Index of the pixel in the array
                const isFilled = Terrain.getBit(x,y,terrain);
                const idx = (x + y * terrain.width) * 4;
                imageData.data[idx + 0] = 0;
                imageData.data[idx + 1] = isFilled?255:0;
                imageData.data[idx + 2] = 0;
                imageData.data[idx + 3] = isFilled?255:0;//TODO can always be 255 if background
            }
        }
        ctx.putImageData(imageData,0,0);
        terrain.#imageData = imageData;
        terrain.#isRendered = true;
    }
}
const xyToIdx = (x:number,y:number,width:number)=>{
    return y*width+x;
}
const idxToXy = (idx:number,width:number)=>{
    return [
        Math.floor(idx%width),//x
        Math.floor(idx/width)//y
    ];
}
class Game extends NetplayState{
//TODO: serialise rooms->entities->terrain
    serialize(): any { 
        const rooms = [];
        for(const r of this.rooms){
            const ents = [];
            for(let i=0;i<r.maxEntities;i+=1){
                const e = r.entities[i];
                if(e.roomId<0){console.warn("neg ID alive!",r)};
                if(i!=e.roomId){console.warn("AAAAAAAAAAAAAA",e,i)}
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
        console.log(value);
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
        for(const room of gameInstance.rooms){
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
let gameInstance:Game =null;
class Main {
	static init (playerId:number,playerCount:number){	
		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		gameInstance = new Game(canvas);
        gameInstance.init(playerId,playerCount);
        console.log(gameInstance);
        return gameInstance;
	}
}
export {Main};
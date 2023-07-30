

import {hash,PRNG,CONTROLS,EntityKind,EuqippedKind} from './types.mjs';
import { Room } from './Room.mjs';
import { Player } from './Entities/Player.mjs';
import { Bullet } from './Entities/Bullet.mjs';
import { Resource } from './Entities/Resource.mjs';
import { Enemy } from './Entities/Enemy.mjs';
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
        this.size={x:8,y:8};
    }
    static update(room:Room,entity:Entity){
        if(entity.kind == EntityKind.Player){
            Player.update(room,entity);
        }
        if(entity.kind == EntityKind.Bullet){
            Bullet.update(room,entity);
        }
        if(entity.kind == EntityKind.Enemy){
            Enemy.update(room,entity);
        }
        //Resource.update (NOTE: resource has no update)
    }
    static draw(ctx:CanvasRenderingContext2D,entity:Entity){
        if(entity.kind == EntityKind.Player){
            Player.draw(ctx,entity);
        }
        if(entity.kind == EntityKind.Bullet){
            Bullet.draw(ctx,entity);
        }
        if(entity.kind == EntityKind.Enemy){
            Enemy.draw(ctx,entity);
        }
        if(entity.kind == EntityKind.Resource){
            Resource.draw(ctx,entity);
        }
    }
}

//collision detection algorithm:
//hold a bunch of buckets. For each element, hash their X,Y with an avalance function to get a bucket
//insert that element ID into its bucket, scanning through to see if there's anything else in it
//each frame, the buckets need to be cleared.
//to do this, let the buckets grow indefinitely (capped by max elemes in scene), but reset by just updating an 'end' pointer
//this gives O(1) clearing, and means allocation/memory pressure is reduced
//the number of bins needed depends on number of elements in scene and the quality of the hash function

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
};
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
};
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

export {Entity,Collision};
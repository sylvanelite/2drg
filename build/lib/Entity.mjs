import { hash, EntityKind } from './types.mjs';
import { Player } from './Entities/Player.mjs';
import { Bullet } from './Entities/Bullet.mjs';
import { Resource } from './Entities/Resource.mjs';
import { Enemy } from './Entities/Enemy.mjs';
import { Conductor } from './Entities/Conductor.mjs';
class Entity {
    static uid = 0;
    uid;
    roomId;
    kind;
    euqipped;
    hp;
    maxHp;
    cooldown;
    secondaryCooldown;
    sprite;
    spriteFrame;
    position;
    velocity;
    size;
    constructor() {
        this.uid = Entity.uid;
        Entity.uid += 1;
        this.roomId = 0;
        this.kind = EntityKind.Enemy;
        this.hp = 100;
        this.maxHp = 100;
        this.cooldown = 0;
        this.secondaryCooldown = 0;
        this.sprite = 0;
        this.spriteFrame = 0;
        this.position = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.size = { x: 8, y: 8 };
    }
    static update(room, entity) {
        if (entity.kind == EntityKind.Player) {
            Player.update(room, entity);
        }
        if (entity.kind == EntityKind.Bullet) {
            Bullet.update(room, entity);
        }
        if (entity.kind == EntityKind.Enemy) {
            Enemy.update(room, entity);
        }
        if (entity.kind == EntityKind.Conductor) {
            Conductor.update(room, entity);
        }
        if (entity.kind == EntityKind.Resource) {
            Resource.update(room, entity);
        }
    }
    static draw(ctx, entity) {
        if (entity.kind == EntityKind.Player) {
            Player.draw(ctx, entity);
        }
        if (entity.kind == EntityKind.Bullet) {
            Bullet.draw(ctx, entity);
        }
        if (entity.kind == EntityKind.Enemy) {
            Enemy.draw(ctx, entity);
        }
        if (entity.kind == EntityKind.Resource) {
            Resource.draw(ctx, entity);
        }
    }
}
class CollisionCells {
    static get hashLength() {
        return 512;
    }
    static collisionCells = null;
    static clear() {
        for (const cells of CollisionCells.collisionCells) {
            cells.clear();
        }
    }
    static init() {
        CollisionCells.collisionCells = [];
        for (let i = 0; i < CollisionCells.hashLength; i += 1) {
            CollisionCells.collisionCells.push(new CacheArray());
        }
    }
}
;
class CacheArray {
    #backingArray = [];
    #length = 0;
    clear() { this.#length = 0; }
    push(elem) {
        if (this.#backingArray.length == this.#length) {
            this.#backingArray.push(elem);
        }
        else {
            this.#backingArray[this.#length] = elem;
        }
        this.#length += 1;
    }
    get length() { return this.#length; }
    get(idx) { return this.#backingArray[idx]; }
}
;
class Collision {
    static cellSize = 32;
    static preExecute() {
        CollisionCells.clear();
    }
    static populateCollisions(room) {
        for (let i = room.maxEntities - 1; i >= 0; i -= 1) {
            const ent = room.entities[i];
            const xmin = Math.floor(ent.position.x / Collision.cellSize);
            const ymin = Math.floor(ent.position.y / Collision.cellSize);
            const xmax = Math.floor((ent.position.x + ent.size.x) / Collision.cellSize) + 1;
            const ymax = Math.floor((ent.position.y + ent.size.y) / Collision.cellSize) + 1;
            for (let x = xmin; x < xmax; x++) {
                for (let y = ymin; y < ymax; y++) {
                    const key = ((hash(x) % CollisionCells.hashLength) + hash(y)) % CollisionCells.hashLength;
                    const hashCell = CollisionCells.collisionCells[key];
                    hashCell.push(ent.roomId);
                }
            }
        }
    }
    static touches(entity, other) {
        return !(entity.position.x >= other.position.x + other.size.x ||
            entity.position.x + entity.size.x <= other.position.x ||
            entity.position.y >= other.position.y + other.size.y ||
            entity.position.y + entity.size.y <= other.position.y);
    }
    static checkCollisions(room, entity, collideCallback) {
        const collisionResults = new Set();
        const xmin = Math.floor(entity.position.x / Collision.cellSize);
        const ymin = Math.floor(entity.position.y / Collision.cellSize);
        const xmax = Math.floor((entity.position.x + entity.size.x) / Collision.cellSize) + 1;
        const ymax = Math.floor((entity.position.y + entity.size.y) / Collision.cellSize) + 1;
        for (let x = xmin; x < xmax; x++) {
            for (let y = ymin; y < ymax; y++) {
                const key = ((hash(x) % CollisionCells.hashLength) + hash(y)) % CollisionCells.hashLength;
                const hashCell = CollisionCells.collisionCells[key];
                for (let i = 0; i < hashCell.length; i += 1) {
                    const otherId = hashCell.get(i);
                    if (entity.roomId == otherId) {
                        continue;
                    }
                    const other = room.entities[otherId];
                    if (Collision.touches(entity, other)) {
                        collisionResults.add(otherId);
                    }
                }
            }
        }
        for (const collision of collisionResults) {
            collideCallback(collision);
        }
    }
}
CollisionCells.init();
export { Entity, Collision };
//# sourceMappingURL=Entity.mjs.map
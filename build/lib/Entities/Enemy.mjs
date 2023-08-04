import { PRNG, EuqippedKind, EntityKind } from "../types.mjs";
import { Collision } from "../Entity.mjs";
import { Room } from "../Room.mjs";
import { Terrain } from "../Terrain.mjs";
import { ImageCache } from "../ImageCache.mjs";
import { sprites } from "../sprites.mjs";
class Enemy {
    static update(room, entity) {
        if (entity.hp < 1) {
            Room.RemoveEntity(room, entity);
        }
        entity.cooldown -= 1;
        if (entity.cooldown <= 0) {
            entity.cooldown += 6 + Math.floor(PRNG.prng() * 3);
            let attack = 5;
            if (entity.euqipped == EuqippedKind.ENEMY_GRUNT) {
                attack = 5;
            }
            if (entity.euqipped == EuqippedKind.ENEMY_WINGED) {
                attack = 2;
            }
            Collision.checkCollisions(room, entity, (collisionId) => {
                const ent = room.entities[collisionId];
                if (ent.kind == EntityKind.Player) {
                    ent.hp -= attack;
                }
            });
        }
        let tgtX = entity.position.x;
        let tgtY = entity.position.y;
        for (const pid of room.players) {
            tgtX = room.entities[pid].position.x + Math.floor(room.entities[pid].size.x / 2);
            tgtY = room.entities[pid].position.y;
        }
        let moveSpeed = 1;
        if (Terrain.hitTest(room.terrain, entity.position.x, entity.position.y, entity.size.x, entity.size.y)) {
            moveSpeed = 0.2;
        }
        if (entity.euqipped == EuqippedKind.ENEMY_GRUNT) {
            if (tgtX < entity.position.x) {
                entity.position.x -= moveSpeed;
            }
            if (tgtX > entity.position.x) {
                entity.position.x += moveSpeed;
            }
            if (tgtY < entity.position.y) {
                entity.position.y -= moveSpeed;
            }
            if (tgtY > entity.position.y) {
                entity.position.y += moveSpeed;
            }
        }
        if (entity.euqipped == EuqippedKind.ENEMY_WINGED) {
            if (tgtX < entity.position.x) {
                entity.position.x -= moveSpeed;
            }
            if (tgtX > entity.position.x) {
                entity.position.x += moveSpeed;
            }
            if (tgtY < entity.position.y) {
                entity.position.y -= moveSpeed;
            }
            if (tgtY > entity.position.y) {
                entity.position.y += moveSpeed;
            }
        }
    }
    static draw(ctx, entity) {
        const image = ImageCache.getImage("./media/sprites.png");
        if (!image.loaded) {
            return;
        }
        let spr = sprites.enemy_grunt;
        let flipX = entity.velocity.x < 0;
        const isAtk = (entity.cooldown <= 2);
        if (entity.euqipped == EuqippedKind.ENEMY_GRUNT) {
            spr = sprites.enemy_grunt;
            if (isAtk) {
                spr = sprites.enemy_grunt_attack;
            }
        }
        if (entity.euqipped == EuqippedKind.ENEMY_WINGED) {
            spr = sprites.enemy_winged;
            if (isAtk) {
                spr = sprites.enemy_winged_attack;
            }
        }
        ImageCache.drawTile(ctx, image, entity.position.x, entity.position.y, spr.x, spr.y, spr.w, spr.h, flipX, false);
    }
}
export { Enemy };
//# sourceMappingURL=Enemy.mjs.map
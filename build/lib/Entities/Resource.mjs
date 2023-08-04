import { EntityKind, EuqippedKind } from "../types.mjs";
import { Collision } from "../Entity.mjs";
import { Room } from "../Room.mjs";
import { ImageCache } from "../ImageCache.mjs";
import { sprites } from "../sprites.mjs";
import { Conductor } from "./Conductor.mjs";
import { Game } from "../Game.mjs";
class Resource {
    static update(room, entity) {
        if (entity.hp < 1) {
            Resource.collectResource(room, entity);
        }
    }
    static collectResource(room, entity) {
        if (entity.sprite == EuqippedKind.RESOURCE_BISMORE_BOTTOM ||
            entity.sprite == EuqippedKind.RESOURCE_BISMORE_TOP) {
            Conductor.TiggerWave(room, EuqippedKind.WAVE_LOCKED_ROOM);
            Game.gameInstance.resourceLiveCount.bismore += 1;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_CROPPA_TOP ||
            entity.sprite == EuqippedKind.RESOURCE_CROPPA_BOTTOM) {
            Game.gameInstance.resourceLiveCount.croppa += 1;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_NITRA_BOTTOM ||
            entity.sprite == EuqippedKind.RESOURCE_NITRA_TOP) {
            Game.gameInstance.resourceLiveCount.nitra += 1;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_RED_SUGAR_BOTTOM ||
            entity.sprite == EuqippedKind.RESOURCE_RED_SUGAR_TOP) {
            Collision.checkCollisions(room, entity, (collisionId) => {
                const ent = room.entities[collisionId];
                if (ent.kind == EntityKind.Player) {
                    ent.hp += 30;
                    if (ent.hp > ent.maxHp) {
                        ent.hp = ent.maxHp;
                    }
                }
            });
        }
        if (entity.sprite == EuqippedKind.RESOURCE_GOLD_TOP ||
            entity.sprite == EuqippedKind.RESOURCE_GOLD_BOTTOM) {
            Game.gameInstance.resourceLiveCount.gold += 1;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_AQUARQ) {
            Conductor.TiggerWave(room, EuqippedKind.WAVE_LOCKED_ROOM);
            Game.gameInstance.resourceLiveCount.aquarq += 1;
        }
        if (entity.euqipped == EuqippedKind.RESOURCE_EGG) {
            Conductor.TiggerWave(room, EuqippedKind.WAVE_LOCKED_ROOM);
            Game.gameInstance.resourceLiveCount.egg += 1;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_FOSSIL) {
            Game.gameInstance.resourceLiveCount.fossil += 1;
        }
        Room.RemoveEntity(room, entity);
    }
    static draw(ctx, entity) {
        const image = ImageCache.getImage("./media/sprites.png");
        if (!image.loaded) {
            return;
        }
        let spr = sprites.gold_bottom;
        if (entity.sprite == EuqippedKind.RESOURCE_BISMORE_BOTTOM) {
            spr = sprites.bismore_bottom;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_BISMORE_TOP) {
            spr = sprites.bismore_top;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_CROPPA_TOP) {
            spr = sprites.croppa_top;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_CROPPA_BOTTOM) {
            spr = sprites.croppa_bottom;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_NITRA_BOTTOM) {
            spr = sprites.nitra_bottom;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_NITRA_TOP) {
            spr = sprites.nitra_top;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_RED_SUGAR_BOTTOM) {
            spr = sprites.red_sugar_bottom;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_RED_SUGAR_TOP) {
            spr = sprites.red_sugar_top;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_GOLD_TOP) {
            spr = sprites.nitra_top;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_GOLD_BOTTOM) {
            spr = sprites.nitra_bottom;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_AQUARQ) {
            spr = sprites.aquarq;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_EGG) {
            spr = sprites.egg;
        }
        if (entity.sprite == EuqippedKind.RESOURCE_FOSSIL) {
            spr = sprites.fossil;
        }
        ImageCache.drawTile(ctx, image, entity.position.x, entity.position.y, spr.x, spr.y, spr.w, spr.h, false, false);
    }
}
export { Resource };
//# sourceMappingURL=Resource.mjs.map
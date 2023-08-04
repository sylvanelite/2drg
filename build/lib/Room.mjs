import { EntityKind } from "./types.mjs";
import { Entity } from "./Entity.mjs";
import { Terrain } from "./Terrain.mjs";
import { Game } from "./Game.mjs";
class Room {
    idx;
    x;
    y;
    entities;
    maxEntities;
    terrain;
    players;
    locked_L;
    locked_R;
    locked_U;
    locked_D;
    constructor() {
        this.entities = [];
        this.maxEntities = 0;
        this.players = new Set();
        this.locked_L = false;
        this.locked_R = false;
        this.locked_U = false;
        this.locked_D = false;
    }
    static MoveEntity(startRoom, endRoom, entity) {
        const entRemover = new Entity();
        entRemover.roomId = entity.roomId;
        entRemover.kind = entity.kind;
        startRoom.entities[entity.roomId] = entRemover;
        Room.RemoveEntity(startRoom, entRemover);
        Room.AddEntity(endRoom, entity);
    }
    static AddEntity(room, entity) {
        if (room.maxEntities == room.entities.length) {
            room.entities.push(entity);
        }
        else {
            room.entities[room.maxEntities] = entity;
        }
        entity.roomId = room.maxEntities;
        room.maxEntities += 1;
        if (entity.kind == EntityKind.Player) {
            room.players.add(entity.roomId);
            if (Game.gameInstance) {
                const cfg = Game.gameInstance.playerLiveCount.get(entity.uid);
                if (cfg) {
                    cfg.roomId = entity.roomId;
                    cfg.roomIdx = room.idx;
                }
            }
        }
    }
    static RemoveEntity(room, entity) {
        const idxToRemove = entity.roomId;
        if (idxToRemove == -1) {
            return;
        }
        if (entity.kind == EntityKind.Player) {
            room.players.delete(entity.roomId);
        }
        const lastEnt = room.entities[room.maxEntities - 1];
        if (lastEnt.roomId != entity.roomId) {
            if (lastEnt.kind == EntityKind.Player) {
                room.players.delete(lastEnt.roomId);
            }
            room.entities[idxToRemove] = lastEnt;
            room.entities[room.maxEntities - 1] = entity;
            lastEnt.roomId = idxToRemove;
            if (lastEnt.kind == EntityKind.Player) {
                room.players.add(lastEnt.roomId);
                if (Game.gameInstance) {
                    const cfg = Game.gameInstance.playerLiveCount.get(lastEnt.uid);
                    if (cfg) {
                        cfg.roomId = lastEnt.roomId;
                        cfg.roomIdx = room.idx;
                    }
                }
            }
        }
        entity.roomId = -1;
        if (room.maxEntities > 0) {
            room.maxEntities -= 1;
        }
    }
    static update(room) {
        for (let i = room.maxEntities - 1; i >= 0; i -= 1) {
            const ent = room.entities[i];
            Entity.update(room, ent);
        }
    }
    static draw(ctx, room) {
        Terrain.draw(ctx, room.terrain);
        for (let i = room.maxEntities - 1; i >= 0; i -= 1) {
            const ent = room.entities[i];
            Entity.draw(ctx, ent);
        }
        ctx.fillStyle = "#FF0000";
        if (room.locked_D || room.y == Game.gameInstance.worldSize - 1) {
            ctx.fillRect(0, room.terrain.height - 2, room.terrain.width, 2);
        }
        if (room.locked_U || room.y == 0) {
            ctx.fillRect(0, 0, room.terrain.width, 2);
        }
        if (room.locked_L || room.x == 0) {
            ctx.fillRect(0, 0, 2, room.terrain.height);
        }
        if (room.locked_R || room.x == Game.gameInstance.worldSize - 1) {
            ctx.fillRect(room.terrain.width - 2, 0, 2, room.terrain.height);
        }
    }
}
export { Room };
//# sourceMappingURL=Room.mjs.map
import { Entity } from "./Entity.mjs";
import { Terrain } from "./Terrain.mjs";
declare class Room {
    idx: number;
    x: number;
    y: number;
    entities: Array<Entity>;
    maxEntities: number;
    terrain: Terrain;
    players: Set<number>;
    locked_L: boolean;
    locked_R: boolean;
    locked_U: boolean;
    locked_D: boolean;
    constructor();
    static MoveEntity(startRoom: Room, endRoom: Room, entity: Entity): void;
    static AddEntity(room: Room, entity: Entity): void;
    static RemoveEntity(room: Room, entity: Entity): void;
    static update(room: Room): void;
    static draw(ctx: CanvasRenderingContext2D, room: Room): void;
}
export { Room };

import { Entity } from "../Entity.mjs";
import { Room } from "../Room.mjs";
declare class Resource {
    static update(room: Room, entity: Entity): void;
    static collectResource(room: Room, entity: Entity): void;
    static draw(ctx: CanvasRenderingContext2D, entity: Entity): void;
}
export { Resource };

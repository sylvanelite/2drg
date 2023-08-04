import { Entity } from "../Entity.mjs";
import { Room } from "../Room.mjs";
declare class Enemy {
    static update(room: Room, entity: Entity): void;
    static draw(ctx: CanvasRenderingContext2D, entity: Entity): void;
}
export { Enemy };

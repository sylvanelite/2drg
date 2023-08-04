import { Entity } from "../Entity.mjs";
import { Room } from "../Room.mjs";
declare const PLAYER_SPRITE: {
    STANDING_LEFT: number;
    STANDING_RIGHT: number;
    MOVING_LEFT: number;
    MOVING_RIGHT: number;
    JUMPING_LEFT: number;
    JUMPING_RIGHT: number;
    FALLING_LEFT: number;
    FALLING_RIGHT: number;
};
declare class Player {
    #private;
    static update(room: Room, entity: Entity): void;
    static draw(ctx: CanvasRenderingContext2D, entity: Entity): void;
}
export { Player, PLAYER_SPRITE };

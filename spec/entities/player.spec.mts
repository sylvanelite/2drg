import { Room } from "../../lib/Room.mjs";
import { Entity } from "../../lib/Entity.mjs";
import { Player,PLAYER_SPRITE } from "../../lib/Entities/Player.mjs";
import { Terrain } from "../../lib/Terrain.mjs";
import { CONTROLS, EntityKind,EuqippedKind } from "../../lib/types.mjs";
import { Game } from "../../lib/Game.mjs";
import { NetplayInput } from "../../lib/netPeer/netplayInput.mjs";

describe("test player",function(){
	it("player gravity",async function() {
        const room = new Room();
        room.terrain =new Terrain();
        Terrain.fillRect(room.terrain,0,64,room.terrain.width,room.terrain.height);
        const playerEntity = new Entity();
        playerEntity.kind = EntityKind.Player;
        playerEntity.euqipped = EuqippedKind.WEAPON_FLAMETHROWER;
        const startX = Math.floor(room.terrain.width/2);
        const startY = 4;
        playerEntity.position.x = startX;
        playerEntity.position.y = startY;
        const inputs= new Map();
        inputs.set(playerEntity.uid,new NetplayInput());
        Game.inputs = inputs;
        expect(playerEntity.position.x).toBe(startX);
        expect(playerEntity.position.y).toBe(startY);
        Player.update(room,playerEntity);
        //see if gravity has kicked in
        expect(playerEntity.position.x).toBe(startX);
        expect(playerEntity.position.y).toBeGreaterThan(startY);
    });
	it("player facing left",async function() {
        const room = new Room();
        room.terrain =new Terrain();
        Terrain.fillRect(room.terrain,0,64,room.terrain.width,room.terrain.height);
        const playerEntity = new Entity();
        playerEntity.kind = EntityKind.Player;
        playerEntity.euqipped = EuqippedKind.WEAPON_FLAMETHROWER;
        const startX = Math.floor(room.terrain.width/2);
        const startY = 50;
        playerEntity.position.x = startX;
        playerEntity.position.y = startY;
        const inputs= new Map();
        const ipt = new NetplayInput();
        NetplayInput.setPressed(ipt,CONTROLS.LEFT);
        inputs.set(playerEntity.uid,ipt);
        Game.inputs = inputs;
        expect(playerEntity.sprite).toBe(0);
        Player.update(room,playerEntity);
        Player.update(room,playerEntity);//2 updates to accumulate enough velocity to fall
        expect(playerEntity.sprite).toBe(PLAYER_SPRITE.FALLING_LEFT);
        Player.update(room,playerEntity);//enough updates to hit the ground
        Player.update(room,playerEntity);
        Player.update(room,playerEntity);
        Player.update(room,playerEntity);
        Player.update(room,playerEntity);
        Player.update(room,playerEntity);
        expect(playerEntity.sprite).toBe(PLAYER_SPRITE.MOVING_LEFT);
        NetplayInput.clearPressed(ipt,CONTROLS.LEFT);
        Player.update(room,playerEntity);//update after release, stop moving
        expect(playerEntity.sprite).toBe(PLAYER_SPRITE.STANDING_LEFT);
    });
	it("player facing right",async function() {
        const room = new Room();
        room.terrain =new Terrain();
        Terrain.fillRect(room.terrain,0,64,room.terrain.width,room.terrain.height);
        const playerEntity = new Entity();
        playerEntity.kind = EntityKind.Player;
        playerEntity.euqipped = EuqippedKind.WEAPON_FLAMETHROWER;
        const startX = Math.floor(room.terrain.width/2);
        const startY = 50;
        playerEntity.position.x = startX;
        playerEntity.position.y = startY;
        const inputs= new Map();
        const ipt = new NetplayInput();
        NetplayInput.setPressed(ipt,CONTROLS.RIGHT);
        inputs.set(playerEntity.uid,ipt);
        Game.inputs = inputs;
        expect(playerEntity.sprite).toBe(0);
        Player.update(room,playerEntity);
        Player.update(room,playerEntity);//2 updates to accumulate enough velocity to fall
        expect(playerEntity.sprite).toBe(PLAYER_SPRITE.FALLING_RIGHT);
        Player.update(room,playerEntity);//enough updates to hit the ground
        Player.update(room,playerEntity);
        Player.update(room,playerEntity);
        Player.update(room,playerEntity);
        Player.update(room,playerEntity);
        Player.update(room,playerEntity);
        expect(playerEntity.sprite).toBe(PLAYER_SPRITE.MOVING_RIGHT);
        NetplayInput.clearPressed(ipt,CONTROLS.RIGHT);
        Player.update(room,playerEntity);//update after release, stop moving
        expect(playerEntity.sprite).toBe(PLAYER_SPRITE.STANDING_RIGHT);
    });
	it("player sprite jumping",async function() {
        const room = new Room();
        room.terrain =new Terrain();
        Terrain.fillRect(room.terrain,0,64,room.terrain.width,room.terrain.height);
        const playerEntity = new Entity();
        playerEntity.kind = EntityKind.Player;
        playerEntity.euqipped = EuqippedKind.WEAPON_FLAMETHROWER;
        const startX = Math.floor(room.terrain.width/2);
        const startY = 50;
        playerEntity.position.x = startX;
        playerEntity.position.y = startY;
        const inputs= new Map();
        const ipt = new NetplayInput();
        NetplayInput.setPressed(ipt,CONTROLS.JUMP);
        NetplayInput.setPressed(ipt,CONTROLS.LEFT);
        inputs.set(playerEntity.uid,ipt);
        Game.inputs = inputs;
        expect(playerEntity.sprite).toBe(0);
        Player.update(room,playerEntity);
        expect(playerEntity.sprite).toBe(PLAYER_SPRITE.JUMPING_LEFT);
        NetplayInput.clearPressed(ipt,CONTROLS.LEFT);
        Player.update(room,playerEntity);//release direction, but keep faving that way
        expect(playerEntity.sprite).toBe(PLAYER_SPRITE.JUMPING_LEFT);
        NetplayInput.setPressed(ipt,CONTROLS.RIGHT);//change direction
        Player.update(room,playerEntity);
        expect(playerEntity.sprite).toBe(PLAYER_SPRITE.JUMPING_RIGHT);
        NetplayInput.clearPressed(ipt,CONTROLS.RIGHT);
        Player.update(room,playerEntity);
        expect(playerEntity.sprite).toBe(PLAYER_SPRITE.JUMPING_RIGHT);
        NetplayInput.clearPressed(ipt,CONTROLS.JUMP);
        Player.update(room,playerEntity);//release jump, animation turns off
        expect(playerEntity.sprite).not.toBe(PLAYER_SPRITE.JUMPING_RIGHT);
        expect(playerEntity.sprite).not.toBe(PLAYER_SPRITE.JUMPING_LEFT);
    });
    //TODO: more complex test cases, terrain traversal, shooting, room change, etc
});
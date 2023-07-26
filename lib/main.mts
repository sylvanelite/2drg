/*class Velocity {
	static system (instance:IgInstance, id:number){
        //bresenham
        //https://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
        let x1 = Position.component.x[id];
        let y1 = Position.component.y[id];
        const x2 = x1+Velocity.component.x[id];
        const y2 = y1+Velocity.component.y[id];
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? 1 : -1;
        const sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;
        // Main loop
        while (!((x1 == x2) && (y1 == y2))) {
            var e2 = err << 1;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
            //update coordinates
            //TODO: if solid.... (if need to check terrain...)
            Position.component.x[id] = x1;
            Position.component.y[id] = y1;
        }
	}
}*/

import { KeyboardAndMouseInputReader } from "./inputController.mjs";
import { NetplayInput } from "./netPeer/types.mjs";

/*
TODO:
mobs, peer, rollback, bullets,
movement that doesn't snap Y
input per player
mouse aiming
test cases
better rendering
UI
terrain generation
*/

const CONTROLS={
    LEFT:1,
    RIGHT:2,
    JUMP:3,
    SHOOT:4
};
enum EntityKind{
    Player = 1,
    Enemy = 10,
    Bullet = 100,
    Resource = 1000,
}
class Entity{
    static uid=0;
    uid:number;//globally unique id, preserved across room boundaries
    roomId:number;//index location in the room array, changes with room operations: insert/delete/move
    kind:EntityKind;//how the entity is controlled
    hp:number;
    maxHp:number;
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
        this.sprite=0;
        this.spriteFrame=0;
        this.position={x:0,y:0};
        this.velocity={x:0,y:0};
        this.size={x:10,y:20};
    }
    static update(room:Room,entity:Entity){
        //TODO:options for all ent.kind
        if(entity.kind == EntityKind.Player){
            Entity.move_character(room,entity);
        }
    }
    static draw(ctx:CanvasRenderingContext2D,entity:Entity){
        //TODO:ent.kind
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(entity.position.x,entity.position.y,entity.size.x,entity.size.y);
    }
    static move_character(room:Room,entity:Entity) {
        const controls =Game.inputs.get(entity.uid);
        let i = 0;
        for (i = 0; i < 3; i+=1) {    
            if ( NetplayInput.getPressed(controls,CONTROLS.LEFT)) {
                if (!Terrain.hitTest(room.terrain, entity.position.x , entity.position.y, 1, 1)) {
                    entity.position.x -= 1;
                }
                while (Terrain.hitTest(room.terrain, entity.position.x, entity.position.y + 20, 10, 1)) {
                    entity.position.y -= 1;
                }
            }
            if (NetplayInput.getPressed(controls,CONTROLS.RIGHT)) {
                if (!Terrain.hitTest(room.terrain, entity.position.x + 10, entity.position.y, 1, 1)) {
                    entity.position.x += 1;
                }
                while (Terrain.hitTest(room.terrain, entity.position.x, entity.position.y + 20, 10, 1)) {
                    entity.position.y -= 1;
                }
            }
        }
        if (NetplayInput.getPressed(controls,CONTROLS.JUMP)) {
            entity.velocity.y = -10;
            //gameInstance.jumping = true;//TODO: fix jumping
        }
        entity.velocity.y+=1; //is this going to work prooperly?
        if (entity.velocity.y > 0) {
            //check ground
            for (i = 0; i < entity.velocity.y; i+=1) {
                if (!Terrain.hitTest(room.terrain, entity.position.x, entity.position.y + 20, 10, 1)) {
                    entity.position.y += 1;
                } else {
                    //gameInstance.jumping = false;//TODO: fix jumping
                    entity.velocity.y = 0;
                }
            }
        } else {
            for (i = 0; i < Math.abs(entity.velocity.y); i+=1) {
                if (!Terrain.hitTest(room.terrain, entity.position.x, entity.position.y, 10, 1)) {
                    entity.position.y -= 1;
                } else {
                    entity.velocity.y = 0;
                }
            }
        }
        //move between rooms, going off one side means going onto another
        const buffer = 3;
        if(entity.position.x<0 && room.x>0){
            const idx = xyToIdx(room.x-1,room.y,gameInstance.worldWidth);
            const targetRoom = gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.x=room.terrain.width-entity.size.x-buffer;
            gameInstance.currentRoom = idx;
        }
        if(entity.position.x+entity.size.x > room.terrain.width&& room.x<gameInstance.worldWidth-1){
            const idx = xyToIdx(room.x+1,room.y,gameInstance.worldWidth);
            const targetRoom = gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.x=buffer;
            gameInstance.currentRoom = idx;
        }
        if(entity.position.y<0 && room.y>0){
            const idx = xyToIdx(room.x,room.y-1,gameInstance.worldWidth);
            const targetRoom = gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.y=room.terrain.height-entity.size.y-buffer;
            gameInstance.currentRoom = idx;
        }
        if(entity.position.y+entity.size.y > room.terrain.height&& room.y<gameInstance.worldWidth-1){
            const idx = xyToIdx(room.x,room.y+1,gameInstance.worldWidth);
            const targetRoom = gameInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.y =buffer;
            gameInstance.currentRoom = idx;
        }
        //==shooting (TODO: spawn bullet & bresenham)
        if (controls.mousePosition&& NetplayInput.getReleased(controls,CONTROLS.SHOOT) ) {
            const mousePos =controls.mousePosition;
            Terrain.clearCircle(room.terrain,mousePos.x,mousePos.y,30);
        }

    }
}
class Room{
    idx:number;
    x:number;
    y:number;
    entities:Array<Entity>;
    maxEntities:number;
    terrain:Terrain;
    static MAX_ENTIES = 500;
    constructor(){
        this.entities = new Array(Room.MAX_ENTIES);
        this.maxEntities = 0;
    }
    static MoveEntity(startRoom:Room,endRoom:Room,entity:Entity){
        //note: if moving in one direction, 
        //can be processed multiple times per frame depending on how rooms are sweept in update() 
        Room.RemoveEntity(startRoom,entity);
        Room.AddEntity(endRoom,entity);
    }
    static AddEntity(room:Room,entity:Entity){
        if(room.maxEntities>=Room.MAX_ENTIES){console.warn('max entities');return;}
        entity.roomId=room.maxEntities;
        room.entities[room.maxEntities] = entity;//TODO: instead of overwriting, could copy props
        room.maxEntities+=1;
    }
    static RemoveEntity(room:Room,entity:Entity){
        //swap & pop, assumes iterating backwards
        if(room.maxEntities<=1){room.maxEntities=0;return;}//base case 1 or 0, nothing to remove
        const lastEntity = room.entities[room.maxEntities-1];//sawp current with last
        room.entities[entity.roomId] = lastEntity;//TODO: instead of overwriting, could copy props
        lastEntity.roomId = entity.roomId;
        room.maxEntities-=1;
    }
    static update(room:Room){
        for(let i=room.maxEntities-1;i>=0;i-=1){
            const ent = room.entities[i];
            Entity.update(room,ent);
        }
    }
    static draw(ctx:CanvasRenderingContext2D,room:Room){
        Terrain.draw(ctx,room.terrain);
        for(let i=room.maxEntities-1;i>=0;i-=1){
            const ent = room.entities[i];
            Entity.draw(ctx,ent);
        }
        
        const controls =Game.inputs.get(gameInstance.playerUid);
        if(controls.mousePosition){
            ctx.strokeStyle = '1px solid black';
            ctx.beginPath();
            ctx.arc(controls.mousePosition.x,controls.mousePosition.y,10,0,Math.PI*2);
            ctx.stroke();
        }
    }

}


//bit manipulation helper functions 
class Bit {
	static BIT_CHECK(a:number,b:number):boolean{return  (!!((a) & (0x01<<(b))));}
	static BIT_SET(a:number,b:number):number{ ((a) |= (0x01<<(b)));return a;}
	static BIT_CLEAR(a:number,b:number):number{ ((a) &= ~(0x01<<(b)));return a;}
}
class Terrain {
    terrain:Uint8Array;
    width:number;
    height:number;
    #isRendered:boolean;
    #imageData:ImageData;
    constructor(){
        this.width = 300;
        this.height = 150;
        this.terrain = new Uint8Array(Math.floor(this.width*this.height )/ 8);
        this.#isRendered = false;
    }
    static getBit(x:number,y:number,terrain:Terrain){
        const idx = xyToIdx(x,y,terrain.width);
		const bitIdx = Math.floor(idx/8);
        const remainder = idx%(8);
        return Bit.BIT_CHECK(terrain.terrain[bitIdx],remainder);
    }
    static #setBit(value:boolean,x:number,y:number,terrain:Terrain){
        const idx = xyToIdx(x,y,terrain.width);
		const bitIdx = Math.floor(idx/8);
        const remainder = idx%(8);
        if(value){//set
            terrain.terrain[bitIdx] = Bit.BIT_SET(terrain.terrain[bitIdx],remainder);
        }else{//clear
            terrain.terrain[bitIdx] = Bit.BIT_CLEAR(terrain.terrain[bitIdx],remainder);
        }
    }
    static hitTest(terrain:Terrain,x:number,y:number,w:number,h:number) {
		for (let x_ = 0; x_ < w; x_+=1) {
			for (let y_ = 0; y_ < h; y_+=1) {
                const pixel = Terrain.getBit(x + x_, y+ y_, terrain);
                if (pixel ) return true;
			}
		}
        return false;
    }
    static clearCircle(terrain:Terrain,x:number,y:number,diameter:number){
        terrain.#isRendered = false;
        //TODO: use bitmasks instead?
        const radius = Math.floor(diameter/2);
        const radiusSquared = radius*radius;
        for(let i=x-radius;i<x+radius;i+=1){
            for(let j=y-radius;j<y+radius;j+=1){
                if(i>0&&i<terrain.width-1&& j>0&&j<terrain.height-1){
                        const distSquared = (x-i)*(x-i) + (y-j)*(y-j);
                        if(distSquared<radiusSquared){//clear pixels in 30px radius
                            Terrain.#setBit(false,i,j,terrain);
                        }
                    }
            }
        }
    }
    static fillRect(terrain:Terrain,x:number,y:number,w:number,h:number){
        terrain.#isRendered = false;
        for(let i=x;i<x+w;i+=1){
            for(let j=y;j<y+h;j+=1){
                if(i>0&&i<terrain.width-1&& j>0&&j<terrain.height-1){
                        Terrain.#setBit(true,i,j,terrain);
                    }
            }
        }
    }
    static draw(ctx:CanvasRenderingContext2D,terrain:Terrain){
        //if there's a cached copy of the image to render, use that
        if(terrain.#isRendered){
            ctx.putImageData(terrain.#imageData,0,0);
            return;
        }
        //otherwise, regenerate
        const imageData =  ctx.createImageData(300, 150);
        for (let x = 0; x < imageData.width; x+=1) {
            for (let y = 0; y < imageData.height; y+=1) {
                // Index of the pixel in the array
                const isFilled = Terrain.getBit(x,y,terrain);
                const idx = (x + y * terrain.width) * 4;
                imageData.data[idx + 0] = 0;
                imageData.data[idx + 1] = isFilled?255:0;
                imageData.data[idx + 2] = 0;
                imageData.data[idx + 3] = isFilled?255:0;//TODO can always be 255 if background
            }
        }
        ctx.putImageData(imageData,0,0);
        terrain.#imageData = imageData;
        terrain.#isRendered = true;
    }
}
const xyToIdx = (x:number,y:number,width:number)=>{
    return y*width+x;
}
const idxToXy = (idx:number,width:number)=>{
    return [
        Math.floor(idx%width),//x
        Math.floor(idx/width)//y
    ];
}
class Game{
    #inputReader:KeyboardAndMouseInputReader;
    ctx:CanvasRenderingContext2D;
    rooms:Array<Room>;
    currentRoom:number;//room for the local player
    worldWidth:number;
    playerUid:number;
    static inputs = new Map<number,NetplayInput>();
    constructor(canvas:HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d");
        this.#inputReader = new KeyboardAndMouseInputReader(canvas);
        this.rooms = [];
        this.worldWidth = 128;
        for(let i=0;i<this.worldWidth;i+=1){
            for(let j=0;j<128;j+=1){
                const r = new Room();
                r.idx = this.rooms.length;
                const [x,y] = idxToXy(r.idx,this.worldWidth);
                r.x = x;
                r.y = y;
                r.terrain = new Terrain();
                Terrain.fillRect(r.terrain,0,50,300,100);
                this.rooms.push(r);
            }
        }
    }
    init(){
        this.init_objects(); //init the objects
        
        //note:bindings is a bitmask, should cap at ~32 
        this.#inputReader.bindings.set('ArrowRight', CONTROLS.RIGHT);
        this.#inputReader.bindings.set('ArrowLeft', CONTROLS.LEFT);
        this.#inputReader.bindings.set('ArrowUp', CONTROLS.JUMP);
        this.#inputReader.bindings.set('Space', CONTROLS.SHOOT);
        this.#inputReader.bindings.set('mouse_0', CONTROLS.SHOOT);
        
        Game.updateLoop();
        Game.renderLoop();
    }
    init_objects() {
        this.currentRoom = 500;
        const startingRoom  = this.rooms[this.currentRoom];
        const playerEntity = new Entity();//TODO: real init...
        playerEntity.kind = EntityKind.Player;
        this.playerUid = playerEntity.uid;//TODO: get player number for actual local player
        Room.AddEntity(startingRoom,playerEntity);
    }
    static updateLoop() {
        //TODO: feed in input via rollback...
        gameInstance.#inputReader.getInput();
        const inputs = gameInstance.#inputReader.getInput();
        Game.inputs.clear();
        Game.inputs.set(gameInstance.playerUid,inputs);//Player id:0
        
        //--update loop below
        for(const room of gameInstance.rooms){
            Room.update(room);
        }
        setTimeout(function () {
            Game.updateLoop();
        }, 1000 / 30); //the loop
    }
    static renderLoop() {
        gameInstance.ctx.clearRect(0, 0, gameInstance.ctx.canvas.width, gameInstance.ctx.canvas.height);
        const currentRoom = gameInstance.rooms[gameInstance.currentRoom];
        Room.draw(gameInstance.ctx,currentRoom);
        window.requestAnimationFrame(Game.renderLoop);
    }
}
let gameInstance:Game =null;
class Main {
	static init (){	
		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		gameInstance = new Game(canvas);
        gameInstance.init();
        console.log(gameInstance);
	}
}
export {Main};
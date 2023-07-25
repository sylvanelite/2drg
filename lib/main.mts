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

/*
TODO:
store players globally
on update()
read player input, for each player, update player.room

//--example:
for each room
    room.update()

in:room.update()
    if playerCount<1   return
    //on add(), if ent.kind == player, playerCount +=1
    //on remove(), if ent.kind == player, playerCount-=1;

    //on entity create() if kind == player, re-initialise current room if player count == 0??
*/

enum EntityKind{
    Player1 = 1,
    Player2 = 2,
    Player3 = 3,
    Player4 = 4,//TODO: more than 4 players
    Enemy = 10,
    Bullet = 100,
    Resource = 1000,
}
class Entity{
    id:number;
    kind:EntityKind;
    hp:number;
    maxHp:number;
    sprite:number;
    spriteFrame:number;
    position:{x:number,y:number};
    velocity:{x:number,y:number};
    size:{x:number,y:number};
    constructor(){
        this.id=0;this.kind = EntityKind.Enemy;
        this.hp=0;
        this.maxHp=100;
        this.sprite=0;
        this.spriteFrame=0;
        this.position={x:0,y:0};
        this.velocity={x:0,y:0};
        this.size={x:10,y:20};
    }
    static update(room:Room,entity:Entity){
        if(entity.kind == EntityKind.Player1){
            Entity.move_character(room,entity);
        }
//TODO:ent.kind
    }
    static draw(ctx:CanvasRenderingContext2D,entity:Entity){
        //TODO:ent.kind
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(entity.position.x,entity.position.y,entity.size.x,entity.size.y);
    }
    static move_character(room:Room,entity:Entity) {
        let i = 0;
        for (i = 0; i < 3; i+=1) {    
            if (wormsInstance.left_key) {
                if (!Terrain.hitTest(room.terrain, entity.position.x , entity.position.y, 1, 1)) {
                    entity.position.x -= 1;
                }
                while (Terrain.hitTest(room.terrain, entity.position.x, entity.position.y + 20, 10, 1)) {
                    entity.position.y -= 1;
                }
            }
            if (wormsInstance.right_key) {
                if (!Terrain.hitTest(room.terrain, entity.position.x + 10, entity.position.y, 1, 1)) {
                    entity.position.x += 1;
                }
                while (Terrain.hitTest(room.terrain, entity.position.x, entity.position.y + 20, 10, 1)) {
                    entity.position.y -= 1;
                }
            }
        }
        if (wormsInstance.space_key && !wormsInstance.jumping) {
            entity.velocity.y = -10;
            wormsInstance.jumping = true;
        }
        entity.velocity.y+=1; //is this going to work prooperly?
        if (entity.velocity.y > 0) {
            //check ground
            for (i = 0; i < entity.velocity.y; i+=1) {
                if (!Terrain.hitTest(room.terrain, entity.position.x, entity.position.y + 20, 10, 1)) {
                    entity.position.y += 1;
                } else {
                    wormsInstance.jumping = false;
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
            const idx = xyToIdx(room.x-1,room.y,wormsInstance.worldWidth);
            const targetRoom = wormsInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.x=room.terrain.width-entity.size.x-buffer;
            wormsInstance.currentRoom = idx;
        }
        if(entity.position.x+entity.size.x > room.terrain.width&& room.x<wormsInstance.worldWidth-1){
            const idx = xyToIdx(room.x+1,room.y,wormsInstance.worldWidth);
            const targetRoom = wormsInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.x=buffer;
            wormsInstance.currentRoom = idx;
        }
        if(entity.position.y<0 && room.y>0){
            const idx = xyToIdx(room.x,room.y-1,wormsInstance.worldWidth);
            const targetRoom = wormsInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.y=room.terrain.height-entity.size.y-buffer;
            wormsInstance.currentRoom = idx;
        }
        if(entity.position.y+entity.size.y > room.terrain.height&& room.y<wormsInstance.worldWidth-1){
            const idx = xyToIdx(room.x,room.y+1,wormsInstance.worldWidth);
            const targetRoom = wormsInstance.rooms[idx];
            Room.MoveEntity(room,targetRoom,entity);
            entity.position.y =buffer;
            wormsInstance.currentRoom = idx;
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
        entity.id=room.maxEntities;
        room.entities[room.maxEntities] = entity;//TODO: instead of overwriting, could copy props
        room.maxEntities+=1;
    }
    static RemoveEntity(room:Room,entity:Entity){
        //swap & pop, assumes iterating backwards
        if(room.maxEntities<=1){room.maxEntities=0;return;}//base case 1 or 0, nothing to remove
        const lastEntity = room.entities[room.maxEntities-1];//sawp current with last
        room.entities[entity.id] = lastEntity;//TODO: instead of overwriting, could copy props
        lastEntity.id = entity.id;
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
class WORMS{
    ctx:CanvasRenderingContext2D;
    rooms:Array<Room>;
    jumping:Boolean;
    left_key:Boolean;right_key:Boolean;space_key:Boolean;
    keys:Array<string>;
    playerId:EntityKind;
    currentRoom:number;//room for the local player
    worldWidth:number;
    constructor(canvas:HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d");
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
        document.onkeydown = this.key_down;
        document.onkeyup = this.key_up;
        document.onmouseup = this.mouse_up;
        this.jumping = false;
        this.left_key = false;
        this.right_key = false;
        this.space_key = false;
        this.keys = [];
        this.playerId = EntityKind.Player1;//TODO: set this to be your local ID...
    }
    init(){
        this.init_objects(); //init the objects
        WORMS.updateLoop();
        WORMS.renderLoop();
    }
    init_objects() {
        this.currentRoom = 500;
        const startingRoom  = this.rooms[this.currentRoom];
        const player1 = new Entity();//TODO: real init...
        player1.kind = this.playerId;
        Room.AddEntity(startingRoom,player1);
    }
    static updateLoop() {
        for(const room of wormsInstance.rooms){
            Room.update(room);
        }
        setTimeout(function () {
            WORMS.updateLoop();
        }, 1000 / 30); //the loop
    }
    static renderLoop() {
        wormsInstance.ctx.clearRect(0, 0, wormsInstance.ctx.canvas.width, wormsInstance.ctx.canvas.height);
        const currentRoom = wormsInstance.rooms[wormsInstance.currentRoom];
        Room.draw(wormsInstance.ctx,currentRoom);
        window.requestAnimationFrame(WORMS.renderLoop);
    }
    mouse_up(e:MouseEvent) {
        const x = e.offsetX, y = e.offsetY;
        Terrain.clearCircle(wormsInstance.rooms[wormsInstance.currentRoom].terrain,x,y,30);
    }
    key_down(e:KeyboardEvent) {
        const KeyID = e.key;
        if (KeyID === "ArrowLeft") wormsInstance.left_key = true;
        if (KeyID === "ArrowRight") wormsInstance.right_key = true;
        if (KeyID === "ArrowUp" || KeyID === " ") wormsInstance.space_key = true;
    }
    key_up = function (e:KeyboardEvent) {
        const KeyID = e.key;
        if (KeyID === "ArrowLeft") wormsInstance.left_key = false;
        if (KeyID === "ArrowRight") wormsInstance.right_key = false;
        if (KeyID === "ArrowUp" || KeyID === " ") wormsInstance.space_key = false;
    }
}
let wormsInstance:WORMS =null;
class Main {
	static init (){	
		const canvas = document.getElementById("canvas") as HTMLCanvasElement;
		wormsInstance = new WORMS(canvas);
        wormsInstance.init();
	}
}
export {Main};
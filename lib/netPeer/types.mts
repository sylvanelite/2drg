abstract class NetplayState {
    abstract tick(playerInputs: Map<number, NetplayInput>): void;//NOTE: tick assumes playerInputs will not be mutated
    abstract serialize(): string;
    abstract deserialize(value: string): void;
}


function BIT_SET(a:number,b:number):number{ ((a) |= (0x01<<(b)));return a;}
function BIT_CLEAR(a:number,b:number):number{ ((a) &= ~(0x01<<(b)));return a;}
function BIT_CHECK(a:number,b:number):boolean{return  (!!((a) & (0x01<<(b))));}
const SIZE_OF_INT = 32;

class NetplayInput {
    isPrediction:boolean = false;
    //how the input should carry over from one frame to the next
    //by default, just assume input remains unchanged
    //for example, could alter this to have mouse velocity or similar
    predictNext(): NetplayInput {
        const res = new NetplayInput();
        res.deserialize(this.serialize());
        res.isPrediction=true;
        return res;
    }
    serialize(): string {
        return this.keysPressed+','+this.keysReleased+','+
                (this.mousePosition?.x??-1)+','+(this.mousePosition?.y??-1);
    }
    deserialize(jsonStr: string): void {
        const [press,release,mousex,mousey] = jsonStr.split(',').map(x=>Number(x));
        this.keysPressed = press;
        this.keysReleased = release;
        if(mousex>=0&&mousey>=0){
            this.mousePosition = {x:mousex,y:mousey};
        }
    }
    static setPressed(ipt:NetplayInput,key:number){ ipt.keysPressed = BIT_SET(ipt.keysPressed,key); }
    static setReleased(ipt:NetplayInput,key:number){ ipt.keysReleased = BIT_SET(ipt.keysReleased,key); }
    static clearPressed(ipt:NetplayInput,key:number){ ipt.keysPressed = BIT_CLEAR(ipt.keysPressed,key); }
    static clearReleased(ipt:NetplayInput,key:number){ ipt.keysReleased = BIT_CLEAR(ipt.keysReleased,key); }
    static getPressed(ipt:NetplayInput,key:number){ return ipt&& BIT_CHECK(ipt.keysPressed,key); }
    static getReleased(ipt:NetplayInput,key:number){ return ipt&&BIT_CHECK(ipt.keysReleased,key); }
    keysPressed: number = 0;
    keysReleased:number  = 0;
    mousePosition?: { x: number; y: number };
}


export {NetplayState,NetplayInput};
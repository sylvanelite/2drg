import { NetplayInput } from './netPeer/types.mjs';

abstract class InputReader {
  bindings:Map<string,number> = new Map();//Local key bindings, keyboad->action name.
                                          //action name is an index into a bitmask for each key
  inputMap:Map<number,NetplayInput> = new Map();//map from playerId to their input
  pressed(input:NetplayInput,key:number):boolean{ return NetplayInput.getPressed(input,key); }
  released(input:NetplayInput,key:number):boolean{ return NetplayInput.getReleased(input,key); }
  abstract getInput(): NetplayInput;
}
class KeyboardAndMouseInputReader extends InputReader {
    canvas: HTMLCanvasElement;
    mousePosition: { x: number; y: number } | null = null;
    mouseDelta: { x: number; y: number } | null = null;
    keyboardInput = new NetplayInput();
  
    getCanvasScale(): { x: number; y: number } {
      const rect = this.canvas.getBoundingClientRect();
      return {
        x: this.canvas.width / rect.width,
        y: this.canvas.height / rect.height,
      };
    }
  
    projectClientPosition( clientX: number, clientY: number ): { x: number; y: number } {
      const rect = this.canvas.getBoundingClientRect();
      const scale = this.getCanvasScale();
  
      return {
        x: (clientX - rect.left) * scale.x,
        y: (clientY - rect.top) * scale.y,
      };
    }
  
    constructor( canvas: HTMLCanvasElement ) {
        super();
      this.canvas = canvas;
      canvas.addEventListener( "mouseenter",
        (e) =>{this.mousePosition = this.projectClientPosition( e.clientX,  e.clientY);},
        false );
  
      canvas.addEventListener( "mousemove",
      (e) =>{this.mousePosition = this.projectClientPosition( e.clientX,  e.clientY);},
        false );
  
      canvas.addEventListener( "mouseleave",
        (e) => {
          this.mousePosition = null;
        },
        false );
        canvas.addEventListener( "mousedown",
          (e) => {
            /*
//TODO: need to bit-check the mosue buttons:
//https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button         
0: left button
1: middle button
2: right button*/
            if(!this.bindings.has("mouse_"+e.button)){return;}
            const bind = this.bindings.get("mouse_"+e.button);
            NetplayInput.setPressed(this.keyboardInput,bind);
            NetplayInput.clearReleased(this.keyboardInput,bind);
          },
          false );
          canvas.addEventListener( "mouseup",
            (e) => {
                if(!this.bindings.has("mouse_"+e.button)){return;}
                const bind = this.bindings.get("mouse_"+e.button);
                NetplayInput.clearPressed(this.keyboardInput,bind);
                NetplayInput.setReleased(this.keyboardInput,bind);
            },
            false );
      const root = document.body;  
      root.addEventListener( "keydown", (event) => {
          if (event.repeat) return;
          if(!this.bindings.has(event.code)){return;}
          const bind = this.bindings.get(event.code);
          NetplayInput.setPressed(this.keyboardInput,bind);
          NetplayInput.clearReleased(this.keyboardInput,bind);
        }, false );
      root.addEventListener( "keyup", (event) => {
          if(!this.bindings.has(event.code)){return;}
          const bind = this.bindings.get(event.code);
          NetplayInput.clearPressed(this.keyboardInput,bind);
          NetplayInput.setReleased(this.keyboardInput,bind);
        }, false );
    }

  
    getInput(): NetplayInput {
      let input = new NetplayInput();
      if (this.mousePosition){
        input.mousePosition = {
            x:this.mousePosition.x,
            y:this.mousePosition.y
        }
      }
      input.keysPressed = this.keyboardInput.keysPressed;
      input.keysReleased = this.keyboardInput.keysReleased;
      return input;
    }
    
}

export {KeyboardAndMouseInputReader}
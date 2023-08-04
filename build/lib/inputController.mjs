import { NetplayInput } from './netPeer/netplayInput.mjs';
class InputReader {
    bindings = new Map();
    pressed(input, key) { return NetplayInput.getPressed(input, key); }
    released(input, key) { return NetplayInput.getReleased(input, key); }
}
class KeyboardAndMouseInputReader extends InputReader {
    canvas;
    mousePosition = null;
    mouseDelta = null;
    keyboardInput = new NetplayInput();
    getCanvasScale() {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: this.canvas.width / rect.width,
            y: this.canvas.height / rect.height,
        };
    }
    projectClientPosition(clientX, clientY) {
        const rect = this.canvas.getBoundingClientRect();
        const scale = this.getCanvasScale();
        return {
            x: (clientX - rect.left) * scale.x,
            y: (clientY - rect.top) * scale.y,
        };
    }
    constructor(canvas) {
        super();
        this.canvas = canvas;
        canvas.addEventListener("mouseenter", (e) => { this.mousePosition = this.projectClientPosition(e.clientX, e.clientY); }, false);
        canvas.addEventListener("mousemove", (e) => { this.mousePosition = this.projectClientPosition(e.clientX, e.clientY); }, false);
        canvas.addEventListener("mouseleave", (e) => {
            this.mousePosition = null;
        }, false);
        canvas.addEventListener("mousedown", (e) => {
            if (!this.bindings.has("mouse_" + e.button)) {
                return;
            }
            const bind = this.bindings.get("mouse_" + e.button);
            NetplayInput.setPressed(this.keyboardInput, bind);
            NetplayInput.clearReleased(this.keyboardInput, bind);
        }, false);
        canvas.addEventListener("mouseup", (e) => {
            if (!this.bindings.has("mouse_" + e.button)) {
                return;
            }
            const bind = this.bindings.get("mouse_" + e.button);
            NetplayInput.clearPressed(this.keyboardInput, bind);
            NetplayInput.setReleased(this.keyboardInput, bind);
        }, false);
        const root = canvas.parentElement;
        root.addEventListener("keydown", (event) => {
            if (event.repeat)
                return;
            if (!this.bindings.has(event.code)) {
                return;
            }
            const bind = this.bindings.get(event.code);
            NetplayInput.setPressed(this.keyboardInput, bind);
            NetplayInput.clearReleased(this.keyboardInput, bind);
        }, false);
        root.addEventListener("keyup", (event) => {
            if (!this.bindings.has(event.code)) {
                return;
            }
            const bind = this.bindings.get(event.code);
            NetplayInput.clearPressed(this.keyboardInput, bind);
            NetplayInput.setReleased(this.keyboardInput, bind);
        }, false);
    }
    getInput() {
        let input = new NetplayInput();
        if (this.mousePosition) {
            input.mousePosition = {
                x: this.mousePosition.x,
                y: this.mousePosition.y
            };
        }
        input.keysPressed = this.keyboardInput.keysPressed;
        input.keysReleased = this.keyboardInput.keysReleased;
        return input;
    }
}
export { KeyboardAndMouseInputReader };
//# sourceMappingURL=inputController.mjs.map
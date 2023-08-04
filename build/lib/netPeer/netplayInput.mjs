import { Bit } from "../types.mjs";
class NetplayState {
}
class NetplayInput {
    isPrediction = false;
    predictNext() {
        const res = new NetplayInput();
        res.deserialize(this.serialize());
        res.isPrediction = true;
        return res;
    }
    serialize() {
        return this.keysPressed + ',' + this.keysReleased + ',' +
            (this.mousePosition?.x ?? -1) + ',' + (this.mousePosition?.y ?? -1);
    }
    deserialize(jsonStr) {
        const [press, release, mousex, mousey] = jsonStr.split(',').map(x => Number(x));
        this.keysPressed = press;
        this.keysReleased = release;
        if (mousex >= 0 && mousey >= 0) {
            this.mousePosition = { x: mousex, y: mousey };
        }
    }
    static setPressed(ipt, key) { ipt.keysPressed = Bit.BIT_SET(ipt.keysPressed, key); }
    static setReleased(ipt, key) { ipt.keysReleased = Bit.BIT_SET(ipt.keysReleased, key); }
    static clearPressed(ipt, key) { ipt.keysPressed = Bit.BIT_CLEAR(ipt.keysPressed, key); }
    static clearReleased(ipt, key) { ipt.keysReleased = Bit.BIT_CLEAR(ipt.keysReleased, key); }
    static getPressed(ipt, key) { return ipt && Bit.BIT_CHECK(ipt.keysPressed, key); }
    static getReleased(ipt, key) { return ipt && Bit.BIT_CHECK(ipt.keysReleased, key); }
    keysPressed = 0;
    keysReleased = 0;
    mousePosition;
}
export { NetplayState, NetplayInput };
//# sourceMappingURL=netplayInput.mjs.map
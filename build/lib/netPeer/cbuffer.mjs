class CBuffer {
    length = 0;
    data;
    end = 0;
    start = 0;
    constructor(size) {
        if (size <= 0) {
            throw new Error('Missing Argument: buffer size');
        }
        this.data = Array(size);
        this.end = (this.data.length) - 1;
    }
    push(item) {
        if (this.length + 1 > this.data.length) {
            throw new Error("circular buffer: push overflow");
        }
        this.data[(this.end + 1) % this.data.length] = item;
        this.length += 1;
        this.end = (this.end + 1) % this.data.length;
        this.start = (this.data.length + this.end - this.length + 1) % this.data.length;
    }
    shift() {
        if (this.length === 0)
            return;
        this.start = (this.start + 1) % this.data.length;
        this.length -= 1;
    }
    get(idx) {
        if (idx < 0 || idx >= this.length) {
            throw new Error("circular buffer: out of bounds get: " + idx);
        }
        return this.data[(this.start + idx) % this.data.length];
    }
}
export { CBuffer };
//# sourceMappingURL=cbuffer.mjs.map
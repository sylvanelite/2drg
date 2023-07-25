//based on: https://github.com/trevnorris/cbuffer/blob/master/cbuffer.js  MIT license

class CBuffer<T> {
    length:number = 0;//how many elements currently in buffer
    data:Array<T>;//the actual elements, fixed size upon creation
    end:number = 0;//index to tail
    start:number = 0;//index to head
    constructor(size:number){
        if (size <= 0){throw new Error('Missing Argument: buffer size');}
        this.data = Array(size);
        this.end = (this.data.length) - 1;
    }
    push (item:T) {// insert items at the end
      if (this.length + 1 > this.data.length) { throw new Error("circular buffer: push overflow"); }
      this.data[(this.end + 1) % this.data.length] = item;
      this.length += 1;
      this.end = (this.end + 1) % this.data.length;
      this.start = (this.data.length + this.end - this.length + 1) % this.data.length;
    }
    shift () {// remove first item
      if (this.length === 0) return;
      this.start = (this.start + 1) % this.data.length;
      this.length-=1;
    }
    get (idx:number) {// return specific index in buffer
        if(idx<0||idx>=this.length){ throw new Error("circular buffer: out of bounds get: "+idx);}
        return this.data[(this.start + idx) % this.data.length];
    }
}

export {CBuffer};



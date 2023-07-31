// https://github.com/kchapelier/convchain (MIT)
//modifed to accept only Uint8Array as sample, and added types
import { PRNG } from "./types.mjs";
class ConvChain{
    static RNG(){
        return PRNG.prng();
    }
    //sample: Sample pattern as a flat array or a 2D array
    sample:Uint8Array;
    sampleWidth:number;
    sampleHeight:number;
    cachedN:number;
    cachedWeights:Float32Array;
    constructor(sample:Uint8Array){
        this.setSample(sample);

    }
    //Set the sample pattern
    setSample(sample:Uint8Array) {
        // assume flat array
        this.sample = sample;
        this.sampleWidth = this.sampleHeight = Math.sqrt(sample.length);
        // invalidate cached weights
        this.cachedN = null;
        this.cachedWeights = null;
    }
    #getWeights(n:number):Float32Array {
        // check if we have to generate new weights, otherwise return cached result
        if (this.cachedN !== n) {
            this.cachedN = n;
            this.cachedWeights = ConvChain.#processWeights(this.sample, this.sampleWidth, this.sampleHeight, n);
        }
        return this.cachedWeights;
    }
    generate (resultWidth:number,resultHeight:number, n:number, temperature:number, iterations:number) {
        const changesPerIterations = resultWidth * resultHeight;
        const field = ConvChain.#generateBaseField(resultWidth, resultHeight);
        const weights = this.#getWeights(n);
        for (let i = 0; i < iterations; i++) {
            ConvChain.#applyChanges(field, weights, resultWidth, resultHeight, n, temperature, changesPerIterations);
        }
        return field;
    }
    static #processWeights (sample:Uint8Array, sampleWidth:number, sampleHeight:number, n:number) {
        const weights = new Float32Array(1 << (n * n));
        const  pattern = function pattern (fn:Function):Array<number> {
            const  result = new Array(n * n);
            for (let y = 0; y < n; y++) {
                for (let x = 0; x < n; x++) {
                    result[x + y * n] = fn(x, y);
                }
            }
            return result;
        };
        const  rotate = function rotate (p:Array<number>) {
            return pattern(function (x:number, y:number) { return p[n - 1 - y + x * n]; });
        };
        const  reflect = function reflect (p:Array<number>) {
            return pattern(function (x:number, y:number) { return p[n - 1 - x + y * n]; });
        };
        const  index = function index (p:Array<number>) {
            let result = 0,
                power = 1;
            for (let i = 0; i < p.length; i++) {
                result += p[p.length - 1 - i] ? power : 0;
                power *= 2;
            }
            return result;
        };
        for (let y = 0; y < sampleHeight; y++) {
            for (let x = 0; x < sampleWidth; x++) {
                const  p0 = pattern(function (dx:number, dy:number) { return sample[((x + dx) % sampleWidth) + ((y + dy) % sampleHeight) * sampleWidth]; }),
                    p1 = rotate(p0),
                    p2 = rotate(p1),
                    p3 = rotate(p2),
                    p4 = reflect(p0),
                    p5 = reflect(p1),
                    p6 = reflect(p2),
                    p7 = reflect(p3);
                weights[index(p0)] += 1;
                weights[index(p1)] += 1;
                weights[index(p2)] += 1;
                weights[index(p3)] += 1;
                weights[index(p4)] += 1;
                weights[index(p5)] += 1;
                weights[index(p6)] += 1;
                weights[index(p7)] += 1;
            }
        }
        for (let k = 0; k < weights.length; k++) {
            if (weights[k] <= 0) {
                weights[k] = 0.1;
            }
        }
        return weights;
    }
    static #generateBaseField(resultWidth:number, resultHeight:number ) {
        const field = new Uint8Array(resultWidth * resultHeight);
        for (let i = 0; i < field.length; i++) {
            field[i] = (ConvChain.RNG() < 0.5) ?1:0;
        }
        return field;
    }
    static #applyChanges(field:Uint8Array, weights:Float32Array, resultWidth:number, resultHeight:number, n:number, temperature:number, changes:number) {
        for (let i = 0; i < changes; i++) {
            let q = 1;
            let r = (ConvChain.RNG() * resultWidth * resultHeight) | 0;
            let x = (r % resultWidth) | 0;
            let y = (r / resultWidth) | 0;
            for (let sy = y - n + 1; sy <= y + n - 1; sy++) {
                for (let sx = x - n + 1; sx <= x + n - 1; sx++) {
                    let ind = 0;
                    let difference = 0;
                    for (let dy = 0; dy < n; dy++) {
                        for (let dx = 0; dx < n; dx++) {
                            const  power = 1 << (dy * n + dx);
                            let X = sx + dx;
                            let Y = sy + dy;
                            let value;
                            if (X < 0) {
                                X += resultWidth;
                            } else if (X >= resultWidth) {
                                X -= resultWidth;
                            }
                            if (Y < 0) {
                                Y += resultHeight;
                            } else if (Y >= resultHeight) {
                                Y -= resultHeight;
                            }
                            value = field[X + Y * resultWidth];
                            ind += value ? power : 0;
                            if (X === x && Y === y) {
                                difference = value ? power : -power;
                            }
                        }
                    }
                    q *= weights[ind - difference] / weights[ind];
                }
            }
            if (q >= 1) {
                field[x + y * resultWidth] = (!field[x + y * resultWidth] ?1:0);
            } else {
                if (temperature != 1) {
                    q = Math.pow(q, 1.0 / temperature);
                }
                if (q > ConvChain.RNG()) {
                    field[x + y * resultWidth] = (!field[x + y * resultWidth]?1:0);
                }
            }
        }
    }
}

export { ConvChain }
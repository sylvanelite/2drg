declare class ConvChain {
    #private;
    static RNG(): number;
    sample: Uint8Array;
    sampleWidth: number;
    sampleHeight: number;
    cachedN: number;
    cachedWeights: Float32Array;
    constructor(sample: Uint8Array);
    setSample(sample: Uint8Array): void;
    generate(resultWidth: number, resultHeight: number, n: number, temperature: number, iterations: number): Uint8Array;
}
export { ConvChain };

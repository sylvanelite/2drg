declare class CBuffer<T> {
    length: number;
    data: Array<T>;
    end: number;
    start: number;
    constructor(size: number);
    push(item: T): void;
    shift(): void;
    get(idx: number): T;
}
export { CBuffer };

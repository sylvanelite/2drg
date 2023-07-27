
const CONTROLS={
    LEFT:1,
    RIGHT:2,
    JUMP:3,
    SHOOT:4
};
enum EntityKind{
    Player = 1,
    Enemy = 10,
    Bullet = 100,
    Resource = 1000,
}
enum EuqippedKind{
    WEAPON_FLAMETHROWER=1,
    WEAPON_PIERCE=2,
    WEAPON_MACHINEGUN=3,

    ENEMY_GRUNT=10,
    ENEMY_WINGED=11,

    MINERAL_HP=100,
    MINERAL_RESOURCE_1=101
}

//https://burtleburtle.net/bob/rand/smallprng.html (I wrote this PRNG. I place it in the public domain. )
//https://github.com/bryc/code/blob/master/jshash/PRNGs.md (License: Public domain. )
//https://gist.github.com/imneme/85cff47d4bad8de6bdeb671f9c76c814 - The MIT License (MIT)
//JSF / smallprng
// 3-rotate version, improves randomness.

class PRNG{
	static RNG_A=42;//TODO: remove from beind global
	static RNG_B=1234;
	static RNG_C=5678;
	static RNG_D=9001;

	static prng(seed:number=null){
		if(seed){
			PRNG.RNG_A=seed;
			PRNG.RNG_B=seed*10;
			PRNG.RNG_C=seed*100;
			PRNG.RNG_D=seed*1000;
		}
		PRNG.RNG_A |= 0; PRNG.RNG_B |= 0; PRNG.RNG_C |= 0; PRNG.RNG_D |= 0;
		const t = PRNG.RNG_A - (PRNG.RNG_B << 23 | PRNG.RNG_B >>> 9) | 0;
		PRNG.RNG_A = PRNG.RNG_B ^ (PRNG.RNG_C << 16 | PRNG.RNG_C >>> 16) | 0;
		PRNG.RNG_B = PRNG.RNG_C + (PRNG.RNG_D << 11 | PRNG.RNG_D >>> 21) | 0;
		PRNG.RNG_B = PRNG.RNG_C + PRNG.RNG_D | 0;
		PRNG.RNG_C = PRNG.RNG_D + t | 0;
		PRNG.RNG_D = PRNG.RNG_A + t | 0;
		
		return (PRNG.RNG_D >>> 0) / 4294967296;//remove divide to make an int instead of float?
	}
}


//https://stackoverflow.com/questions/664014/what-integer-hash-function-are-good-that-accepts-an-integer-hash-key
const hash =  (x:number)=> {
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = (x >> 16) ^ x;
    return x;
};
const xyToIdx = (x:number,y:number,width:number)=>{
    return y*width+x;
};
const idxToXy = (idx:number,width:number)=>{
    return [
        Math.floor(idx%width),//x
        Math.floor(idx/width)//y
    ];
};
//bit manipulation helper functions 
class Bit {
	static BIT_CHECK(a:number,b:number):boolean{return  (!!((a) & (0x01<<(b))));}
	static BIT_SET(a:number,b:number):number{ ((a) |= (0x01<<(b)));return a;}
	static BIT_CLEAR(a:number,b:number):number{ ((a) &= ~(0x01<<(b)));return a;}
}
const SIZE_OF_INT = 32;

export {Bit,hash,xyToIdx,idxToXy,PRNG,CONTROLS,EntityKind,EuqippedKind,SIZE_OF_INT};
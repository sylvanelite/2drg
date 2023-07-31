import { Room } from "../../lib/Room.mjs";
import { Terrain } from "../../lib/Terrain.mjs";


describe("test terrain",function(){
	it("empty terrain",async function() {
        const terrain = new Terrain();
        expect(Terrain.hitTest(terrain,0,0,terrain.width,terrain.height)).toBe(false);
    });
	it("filled terrain",async function() {
        const terrain = new Terrain();
        Terrain.fillRect(terrain,12,12,12,12);
        expect(Terrain.hitTest(terrain,0,0,terrain.width,terrain.height)).toBe(true);
        expect(Terrain.getBit(12,12,terrain)).toBe(true);
        expect(Terrain.getBit(13,13,terrain)).toBe(true);
        expect(Terrain.getBit(11,11,terrain)).toBe(false);
        expect(Terrain.clearCircle(terrain,12,12,32));
        expect(Terrain.hitTest(terrain,0,0,terrain.width,terrain.height)).toBe(false);
        expect(Terrain.getBit(12,12,terrain)).toBe(false);
        expect(Terrain.getBit(13,13,terrain)).toBe(false);
        expect(Terrain.getBit(11,11,terrain)).toBe(false);
    });
});


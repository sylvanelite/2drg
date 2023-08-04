import { NetplayInput } from "../../lib/netPeer/netplayInput.mjs";
import { KEY_A, cleanup, RollbackTestWrapper, GameTestInstance, waitForMessageQueue } from "./mock_network.mjs";
describe("test rollback interval", function () {
    it("check lockstep", async function () {
        const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const players = [{ peerid: rbplayerA.networkId, telegraphPlayerNum: 0 },
            { peerid: rbplayerB.networkId, telegraphPlayerNum: 1 }];
        rbplayerA.onStart(new GameTestInstance(), players, 0);
        rbplayerB.onStart(new GameTestInstance(), players, 1);
        NetplayInput.setPressed(rbplayerA.localinput, KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput, KEY_A);
        const frameCount = 10;
        const timePerFrame = 15;
        for (let i = 0; i < frameCount; i += 1) {
            rbplayerA.rollbackNetcode._updateInterval(timePerFrame);
            rbplayerB.rollbackNetcode._updateInterval(timePerFrame);
            await waitForMessageQueue();
        }
        expect(rbplayerA.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerB.game.internalState.player1).toBe(200 + frameCount);
        await cleanup();
    });
    it("check one running slow", async function () {
        const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const players = [{ peerid: rbplayerA.networkId, telegraphPlayerNum: 0 },
            { peerid: rbplayerB.networkId, telegraphPlayerNum: 1 }];
        rbplayerA.onStart(new GameTestInstance(), players, 0);
        rbplayerB.onStart(new GameTestInstance(), players, 1);
        NetplayInput.setPressed(rbplayerA.localinput, KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput, KEY_A);
        const frameCount = 10;
        const timePerFrameA = 15;
        const timePerFrameB = 100;
        for (let i = 0; i < frameCount; i += 1) {
            rbplayerA.rollbackNetcode._updateInterval(timePerFrameA);
            rbplayerB.rollbackNetcode._updateInterval(timePerFrameB);
            await waitForMessageQueue();
        }
        expect(rbplayerA.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerB.game.internalState.player1).toBe(200 + frameCount);
        await cleanup();
    });
    it("check one running fast", async function () {
        const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const players = [{ peerid: rbplayerA.networkId, telegraphPlayerNum: 0 },
            { peerid: rbplayerB.networkId, telegraphPlayerNum: 1 }];
        rbplayerA.onStart(new GameTestInstance(), players, 0);
        rbplayerB.onStart(new GameTestInstance(), players, 1);
        NetplayInput.setPressed(rbplayerA.localinput, KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput, KEY_A);
        const frameCount = 10;
        const timePerFrameA = 15;
        const timePerFrameB = 1;
        for (let i = 0; i < frameCount; i += 1) {
            rbplayerA.rollbackNetcode._updateInterval(timePerFrameA);
            rbplayerB.rollbackNetcode._updateInterval(timePerFrameB);
            await waitForMessageQueue();
        }
        expect(rbplayerA.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerB.game.internalState.player1).toBe(200 + frameCount);
        await cleanup();
    });
    it("check one not running", async function () {
        const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const players = [{ peerid: rbplayerA.networkId, telegraphPlayerNum: 0 },
            { peerid: rbplayerB.networkId, telegraphPlayerNum: 1 }];
        rbplayerA.onStart(new GameTestInstance(), players, 0);
        rbplayerB.onStart(new GameTestInstance(), players, 1);
        NetplayInput.setPressed(rbplayerA.localinput, KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput, KEY_A);
        const frameCount = 12;
        const timePerFrameA = 15;
        const timePerFrameB = 10000;
        for (let i = 0; i < frameCount; i += 1) {
            rbplayerA.rollbackNetcode._updateInterval(timePerFrameA);
            await waitForMessageQueue();
        }
        rbplayerB.rollbackNetcode._updateInterval(timePerFrameB);
        await waitForMessageQueue();
        expect(rbplayerA.game.internalState.player0).toBe(100 + 9);
        expect(rbplayerA.game.internalState.player1).toBe(200 + 0);
        expect(rbplayerB.game.internalState.player0).toBe(100 + 2);
        expect(rbplayerB.game.internalState.player1).toBe(200 + 2);
        await cleanup();
    });
    it("check one not running, many iterations", async function () {
        const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const players = [{ peerid: rbplayerA.networkId, telegraphPlayerNum: 0 },
            { peerid: rbplayerB.networkId, telegraphPlayerNum: 1 }];
        rbplayerA.onStart(new GameTestInstance(), players, 0);
        rbplayerB.onStart(new GameTestInstance(), players, 1);
        NetplayInput.setPressed(rbplayerA.localinput, KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput, KEY_A);
        const frameCount = 12;
        const timePerFrameA = 15;
        const timePerFrameB = 10000;
        const iterationCount = 5;
        for (let j = 0; j < iterationCount; j += 1) {
            for (let i = 0; i < frameCount; i += 1) {
                rbplayerA.rollbackNetcode._updateInterval(timePerFrameA);
                await waitForMessageQueue();
            }
            rbplayerB.rollbackNetcode._updateInterval(timePerFrameB);
            await waitForMessageQueue();
        }
        expect(rbplayerA.game.internalState.player0).toBe(100 + 17);
        expect(rbplayerA.game.internalState.player1).toBe(200 + 17);
        expect(rbplayerB.game.internalState.player0).toBe(100 + 10);
        expect(rbplayerB.game.internalState.player1).toBe(200 + 10);
        await cleanup();
    });
});
describe("test rollback interval - multi ", function () {
    it("check one not running, many iterations", async function () {
        const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const rbplayerC = new RollbackTestWrapper();
        rbplayerC.join(rbplayerA.networkId);
        const players = [{ peerid: rbplayerA.networkId, telegraphPlayerNum: 0 },
            { peerid: rbplayerB.networkId, telegraphPlayerNum: 1 },
            { peerid: rbplayerC.networkId, telegraphPlayerNum: 2 }];
        rbplayerA.onStart(new GameTestInstance(), players, 0);
        rbplayerB.onStart(new GameTestInstance(), players, 1);
        rbplayerC.onStart(new GameTestInstance(), players, 2);
        NetplayInput.setPressed(rbplayerA.localinput, KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput, KEY_A);
        NetplayInput.setPressed(rbplayerC.localinput, KEY_A);
        const frameCount = 12;
        const timePerFrameA = 15;
        const timePerFrameB = 10000;
        const timePerFrameC = 1;
        const iterationCount = 5;
        for (let j = 0; j < iterationCount; j += 1) {
            for (let i = 0; i < frameCount; i += 1) {
                rbplayerC.rollbackNetcode._updateInterval(timePerFrameC);
                rbplayerA.rollbackNetcode._updateInterval(timePerFrameA);
                await waitForMessageQueue();
            }
            rbplayerB.rollbackNetcode._updateInterval(timePerFrameB);
            await waitForMessageQueue();
        }
        expect(rbplayerA.game.internalState.player0).toBe(100 + 17);
        expect(rbplayerA.game.internalState.player1).toBe(200 + 17);
        expect(rbplayerA.game.internalState.player2).toBe(300 + 17);
        expect(rbplayerB.game.internalState.player0).toBe(100 + 10);
        expect(rbplayerB.game.internalState.player1).toBe(200 + 10);
        expect(rbplayerB.game.internalState.player2).toBe(300 + 10);
        expect(rbplayerC.game.internalState.player0).toBe(100 + 17);
        expect(rbplayerC.game.internalState.player1).toBe(200 + 17);
        expect(rbplayerC.game.internalState.player2).toBe(300 + 17);
        await cleanup();
    });
});
//# sourceMappingURL=test_speedup.spec.mjs.map
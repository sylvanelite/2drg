import { NetplayInput } from "../../lib/netPeer/netplayInput.mjs";
import { KEY_A, BUFFER_LIMIT, cleanup, RollbackTestWrapper, GameTestInstance, waitForMessageQueue } from "./mock_network.mjs";
describe("test multi", function () {
    it("check prediction", async function () {
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
        const frameCount = 7;
        for (let i = 0; i < frameCount; i += 1) {
            rbplayerA.rollbackNetcode.tick();
            rbplayerB.rollbackNetcode.tick();
            rbplayerC.rollbackNetcode.tick();
        }
        expect(rbplayerA.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200);
        expect(rbplayerA.game.internalState.player2).toBe(300);
        expect(rbplayerB.game.internalState.player0).toBe(100);
        expect(rbplayerB.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerB.game.internalState.player2).toBe(300);
        expect(rbplayerC.game.internalState.player0).toBe(100);
        expect(rbplayerC.game.internalState.player1).toBe(200);
        expect(rbplayerC.game.internalState.player2).toBe(300 + frameCount);
        await waitForMessageQueue();
        rbplayerA.rollbackNetcode.updateSimulations();
        rbplayerB.rollbackNetcode.updateSimulations();
        rbplayerC.rollbackNetcode.updateSimulations();
        expect(rbplayerA.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerA.game.internalState.player2).toBe(300 + frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerB.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerB.game.internalState.player2).toBe(300 + frameCount);
        expect(rbplayerC.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerC.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerC.game.internalState.player2).toBe(300 + frameCount);
        NetplayInput.clearPressed(rbplayerA.localinput, KEY_A);
        NetplayInput.clearPressed(rbplayerB.localinput, KEY_A);
        NetplayInput.clearPressed(rbplayerC.localinput, KEY_A);
        for (let i = 0; i < frameCount; i += 1) {
            rbplayerA.rollbackNetcode.tick();
            rbplayerB.rollbackNetcode.tick();
            rbplayerC.rollbackNetcode.tick();
        }
        expect(rbplayerA.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200 + frameCount * 2);
        expect(rbplayerA.game.internalState.player2).toBe(300 + frameCount * 2);
        expect(rbplayerB.game.internalState.player0).toBe(100 + frameCount * 2);
        expect(rbplayerB.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerB.game.internalState.player2).toBe(300 + frameCount * 2);
        expect(rbplayerC.game.internalState.player0).toBe(100 + frameCount * 2);
        expect(rbplayerC.game.internalState.player1).toBe(200 + frameCount * 2);
        expect(rbplayerC.game.internalState.player2).toBe(300 + frameCount);
        await waitForMessageQueue();
        rbplayerA.rollbackNetcode.updateSimulations();
        rbplayerB.rollbackNetcode.updateSimulations();
        rbplayerC.rollbackNetcode.updateSimulations();
        expect(rbplayerA.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerA.game.internalState.player2).toBe(300 + frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerB.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerB.game.internalState.player2).toBe(300 + frameCount);
        expect(rbplayerC.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerC.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerC.game.internalState.player2).toBe(300 + frameCount);
        await cleanup();
    });
    it("check out of order tick and updates", async function () {
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
        const frameCount = 7;
        for (let i = 0; i < frameCount; i += 1) {
            rbplayerA.rollbackNetcode.updateSimulations();
            rbplayerB.rollbackNetcode.updateSimulations();
            rbplayerA.rollbackNetcode.tick();
            rbplayerB.rollbackNetcode.tick();
            rbplayerB.rollbackNetcode.tick();
            rbplayerC.rollbackNetcode.tick();
            await waitForMessageQueue();
            rbplayerA.rollbackNetcode.updateSimulations();
            rbplayerB.rollbackNetcode.updateSimulations();
        }
        rbplayerC.rollbackNetcode.updateSimulations();
        expect(rbplayerA.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerA.game.internalState.player2).toBe(300 + frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100 + frameCount * 2);
        expect(rbplayerB.game.internalState.player1).toBe(200 + frameCount * 2);
        expect(rbplayerB.game.internalState.player2).toBe(300 + frameCount * 2);
        expect(rbplayerC.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerC.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerC.game.internalState.player2).toBe(300 + frameCount);
        await cleanup();
    });
    it("check buffer limit", async function () {
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
        const frameCount = 20;
        const delta = 11;
        for (let i = 0; i < frameCount; i += 1) {
            rbplayerA.rollbackNetcode.tick();
        }
        for (let i = 0; i < frameCount - delta; i += 1) {
            rbplayerB.rollbackNetcode.tick();
        }
        rbplayerC.rollbackNetcode.tick();
        expect(rbplayerA.game.internalState.player0).toBe(100 + Math.min(frameCount, BUFFER_LIMIT - 1));
        expect(rbplayerA.game.internalState.player1).toBe(200);
        expect(rbplayerA.game.internalState.player2).toBe(300);
        expect(rbplayerB.game.internalState.player0).toBe(100);
        expect(rbplayerB.game.internalState.player1).toBe(200 + Math.min(frameCount - delta, BUFFER_LIMIT - 1));
        expect(rbplayerB.game.internalState.player2).toBe(300);
        expect(rbplayerC.game.internalState.player0).toBe(100);
        expect(rbplayerC.game.internalState.player1).toBe(200);
        expect(rbplayerC.game.internalState.player2).toBe(300 + 1);
        await waitForMessageQueue();
        rbplayerA.rollbackNetcode.updateSimulations();
        rbplayerB.rollbackNetcode.updateSimulations();
        rbplayerC.rollbackNetcode.updateSimulations();
        expect(rbplayerA.game.internalState.player0).toBe(100 + Math.min(frameCount, BUFFER_LIMIT - 1));
        expect(rbplayerA.game.internalState.player1).toBe(200 + Math.min(frameCount, BUFFER_LIMIT - 1));
        expect(rbplayerA.game.internalState.player2).toBe(300 + Math.min(frameCount, BUFFER_LIMIT - 1));
        expect(rbplayerB.game.internalState.player0).toBe(100 + Math.min(frameCount - delta, BUFFER_LIMIT - 1));
        expect(rbplayerB.game.internalState.player1).toBe(200 + Math.min(frameCount - delta, BUFFER_LIMIT - 1));
        expect(rbplayerB.game.internalState.player2).toBe(300 + Math.min(frameCount - delta, BUFFER_LIMIT - 1));
        expect(rbplayerC.game.internalState.player0).toBe(100 + 1);
        expect(rbplayerC.game.internalState.player1).toBe(200 + 1);
        expect(rbplayerC.game.internalState.player2).toBe(300 + 1);
        await cleanup();
    });
    it("check buffer delay limit", async function () {
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
        const frameCount = BUFFER_LIMIT * 4;
        for (let i = 0; i < frameCount; i += 1) {
            rbplayerA.rollbackNetcode.tick();
            rbplayerB.rollbackNetcode.tick();
            rbplayerA.rollbackNetcode.updateSimulations();
            rbplayerB.rollbackNetcode.updateSimulations();
            await waitForMessageQueue();
        }
        rbplayerC.rollbackNetcode.updateSimulations();
        rbplayerC.rollbackNetcode.tick();
        expect(rbplayerA.game.internalState.player0).toBe(100 + BUFFER_LIMIT - 1);
        expect(rbplayerA.game.internalState.player1).toBe(200 + BUFFER_LIMIT - 1);
        expect(rbplayerA.game.internalState.player2).toBe(300);
        expect(rbplayerB.game.internalState.player0).toBe(100 + BUFFER_LIMIT - 1);
        expect(rbplayerB.game.internalState.player1).toBe(200 + BUFFER_LIMIT - 1);
        expect(rbplayerB.game.internalState.player2).toBe(300);
        expect(rbplayerC.game.internalState.player0).toBe(100 + 1);
        expect(rbplayerC.game.internalState.player1).toBe(200 + 1);
        expect(rbplayerC.game.internalState.player2).toBe(300 + 1);
        await cleanup();
    });
});
//# sourceMappingURL=test_multi.spec.mjs.map
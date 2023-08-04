import { NetplayInput } from "../../lib/netPeer/netplayInput.mjs";
import { KEY_A, BUFFER_LIMIT, cleanup, RollbackTestWrapper, GameTestInstance, waitForMessageQueue } from "./mock_network.mjs";
describe("test update loop", function () {
    it("call update loop frequently", async function () {
        const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const players = [{
                peerid: rbplayerA.networkId,
                telegraphPlayerNum: 0
            }, {
                peerid: rbplayerB.networkId,
                telegraphPlayerNum: 1
            }];
        rbplayerA.onStart(new GameTestInstance(), players, 0);
        rbplayerB.onStart(new GameTestInstance(), players, 1);
        NetplayInput.setPressed(rbplayerA.localinput, KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput, KEY_A);
        await waitForMessageQueue();
        expect(rbplayerA.game.internalState.player0).toBe(100);
        expect(rbplayerA.game.internalState.player1).toBe(200);
        expect(rbplayerB.game.internalState.player0).toBe(100);
        expect(rbplayerB.game.internalState.player1).toBe(200);
        rbplayerA.rollbackNetcode.tick();
        expect(rbplayerA.game.internalState.player0).toBe(101);
        expect(rbplayerA.game.internalState.player1).toBe(200);
        expect(rbplayerB.game.internalState.player0).toBe(100);
        expect(rbplayerB.game.internalState.player1).toBe(200);
        await waitForMessageQueue();
        expect(rbplayerA.game.internalState.player0).toBe(101);
        expect(rbplayerA.game.internalState.player1).toBe(200);
        expect(rbplayerB.game.internalState.player0).toBe(100);
        expect(rbplayerB.game.internalState.player1).toBe(200);
        rbplayerB.rollbackNetcode.tick();
        expect(rbplayerA.game.internalState.player0).toBe(101);
        expect(rbplayerA.game.internalState.player1).toBe(200);
        expect(rbplayerB.game.internalState.player0).toBe(101);
        expect(rbplayerB.game.internalState.player1).toBe(201);
        await cleanup();
    });
});
describe("test rollback loop", function () {
    it("check prediction", async function () {
        const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const players = [{
                peerid: rbplayerA.networkId,
                telegraphPlayerNum: 0
            }, {
                peerid: rbplayerB.networkId,
                telegraphPlayerNum: 1
            }];
        rbplayerA.onStart(new GameTestInstance(), players, 0);
        rbplayerB.onStart(new GameTestInstance(), players, 1);
        NetplayInput.setPressed(rbplayerA.localinput, KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput, KEY_A);
        const frameCount = 7;
        for (let i = 0; i < frameCount; i += 1) {
            rbplayerA.rollbackNetcode.tick();
            rbplayerB.rollbackNetcode.tick();
        }
        expect(rbplayerA.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200);
        expect(rbplayerB.game.internalState.player0).toBe(100);
        expect(rbplayerB.game.internalState.player1).toBe(200 + frameCount);
        await waitForMessageQueue();
        rbplayerA.rollbackNetcode.updateSimulations();
        rbplayerB.rollbackNetcode.updateSimulations();
        expect(rbplayerA.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerB.game.internalState.player1).toBe(200 + frameCount);
        NetplayInput.clearPressed(rbplayerA.localinput, KEY_A);
        NetplayInput.clearPressed(rbplayerB.localinput, KEY_A);
        for (let i = 0; i < frameCount; i += 1) {
            rbplayerA.rollbackNetcode.tick();
            rbplayerB.rollbackNetcode.tick();
        }
        expect(rbplayerA.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200 + frameCount * 2);
        expect(rbplayerB.game.internalState.player0).toBe(100 + frameCount * 2);
        expect(rbplayerB.game.internalState.player1).toBe(200 + frameCount);
        await waitForMessageQueue();
        rbplayerA.rollbackNetcode.updateSimulations();
        rbplayerB.rollbackNetcode.updateSimulations();
        expect(rbplayerA.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerB.game.internalState.player1).toBe(200 + frameCount);
        await cleanup();
    });
});
describe("test rollback tick rate", function () {
    it("check predictions", async function () {
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
        const frameCount = 7;
        const delta = 4;
        for (let i = 0; i < frameCount; i += 1) {
            rbplayerA.rollbackNetcode.tick();
        }
        for (let i = 0; i < frameCount - delta; i += 1) {
            rbplayerB.rollbackNetcode.tick();
        }
        expect(rbplayerA.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200);
        expect(rbplayerB.game.internalState.player0).toBe(100);
        expect(rbplayerB.game.internalState.player1).toBe(200 + frameCount - delta);
        await waitForMessageQueue();
        rbplayerA.rollbackNetcode.updateSimulations();
        rbplayerB.rollbackNetcode.updateSimulations();
        expect(rbplayerA.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100 + frameCount - delta);
        expect(rbplayerB.game.internalState.player1).toBe(200 + frameCount - delta);
        await cleanup();
    });
    it("check buffer limit", async function () {
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
        const frameCount = 20;
        const delta = 11;
        for (let i = 0; i < frameCount; i += 1) {
            rbplayerA.rollbackNetcode.tick();
        }
        for (let i = 0; i < frameCount - delta; i += 1) {
            rbplayerB.rollbackNetcode.tick();
        }
        expect(rbplayerA.game.internalState.player0).toBe(100 + Math.min(frameCount, BUFFER_LIMIT - 1));
        expect(rbplayerA.game.internalState.player1).toBe(200);
        expect(rbplayerB.game.internalState.player0).toBe(100);
        expect(rbplayerB.game.internalState.player1).toBe(200 + Math.min(frameCount - delta, BUFFER_LIMIT - 1));
        await waitForMessageQueue();
        rbplayerA.rollbackNetcode.updateSimulations();
        rbplayerB.rollbackNetcode.updateSimulations();
        expect(rbplayerA.game.internalState.player0).toBe(100 + Math.min(frameCount, BUFFER_LIMIT - 1));
        expect(rbplayerA.game.internalState.player1).toBe(200 + Math.min(frameCount, BUFFER_LIMIT - 1));
        expect(rbplayerB.game.internalState.player0).toBe(100 + Math.min(frameCount - delta, BUFFER_LIMIT - 1));
        expect(rbplayerB.game.internalState.player1).toBe(200 + Math.min(frameCount - delta, BUFFER_LIMIT - 1));
        await cleanup();
    });
    it("check out of order tick and updates", async function () {
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
        const frameCount = 7;
        for (let i = 0; i < frameCount; i += 1) {
            rbplayerA.rollbackNetcode.updateSimulations();
            rbplayerB.rollbackNetcode.updateSimulations();
            rbplayerA.rollbackNetcode.tick();
            rbplayerB.rollbackNetcode.tick();
            rbplayerB.rollbackNetcode.tick();
            await waitForMessageQueue();
            rbplayerA.rollbackNetcode.updateSimulations();
            rbplayerB.rollbackNetcode.updateSimulations();
        }
        expect(rbplayerA.game.internalState.player0).toBe(100 + frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200 + frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100 + frameCount * 2);
        expect(rbplayerB.game.internalState.player1).toBe(200 + frameCount * 2);
        await cleanup();
    });
});
//# sourceMappingURL=test_network.spec.mjs.map
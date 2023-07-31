import { NetplayInput } from "../../lib/netPeer/netplayInput.mjs";
import {KEY_A,BUFFER_LIMIT,cleanup,RollbackTestWrapper,GameTestInstance,waitForMessageQueue}  from "./mock_network.mjs";

describe("test multi",function(){
	it("check prediction",async function() {
		const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const rbplayerC = new RollbackTestWrapper();
        rbplayerC.join(rbplayerA.networkId);
        const players=[{ peerid:rbplayerA.networkId, telegraphPlayerNum:0 },
                { peerid:rbplayerB.networkId, telegraphPlayerNum:1 },
                { peerid:rbplayerC.networkId, telegraphPlayerNum:2 }];
        rbplayerA.onStart(new GameTestInstance(),players,0);
        rbplayerB.onStart(new GameTestInstance(),players,1);
        rbplayerC.onStart(new GameTestInstance(),players,2);
        NetplayInput.setPressed(rbplayerA.localinput,KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput,KEY_A);
        NetplayInput.setPressed(rbplayerC.localinput,KEY_A);
        const frameCount = 7;//should be less than 10 so we don't run into the prediction buffer limit
        //roll A and B forward without waiting for network traffic 
        for (let i=0;i<frameCount;i+=1){
            rbplayerA.rollbackNetcode.tick();
            rbplayerB.rollbackNetcode.tick();
            rbplayerC.rollbackNetcode.tick();
        }
        //at this point each should have predicted wrongly (the other player will be 0)
        expect(rbplayerA.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200);
        expect(rbplayerA.game.internalState.player2).toBe(300);
        expect(rbplayerB.game.internalState.player0).toBe(100);
        expect(rbplayerB.game.internalState.player1).toBe(200+frameCount);
        expect(rbplayerB.game.internalState.player2).toBe(300);
        expect(rbplayerC.game.internalState.player0).toBe(100);
        expect(rbplayerC.game.internalState.player1).toBe(200);
        expect(rbplayerC.game.internalState.player2).toBe(300+frameCount);

        //receive messages and see if the tick updates the simulations for all players
        await waitForMessageQueue();
        rbplayerA.rollbackNetcode.updateSimulations();
        rbplayerB.rollbackNetcode.updateSimulations();
        rbplayerC.rollbackNetcode.updateSimulations();
        expect(rbplayerA.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200+frameCount);
        expect(rbplayerA.game.internalState.player2).toBe(300+frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerB.game.internalState.player1).toBe(200+frameCount);
        expect(rbplayerB.game.internalState.player2).toBe(300+frameCount);
        expect(rbplayerC.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerC.game.internalState.player1).toBe(200+frameCount);
        expect(rbplayerC.game.internalState.player2).toBe(300+frameCount);

        //now try releasing the local input and advancing
        
        NetplayInput.clearPressed(rbplayerA.localinput,KEY_A);
        NetplayInput.clearPressed(rbplayerB.localinput,KEY_A);
        NetplayInput.clearPressed(rbplayerC.localinput,KEY_A);
        for (let i=0;i<frameCount;i+=1){
            rbplayerA.rollbackNetcode.tick();
            rbplayerB.rollbackNetcode.tick();
            rbplayerC.rollbackNetcode.tick();
        }
        //*2 is because we've not yet seen the other's inputs come in, will predict incorrectly
        expect(rbplayerA.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200+frameCount*2);
        expect(rbplayerA.game.internalState.player2).toBe(300+frameCount*2);
        expect(rbplayerB.game.internalState.player0).toBe(100+frameCount*2);
        expect(rbplayerB.game.internalState.player1).toBe(200+frameCount);
        expect(rbplayerB.game.internalState.player2).toBe(300+frameCount*2);
        expect(rbplayerC.game.internalState.player0).toBe(100+frameCount*2);
        expect(rbplayerC.game.internalState.player1).toBe(200+frameCount*2);
        expect(rbplayerC.game.internalState.player2).toBe(300+frameCount);
        //let messages recieve and see if sims updated to undo the wrong prediction
        await waitForMessageQueue();
        rbplayerA.rollbackNetcode.updateSimulations();
        rbplayerB.rollbackNetcode.updateSimulations();
        rbplayerC.rollbackNetcode.updateSimulations();
        expect(rbplayerA.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200+frameCount);
        expect(rbplayerA.game.internalState.player2).toBe(300+frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerB.game.internalState.player1).toBe(200+frameCount);
        expect(rbplayerB.game.internalState.player2).toBe(300+frameCount);
        expect(rbplayerC.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerC.game.internalState.player1).toBe(200+frameCount);
        expect(rbplayerC.game.internalState.player2).toBe(300+frameCount);
        await cleanup();
	});
	it("check out of order tick and updates",async function() {
		const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const rbplayerC = new RollbackTestWrapper();
        rbplayerC.join(rbplayerA.networkId);
        const players=[{ peerid:rbplayerA.networkId, telegraphPlayerNum:0 },
                { peerid:rbplayerB.networkId, telegraphPlayerNum:1 },
                { peerid:rbplayerC.networkId, telegraphPlayerNum:2 }];
        rbplayerA.onStart(new GameTestInstance(),players,0);
        rbplayerB.onStart(new GameTestInstance(),players,1);
        rbplayerC.onStart(new GameTestInstance(),players,2);
        NetplayInput.setPressed(rbplayerA.localinput,KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput,KEY_A);
        NetplayInput.setPressed(rbplayerC.localinput,KEY_A);
        const frameCount = 7;//should be less than 10 so we don't run into the prediction buffer limit
        for (let i=0;i<frameCount;i+=1){
            //call tick, update and await in arbitrary order
            rbplayerA.rollbackNetcode.updateSimulations();
            rbplayerB.rollbackNetcode.updateSimulations();
            rbplayerA.rollbackNetcode.tick();//A is ticked once
            rbplayerB.rollbackNetcode.tick();//B is ticked twice
            rbplayerB.rollbackNetcode.tick();
            rbplayerC.rollbackNetcode.tick();
            await waitForMessageQueue();
            rbplayerA.rollbackNetcode.updateSimulations();
            rbplayerB.rollbackNetcode.updateSimulations();
        }
        rbplayerC.rollbackNetcode.updateSimulations();
        //at this point each should have predicted wrongly (the other player will be 0)
        expect(rbplayerA.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200+frameCount);
        expect(rbplayerA.game.internalState.player2).toBe(300+frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100+frameCount*2);
        expect(rbplayerB.game.internalState.player1).toBe(200+frameCount*2);
        expect(rbplayerB.game.internalState.player2).toBe(300+frameCount*2);
        expect(rbplayerC.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerC.game.internalState.player1).toBe(200+frameCount);
        expect(rbplayerC.game.internalState.player2).toBe(300+frameCount);

        await cleanup();
	});
	it("check buffer limit",async function() {
		const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const rbplayerC = new RollbackTestWrapper();
        rbplayerC.join(rbplayerA.networkId);
        const players=[{ peerid:rbplayerA.networkId, telegraphPlayerNum:0 },
                { peerid:rbplayerB.networkId, telegraphPlayerNum:1 },
                { peerid:rbplayerC.networkId, telegraphPlayerNum:2 }];
        rbplayerA.onStart(new GameTestInstance(),players,0);
        rbplayerB.onStart(new GameTestInstance(),players,1);
        rbplayerC.onStart(new GameTestInstance(),players,2);
        NetplayInput.setPressed(rbplayerA.localinput,KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput,KEY_A);
        NetplayInput.setPressed(rbplayerC.localinput,KEY_A);
        const frameCount = 20;//should be more than 10 so we run into the prediction buffer limit
        const delta = 11;//how far behind one client should be
        for (let i=0;i<frameCount;i+=1){
            rbplayerA.rollbackNetcode.tick();//pretend player A is running fast
        }
        for(let i=0;i<frameCount-delta;i+=1){
            rbplayerB.rollbackNetcode.tick();
        }
        rbplayerC.rollbackNetcode.tick();
        //at this point each should have predicted wrongly (the other player will be 0)
        expect(rbplayerA.game.internalState.player0).toBe(100+Math.min(frameCount,BUFFER_LIMIT-1));
        expect(rbplayerA.game.internalState.player1).toBe(200);
        expect(rbplayerA.game.internalState.player2).toBe(300);
        expect(rbplayerB.game.internalState.player0).toBe(100);
        expect(rbplayerB.game.internalState.player1).toBe(200+Math.min(frameCount-delta,BUFFER_LIMIT-1));
        expect(rbplayerB.game.internalState.player2).toBe(300);
        expect(rbplayerC.game.internalState.player0).toBe(100);
        expect(rbplayerC.game.internalState.player1).toBe(200);
        expect(rbplayerC.game.internalState.player2).toBe(300+1);

        //receive messages and see if the tick updates the simulations for all players
        await waitForMessageQueue();
        rbplayerA.rollbackNetcode.updateSimulations();
        rbplayerB.rollbackNetcode.updateSimulations();
        rbplayerC.rollbackNetcode.updateSimulations();
        expect(rbplayerA.game.internalState.player0).toBe(100+Math.min(frameCount,BUFFER_LIMIT-1));
        expect(rbplayerA.game.internalState.player1).toBe(200+Math.min(frameCount,BUFFER_LIMIT-1));
        expect(rbplayerA.game.internalState.player2).toBe(300+Math.min(frameCount,BUFFER_LIMIT-1));
        expect(rbplayerB.game.internalState.player0).toBe(100+Math.min(frameCount-delta,BUFFER_LIMIT-1));
        expect(rbplayerB.game.internalState.player1).toBe(200+Math.min(frameCount-delta,BUFFER_LIMIT-1));
        expect(rbplayerB.game.internalState.player2).toBe(300+Math.min(frameCount-delta,BUFFER_LIMIT-1));
        expect(rbplayerC.game.internalState.player0).toBe(100+1);
        expect(rbplayerC.game.internalState.player1).toBe(200+1);
        expect(rbplayerC.game.internalState.player2).toBe(300+1);
        await cleanup();
	});
	it("check buffer delay limit",async function() {
		const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const rbplayerC = new RollbackTestWrapper();
        rbplayerC.join(rbplayerA.networkId);
        const players=[{ peerid:rbplayerA.networkId, telegraphPlayerNum:0 },
                { peerid:rbplayerB.networkId, telegraphPlayerNum:1 },
                { peerid:rbplayerC.networkId, telegraphPlayerNum:2 }];
        rbplayerA.onStart(new GameTestInstance(),players,0);
        rbplayerB.onStart(new GameTestInstance(),players,1);
        rbplayerC.onStart(new GameTestInstance(),players,2);
        NetplayInput.setPressed(rbplayerA.localinput,KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput,KEY_A);
        NetplayInput.setPressed(rbplayerC.localinput,KEY_A);
        const frameCount = BUFFER_LIMIT*4;
        //attempt to saturate the queue, should stall
        for (let i=0;i<frameCount;i+=1){
            rbplayerA.rollbackNetcode.tick();
            rbplayerB.rollbackNetcode.tick();
            rbplayerA.rollbackNetcode.updateSimulations();
            rbplayerB.rollbackNetcode.updateSimulations();
            await waitForMessageQueue();
        }
        rbplayerC.rollbackNetcode.updateSimulations();
        rbplayerC.rollbackNetcode.tick();
        //at this point each should have updates for A&B, but C has only ticked once
        expect(rbplayerA.game.internalState.player0).toBe(100+BUFFER_LIMIT-1);
        expect(rbplayerA.game.internalState.player1).toBe(200+BUFFER_LIMIT-1);
        expect(rbplayerA.game.internalState.player2).toBe(300);
        expect(rbplayerB.game.internalState.player0).toBe(100+BUFFER_LIMIT-1);
        expect(rbplayerB.game.internalState.player1).toBe(200+BUFFER_LIMIT-1);
        expect(rbplayerB.game.internalState.player2).toBe(300);
        expect(rbplayerC.game.internalState.player0).toBe(100+1);
        expect(rbplayerC.game.internalState.player1).toBe(200+1);
        expect(rbplayerC.game.internalState.player2).toBe(300+1);

        
        await cleanup();
	});
});




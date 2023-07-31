import { NetplayInput } from "../../lib/netPeer/netplayInput.mjs";

import {KEY_A,BUFFER_LIMIT,cleanup,RollbackTestWrapper,GameTestInstance,waitForMessageQueue}  from "./mock_network.mjs";


/*
attempting to simulate rollback.start(),
which calls:
    this.#lastUpdate = performance.now();
    setInterval(() => {
        const timeElapsed = performance.now()-this.#lastUpdate;
        this._updateInterval(timeElapsed);
    }, timestep);
*/

describe("test rollback interval",function(){
	it("check lockstep",async function() {
		const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const players=[{ peerid:rbplayerA.networkId, telegraphPlayerNum:0 },
                       { peerid:rbplayerB.networkId, telegraphPlayerNum:1 }];
        rbplayerA.onStart(new GameTestInstance(),players,0);
        rbplayerB.onStart(new GameTestInstance(),players,1);
        NetplayInput.setPressed(rbplayerA.localinput,KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput,KEY_A);
        //base case, assume both clients tick at a rate of 15ms for 10 frames (150ms)
        //should call update() 3 times, and prediction should set values to be correct
        const frameCount = 10;//should be less than 10 so we don't run into the prediction buffer limit
        const timePerFrame = 15;
        //roll A and B forward without waiting for network traffic 
        for (let i=0;i<frameCount;i+=1){
            rbplayerA.rollbackNetcode._updateInterval(timePerFrame);
            rbplayerB.rollbackNetcode._updateInterval(timePerFrame);
            //receive messages and see if the tick updates the simulations for all players
            await waitForMessageQueue();
        }
        //at this point each should have predicted wrongly (the other player will be 0)
        expect(rbplayerA.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200+frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerB.game.internalState.player1).toBe(200+frameCount);
        await cleanup();
	});
	it("check one running slow",async function() {
		const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const players=[{ peerid:rbplayerA.networkId, telegraphPlayerNum:0 },
                       { peerid:rbplayerB.networkId, telegraphPlayerNum:1 }];
        rbplayerA.onStart(new GameTestInstance(),players,0);
        rbplayerB.onStart(new GameTestInstance(),players,1);
        NetplayInput.setPressed(rbplayerA.localinput,KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput,KEY_A);
        //base case, assume both clients tick at a rate of 15ms for 10 frames (150ms)
        //should call update() 3 times, and prediction should set values to be correct
        const frameCount = 10;
        const timePerFrameA = 15;//frame A running at 1 frame every 15 ms
        const timePerFrameB = 100; //frame B running at 1 frame every 100ms
        //roll A and B forward without waiting for network traffic 
        for (let i=0;i<frameCount;i+=1){
            rbplayerA.rollbackNetcode._updateInterval(timePerFrameA);
            rbplayerB.rollbackNetcode._updateInterval(timePerFrameB);
            //receive messages and see if the tick updates the simulations for all players
            await waitForMessageQueue();
        }
        //at this point each should have predicted wrongly (the other player will be 0)
        expect(rbplayerA.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200+frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerB.game.internalState.player1).toBe(200+frameCount);
        await cleanup();
	});
	it("check one running fast",async function() {
		const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const players=[{ peerid:rbplayerA.networkId, telegraphPlayerNum:0 },
                       { peerid:rbplayerB.networkId, telegraphPlayerNum:1 }];
        rbplayerA.onStart(new GameTestInstance(),players,0);
        rbplayerB.onStart(new GameTestInstance(),players,1);
        NetplayInput.setPressed(rbplayerA.localinput,KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput,KEY_A);
        //base case, assume both clients tick at a rate of 15ms for 10 frames (150ms)
        //should call update() 3 times, and prediction should set values to be correct
        const frameCount = 10;
        const timePerFrameA = 15;//frame A running at 1 frame every 15 ms
        const timePerFrameB = 1; //frame B running at 1 frame every 1 ms
        //roll A and B forward without waiting for network traffic 
        for (let i=0;i<frameCount;i+=1){
            rbplayerA.rollbackNetcode._updateInterval(timePerFrameA);
            rbplayerB.rollbackNetcode._updateInterval(timePerFrameB);
            //receive messages and see if the tick updates the simulations for all players
            await waitForMessageQueue();
        }
        //at this point each should have predicted wrongly (the other player will be 0)
        expect(rbplayerA.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerA.game.internalState.player1).toBe(200+frameCount);
        expect(rbplayerB.game.internalState.player0).toBe(100+frameCount);
        expect(rbplayerB.game.internalState.player1).toBe(200+frameCount);
        await cleanup();
	});
	it("check one not running",async function() {
		const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const players=[{ peerid:rbplayerA.networkId, telegraphPlayerNum:0 },
                       { peerid:rbplayerB.networkId, telegraphPlayerNum:1 }];
        rbplayerA.onStart(new GameTestInstance(),players,0);
        rbplayerB.onStart(new GameTestInstance(),players,1);
        NetplayInput.setPressed(rbplayerA.localinput,KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput,KEY_A);
        //base case, assume both clients tick at a rate of 15ms for 10 frames (150ms)
        //should call update() 3 times, and prediction should set values to be correct
        const frameCount = 12;
        const timePerFrameA = 15;//frame A running at 1 frame every 15 ms
        const timePerFrameB = 10000; //frame B running at 1 frame every 1 second
        //roll A and B forward without waiting for network traffic 
        for (let i=0;i<frameCount;i+=1){
            rbplayerA.rollbackNetcode._updateInterval(timePerFrameA);
            //rbplayerB.rollbackNetcode._updateInterval(timePerFrameB);
            //receive messages and see if the tick updates the simulations for all players
            await waitForMessageQueue();
        }
        rbplayerB.rollbackNetcode._updateInterval(timePerFrameB);
        //receive messages and see if the tick updates the simulations for all players
        await waitForMessageQueue();
        //at this point each should have predicted wrongly (the other player will be 0)
        expect(rbplayerA.game.internalState.player0).toBe(100+9);//A should be stalled at the prediction limit
        expect(rbplayerA.game.internalState.player1).toBe(200+0);//A has not updated sims since getting B's message
        expect(rbplayerB.game.internalState.player0).toBe(100+2);//B should have advanced 2 frames (1 default frame, another from 'speed up')
        expect(rbplayerB.game.internalState.player1).toBe(200+2);
        await cleanup();
	});
	it("check one not running, many iterations",async function() {
		const rbplayerA = new RollbackTestWrapper();
        rbplayerA.host();
        const rbplayerB = new RollbackTestWrapper();
        rbplayerB.join(rbplayerA.networkId);
        const players=[{ peerid:rbplayerA.networkId, telegraphPlayerNum:0 },
                       { peerid:rbplayerB.networkId, telegraphPlayerNum:1 }];
        rbplayerA.onStart(new GameTestInstance(),players,0);
        rbplayerB.onStart(new GameTestInstance(),players,1);
        NetplayInput.setPressed(rbplayerA.localinput,KEY_A);
        NetplayInput.setPressed(rbplayerB.localinput,KEY_A);
        //base case, assume both clients tick at a rate of 15ms for 10 frames (150ms)
        //should call update() 3 times, and prediction should set values to be correct
        const frameCount = 12;
        const timePerFrameA = 15;//frame A running at 1 frame every 15 ms
        const timePerFrameB = 10000; //frame B running at 1 frame every 1 second
        //roll A and B forward without waiting for network traffic 
        const iterationCount = 5;
        for(let j=0;j<iterationCount;j+=1){
            for (let i=0;i<frameCount;i+=1){
                rbplayerA.rollbackNetcode._updateInterval(timePerFrameA);
                //rbplayerB.rollbackNetcode._updateInterval(timePerFrameB);
                //receive messages and see if the tick updates the simulations for all players
                await waitForMessageQueue();
            }
            rbplayerB.rollbackNetcode._updateInterval(timePerFrameB);
            //receive messages and see if the tick updates the simulations for all players
            await waitForMessageQueue();
        }
        //at this point each should have predicted wrongly (the other player will be 0)
        expect(rbplayerA.game.internalState.player0).toBe(100+17);//A should have ticked 17 frames (12+5?)
        expect(rbplayerA.game.internalState.player1).toBe(200+17);
        expect(rbplayerB.game.internalState.player0).toBe(100+10);//B should have advanced 5 frames *2 due to tick speed increase
        expect(rbplayerB.game.internalState.player1).toBe(200+10);
        await cleanup();
	});
});


describe("test rollback interval - multi ",function(){
	it("check one not running, many iterations",async function() {
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
        //base case, assume both clients tick at a rate of 15ms for 10 frames (150ms)
        //should call update() 3 times, and prediction should set values to be correct
        const frameCount = 12;
        const timePerFrameA = 15;//frame A running at 1 frame every 15 ms
        const timePerFrameB = 10000; //frame B running at 1 frame every 1 second
        const timePerFrameC = 1; //frame C running at 1 frame every 1 ms
        //roll A and B forward without waiting for network traffic 
        const iterationCount = 5;
        for(let j=0;j<iterationCount;j+=1){
            for (let i=0;i<frameCount;i+=1){
                rbplayerC.rollbackNetcode._updateInterval(timePerFrameC);
                rbplayerA.rollbackNetcode._updateInterval(timePerFrameA);
                //rbplayerB.rollbackNetcode._updateInterval(timePerFrameB);
                //receive messages and see if the tick updates the simulations for all players
                await waitForMessageQueue();
            }
            rbplayerB.rollbackNetcode._updateInterval(timePerFrameB);
            //receive messages and see if the tick updates the simulations for all players
            await waitForMessageQueue();
        }
        //at this point each should have predicted wrongly (the other player will be 0)
        expect(rbplayerA.game.internalState.player0).toBe(100+17);//A should have ticked 17 frames (12+5?)
        expect(rbplayerA.game.internalState.player1).toBe(200+17);
        expect(rbplayerA.game.internalState.player2).toBe(300+17);
        expect(rbplayerB.game.internalState.player0).toBe(100+10);//B should have advanced 5 frames *2 due to tick speed increase
        expect(rbplayerB.game.internalState.player1).toBe(200+10);
        expect(rbplayerB.game.internalState.player2).toBe(300+10);
        expect(rbplayerC.game.internalState.player0).toBe(100+17);//C should be like A, stalled at +17
        expect(rbplayerC.game.internalState.player1).toBe(200+17);
        expect(rbplayerC.game.internalState.player2).toBe(300+17);
        await cleanup();
	});
    
});
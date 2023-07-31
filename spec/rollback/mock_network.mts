import { RollbackNetcode } from "../../lib/netPeer/rollback.mjs";
import { NetplayInput } from "../../lib/netPeer/netplayInput.mjs";
import { NW,IConnection } from "../../lib/netPeer/network.mjs";

interface IPlayerNum{
    peerid:string,
    telegraphPlayerNum:number
}
//mock network
//NOTE this is shared. Assume IDs are either unique, or reset on each test case
let messageQueue:Array<Promise<unknown>>=[];
const sleep=(ms:number)=> {
    return new Promise((resolve) => setTimeout(()=>{
        (resolve as any)();
        //console.log("sleep");
    }, ms));
}
const networkDelay =async (callback:any)=>{
    const pause =  sleep(1);
    messageQueue.push(pause);
    await pause;
    messageQueue=[];
    callback();
}
const peers:Map<string,RollbackTestWrapper> = new Map();
class MockConnection implements IConnection{
    idToSendTo="";
    constructor(idToSendTo:string){
        this.idToSendTo = idToSendTo;
    }
    send = (msg: object) => {
        networkDelay(()=>{
            const target = peers.get(this.idToSendTo);
            target.onRollbackData(msg);
        });
    }
}
const waitForMessageQueue = async ()=>{
    while(messageQueue.length){
        await Promise.all(messageQueue);
    }
};

class GameTestInstance  {
    internalState = {
        player0:100,
        player1:200,
        player2:300
    }
    constructor() { }
    tick(playerInputs: Map<number, NetplayInput>): void {
       // console.log("TICK",playerInputs);
        for(const [p,ipt] of playerInputs){
            if(p==0){ if( NetplayInput.getPressed(ipt,KEY_A)){  this.internalState.player0+=1; } }
            if(p==1){  if( NetplayInput.getPressed(ipt,KEY_A)){ this.internalState.player1+=1;  } }
            if(p==2){ if( NetplayInput.getPressed(ipt,KEY_A)){ this.internalState.player2+=1;  } }
        }
    }
    serialize(): string { return JSON.stringify(this.internalState);}
    deserialize(value: string) { this.internalState = JSON.parse(value); }
}
const BUFFER_LIMIT = 10;
class RollbackTestWrapper extends NW  {

    connect(): void {
        peers.set(this.networkId,this);
        if(!this.isHost){
            //if joining, connect self to host and host to self
            this.connections.push(new MockConnection(this.hostId));
            const host = peers.get(this.hostId);
            host.connections.push(new MockConnection(this.networkId));
        }
        
    }
    #send(message:any){
        message.peerid = this.networkId;//so the receiver knows who sent it
        this.send({
            kind:"telegraph",
            data:message
        });
    }
    localinput = new NetplayInput();
    pollinput(){
        return this.localinput;
    }
    async onRollbackData(message:any){
        const data = message.data;
        if(data.peerid==this.networkId){return;}//message was a rebroadcast of your own input from the host
        if(this.isHost){//broadcast to clients
            this.send({
                kind:"telegraph",
                data
            });
        }
        if (data.type === "input") {
            let input = new NetplayInput();
            input.deserialize(data.input);
            this.rollbackNetcode.onRemoteInput(data.frame, data.handle, input);
        }
    }
  rollbackNetcode: RollbackNetcode;
  constructor(pollinput?:Function) {
    super();
    if(pollinput){this.pollinput = pollinput as unknown as any;}
  }
  game:GameTestInstance;
  onStart(game:GameTestInstance,allPlayers:Array<IPlayerNum>,playerId:number){
    this.game = game;
    this.rollbackNetcode = new RollbackNetcode(
       game,allPlayers.length,playerId,
      BUFFER_LIMIT, () => this.pollinput(),   (frame, input) => {
        this.#send({ type: "input", frame: frame, input: input.serialize(),handle:playerId });
      }
    );
//NOTE: call tick manually...    this.#rollbackNetcode.start(game.TIME_STEP);

  }
}

const cleanup = async ()=>{
    //purge any dangling messages so that they don't run into the next test
    await waitForMessageQueue();
    peers.clear();
    messageQueue.splice(0);
}


const KEY_A=1;

export {KEY_A,BUFFER_LIMIT,cleanup,RollbackTestWrapper,GameTestInstance,waitForMessageQueue} 
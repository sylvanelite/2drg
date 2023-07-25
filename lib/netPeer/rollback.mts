//https://github.com/rameshvarun/netplayjs (ISC)
import { NetplayInput, NetplayState } from "./types.mjs";
import { CBuffer } from "./cbuffer.mjs";

type NetplayPlayer = number;//player is a handle (id), use a type here so that it doesn't get confused with other ints

class RollbackHistory {
  #frame: number;
  get frame(){return this.#frame;}
  #inputs: Map<NetplayPlayer, NetplayInput>;//values are mutable in onRemoteInput()
  constructor( frame: number, inputs: Map<NetplayPlayer, NetplayInput> ) {
    this.#frame = frame;
    this.#inputs = inputs;
  }
  static isPlayerInputPredicted(hist:RollbackHistory,player: NetplayPlayer) {
    return hist.#inputs.get(player).isPrediction;
  }
  static allInputsSynced(hist:RollbackHistory): boolean {
    //all inputs are synced if none predicted
    for (const ipt of hist.#inputs.values()) {
        if (ipt.isPrediction) return false;
      }
      return true;
  }
  static setHistoryInput(hist:RollbackHistory,player: NetplayPlayer,input:NetplayInput){
    hist.#inputs.set(player,input);
  }
  static getHistoryInputForPlayer(hist:RollbackHistory,player: NetplayPlayer){
    return hist.#inputs.get(player);
  }
  static copyHistInputs(hist:RollbackHistory){
    const res = new  Map<NetplayPlayer, NetplayInput>();
    //TODO: faster way of copying
    for(const player of hist.#inputs.keys()){
        const existingInput = RollbackHistory.getHistoryInputForPlayer(hist,player);
        const inputUpdate = new NetplayInput();
        inputUpdate.deserialize(existingInput.serialize());
        inputUpdate.isPrediction = existingInput.isPrediction;
        res.set(player,inputUpdate);
    }
    return res;
  }
}

class RollbackNetcode {
  // Inputs from other players that have already arrived, but have not been applied due to our simulation being behind.
  #future: Map<NetplayPlayer, Array<{ frame: number; input: NetplayInput }>>;
  #highestFrameReceived: Map<NetplayPlayer, number>;
  #updateRecieved:boolean=false;
  #broadcastInput: (frame: number, input: NetplayInput) => void;
  #state: NetplayState;//working copy of state
  #confirmedState: string;//backup of the last state that was recieved
  #predictedFrame:number = 0;//the frame which you've predicted up to (i.e. your local frame count)
  #confirmedInputs: Map<NetplayPlayer, NetplayInput>;//TODO: rethink this... it was history.get(length-1).inputs....
  #pollInput: () => NetplayInput;
  #localPlayerId:number = 0;
  #history: CBuffer<RollbackHistory>;
  #maxPredictedFrames: number;
  constructor(
    initialState: NetplayState, playerCount:number, localPlayerId:number, maxPredictedFrames: number,
    pollInput: () => NetplayInput,
    broadcastInput: (frame: number, input: NetplayInput) => void,
  ) {
    this.#localPlayerId = localPlayerId;
    const historyInputs: Map<NetplayPlayer, NetplayInput> = new Map();
    this.#confirmedInputs = new Map();
    for (let i=0;i<playerCount;i+=1) {
        historyInputs.set(i, new NetplayInput());
        this.#confirmedInputs.set(i,new NetplayInput());
    }
    this.#state = initialState;
    this.#confirmedState = this.#state.serialize();
    this.#maxPredictedFrames = maxPredictedFrames;
    this.#broadcastInput = broadcastInput;
    this.#pollInput = pollInput;
    this.#history = new CBuffer(maxPredictedFrames);
    this.#history.push(new RollbackHistory(0, historyInputs));
    this.#future = new Map();
    this.#highestFrameReceived = new Map();
    for (let i=0;i<playerCount;i+=1) {
        this.#future.set(i, []);
        this.#highestFrameReceived.set(i, 0);
    }
  }
  onRemoteInput(frame: number, player: NetplayPlayer, input: NetplayInput) {
    this.#updateRecieved = true;
    const expectedFrame = this.#highestFrameReceived.get(player) + 1;
    this.#highestFrameReceived.set(player, expectedFrame);
    // If this input is for a frame that we haven't even simulated, we need to
    // store it in a queue to pull during our next tick.
    if (frame > this.#history.get(this.#history.length - 1).frame) {
      this.#future.get(player).push({ frame: frame, input: input });
      return; // Skip rest of logic in this function.
    }
    //find recieved frame, mark it as not predicted
    for (let i = 0; i < this.#history.length; i+=1) {//TODO: could this be a lookup? history.frame should be incremental? 
        const h =  this.#history.get(i);
        if(h.frame == frame){
            RollbackHistory.setHistoryInput(h,player,input);
            break;
        }
    }
    //roll simlations forward
    for (let i = 1; i < this.#history.length; i+=1) {//start from 1, so that prev (i-1) is defined
      const h =  this.#history.get(i);
      if (RollbackHistory.isPlayerInputPredicted(this.#history.get(i),player)) {
        const previousState = this.#history.get(i - 1);
        const previousPlayerInput = RollbackHistory.getHistoryInputForPlayer(previousState,player);
        RollbackHistory.setHistoryInput(h,player,previousPlayerInput.predictNext());
      }
    }

  }
  updateSimulations(){
    //flag to indicate that the updates have been re-run 
    if(!this.#updateRecieved){return;}
    this.#updateRecieved = false;
    this.#state.deserialize(this.#confirmedState);//roll back to last state that had all the inputs provided
    // Resimulate forwards with the actual input.
    for (let i = 0; i < this.#history.length; i+=1) {
        const h = this.#history.get(i);
        const currentStateInputs = RollbackHistory.copyHistInputs(h);
        this.#state.tick(currentStateInputs);
        if (RollbackHistory.allInputsSynced(h)) {//state is confirmed, store it as the new most recent state
            this.#confirmedState = this.#state.serialize();//TODO: this chould be optimised so that it's only called once?
        }
    }
    //remove confirmed frames
    while (this.#history.length > 0) {
        const h = this.#history.get(0);
        if (!RollbackHistory.allInputsSynced(h)) {break;}
        this.#history.shift();
        //store the inputs from this 'confirmed' frame as being the correct inputs to simulate forward
       this.#confirmedInputs = RollbackHistory.copyHistInputs(h);
    }
  }
  #shouldStall(): boolean {// If we are predicting too many frames, then we have to stall.
    let predictedFrames = 0;
    for (let i = 0; i < this.#history.length; i+=1) {
        if (!RollbackHistory.allInputsSynced(this.#history.get(i))) {
            predictedFrames = this.#history.length - i;
            break;
        }
      }
    return predictedFrames >= this.#maxPredictedFrames-1;
  }
  tick() {
    if (this.#shouldStall()){ return; }// If we should stall, then don't peform a tick at all.
    this.#predictedFrame += 1;
    const newInputs: Map< NetplayPlayer,NetplayInput> = new Map();// Construct the new map of inputs for this frame.
    for (const [player, lastConfirmedInput] of this.#confirmedInputs.entries()) {
        if (player==this.#localPlayerId) {
            const localInput = this.#pollInput();// Local player gets the local input.
            newInputs.set(player, localInput);
            this.#broadcastInput(this.#predictedFrame, localInput); // Broadcast the input to the other players.
            continue;
        }
        if (this.#future.get(player).length > 0) {
            // If we have already recieved the player's input (due to our simulation being behind), then use that input.
            const future = this.#future.get(player).shift();
            newInputs.set(player, future.input);
            continue;
        } 
        // Otherwise, set the next input based off of the latest confirmed input for that player
        newInputs.set(player, lastConfirmedInput.predictNext());
    }
    // Tick our state with the new inputs, which may include predictions.
    this.#state.tick(newInputs);

    // Add a history entry into our rollback buffer.
    this.#history.push(//TODO: alleviate memory pressure by replacing push() with update()/advance(). 
                       //check if head==null if not, update the props at head
      new RollbackHistory(
        this.#predictedFrame,
        newInputs
      )
    );
  }
  _updateInterval(timeElapsed:number){//only public so that it can be tested
    this.#updateDelta+=timeElapsed;
    //only refresh the sims at a reduced rate
    //update every 50ms assuming you're ticking at the right rate
    //if the history length is ballooning, need to force an update to make sure it's cleared
    //this probably happens if someone is ticking
    if(this.#updateDelta>50||this.#history.length > this.#maxPredictedFrames-2){
        this.updateSimulations();
        this.#updateDelta = 0;
    }
    // if we have a lot of futures, we are running slow, need to tick more to catch up
    let numTicks = 1;
    const largestFutureSize = Math.max(...Array.from(this.#future.values()).map((a) => a.length));
    if (largestFutureSize > 0) {
        numTicks = 2;//cap tick speedup to 2 frames, since we are effectively making the client skip a frame
    }
    for (let i = 0; i < numTicks; i+=1) {
        this.tick();
    }
  }
  #updateDelta = 0;
  start(timestep:number) {
    let lastUpdate = performance.now();
    setInterval(() => {
        const timeElapsed = performance.now()-lastUpdate;
        lastUpdate = performance.now();
        this._updateInterval(timeElapsed);
    }, timestep);
  }
}

export { RollbackNetcode }

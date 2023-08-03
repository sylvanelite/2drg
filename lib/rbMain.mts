
import { NW }from "./netPeer/network.mjs";
import { NetplayInput } from "./netPeer/netplayInput.mjs";
import { RollbackNetcode } from "./netPeer/rollback.mjs";
import { Peer } from "./peer/peerjs.mjs";
import { Main } from "./main.mjs";
import { PlayerConfig } from "./Config/PlayerConfig.mjs";
import { ResourceConfig } from "./Config/ResourceConfig.mjs";
type JoinStatus = "ready"|"joined";
type MessageKind = "begin"|"telegraph"|"join"|"ready";
type Message = {
    data:any,
    id:string,
    kind:MessageKind
}

interface IPlayerNum{
    peerid:string,
    telegraphPlayerNum:number,
    config:PlayerConfig
}

class RbMain extends NW{
    static messageCallback(message:string){}//empty method, give an implementation in the UI to catch logs...
    //NW implementation
    connect(){
		const peer = new Peer(this.GAME_ID+this.networkId);
		peer.on('connection', (conn)=>{
            this.connections.push(conn);
			conn.on('data',(data:Message)=>{//console.log("conn: data",data);
                this.onData(data);
            });
		});
        peer.on('open',(e)=>{
            //this.peerOpen(e);
            if(!this.isHost){//is joining, establish connection to host and send initial message
                const conn = peer.connect(this.GAME_ID+this.hostId,{reliable:true});
                conn.on('open',()=>{
                    //this.connectionOpen();
                    this.connections.push(conn);
                    //push join player's characters to the host
                    //send 'join' message to the host
                    //join should only have 1 connection (to the host)
                    for (const conn of this.connections){
                        conn.send({kind:'join',id:this.networkId});
                    }
                });
                conn.on('data',(data:Message)=>{//console.log("conn: data",data);
                    this.onData(data);
                });
            }
        });
    }


    joined:Map<string,JoinStatus> = new Map();//holds player ID->status mapping
    playerConfig:Map<string,PlayerConfig> = new Map();//holds intial player config when they join
    #rollbackNetcode: RollbackNetcode;
    constructor(){
        super();
    }
    onStart(players:Array<IPlayerNum>,playerId:number,mission:ResourceConfig){
        const playerCount = players.length;
        const configs = [];
        for(const p of players){
            configs.push(p.config);
        }
        const game = Main.init(playerId,configs,mission);
        this.#rollbackNetcode = new RollbackNetcode(
        game,playerCount,playerId,
        10,
        () => game.inputReader.getInput(),
        (frame, input) => {
            this.send({
                kind:'telegraph',
                data:{ type: "input", frame, input: input.serialize(),handle:playerId,
                peerid: this.networkId }});
        },
        );
        console.log("Successfully connected to server.. Starting game..");
        //start game render loop
        this.#rollbackNetcode.start(game.tickRate);
        const animate = () => {
            game.draw();
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }
    async onData(rcvMessage:Message){
        
        //create list of self.joined players
        //once all players are 'ready', enable a new method 'begin'
        //'begin' sets up a telegraph instance and broadcasts telegraph IDs to each client
        //when client gets this broadcast, they do the corresponding action 
        if(this.isHost){
            if(rcvMessage.kind == 'join'){
                RbMain.messageCallback("JOIN: "+rcvMessage.id);
                this.joined.set(rcvMessage.id,"joined");
            }
            if(rcvMessage.kind == 'ready'){
                RbMain.messageCallback("READY: "+rcvMessage.id);
                this.joined.set(rcvMessage.id, "ready");
                this.playerConfig.set(rcvMessage.id,rcvMessage.data.config);
            }
            //if you're the host, broadcast messages to clients
            if(rcvMessage.kind == "telegraph" ){
                this.send(rcvMessage);
            }
        }
        if(!this.isHost){
            if(rcvMessage.kind == 'begin'){
                const players = rcvMessage.data.allPlayers as Array<IPlayerNum>;
                let myId = 1;
                for (let i=0;i<players.length;i+=1){
                    if(players[i].peerid==this.networkId){
                        myId=i;
                        break;
                    }
                }
                this.onStart(players,myId,rcvMessage.data.mission);
            }
        }
        //finally, handle telegraph message processing
        //host rebroadcasts to everyone, filter out messages sent to self
        if(rcvMessage.kind == "telegraph" && rcvMessage.data.peerid != this.networkId){
            //await new Promise(r => setTimeout(r, 100+Math.random()*400));//artifical delay on receive (for testing)
            //startHost /startClient
            const data = rcvMessage.data;
            if (data.type === "input") {
                let input = new NetplayInput();
                input.deserialize(data.input);
                this.#rollbackNetcode.onRemoteInput(data.frame, data.handle, input);
            }
        }
    }
    static begin(self:RbMain,config:PlayerConfig){//TOOD: should only the host be able to start???
        if(self.joined.size<1){
            RbMain.messageCallback("not enough remove players");
            console.log("not enough remote players",self.joined);
            return;
        }
        for(const [id,status] of self.joined){
            if(self.joined.get(id)!="ready"){
                RbMain.messageCallback("player not ready:"+id);
                console.log("player not ready",id,self.joined);
                return;
            }
        }
        //--send initial telegraph status to all clients
        const numPlayers = self.joined.size+1;//+1 for self
        const allPlayers = [{//start with self (host)
                peerid:self.networkId,
                telegraphPlayerNum:0,
                config
        }];
        let playerNum = 1;
        for(const [id,status] of self.joined){//add all others
            allPlayers.push({
                peerid:id,
                telegraphPlayerNum:playerNum,
                config:self.playerConfig.get(id)});
            playerNum+=1;
        }
        
        //--send initial telegraph status to all clients
        const mission = new ResourceConfig();
        const msg = {allPlayers,numPlayers,mission};
        self.send({
            kind:'begin',data:msg
        });
        self.onStart(allPlayers,0,mission);
    }
    static readyUp(self:RbMain,config:PlayerConfig){
        if(!self.isHost){
            self.send({
                kind:'ready',id:self.networkId,
                data:{config}
            });
        }
    }
    static host=(self:RbMain)=>{
        self.host();
        console.log(self.networkId);
        return self.networkId;
    }
    static join(self:RbMain,hostId:string){
        self.join(hostId);
        console.log(self.networkId);
    }

}

export {RbMain};


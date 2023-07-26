
const GAME_ID="SYESH_";
const _getId =()=>{
    let result = '';
    const returnLength = 5;
    //select from charas not likely to be confused for digits
    const characters = 'ABCDEFGHKMNPRSTUVWXYZ235689';
    const charactersLength = characters.length;
    for ( let i = 0; i < returnLength; i+=1 ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
//used to sync peer-to-peer calls

interface IPeer{
    create:(id:string)=>string,//takes in an id of the host, returns your id (either host or join)
    onData:(msg:any)=>void,
    connections:Array<IConnection>
}
interface IConnection{
    send:(msg:object)=>void
}
abstract class NW{
    GAME_ID = GAME_ID;
    networkId = "";//id of self
    hostId = "";//id of host (if isHost==true, )
    get isHost(){
        if(!this.hostId){return false;}
        return this.hostId==this.networkId;
    }
    connections:Array<IConnection> = [];
	host(){
        this.networkId = _getId();
        this.hostId = this.networkId;
        this.connect();
	}
	join(hostId:string){
        this.networkId = _getId();
        this.hostId = hostId;
        this.connect();
	}
	send(message:object){
        for (const conn of this.connections){
            conn.send(message);
        }
	}
    abstract connect():void;
}

export {NW,IPeer,IConnection};
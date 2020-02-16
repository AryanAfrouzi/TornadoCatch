const EventEmitter = require("events");

// local dependencies
const networkCatcher = require("./networkCatcher.js");
const chainCatcher = require("./chainCatcher.js");
//const catcherApi = require("./catcherApi.js");

class MatchMaker extends EventEmitter {
    constructor(){
        super();
        this.matches = [];
    }
}

const matchMaker = new MatchMaker();

let packets = [];
let txs = [];

networkCatcher.on("newPacket", (packet) => {
    packets.push(packet);
    // match();
});

chainCatcher.on("newTx", (tx) => {
    txs.push(tx);
    match();
});

function match() {
    if (packets.length == 0 || txs.length == 0) {
        console.log("no tx or packets available...");
        return;
    }

    pIndex = packets.length - 1;
    tIndex = txs.length - 1;

    const tx = txs[txs.length - 1];

    const targetDomain = ".com";
    const deltaTimeS = 45;

    // find all packets of target domain
    console.log("going to process another match...");
    for (let packet of packets) {
        let url = packet.URL;

        // we don't need to search URL anymore as we now apply an IP filter on only Tornado
        //if(packet.URL.includes(targetDomain)) {

            // we found a packet for the target domain!
            // now check if there are any transactions within +/- deltaTimeS
            // which match the dapp

            //console.log("found packet: " + JSON.stringify(packet));
            const txTime = tx.blockTime;
            const packetTime = packet.time / 1000;
            const dt = Math.abs(txTime - packetTime);
            //console.log("txTime: " + txTime + ", packetTime: " + packetTime + ", dt: " + dt);

            if(dt < deltaTimeS) {
                console.log("MATCH");

                //matchMaker.emit("newMatch", 
                matchMaker.matches.push({
                    MAC: packet.MAC,
                    time: tx.blockTime,
                    hash: tx.txHash,
                    URL: "tornado.cash"
                });

                // in order to prevent multiple results, remove the tx and return
                txs.pop();
                packets = [];
                break;
            }
        //}
    }

}

module.exports = matchMaker;
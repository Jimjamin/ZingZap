require('dotenv').config();
const { createHash, randomBytes } = require('crypto');
const fs = require('fs');

const MAX_TX_CONDUCTOR = process.env.MAX_TX_CONDUCTOR || 16384;
const MAX_TX_PULSE = process.env.MAX_TX_PULSE || 100;

const MAX_TIME_PULSE = process.env.MAX_TIME_PULSE || 10000;

const NUM_ASCII = 128;

let HOST = '';
let HOST_PASSWORD = '';

class Volt {
    constructor(zingzap, address, to, data, hashing, exec) {
        this.index = 0;
        this.to = to;
        this.data = data;
        this.executed = false;
        this.from = address;
        this.hash = hashing;
        this.exec = exec;
        for (let j = 0; j < zingzap.station[this.from.charCodeAt(0)].length; j++) {
            if (zingzap.station[this.from.charCodeAt(0)][j].address === this.from) {
                this.index = ++zingzap.station[this.from.charCodeAt(0)][j].numTX;
            }
        }
    }
}

module.exports = class Pulse {
    constructor() {
        HOST_PASSWORD = createHash('sha256').update(`${process.env.NONCE}:${randomBytes(24)}:${(new Date()).getTime()}`).digest('base64').toUpperCase();
        HOST = HOST_PASSWORD;
        for (let i = 0; i < MAX_TX_CONDUCTOR; i++) {
            HOST = createHash('sha256').update(HOST).digest('base64').toUpperCase();
        }
        HOST = HOST.slice(0, 8).toUpperCase();
        fs.writeFileSync('./host.json', JSON.stringify({ host: HOST, host_password: HOST_PASSWORD }));
        this.timestamp = (new Date()).getTime();
        this.battery = [];
        this.station = [];
        for (let i = 0; i < NUM_ASCII; i++) this.station[i] = [];
        this.prevHash = '';
        this.hash = createHash('sha256').update(`${this.timestamp}${this.battery}${this.station}${this.prevHash}`).digest('base64');
        this.numConductors = 0;
        console.log(this.add(HOST)[0]);
    }

    new = () => {
        this.timestamp = (new Date()).getTime();
        this.battery = [];
        this.prevHash = this.hash;
        this.hash = createHash('sha256').update(`${this.timestamp}${this.battery}${this.station}${this.prevHash}`).digest('base64');
    }

    send = (address, to, data, hashing, exec) => {
        this.battery.push(new Volt(this, address, to, data, hashing, exec));
        if (this.battery.length === MAX_TX_PULSE || (new Date).getTime() > (this.timestamp + MAX_TIME_PULSE)) {
            let successCount = 0;
            for (let i = 0; i < this.battery.length; i++) {
                if (this.battery[i].index === MAX_TX_CONDUCTOR - 1 && this.battery[i].to !== HOST) {
                    break;
                }
                for (let j = 0; j < this.station[this.battery[i].from.charCodeAt(0)].length; j++) {
                    if (this.station[this.battery[i].from.charCodeAt(0)][j].address === this.battery[i].from) {
                        let hash = this.battery[i].hash;
                        for (let k = 0; k < this.battery[i].index; k++) {
                            hash = createHash('sha256').update(hash).digest('base64').toUpperCase();
                        }
                        hash = hash.slice(0, 8).toUpperCase();
                        if (hash === this.battery[i].from) {
                            for (let k = 0; k < this.station[this.battery[i].to.charCodeAt(0)].length; k++) {
                                if (this.station[this.battery[i].to.charCodeAt(0)][k].address === this.battery[i].to) {
                                    successCount++;
                                    this.battery[i].exec(this.station[this.battery[i].from.charCodeAt(0)][j], this.station[this.battery[i].to.charCodeAt(0)][k], this.battery[i].data);
                                    this.battery[i].executed = true;
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
            }
            this.hash = createHash('sha256').update(`${this.timestamp}${this.battery}${this.station}${this.prevHash}`).digest('base64');
            console.log(`Pulse ${this.hash} has executed ${successCount} out of ${this.battery.length} messages.`);
            this.new();
        }
        this.hash = createHash('sha256').update(`${this.timestamp}${this.battery}${this.station}${this.prevHash}`).digest('base64');
    }

    add = address => {
        for (let i = 0; i < this.station[address.charCodeAt(0)].length; i++) {
            if (this.station[address.charCodeAt(0)][i].address === address) {
                return [`Conductor ${address} already exists.`, this.station[address.charCodeAt(0)][i].numTX];
            }
        }
        this.station[address.charCodeAt(0)].push({ 
            address: address,
            amount: 300,
            numTX: 0 
        });
        this.numConductors++;
        return [`Conductor ${address} has been successfully created.`, 0];
    }

    find = address => {
        for (let i = 0; i < this.station[address.charCodeAt(0)].length; i++) {
            if (this.station[address.charCodeAt(0)][i].address === address) {
                return [`Conductor ${address} has successfully logged in.`, this.station[address.charCodeAt(0)][i].numTX];
            }
        }
        return [`Conductor ${address} does not exist.`, -1];
    }
}

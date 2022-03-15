require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, "public/")));

const Pulse = require('./obj/pulse.js');

const MAX_TX_CONDUCTOR = process.env.MAX_TX_CONDUCTOR || 16384;
const PORT = process.env.PORT || 80;

let zingzap = new Pulse();

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, "./public/view/", "index.html"));
})

app.get('/register', (req, res) => {
	res.send({
		status: 'success',
		numConductors: zingzap.numConductors,
		maxTX: MAX_TX_CONDUCTOR
	});
})

app.get('/logon', (req, res) => {
	let data = '';
	let status = '';
	if (req.query.register === 'true') {
		data = zingzap.add(decodeURIComponent(req.query.address));
		status = 'success';
	} else {
		data = zingzap.find(decodeURIComponent(req.query.address));
		if (data[1] < 0) {
			status = 'error';
		}
	}
	console.log(data[0]);
	res.send({
		status: status,
		msg: data[0],
		numTX: data[1]
	});
});

app.get('/send', (req, res) => {
	console.log(`Conductor ${req.query.address} has sent a message to ${req.query.to}.`);
	zingzap.send(req.query.address, req.query.to, req.query.data, req.query.hashing, (from, to, amount) => {
		console.log(`Message from conductor ${from.address} to ${to.address} has been executed successfully.`);
		from.amount -= amount;
		to.amount += amount;
	});
	res.send({ 
		status: 'success',
		msg: "Transaction has been sent."
	});
});

app.get('/history', (req, res) => {
	console.log('History of the chain has been requested.');
	res.send({ 
		history: {
			timestamp: zingzap.timestamp,
			battery: zingzap.battery,
			station: zingzap.station,
			prevHash: zingzap.prevHash,
			hash: zingzap.hash
		}
	});
});

app.listen(PORT, () => {
	console.log(`Running on port ${PORT}.`)
});

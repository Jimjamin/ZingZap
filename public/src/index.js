let address = '';
let password = '';
let numTX = 0;

document.getElementById("copyPassword").addEventListener("click", () => {
    navigator.clipboard.writeText(password);
	document.getElementById("copyImg").style.display = 'none';
	document.getElementById("copyTxt").style.display = 'block';
	setTimeout(() => {
		document.getElementById("copyTxt").style.display = 'none';
		document.getElementById("copyImg").style.display = 'block';
	}, 3000);
})

const logon = (callback, hashword = '') => {
	fetch(`${window.location.href}register`)
		.then(res => res.json())
		.then(async res => {
			if (hashword.length === 0) {
				let rand = window.crypto.getRandomValues(new Uint32Array(1))[0];
				let hashing = new Uint8Array(await window.crypto.subtle.digest('SHA-256', (new TextEncoder).encode(`${rand}:${res.numConductors}`)));
				let output = '';
				for (let i = 0; i < hashing.byteLength; i++) {
					output += String.fromCharCode(hashing[i]);
				}
				password = window.btoa(output).toUpperCase();
			} else if (hashword.length === 44) {
				password = hashword;
			}
			address = password;
			for (let i = 0; i < res.maxTX; i++) {
				address = new Uint8Array(await window.crypto.subtle.digest('SHA-256', (new TextEncoder).encode(`${address}`)));
				output = '';
				for (let j = 0; j < address.byteLength; j++) {
					output += String.fromCharCode(address[j]);
				}
				address = window.btoa(output).toUpperCase();
				if (i === res.maxTX - 1) {
					address = window.btoa(output).slice(0, 8).toUpperCase();
					if (hashword.length === 0) {
						fetch(`${window.location.href}logon?address=${encodeURIComponent(address)}&register=true`)
							.then(result => result.json())
							.then(result => {
								numTX = result.numTX;
								callback(result.status, result.msg);
								return { status: result.status, data: result.msg };
							})
							.catch(error => {
								callback('error', error);
								return { status: 'error', data: error };
							})
					} else {
						fetch(`${window.location.href}logon?address=${encodeURIComponent(address)}&register=false`)
							.then(result => result.json())
							.then(result => {
								numTX = result.numTX;
								callback(result.status, result.msg);
								return { status: result.status, data: result.msg };
							})
							.catch(error => {
								callback('error', error);
								return { status: 'error', data: error };
							})
					}
				}
			}
		})
		.catch(err => {
			callback('error', err);
			return { status: 'error', data: err };
		})
}

document.getElementById("regBtn").addEventListener("click", () => {
	document.getElementById("intro").style.display = 'none';
	document.getElementById("registration").style.display = 'block';
	logon((status, data) => {
		console.log(data);
		if (status === 'error') {
			document.getElementById("regStatus").textContent = 'oops, it seems something went wrong?';
		} else {
			document.getElementById("regStatus").textContent = 'ta-da, all done!';
			document.getElementById("regAddress").textContent = address;
			document.getElementById("postReg").style.display = "block";
		}
	});
})

document.getElementById("logBtnTwo").addEventListener("click", () => {
	if (sessionStorage.logonCount > 4) {
		document.getElementById("logBtnTwo").textContent = '';
		document.getElementById("logonAttempt").textContent = 'You have been temporarily locked out. If you have forgotten your password click the link above.';
		return;
	}
	logon((status, data) => {
		console.log(data);
		if (status === 'error') {
			if (sessionStorage.logonCount) {
				sessionStorage.logonCount = Number(sessionStorage.logonCount) + 1;
			} else {
				sessionStorage.logonCount = 1;
			}
			document.getElementById("passwordInput").textContent = '';
			document.getElementById("logonAttempt").textContent = `You have made ${sessionStorage.logonCount} logon attempts. After 5 attempts you will be temporarily locked out.`;
		} else {
			document.getElementById("logon").style.display = 'none';
			document.getElementById("passwordInput").textContent = '';
			document.getElementById("logAddress").textContent = address;
			document.getElementById("payment").style.display = 'block';
		}
	}, document.getElementById("passwordInput").value);
})

document.getElementById("logLnk").addEventListener("click", () => {
	document.getElementById("intro").style.display = 'none';
	document.getElementById("logon").style.display = 'block';
})

document.getElementById("payBtn").addEventListener("click", () => {
	send(document.getElementById("toInput").value, document.getElementById("payInput").value);
})

const send = (to, data) => {
	numTX++;
	fetch(`${window.location.href}register`)
		.then(res => res.json())
		.then(async res => {
			let hashing = password;
			for (let i = 0; i < (res.maxTX - numTX); i++) {
				hashing = new Uint8Array(await window.crypto.subtle.digest('SHA-256', (new TextEncoder).encode(`${hashing}`)));
				let output = '';
				for (let j = 0; j < hashing.byteLength; j++) {
					output += String.fromCharCode(hashing[j]);
				}
				hashing = window.btoa(output).toUpperCase();
			}
			fetch(`${window.location.href}send?to=${encodeURIComponent(to)}&data=${encodeURIComponent(data)}&hashing=${encodeURIComponent(hashing)}&address=${encodeURIComponent(address)}`)
			if (numTX === res.maxTX - 1) {
				return { status: 'warning', data: 'You have reached your transaction limit for this account. All future transactions will fail unless directed to the host.' };
			}
			return { status: 'success', data: 'You have successfully sent data to the intended recipient.' };
		})
		.catch(err => {
			return { status: 'error', data: err };
		})
}

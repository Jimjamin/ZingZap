const customPay = () => {
    const options = [
        'friends',
        'family',
        'merchants',
        'staff',
        'team mates',
        'subscriptions'
    ];
    let rand = 0;
    do {
        rand = Math.round(Math.random() * 6) % 6;
    } while (document.getElementById("whoPay").textContent === options[rand]);
    document.getElementById("whoPay").textContent = options[rand];
    document.getElementById("whoPayTwo").textContent = options[rand];
    setTimeout(customPay, 8000);
}

window.onload = () => {
    customPay();
}

document.getElementById("logo").addEventListener("click", () => {
    window.location.href = window.location.href;
})

document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = window.location.href;
})

document.getElementById("backBtnTwo").addEventListener("click", () => {
    window.location.href = window.location.href;
})

document.getElementById("logBtn").addEventListener("click", () => {
    document.getElementById("registration").style.display = 'none';
    document.getElementById("logAddress").textContent = address;
    document.getElementById("payment").style.display = 'block';
})

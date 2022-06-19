const customPay = () => {
    const options = [
        'photos',
        'data',
        'memories',
        'passwords',
        'accounts',
        'documents'
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
});

document.getElementById("backBtn").addEventListener("click", () => {
    window.location.href = window.location.href;
});

document.getElementById("backBtnTwo").addEventListener("click", () => {
    window.location.href = window.location.href;
});

let page = 0;
const switchDocs = () => {
    if (page === 0) {
        document.getElementById("vision").style.display = 'block';
        document.getElementById("cryptography").style.display = 'none';
        document.getElementById("cryptonomics").style.display = 'none';
    } else if (page === 1) {
        document.getElementById("vision").style.display = 'none';
        document.getElementById("cryptography").style.display = 'block';
        document.getElementById("cryptonomics").style.display = 'none';
    } else if (page === 2) {
        document.getElementById("vision").style.display = 'none';
        document.getElementById("cryptography").style.display = 'none';
        document.getElementById("cryptonomics").style.display = 'block';
    } else {
        window.location.href = window.location.href;
    }
}

document.getElementById("backBtnThree").addEventListener("click", () => {
    page--;
    switchDocs();
});

document.getElementById("nextBtn").addEventListener("click", () => {
    page++;
    switchDocs();
});

document.getElementById("viewBtn").addEventListener("click", () => {
    document.getElementById("nextBtnTwo").click();
});

let list = -1;
document.getElementById("backBtnFour").addEventListener("click", () => {
    list--;
    if (list === -1) {
        document.getElementById("payment").style.display = "block";
        document.getElementById("search").style.display = "none";
    }
    let blocks = document.querySelectorAll(".blockBtn");
    blocks.forEach(block => {
        block.textContent = `#${32853 - list * 5}`;
    });
});

document.getElementById("nextBtnTwo").addEventListener("click", () => {
    list++;
    if (list > -1) {
        document.getElementById("payment").style.display = "none";
        document.getElementById("search").style.display = "block";
    }
    let blocks = document.querySelectorAll(".blockBtn");
    let i = 0;
    blocks.forEach(block => {
        block.textContent = `#${32853 - i - list * 5}`;
        i++;
    });
});

document.getElementById("logBtn").addEventListener("click", () => {
    document.getElementById("registration").style.display = 'none';
    document.getElementById("logAddress").textContent = address;
    document.getElementById("logAddressTwo").textContent = address;
    document.getElementById("payment").style.display = 'block';
});

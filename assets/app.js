let participants = [];
let orders = [];

function addParticipant() {
    let name = document.getElementById("participant-name").value;
    if (name !== '' && !participants.includes(name)) {
        participants.push(name);
        updateParticipants();
        document.getElementById("participant-name").value = "";
    }
}

function updateParticipants() {
    let participantDiv = document.getElementById("participants");
    let participantSelect = document.getElementById("participant-select");
    participantDiv.innerHTML = "Nama: " + participants.join(", ");
    participantSelect.innerHTML = participants.map(p => 
        `<label><input type="checkbox" value="${p}"> ${p}</label>`
    ).join(" ");
}

function addOrder() {
    let menuInput = document.getElementById("menu-name"); 
    let quantityInput = document.getElementById("quantity");
    let priceInput = document.getElementById("price");

    let menu = menuInput.value;
    let quantity = parseInt(quantityInput.value);
    let price = parseInt(priceInput.value);
    let selectedParticipants = Array.from(document.querySelectorAll("#participant-select input:checked"))
                                      .map(input => input.value);

    if (menu && quantity > 0 && price > 0 && selectedParticipants.length > 0) {
        orders.push({ menu, quantity, price, participants: selectedParticipants });
        updateOrders();

        document.getElementById("menu-name").value = "";
        document.getElementById("quantity").value = "";  
        document.getElementById("price").value = "";

        document.querySelectorAll("#participant-select input:checked").forEach(input => input.checked = false);
    }
}

function updateOrders() {
    let orderList = document.getElementById("order-list");
    orderList.innerHTML = orders.map((o, index) => `
        <tr>
            <td>${o.menu}</td>
            <td>${o.quantity}</td>
            <td>${o.price}</td>
            <td>${o.quantity * o.price}</td>
            <td>${o.participants.join(", ")}</td>
            <td class="no-print"><button onclick="removeOrder(${index})">Hapus</button></td>
        </tr>
    `).join("");
}

function removeOrder(index) {
    let order = orders[index];
    let confirmation = confirm (`Apakah kamu yakin ingin menghapusnya?`) 
    
    if (confirmation) {
        orders.splice(index,1);
        updateOrders();
    }
}

function calculateSplit() {
    let tax = parseFloat(document.getElementById("tax").value) / 100 || 0;
    let service = parseFloat(document.getElementById("service").value) / 100 || 0;
    let discount = parseFloat(document.getElementById("discount").value) / 100 || 0;

    let results = {};

    orders.forEach(order => {
        let total = order.quantity * order.price;
        let perPerson = total / order.participants.length;

        order.participants.forEach(participant => {
            if (!results[participant]) {
                results[participant] = [];
            }
            results[participant].push({
                menu: order.menu,
                total: perPerson
            });
        });
    });

    document.getElementById("split-results").innerHTML += `<h3>Hasil Pembagian</h3>`

    for (let participant in results) {
        let subtotal = results[participant].reduce((sum, item) => sum + item.total, 0);
        let taxAmount = subtotal * tax;
        let serviceAmount = subtotal * service;
        let discountAmount = subtotal * discount;
        let total = subtotal + taxAmount + serviceAmount - discountAmount;

    document.getElementById("split-results").innerHTML += `
    <h4>${participant}</h4>

    <ul>
        ${results[participant].map(item => `<li>${item.menu}: Rp ${item.total.toLocaleString()}</li>`).join('')}
        <li>Pajak: Rp ${taxAmount.toLocaleString()}</li>
        <li>Biaya Layanan: Rp ${serviceAmount.toLocaleString()}</li>
        <li>Diskon: Rp ${discountAmount.toLocaleString()}</li>
        <li><b>Total: Rp ${total.toLocaleString()}</b></li>
    </ul>
`;}
}

function printReceipt() {
    let content = document.getElementById("split-results").innerHTML;
    let printWindow = window.open("", "", "width=800,height=600");

    printWindow.document.write(`
        <html>
        <head>
            <title>SplitYourBill</title>
            <link rel="stylesheet" href="assets/app.css">
        </head>
        <body>
            <div class="split-results">${content}</div>
        </body>
        </html>
    `);

    printWindow.document.close();

    printWindow.onload = function () {
        printWindow.print();
        printWindow.close();
    };
}

function openPopup() {
    document.getElementById("popup").style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}

window.onclick = function(event) {
    let popup = document.getElementById("popup");
    if (event.target == popup) {
        popup.style.display = "none";
    }
}

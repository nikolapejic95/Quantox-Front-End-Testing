"use strict";

var currentPage = 0;

var lastTotal = 0;
if (parseFloat(window.localStorage.getItem("lastTotal")) > 0) lastTotal = parseFloat(window.localStorage.getItem("lastTotal"));

var info = "";
function requestData() {
    var data = new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://api.coinmarketcap.com/v2/ticker/?limit=50&sort=rank");
        xhr.onload = function () {
            return resolve(xhr.responseText);
        };
        xhr.onerror = function () {
            return reject(xhr.statusText);
        };
        xhr.send();
    });

    data.then(function (result) {
        info = Object.values(JSON.parse(result).data);

        for (var i = info.length - 1; i >= 0; i--) {
            for (var j = 0; j <= i; j++) {
                if (info[i].quotes.USD.price > info[j].quotes.USD.price) {
                    var t = info[i];
                    info[i] = info[j];
                    info[j] = t;
                }
            }
        }
        console.log(info);

        for (var i = 0; i < info.length; i++) {
            console.log(info[i].name + " : " + info[i].quotes.USD.price);
        }fillTheTable();
        document.getElementById("loader-overlay").style.display = "none";
    });
}
requestData();

setInterval(function () {
    requestData();
}, 60000);

function fillTheTable() {
    var table = document.getElementById("currencies");
    var tableContents = tableHeading;
    for (var i = currentPage * 10; i < currentPage * 10 + 10; i++) {
        tableContents += "<tr><td><a href=\"details.html?id=" + info[i].id + "\" target=\"_blank\">" + info[i].name + "</a></td><td>" + info[i].symbol + "</td><td>$ " + info[i].quotes.USD.price + "</td><td>";
        if (info[i].quotes.USD.percent_change_24h > 0) {
            tableContents += "<span style=\"color: green;\">" + info[i].quotes.USD.percent_change_24h + " %</span></td>";
        } else {
            tableContents += "<span style=\"color: red;\">" + info[i].quotes.USD.percent_change_24h + " %</span></td>";
        }

        var id = info[i].id;
        var value = window.localStorage.getItem("val" + info[i].id);
        if (parseFloat(value) > 0) {
            tableContents += "<td><input onkeypress=\"tryToSave(event," + id + "," + info[i].quotes.USD.price + ")\" type=\"number\" value=\"" + parseFloat(value) + "\" onkeyup=\"checkDisable(" + id + ")\" id=\"save-input-" + id + "\" /><br><button id=\"save-input-button-" + id + "\" onclick=\"saveVal(" + id + "," + info[i].quotes.USD.price + ")\">Submit</button></td>";
            tableContents += "<td id=\"save-total-" + id + "\">$ " + parseFloat(Math.round(parseFloat(value) * info[i].quotes.USD.price * 100) / 100).toFixed(2) + " </td></tr>";
        } else {
            tableContents += "<td><input onkeypress=\"tryToSave(event," + id + "," + info[i].quotes.USD.price + ")\" type=\"number\" onkeyup=\"checkDisable(" + id + ")\" id=\"save-input-" + id + "\" /><br><button id=\"save-input-button-" + id + "\" onclick=\"saveVal(" + id + "," + info[i].quotes.USD.price + ")\" disabled>Submit</button></td>";
            tableContents += "<td id=\"save-total-" + id + "\">$ 0.00</td></tr>";
        }

        table.innerHTML = tableContents;
    }
    checkEarnings();
}

var tableHeading = "<tr> <th>Name</th> <th>Short Name</th> <th>$ Value</th> <th>Last 24</th><th>Amount you own</th><th>$ value of your coin</th></tr>";

function checkDisable(n) {
    if (document.getElementById("save-input-" + n).value.length === 0) {
        document.getElementById("save-input-button-" + n).disabled = true;
    } else {
        document.getElementById("save-input-button-" + n).disabled = false;
    }
}

function saveVal(n, amount) {
    // Regex is not required here - since the input type is a number and user is not able to input anything else
    // However, in case user changes html or anything, this regex will catch any errors
    var regex = /[+-]?([0-9]*[.])?[0-9]+/g;
    var str = "" + n;
    if (!str.match(regex)) {
        alert("User did not input a number!");
        return;
    }

    var value = document.getElementById("save-input-" + n).value;
    window.localStorage.setItem("val" + n, value);
    console.log(value);
    console.log(amount);
    var prod = value * amount;
    console.log(prod);
    checkEarnings();
    document.getElementById("save-total-" + n).innerHTML = "$ " + parseFloat(Math.round(prod * 100) / 100).toFixed(2);
}

function tryToSave(e, n, amount) {
    if (e.keyCode == 13 && document.getElementById("save-input-button-" + n).disabled === false) {
        saveVal(n, amount);
    }
}

function changePage(n) {
    document.getElementById("page-" + (currentPage + 1)).style.color = "#212529";
    currentPage = n;
    document.getElementById("page-" + (currentPage + 1)).style.color = "blue";
    fillTheTable();
}

function checkEarnings() {
    var currentTotal = 0;
    for (var i = 0; i < 50; i++) {
        var value = window.localStorage.getItem("val" + info[i].id);
        if (parseFloat(value) > 0) {
            currentTotal += info[i].quotes.USD.price * value;
        }
    }
    window.localStorage.setItem("lastTotal", currentTotal);

    var el = document.getElementById("from-last-time");
    var dif = currentTotal - lastTotal;
    if (dif > 0) {
        el.innerHTML = "You have <span style=\"color: green;\">gained</span> " + dif.toFixed(2) + "$ from the last time you visited!";
    } else if (dif < 0) {
        el.innerHTML = "You have <span style=\"color: red;\">lost</span> " + -1 * dif.toFixed(2) + "$ from the last time you visited!";
    } else {
        el.innerHTML = "There were no changes in the earnings from the last time you visited.";
    }
}
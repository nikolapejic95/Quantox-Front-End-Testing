"use strict";

var info = "";

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}
function requestData()
{
    var data = new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "https://api.coinmarketcap.com/v2/ticker/"+findGetParameter("id")+"/");
        xhr.onload = function () {
            return resolve(xhr.responseText);
        };
        xhr.onerror = function () {
            return reject(xhr.statusText);
        };
        xhr.send();
    });

    data.then(function (result) {
        info = JSON.parse(result).data;

        // Display the data
        document.getElementById("details-heading").innerHTML = info.name+" ("+info.symbol+")";
        document.getElementById("details-website").innerHTML = info.website_slug;
        document.getElementById("details-lastupdated").innerHTML = timeConverter(info.last_updated);
        document.getElementById("details-rank").innerHTML = info.rank;
        document.getElementById("details-circulating").innerHTML = info.circulating_supply;
        document.getElementById("details-total").innerHTML = info.total_supply;
        document.getElementById("details-max").innerHTML = info.max_supply;
        document.getElementById("details-price").innerHTML = info.quotes.USD.price;
        document.getElementById("details-volume").innerHTML = info.quotes.USD.volume_24h;
        document.getElementById("details-market").innerHTML = info.quotes.USD.market_cap;

        var change = info.quotes.USD.percent_change_1h;
        if(change >= 0) document.getElementById("details-1hour").style.color = "green";
        else document.getElementById("details-1hour").style.color = "red";
        document.getElementById("details-1hour").innerHTML = change;

        change = info.quotes.USD.percent_change_24h;
        if(change >= 0) document.getElementById("details-24hours").style.color = "green";
        else document.getElementById("details-24hours").style.color = "red";
        document.getElementById("details-24hours").innerHTML = change;

        change = info.quotes.USD.percent_change_7d;
        if(change >= 0) document.getElementById("details-7days").style.color = "green";
        else document.getElementById("details-7days").style.color = "red";
        document.getElementById("details-7days").innerHTML = change;

        document.getElementById("loader-overlay").style.display = "none";
    });
}
requestData();

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}
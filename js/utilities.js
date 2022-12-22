// New IEX API Key (Publishable)
const apiKey = "pk_98f3452a96a4423db9772e70ee8f5cec";

// New IEX Base URL
const baseUrl = "https://cloud.iexapis.com/";

// Prepend Base URL to Segments


var cryptos = [];

function crypto(name, apiname, symbol) {
	this.name = name;
	this.apiname = apiname;
	this.symbol = symbol;
	this.src = "https://raw.githubusercontent.com/atomiclabs/cryptocurrency-icons/master/128/color/" + this.symbol.toLowerCase() + ".png";
}

cryptos.push(new crypto("Bitcoin", "bitcoin", "BTC"));
cryptos.push(new crypto("EOS", "eos", "EOS"));
cryptos.push(new crypto("Ethereum", "ethereum", "ETH"));
cryptos.push(new crypto("Binance Coin", "binancecoin", "BNB"));
cryptos.push(new crypto("Ripple", "ripple", "XRP"));
cryptos.push(new crypto("Litecoin", "litecoin", "LTC"));
cryptos.push(new crypto("MIOTA", "iota", "MIOTA"));
cryptos.push(new crypto("QTUM", "qtum", "QTUM"));

const prependBase = function (url, stable) {
	if (stable) {
		return `${baseUrl}stable/${url}`;
	} else {
		return `${baseUrl}${url}`;
	}
};

$("#nav-contect").on("click", function () {
	alert('xd');
	$("#nav-contact").scrollTo(0, document.body.scrollHeight);
});

// Append API Key to URL as a Query Parameter
const appendKey = function (url) {
	return `${url}?token=${apiKey}`;
};

// Gainers & Losers Data
const gainersEndPoint = appendKey(prependBase("stock/market/list/gainers", true));
const losersEndPoint = appendKey(prependBase("stock/market/list/losers", true));

// Fetch Options
const fetchOptionsDefault = {
	method: "GET",
	headers: { Accept: "application/json" }
};

// URL Constructors
const makeStockQuoteUrl = function (symbol) {
	let segment = `stock/${symbol}/quote`;
	return appendKey(prependBase(segment, true));
};

const makeCompanyNewsUrl = function (symbol) {
	let segment = `stock/${symbol}/news/last/5`;
	return appendKey(prependBase(segment, true));
};

// Generic Fetch Function
const fetchFromAPI = function (url, options, successFunc, failureFunc) {
	fetch(url, options)
		.then(function (response) {
			return response.json();
		})
		.then(successFunc)
		.catch(failureFunc);
};

// Logging Function (for test only)
const logStatus = function (msg) {
	console.log(msg);
};

// Fix a Number to (at least) Two Decimal Places
const toTwoDecimal = function (num) {
	num = parseFloat(num);
	return num.toFixed(2);
};

// Fix a Number to (at least) Two Decimal Places
const leastTwoDecimal = function (num) {
	num = parseFloat(num);
	return num.toFixed(Math.max(2, (num.toString().split('.')[1] || []).length));
};

// Cut a Company's Name to Two Words
const shortenName = function (name) {
	let finalName = "";
	let words = name.split(" ");
	if (words[0]) {
		finalName += words[0];
	}
	if (words[1]) {
		finalName += " " + words[1];
	}
	return finalName;
};

// Determine Whether It is Business Hour
const isBusinessHour = function (date) {
	if (date.getDay() == 0 || date.getDay() == 6) {
		return false;
	}
	else if (date.getHours() < 9 || date.getHours() > 16) {
		return false;
	}
	return true;
};

// Capitalize only the first character of a string
const toTitle = function (string) {
	string = string.toLowerCase();
	return string.charAt(0).toUpperCase() + string.slice(1);
};

// Format Epoch Time to ISO String
const formatDateTime = function (epoch) {
	let date = new Date(epoch);
	let iso = date.toISOString();
	let segments = iso.split("T");
	return `${segments[0]} ${segments[1].substring(0, 5)}`;
};

// Trim News Summary
const trimSummary = function (summary) {
	let length = 500;
	let raw = summary.substring(0, length);
	let last = raw.lastIndexOf(" ");
	let elp = "";
	if (summary.length > length) {
		elp = "...";
		raw = raw.substring(0, last);
	}
	return `${raw.trim()}${elp}`;
};


var btcPriceDiv = document.getElementById("btc-p");
var eosPriceDiv = document.getElementById("eos-p");
var ethPriceDiv = document.getElementById("eth-p");
var bnbPriceDiv = document.getElementById("bnb-p");
var xrpPriceDiv = document.getElementById("xrp-p");
var ltcPriceDiv = document.getElementById("ltc-p");
var IOTAPriceDiv = document.getElementById("iota-p");
var QTUMPriceDiv = document.getElementById("qtum-p");

var liveCrypto = {
	"async": true,
	"scroosDomain": true,
	"url": "https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2Cbitcoin%2Cripple%2Ciota%2Clitecoin%2Cbitcoin%2Ceos%2Cqtum%2Cbinancecoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true",

	"method": "GET",
	"headers": {}

};

var mySectorApi = "API_KEYf9NKRUWASFAJ0IOB2TTPXXSSQHR7ASG6";

var liveSector = {
	"async": true,
	"scroosDomain": true,
	"url": "https://api.finage.co.uk/market-information/us/sector-performance?apikey=" + mySectorApi,
	"method": "GET",
	"headers": {}

};

const createTableData = (text) => {
	var x = document.createElement("td");
	x.textContent = text;
	return x;
}

$.ajax(liveCrypto).done(function (response) {
	const date = new Date(response.bitcoin.last_updated_at * 1000);
	var timeDiv = document.getElementById("timeDiv");
	timeDiv.textContent = "*Last updated at: " + date;
	var cryptoTable = document.getElementById("cryptoTable");
	for (let i = 0; i < cryptos.length; i++) {
		var newRow = document.createElement("tr");
		var newHead = document.createElement("th");
		newHead.classList.add("symbol-header");
		newHead.scope = "row";
		var imgDiv = document.createElement("div");
		var img = document.createElement("img");
		img.src = cryptos[i].src;
		imgDiv.appendChild(img);
		var flexDiv = document.createElement("div");
		flexDiv.style.display = "flex";
		var textDiv = document.createElement("div");
		textDiv.style.display = "inline";
		textDiv.textContent = cryptos[i].symbol + "-USD";
		flexDiv.appendChild(imgDiv);
		flexDiv.appendChild(textDiv);
		img.classList.add("crypto-icon");
		newHead.appendChild(flexDiv);
		newRow.append(newHead);
		newRow.append(createTableData(cryptos[i].name));
		let coin = cryptos[i].apiname;
		newRow.append(createTableData("$" + response[coin].usd));
		var changeValue = toTwoDecimal(response[coin].usd_24h_change);
		var changeTd = document.createElement("td");
		if (changeValue > 0) {
			changeTd.style.color = "#093";
			changeTd.textContent = "+" + changeValue;
		}
		else {
			changeTd.style.color = "red";
			changeTd.textContent = changeValue;
		}
		newRow.append(changeTd);
		newRow.append(createTableData("$" + toTwoDecimal(response[coin].usd_market_cap / 1000000) + "M"));
		cryptoTable.appendChild(newRow);
	}
});
$.ajax(liveSector).done(function (response) {
	console.log(response);
	for (let i = 0; i < response.length; i++) {
		var secResp = response[i];
		var sectorName = secResp.sector;
		const sectorDiv = document.getElementById(sectorName);
		if (sectorDiv) {
			sectorDiv.innerHTML = secResp.change_percentage;
			if (secResp.change_percentage[0] != '-') {
				sectorDiv.style.color = "#093";
			}
			else {
				sectorDiv.style.color = "red";
			}
		}
	}
});


var liveStockGainers = {
	"async": true,
	"scroosDomain": true,
	"url": "https://financialmodelingprep.com/api/v3/stock_market/gainers?apikey=a7f5317786f8fc549cfc159224d11875",
	"method": "GET",
	"headers": {}

};

function sortByKeyDescending(array, key) {
	return array.sort(function (a, b) {
		var x = a[key]; var y = b[key];
		return ((x < y) ? 1 : ((x > y) ? -1 : 0));
	});
}

function sortByKeyAscending(array, key) {
	return array.sort(function (a, b) {
		var x = a[key]; var y = b[key];
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
}

$.ajax(liveStockGainers).done(function (response) {
	console.log(response);
	sortByKeyDescending(response, "change");
	for (let i = 0; i < response.length && i < 10; i++) {
		// Create elements
		var $newRow = $("<tr></tr>");
		var $head = $("<td></td>");
		var $change = $("<td></td>");
		var $price = $("<td></td>");
		var $symbol = $("<div></div>");
		var $name = $("<div></div>");
		// Fill elements
		$symbol.html(response[i].symbol).addClass("stock-symbol");
		$name.html(shortenName(response[i].name)).addClass("company-name");
		$price.html("$" + toTwoDecimal(response[i].price)).addClass("font-weight-bold");
		$change.html("+" + toTwoDecimal(parseFloat(response[i].change)) + "%").addClass("up");
		// Attach elements
		$head.append($symbol, $name);
		$newRow.append($head, $change, $price);
		$("#gainers-tbody").append($newRow);
	}
});



var liveStockLosers = {
	"async": true,
	"scroosDomain": true,
	"url": "https://financialmodelingprep.com/api/v3/stock_market/losers?apikey=a7f5317786f8fc549cfc159224d11875",
	"method": "GET",
	"headers": {}

};

$.ajax(liveStockLosers).done(function (response) {
	console.log(response);
	sortByKeyAscending(response, "change");
	for (let i = 0; i < response.length && i < 10; i++) {
		// Create elements
		var $newRow = $("<tr></tr>");
		var $head = $("<td></td>");
		var $change = $("<td></td>");
		var $price = $("<td></td>");
		var $symbol = $("<div></div>");
		var $name = $("<div></div>");
		// Fill elements
		$symbol.html(response[i].symbol).addClass("stock-symbol");
		$name.html(shortenName(response[i].name)).addClass("company-name");
		$price.html("$" + toTwoDecimal(response[i].price)).addClass("font-weight-bold");
		$change.html(toTwoDecimal(parseFloat(response[i].change)) + "%").addClass("down");
		// Attach elements
		$head.append($symbol, $name);
		$newRow.append($head, $change, $price);
		$("#losers-tbody").append($newRow);
	}
});
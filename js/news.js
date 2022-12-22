

// All Cryptos
const ALL_CRYPTOS = [
	"btc",
	"eos",
	"eth",
	"bnb",
	"xrp",
	"ltc",
	"iota",
	"qtum",
];

// Update gainers table
const updateGainersTable = function (data) {
	clearGainers();
	for (let i in data) {
		// Create elements
		var $newRow = $("<tr></tr>");
		var $head = $("<td></td>");
		var $change = $("<td></td>");
		var $price = $("<td></td>");
		var $symbol = $("<div></div>");
		var $name = $("<div></div>");
		// Fill elements
		$symbol.html(data[i].symbol).addClass("stock-symbol");
		$name.html(shortenName(data[i].companyName)).addClass("company-name");
		$price.html("$" + toTwoDecimal(data[i].latestPrice)).addClass("font-weight-bold");
		$change.html("+" + toTwoDecimal(parseFloat(data[i].changePercent) * 100) + "%").addClass("up");
		// Attach elements
		$head.append($symbol, $name);
		$newRow.append($head, $change, $price);
		$("#gainers-tbody").append($newRow);
	}
};

// Update losers table
const updateLosersTable = function (data) {
	clearLosers();
	for (let i in data) {
		// Create elements
		var $newRow = $("<tr></tr>");
		var $head = $("<td></td>");
		var $change = $("<td></td>");
		var $price = $("<td></td>");
		var $symbol = $("<div></div>");
		var $name = $("<div></div>");
		// Fill elements
		$symbol.html(data[i].symbol).addClass("stock-symbol");
		$name.html(shortenName(data[i].companyName)).addClass("company-name");
		$price.html("$" + toTwoDecimal(data[i].latestPrice)).addClass("font-weight-bold");
		$change.html(toTwoDecimal(parseFloat(data[i].changePercent) * 100) + "%").addClass("down");
		// Attach elements
		$head.append($symbol, $name);
		$newRow.append($head, $change, $price);
		$("#losers-tbody").append($newRow);
	}
};

// Launch the search update process with animation
const animateSearch = function (data) {
	$("#response-zone").slideUp(2000, function () {
		updateKeyStockData(data);
	})
};

// Update key stock data and make an API call to get news
const updateKeyStockData = function (data) {
	clearSearch();
	$("#key-symbol").html(data.symbol);
	$("#key-name").html(data.companyName);
	$("#key-p").html("$" + toTwoDecimal(data.latestPrice));
	$("#key-op").html(toTwoDecimal(data.open));
	$("#key-cl").html(toTwoDecimal(data.close));
	$("#key-pc").html(toTwoDecimal(data.previousClose));
	$("#key-h").html(toTwoDecimal(data.high));
	$("#key-l").html(toTwoDecimal(data.low));
	$("#key-yh").html(toTwoDecimal(data.week52High));
	$("#key-yl").html(toTwoDecimal(data.week52Low));
	if (data.peRatio != null) {
		$("#key-pe").html(toTwoDecimal(data.peRatio));
	}
	else {
		$("#key-pe").html("N/A");
	}
	if (parseFloat(data.change) > 0) {
		$("#key-cc").removeClass("down");
		$("#key-cc").html("+" + toTwoDecimal(data.change)).addClass("up");
		$("#key-cp").removeClass("down");
		$("#key-cp").html("+" + toTwoDecimal(parseFloat(data.changePercent) * 100) + "%").addClass("up");
	}
	else if (parseFloat(data.change) < 0) {
		$("#key-cc").removeClass("up");
		$("#key-cc").html(toTwoDecimal(data.change)).addClass("down");
		$("#key-cp").removeClass("up");
		$("#key-cp").html(toTwoDecimal(parseFloat(data.changePercent) * 100) + "%").addClass("down");
	}
	else {
		$("#key-cc").removeClass("up").removeClass("down").html("0.00");
		$("#key-cp").removeClass("up").removeClass("down").html("0.00%");
	}
	fetchFromAPI(makeCompanyNewsUrl(data.symbol), fetchOptionsDefault, updateNews, logStatus);
};

// Update news
const updateNews = function (data) {
	var $newsZone = $("#news-zone");
	if (data.length === 0) {
		let $newRow = $("<div></div>").addClass("row");
		let $newCol = $("<div></div>").addClass("col-12");
		let $header = $("<a></a>");
		$header.html("Oops, nothing was found.").addClass("text-left");
		$newCol.append($header);
		$newRow.append($newCol);
		$newsZone.append($newRow);
	}
	else {
		for (let i in data) {
			let $newRow = $("<div></div>").addClass("row");
			let $newCol = $("<div></div>").addClass("col-12").addClass("text-left");
			let $header = $("<a></a>");
			let $time = $("<p></p>").addClass("lead");
			let $summary = $("<p></p>");
			$header.html(data[i].headline).attr("target", "_blank").attr("href", data[i].url);
			$time.html(formatDateTime(data[i].datetime));
			$summary.html(trimSummary(data[i].summary));
			$newCol.append($header, $time, $summary);
			if (i < data.length - 1) {
				$newCol.append($("<div></div>").addClass("news-div"));
			}
			$newRow.append($newCol);
			$newsZone.append($newRow);
		}
	}
	$("#response-zone").slideDown(2000);
};


// Clear search results
const clearSearch = function () {
	$("#news-zone").empty();
};

// Display error message for unknown search string
const displayError = function () {
	$("#error-zone").slideDown().delay(2000).slideUp(1000);
};




// Start the two-step process of calling stock quote and news API
const getSearchResult = function (symbol) {
	fetchFromAPI(makeStockQuoteUrl(symbol), fetchOptionsDefault, animateSearch, displayError);
};

// Wait until the document is ready for jQuery
$(function () {
	// Add event listener to the search button
	$("#search").on("click", function () {
		if ($("#ticker").val().trim()) {
			getSearchResult($("#ticker").val().trim());
		}
	})
});

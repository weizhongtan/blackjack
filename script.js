/*
52 cards
aim is to get as close to 21 as possible
if you beat the dealer you win
if you get 5 cards under 21 you win - not implemented yet
dealer and player are dealt two random cards
player can choose to hit (take another card) or
*/

// GAME SETTINGS
var BET_INCREMENT = 100;
var STARTING_MONEY = 1000;

// init
function init() {
	document.getElementById("hit").disabled = true;
	document.getElementById("stay").disabled = true;
	startBets();
}

function startBets() {
	betamount = BET_INCREMENT;
	cash -= betamount;
	bettingover = false;
	playerbust = false;
	dealerbust = false;
	dealersTurn = false;
	renderBets();
}

function button_play() {
	// disable betting area
	bettingover = true;
	renderBets();

	deck = generateDeck();

	// inital hands
	playerHand = generateHand(deck);
	dealerHand = generateHand(deck);

	// FOR TESTING PURPOSES
	// playerHand = [[10], ["ACE"]]
	// dealerHand = [[10], ["ACE"]]

	// render html
	render()

	// populate deck
	function generateDeck() {
		var deck = []
		// one for each suit
		for (var i = 0; i < 4; i++) {
			// cards 2-10
			for (var j = 2; j <= 10; j++) {
				deck.push(j)
			}
			// cards ace j, q, k
			deck.push("ACE", "J", "Q", "K");
		}
		return deck
	}

	// generate initial 2 hand
	function generateHand() {
		return [randomCard(deck), randomCard(deck)]
	}
}

function render() {
	// render html
	document.getElementById("player").innerHTML = playerHand.toString() + " (sum: " + renderSum(playerHand) + ")";
	document.getElementById("playerbust").innerHTML = (playerbust) ? " -> BUST!" : "";
	document.getElementById("dealer").innerHTML = dealerHand[0].toString();
	document.getElementById("dealerbust").innerHTML = (dealerbust) ? " -> BUST!" : "";

	// disable/enable buttons
	document.getElementById("hit").disabled = playerbust;
	document.getElementById("stay").disabled = playerbust;

	if (dealersTurn) {
		document.getElementById("dealer").innerHTML = dealerHand.toString() + " (sum: " + renderSum(dealerHand) + ")";
		document.getElementById("result").innerHTML = "you " + result;

		// disable/enable buttons
		document.getElementById("hit").disabled = true;
		document.getElementById("stay").disabled = true;
	} else {
		document.getElementById("result").innerHTML = "";
	}

	function renderSum(playerHand) {
		if (calculateSum(playerHand)[0] == calculateSum(playerHand)[1]) {
			return calculateSum(playerHand)[0];
		} else {
			return calculateSum(playerHand)[0] + " or " + calculateSum(playerHand)[1];
		}
	}
}

function renderBets() {
	document.getElementById("cash").innerHTML = cash.toString();

	document.getElementById("bet").innerHTML = betamount.toString();
	document.getElementById("bet").disabled = bettingover;
	document.getElementById("play").disabled = bettingover;
}

// returns random card from deck and removes it from the deck
function randomCard() {
	var randNum = Math.floor(Math.random()*deck.length);
	return deck.splice(randNum, 1)
}

// play buttons
function button_hit() {
	playerHand.push(randomCard());
	playerbust = checkIfBust(playerHand);
	bettingover = true;
	highlight("player");
	render();
}

function button_stay() {
	dealersTurn = true;
	while (bestSum(dealerHand) < 17) {
		dealerHand.push(randomCard());
	}
	dealerbust = checkIfBust(dealerHand);
	result = whoWins();
	highlight("dealer");
	render();

	startBets();
}

function calculateSum(hand) {
	var sum1 = 0;
	var sum2 = 0;
	for (var i = 0; i < hand.length; i++) {
		var card = hand[i][0];
		if (typeof card == "string") {
			if (card == "J" || card == "Q" || card == "K") {
				sum1 += 10;
				sum2 += 10;
			} else {
				sum1 += 1;
				sum2 += 11;
			}
		} else {
			sum1 += card;
			sum2 += card;
		}
	}
	return [sum1, sum2];
}

function bestSum(hand) {
	var sums = calculateSum(hand);
	if (sums[1] > sums[0] && sums[1] <= 21) {
		return sums[1];
	} else {
		return sums[0];
	}
}

function checkIfBust(hand) {
	var amounts = calculateSum(hand);
	return (Math.min(amounts[0], amounts[1]) > 21) ? true : false;
}

function whoWins() {
	if (playerbust) {
		return lose();
	} else if (dealerbust || bestSum(playerHand) > bestSum(dealerHand)) {
		cash += betamount*2;
		betamount = 0;
		highlight("cash");
		return "win"
	} else if (bestSum(playerHand) < bestSum(dealerHand)) {
		return lose();
	} else {
		cash += betamount;
		betamount = 0;
		return "draw"
	}

	function lose() {
		betamount = 0;
		return "lose";
	}
}

// betting
function button_bet() {
	betamount += BET_INCREMENT;
	cash -= BET_INCREMENT;
	renderBets();
	highlight("cash");
}

function highlight(cls) {
	document.getElementById(cls).className = "highlighted";
	setTimeout(function() {
		document.getElementById(cls).className = "";
	}, 500)
}

var deck, playerHand, dealerHand, playerbust = false, dealerbust = false, dealersTurn = false, result, bettingover = false, betamount, cash = STARTING_MONEY;

init();

// console
// check();

// function check() {
// 	console.log("playerhand:", playerHand, "dealer:", dealerHand, "deck size:", deck.length)
// }

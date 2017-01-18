"use strict"

/*
52 cards
aim is to get as close to 21 as possible
if you beat the dealer you win
dealer and player are dealt two random cards
player can choose to hit (take another card) or
*/

/* To do:
if you get 5 cards under 21 you win
*/

// GAME SETTINGS
var BET_INCREMENT = 100;

// Access localStorage from previous game session
if (localStorage.getItem("player_money")) {
	var STARTING_MONEY = localStorage.getItem("player_money");
} else {
	var STARTING_MONEY = 1000;
}

// deck must be global since it changes throughout the game
var _deck, playerHand, dealerHand, playerbust = false, dealerbust = false, dealersTurn = false, result, bettingover = false, betamount, cash = STARTING_MONEY;

// keeps track of how many cards are currently showing to the player
var _cardsShownPlayer;
var _cardsShownDealer;

// target dom by ID
function $id(id) {
	return document.getElementById(id)
}

// init
function init() {
	$id("hit").disabled = true;
	$id("stay").disabled = true;
	startBets();
	_deck = generateDeck();
	generateCardSprites(_deck);
	_cardsShownPlayer = 0;
	_cardsShownDealer = 0;
}

// generates card sprites from sprite gif file
function generateCardSprites(d) {
	var count = 0;
	for (var suit = 0; suit < 4; suit++) {
		for (var val = 0; val < 13; val++) {
			var style = document.createElement("style");
			style.type = "text/css";
			style.innerHTML = ".card_" + d[count] + " { background-position: " + -81*val + "px " + -117.5*suit + "px; }";
			document.getElementsByTagName("head")[0].appendChild(style);
			count++;
		}
	}
}

function startBets() {
	localStorage.setItem("player_money", cash);
	if (cash !== 0) {
		betamount = BET_INCREMENT;
		cash -= betamount;
	} else {
		betamount = 0;
	}
	bettingover = false;
	playerbust = false;
	dealerbust = false;
	dealersTurn = false;
	renderBets();
}

// generate inital full deck of 52 cards
function generateDeck() {
	var deck = []
	var suits = ["h", "d", "c", "s"]
	// one for each suit (hearts, diamonds, clubs, spades)
	for (var i = 0; i < 4; i++) {
		// current suit
		var s = suits[i];
		// cards 2-9
		for (var j = 2; j <= 9; j++) {
			deck.push(s+j)
		}
		// cards 10, j, q, k, a
		deck.push(s+"T", s+"J", s+"Q", s+"K", s+"A");
	}
	return deck
}

function button_play() {
	localStorage.setItem("player_money", cash);
	// disable betting area
	bettingover = true;
	renderBets();

	// enable play area;
	document.getElementsByClassName("play")[0].style.display = "block";

	_deck = generateDeck();

	// inital hands
	playerHand = generateHand(_deck);
	dealerHand = [randomCard(_deck)];

	// render html
	render();

	// generate initial 2 card hand
	function generateHand(deck) {
		return [randomCard(deck), randomCard(deck)]
	}
}

function button_resetCash() {
	cash = 1000;
	localStorage.setItem("player_money", cash);
	init();
}

function render() {
	// render card sprites of given hand
	function showCards(person, hand, cards_shown) {
		if (cards_shown == 0) {
			$id(person).innerHTML = "";
		}
		for (; cards_shown < hand.length; cards_shown++) {
			var div = document.createElement("div");
			div.className = "card card_" + hand[cards_shown];
			$id(person).appendChild(div);
		}
		if (person == "player") {
			_cardsShownPlayer = cards_shown;
		} else if (person == "dealer") {
			_cardsShownDealer = cards_shown;
		}
	}

	showCards("player", playerHand, _cardsShownPlayer);
	$id("playersum").innerHTML = (playerbust) ? "BUST!" : renderSum(playerHand);
	showCards("dealer", dealerHand, _cardsShownDealer);
	$id("dealersum").innerHTML = (dealerbust) ? "BUST!" : renderSum(dealerHand);

	// disable/enable buttons
	$id("hit").disabled = playerbust;
	$id("stay").disabled = playerbust;

	if (dealersTurn) {
		showCards("dealer", dealerHand, _cardsShownDealer);
		if (result) setTimeout(function() {
			$id("result").innerHTML = "You " + result;
			highlight("result");
		}, 1000);

		// disable/enable buttons
		$id("hit").disabled = true;
		$id("stay").disabled = true;
	} else {
		$id("result").innerHTML = "";
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
	$id("cash").innerHTML = cash.toString();
	$id("bet").innerHTML = "<i class='material-icons'>add_circle_outline</i>" + betamount.toString();
	$id("bet").disabled = bettingover;
	$id("play").disabled = bettingover;
	$id("reset").disabled = bettingover;
}

// returns random card from deck and removes it from the deck
function randomCard(deck) {
	var randNum = Math.floor(Math.random()*deck.length);
	return deck.splice(randNum, 1)
}

// play buttons
function button_hit() {
	playerHand.push(randomCard(_deck));
	playerbust = checkIfBust(playerHand);
	bettingover = true;
	render();

	if (playerbust) {
		init()
	} else if (_cardsShownPlayer == 5) {
		button_stay(true)
	}
}

function button_stay(five_card) {
	dealersTurn = true;
	function getDealerNewCard() {
		console.log("getting new card")
		dealerHand.push(randomCard(_deck));
		dealerbust = checkIfBust(dealerHand);
		render();
		if (bestSum(dealerHand) < 17) {
			setTimeout(getDealerNewCard, 1000);
		} else {
			if (five_card == true) {
				result = whoWins(true)
			} else {
				result = whoWins()
			}
			render();
			init();
		}
	}

	getDealerNewCard();
}

// returns an array of the highest and lowest possible sums of a given hand
function calculateSum(hand) {
	var sum1 = 0;
	var sum2 = 0;
	for (var i = 0; i < hand.length; i++) {
		var card = hand[i][0];
		var card_suit = card.charAt(0);
		var card_value = card.charAt(1);
		if (card_value == "T" || card_value == "J" || card_value == "Q" || card_value == "K") {
				sum1 += 10;
				sum2 += 10;
		} else if (card_value == "A") {
				sum1 += 1;
				sum2 += 11;
		} else {
			sum1 += +card_value;
			sum2 += +card_value;
		}
	}
	return [sum1, sum2];
}

// returns the best value of a given hand
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

// five_card indicates that the player has a 5 card hand below 21 which makes them win in nearly all scenarios
function whoWins(five_card) {
	if (playerbust) {
		return lose();
	} else if (dealerbust || bestSum(playerHand) > bestSum(dealerHand) || five_card == true) {
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
	if (cash !== 0) {
		cash -= BET_INCREMENT;
		betamount += BET_INCREMENT;
	}
	renderBets();
	highlight("cash");
}

// highlight dom elements with id given
function highlight(id) {
	$id(id).className = "highlighted";
	setTimeout(function() {
		$id(id).className = "";
	}, 1000)
}

init();

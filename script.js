"use strict"

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
	if (cash !== 0) {
		betamount = BET_INCREMENT;
		cash -= betamount;
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
	// disable betting area
	bettingover = true;
	renderBets();

	// enable play area;
	document.getElementsByClassName("play")[0].style.display = "block";

	_deck = generateDeck();

	// inital hands
	playerHand = generateHand(_deck);
	dealerHand = [randomCard(_deck)];

	// FOR TESTING PURPOSES
	// playerHand = [[10], ["ACE"]]
	// dealerHand = [[10], ["ACE"]]

	// render html
	render()

	// generate initial 2 card hand
	function generateHand(deck) {
		return [randomCard(deck), randomCard(deck)]
	}
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
		$id("result").innerHTML = "you " + result;

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
	$id("bet").innerHTML = betamount.toString();
	$id("bet").disabled = bettingover;
	$id("play").disabled = bettingover;
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
	}
}

function button_stay() {
	dealersTurn = true;
	while (bestSum(dealerHand) < 17) {
		dealerHand.push(randomCard(_deck));
	}
	dealerbust = checkIfBust(dealerHand);
	result = whoWins();
	render();

	init();
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
	if (cash !== 0) {
		cash -= BET_INCREMENT;
		betamount += BET_INCREMENT;
	}
	renderBets();
	highlight("cash");
}

function highlight(cls) {
	$id(cls).className = "highlighted";
	setTimeout(function() {
		$id(cls).className = "";
	}, 500)
}

init();

// console
// check();

// function check() {
// 	console.log("playerhand:", playerHand, "dealer:", dealerHand, "deck size:", deck.length)
// }

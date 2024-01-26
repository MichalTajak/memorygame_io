const socket = io();
// Wczytaj login z query parameter
const urlParams = new URLSearchParams(window.location.search);
const urlAll = urlParams.get("room");
const moves = document.getElementById("moves-count");
const timeValue = document.getElementById("time");
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const gameContainer = document.querySelector(".game-container");
const result = document.getElementById("result");
const controls = document.querySelector(".controls-container");
let cards;
let interval;
let firstCard = false;
let secondCard = false;
let room = "";
let login = "";
let players;

// url
if (urlAll) {
	const roomParts = urlAll.split("?");
	room = roomParts.length > 1 ? roomParts[0] : urlAll;
	const log = roomParts.length > 1 ? roomParts[1] : urlAll;
	const logParts = log.split("=");
	login = logParts.length > 1 ? logParts[1] : roomParts;
	socket.emit("createConnection", { roomName: room });
	console.log("Wartość po znakiem zapytania:", login);
} else {
	console.log("Brak parametru 'room' w URL.");
}

//Items array
const items = [
	{ name: "bee", image: "img/bee.png" },
	{ name: "crocodile", image: "img/crocodile.png" },
	{ name: "macaw", image: "img/macaw.png" },
	{ name: "gorilla", image: "img/gorilla.png" },
	{ name: "tiger", image: "img/tiger.png" },
	{ name: "monkey", image: "img/monkey.png" },
	{ name: "chameleon", image: "img/chameleon.png" },
	{ name: "piranha", image: "img/piranha.png" },
	{ name: "anaconda", image: "img/anaconda.png" },
	{ name: "sloth", image: "img/sloth.png" },
	{ name: "cockatoo", image: "img/cockatoo.png" },
	{ name: "toucan", image: "img/toucan.png" },
];

//Initial Time
let seconds = 0,
	minutes = 0;
//Initial moves and win count
let movesCount = 0,
	winCount = 0;

let cardValues = [];

//For timer
const timeGenerator = () => {
	seconds += 1;
	//minutes logic
	if (seconds >= 60) {
		minutes += 1;
		seconds = 0;
	}
	//format time before displaying
	let secondsValue = seconds < 10 ? `0${seconds}` : seconds;
	let minutesValue = minutes < 10 ? `0${minutes}` : minutes;
	timeValue.innerHTML = `<span>Time:</span>${minutesValue}:${secondsValue}`;
};

//For calculating moves
const movesCounter = () => {
	movesCount += 1;
	moves.innerHTML = `<span>Moves:</span>${movesCount}`;
};

//Pick random objects from the items array
const generateRandom = (size = 4) => {
	//temporary array
	let tempArray = [...items];
	//initializes cardValues array
	//size should be double (4*4 matrix)/2 since pairs of objects would exist
	size = (size * size) / 2;
	//Random object selection
	for (let i = 0; i < size; i++) {
		const randomIndex = Math.floor(Math.random() * tempArray.length);
		cardValues.push(tempArray[randomIndex]);
		//once selected remove the object from temp array
		tempArray.splice(randomIndex, 1);
	}
	return cardValues;
};

const matrixGenerator = (cardValues, size = 4) => {
	gameContainer.innerHTML = "";
	for (let i = 0; i < size * size; i++) {
		/*
        Create Cards
        before => front side (contains question mark)
        after => back side (contains actual image);
        data-card-values is a custom attribute which stores the names of the cards to match later
      */
		gameContainer.innerHTML += `
     <div class="card-container" data-card-value="${cardValues[i].name}" id="${i}">
        <div class="card-before">?</div>
        <div class="card-after">
        <img src="${cardValues[i].image}" class="image"/></div>
     </div>
     `;
	}
	//Grid
	gameContainer.style.gridTemplateColumns = `repeat(${size},auto)`;
	//Cards
	console.log(players);
	cards = document.querySelectorAll(".card-container");
	cards.forEach(card => {
		card.addEventListener("click", () => {
			socket.emit("cardFlipped", { cardId: card.id, roomName: room });
		});
	});
};
//Start game
startButton.addEventListener("click", () => {
	cardValues = initializer();
	socket.emit("startGame", {
		roomName: room,
		cardValues: cardValues,
		move: move,
	});
});

//Stop game
stopButton.addEventListener(
	"click",
	(stopGame = () => {
		socket.emit("stopGame", { roomName: room });
	})
);

//Initialize values and func calls
const initializer = () => {
	result.innerText = "";
	winCount = 0;
	let cardValues = generateRandom();
	console.log(cardValues);
	cardValues = [...cardValues, ...cardValues];
	//simple shuffle
	cardValues.sort(() => Math.random() - 0.5);
	return cardValues;
};

//Komuniation with server
//Start Game
socket.on("gameStarted", data => {
	if (data.success) {
		console.log("Gra rozpoczęta!");
		console.log("Gracze:", data.players);
		players = data.players;
		movesCount = 0;
		seconds = 0;
		minutes = 0;
		//controls amd buttons visibility
		controls.classList.add("hide");
		stopButton.classList.remove("hide");
		startButton.classList.add("hide");
		//Start timer
		interval = setInterval(timeGenerator, 1000);
		//initial moves
		moves.innerHTML = `<span>Moves:</span> ${movesCount}`;
		matrixGenerator(data.cardValues);
	} else {
		console.log("Błąd rozpoczynania gry:", data.error);
	}
});
//Stop start game
socket.on("stopStart", () => {
	alert("Poczekaj na dolaczenie drugiego gracza!");
});
//Flipped card
socket.on("cardFlipped", data => {
	const card = document.getElementById(data.cardId);
	if (!card.classList.contains("matched")) {
		//flip the cliked card
		card.classList.add("flipped");
		//if it is the firstcard (!firstCard since firstCard is initially false)
		if (!firstCard) {
			//so current card will become firstCard
			firstCard = card;
			//current cards value becomes firstCardValue
			firstCardValue = card.getAttribute("data-card-value");
		} else {
			//increment moves since user selected second card
			movesCounter();
			//secondCard and value
			secondCard = card;
			let secondCardValue = card.getAttribute("data-card-value");
			if (firstCardValue == secondCardValue) {
				//if both cards match add matched class so these cards would beignored next time
				firstCard.classList.add("matched");
				secondCard.classList.add("matched");
				//set firstCard to false since next card would be first now
				firstCard = false;
				//winCount increment as user found a correct match
				winCount += 1;
				//check if winCount ==half of cardValues
				if (winCount == Math.floor(cardValues.length / 2)) {
					result.innerHTML = `<h2>You Won</h2>
        <h4>Moves: ${movesCount}</h4>`;
					stopGame();
				}
			} else {
				//if the cards dont match
				//flip the cards back to normal
				let [tempFirst, tempSecond] = [firstCard, secondCard];
				firstCard = false;
				secondCard = false;
				let delay = setTimeout(() => {
					tempFirst.classList.remove("flipped");
					tempSecond.classList.remove("flipped");
				}, 900);
			}
		}
	}
});
//check turn
socket.on("nextTurn", data => {
	move = data.move;
	console.log("Zmiana move: ", move);
	cardsGen;
});
//Stop game
socket.on("gameStopped", () => {
	controls.classList.remove("hide");
	stopButton.classList.add("hide");
	startButton.classList.remove("hide");
	clearInterval(interval);
});

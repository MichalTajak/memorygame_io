const socket = io();
// Wczytaj login z query parameter
const urlParams = new URLSearchParams(window.location.search);
const login = urlParams.get("login");

// Przykład użycia login w skrypcie
console.log("Login użytkownika:", login);

// do servera
async function loadUniqueRoomNames() {
	const roomListDiv = document.getElementById("room-list");

	try {
		// Połączenie z serwerem za pomocą Socket.IO
		const socket = io();

		// Wysyłanie zapytania o unikalne nazwy pokoi
		socket.emit("getUniqueRoomNames");

		// Nasłuchiwanie na zdarzenie "uniqueRoomNames"
		socket.on("uniqueRoomNames", data => {
			if (data.success) {
				const uniqueRoomNames = data.data;
				const listItems = uniqueRoomNames
					.map(name => `<li id=${name}>${name}</li>`)
					.join("");
				roomListDiv.innerHTML = `<ul>${listItems}</ul>`;
			} else {
				console.log("Błąd podczas pobierania unikalnych nazw pokoi");
			}
		});
	} catch (error) {
		console.error("Błąd podczas połączenia z serwerem Socket.IO:", error);
	}
}

// Wywołaj funkcję przy załadowaniu strony
window.addEventListener("load", loadUniqueRoomNames);

document.addEventListener("DOMContentLoaded", function () {
	// Pobierz listę pokoi
	const roomList = document.getElementById("room-list");

	// Dodaj Event Listener dla kliknięcia na element listy
	roomList.addEventListener("click", function (event) {
		// Sprawdź, czy kliknięcie nastąpiło na elemencie li
		if (event.target.tagName === "LI") {
			// Pobierz nazwę pokoju z id
			const roomName = event.target.id;

			// Wywołaj funkcję do obsługi kliknięcia
			handleRoomClick(roomName);
		}
	});

	// Funkcja obsługująca kliknięcie na pokój
	async function handleRoomClick(roomName) {
		// Pobierz hasło do pokoju od użytkownika (możesz użyć biblioteki do obsługi okien dialogowych)
		const password = prompt(`Wprowadź hasło do pokoju "${roomName}":`);
		console.log(password);
		// Teraz masz nazwę pokoju (roomName) i hasło (password), możesz je wykorzystać do dalszej logiki
		socket.emit("connectRoom", {
			name: roomName,
			password: password,
			login: login,
		});
	}
});

function createRoom() {
	const roomName = document.getElementById("room-name").value;
	const roomPassword = document.getElementById("room-password").value;

	if (roomName.trim() === "") {
		alert("Podaj nazwę pokoju");
		return;
	}
	socket.emit("createRoom", { roomName, roomPassword, login });
	console.log(
		"Tworzenie pokoju:",
		roomName,
		"Hasło:",
		roomPassword,
		"USER:",
		login
	);
}

//od servera
socket.on("roomCreated", data => {
	if (data.success) {
		window.location.href = `/game.html?room=${data.room}?login=${login}`;
	} else {
		console.log("Błąd logowania");
	}
});
socket.on("connectRoomRes", data => {
	if (data.success) {
		window.location.href = `/game.html?room=${data.room}?login=${login}`;
	} else {
		console.log("Błąd logowania");
		alert(`Złe hasło do pokoju "${data.room}"`);
	}
});

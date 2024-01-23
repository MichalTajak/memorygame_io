const socket = io();
// Wczytaj login z query parameter
const urlParams = new URLSearchParams(window.location.search);
const login = urlParams.get("login");

// Przykład użycia login w skrypcie
console.log("Login użytkownika:", login);
// do servera
// Funkcja createRoom przyjmuje nazwę i hasło pokoju
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

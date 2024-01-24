const socket = io();

//do servera
//sprawdzenie logowania
async function attemptLogin() {
	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;

	// Przykład wysłania wiadomości do serwera za pomocą socket.io
	// socket.emit("messageFromClient", { username, password });

	try {
		const response = await fetch("/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ username, password }),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}

		const data = await response.json();

		if (data.success) {
			console.log("Uwierzytelnianie udane");
			// Dodaj kod obsługi, który ma być wykonywany po poprawnym uwierzytelnianiu
		} else {
			console.error("Błąd uwierzytelniania:", data.message);
			// Dodaj kod obsługi błędów uwierzytelniania
		}
	} catch (error) {
		console.error("Błąd sieci:", error);
		// Dodaj kod obsługi błędów sieci
	}
}

//tworzenie konta
function createUser() {
	const username = document.getElementById("username").value;
	const password = document.getElementById("password").value;
	const re_password = document.getElementById("re_password").value;
	if (password == re_password) {
		socket.emit("createUser", { username, password });
	} else {
		alert("Powtórzone hasło nie jest takie samo");
	}
}

//od servera
//logowanie
socket.on("loginSuccess", data => {
	if (data.success) {
		// Przekieruj użytkownika na stronę game.html
		window.location.href = "/game.html";
	} else {
		// Obsługa przypadku błędnego logowania (jeśli to potrzebne)
		console.log("Błąd logowania");
	}
});
socket.on("loginFailure", data => {
	if (!data.success) {
		// Obsługa przypadku błędnego logowania (jeśli to potrzebne)
		alert("Błędny login lub hasło. Spróbuj ponownie.");
		console.log("Błąd logowania");
	}
});
//rejestracja
socket.on("registerSuccess", data => {
	window.location.href = "/login.html";
	document.getElementById("username").value = data.login;
});
socket.on("registerFailure", data => {
	if (!data.success) {
		alert("Podany login znajduje się juz w bazie");
		console.log("Błąd logowania");
	}
});

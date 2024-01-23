// server.js
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();
const passport = require("passport");
const session = require("express-session");
const server = http.createServer(app);
const io = socketIo(server);
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

app.use(bodyParser.json());
app.use(
	session({ secret: "your-secret-key", resave: true, saveUninitialized: true })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

// Konfiguracja połączenia do bazy danych
const pgp = require("pg-promise")();
const db = pgp({
	user: "postgres",
	host: "localhost",
	database: "MemoryGame",
	password: "Baza1234",
	port: 5432,
});

const usersConnected = {};

//LOGOWANIE I REJESTRACJA

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
	try {
		const user = await db.oneOrNone("SELECT * FROM users WHERE id = $1", [id]);
		done(null, user);
	} catch (error) {
		done(error, null);
	}
});

// Definicja strategii uwierzytelniania
passport.use(
	new LocalStrategy(async (username, password, done) => {
		try {
			// Pobierz użytkownika z bazy danych na podstawie nazwy użytkownika
			const user = await db.oneOrNone(
				"SELECT * FROM users WHERE login = $1 AND password = $2",
				[username, password]
			);

			if (!user) {
				// Jeśli użytkownik nie istnieje, zwróć błąd uwierzytelniania
				return done(null, false, { message: "Incorrect username." });
			}

			// Jeśli użytkownik i hasło są poprawne, zwróć obiekt użytkownika
			return done(null, user);
		} catch (error) {
			// W przypadku błędu zwróć błąd uwierzytelniania
			console.error("Błąd podczas uwierzytelniania:", error);
			return done(error);
		}
	})
);
// Middleware sprawdzający, czy użytkownik jest zalogowany
app.use(express.urlencoded({ extended: true }));
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login.html"); // Przekieruj na stronę logowania, jeśli użytkownik nie jest zalogowany
}
app.get("/game.html", ensureAuthenticated, (req, res) => {
	const fullPathToFrontend = path.join(__dirname, "../frontend");
	res.sendFile("game.html", { root: fullPathToFrontend + "/" });
});

app.post("/login", async (req, res, next) => {
	console.log("Żądanie POST na ścieżce /login");
	const { username, password } = req.body;
	console.log(req.body);
	try {
		const user = await db.oneOrNone(
			"SELECT * FROM users WHERE login = $1 AND password = $2",
			[username, password]
		);

		if (!user) {
			console.error("Błąd podczas uwierzytelniania:", error);
			return res.redirect("/login.html");
		}

		// Jeśli użytkownik i hasło są poprawne, zaloguj go ręcznie
		req.logIn(user, err => {
			if (err) {
				console.error("Błąd podczas logowania:", err);
				return res.redirect("/login.html");
			}
			console.log("Ręczne uwierzytelnianie zakończone pomyślnie");
			const redirectUrl = `/rooms.html?login=${encodeURIComponent(username)}`;
			ensureAuthenticated(req, res, () => {
				res.redirect(redirectUrl);
			});
		});
	} catch (error) {
		console.error("Błąd podczas uwierzytelniania:", error);
		return res.redirect("/login.html");
	}
});

io.on("connection", async socket => {
	console.log("Nowe połączenie socket.io:", socket.id);

	// Obsługa wiadomości od klienta
	socket.on("messageFromClient", async message => {
		console.log("Wiadomość od klienta:", message);

		try {
			const { username, password } = message;

			// Pobranie hasła użytkownika z bazy danych
			const user = await db.oneOrNone(
				"SELECT id FROM users WHERE login = $1 AND password = $2;",
				[username, password]
			);

			if (user) {
				// Hasło jest poprawne
				console.log("Poprawne dane logowania. Wykonaj odpowiednie działania.");

				socket.emit("loginSuccess", { success: true });
			} else {
				// Niepoprawne dane logowania
				console.log("Błędne dane logowania.");
				socket.emit("loginFailure", { success: false });
			}
		} catch (error) {
			console.error(
				"Błąd podczas sprawdzania loginu i hasła w bazie danych:",
				error
			);
			socket.emit("loginFailure", {
				success: false,
				error: "Internal Server Error",
			});
		}
	});

	socket.on("createUser", data => {
		const { username, password } = data;

		db.none("INSERT INTO users(login, password, admin) VALUES($1, $2, false)", [
			username,
			password,
		])
			.then(() => {
				console.log("Użytkownik został utworzony.");
				socket.emit("registerSuccess", { login: username });
			})
			.catch(error => {
				console.error("Błąd podczas tworzenia użytkownika:", error);
				socket.emit("registerFailure", { login: username });
			});

		console.log("Nowy użytkownik:", username);
	});

	//ROOMS

	socket.on("createRoom", async data => {
		const { roomName, roomPassword, login } = data;
		try {
			// Tworzenie wpisu w bazie danych
			const result = await db.none(
				"INSERT INTO rooms (name, password, player) VALUES ($1, $2, $3)",
				[roomName, roomPassword, login]
			);

			console.log("Pokój utworzony:", result);

			// Możesz emitować zdarzenie potwierdzające utworzenie pokoju
			socket.emit("roomCreated", { success: true, room: roomName });
		} catch (error) {
			console.error("Błąd podczas tworzenia pokoju:", error);

			// Możesz emitować zdarzenie informujące o błędzie
			socket.emit("roomCreationError", {
				success: false,
				error: "Internal Server Error",
			});
		}
	});

	//GAME
	socket.on("createConnection", data => {
		const { login } = data;
		usersConnected[socket.id] = login;
	});
});

//PODPIECIA I WLACZANIE SERVERA

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// Define a route for the homepage
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "../frontend", "login.html"));
});

const port = 3000;
server.listen(port, () => {
	console.log(`Server started on port ${port}`);
});

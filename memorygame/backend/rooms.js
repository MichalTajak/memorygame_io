module.exports = class Rooms {
	constructor(id, name, password) {
		this.lobbyId = id;
		this.lobbyName = name;
		this.lobbyPassword = password;
	}
	players = [];
};

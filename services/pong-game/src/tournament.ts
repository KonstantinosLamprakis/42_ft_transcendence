import { WebSocket } from "ws";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";


import { Game, SQLITE_DB_URL } from "./game.js";
import { games, socketToGame, socketToTournament } from "./server.js";

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class Tournament {

	public Id : string | null = null;
	public connectionPlayer1: WebSocket | null = null;
    public player1UserId: number | null = null;
	public usernamePlayer1 : string = "";
	public connectionPlayer2: WebSocket | null = null;
    public player2UserId: number | null = null;
	public usernamePlayer2 : string = "";
	public connectionPlayer3: WebSocket | null = null;
    public player3UserId: number | null = null;
	public usernamePlayer3 : string = "";
	public connectionPlayer4: WebSocket | null = null;
    public player4UserId: number | null = null;
	public usernamePlayer4 : string = "";
	public userCount = 0;
	public started = false;
	public secondRound = false;

	private match1 : Game | null = null;
	private match2 : Game | null = null;
	private matchWinners : Game | null = null;
	private matchLosers : Game | null = null;

	public score = new Map<number, number>;

	public isOver() : boolean{
		if (!this.matchWinners || !this.matchLosers)
			return false;
		else if (this.matchWinners.isGameOver && this.matchLosers.isGameOver)
			return true
		return false;
	}

	public	async addPlayer(Player : WebSocket, PlayerID : number){
		if (!this.connectionPlayer1){
			this.connectionPlayer1 = Player;
			this.player1UserId = PlayerID;
			let res = await axios.get(`${SQLITE_DB_URL}/get-user-and-nickname-by-id/${this.player1UserId}`, {});
			this.usernamePlayer1 = res.data.nickname;
		}
		else if (!this.connectionPlayer2){
			this.connectionPlayer2 = Player;
			this.player2UserId = PlayerID;
			let res = await axios.get(`${SQLITE_DB_URL}/get-user-and-nickname-by-id/${this.player2UserId}`, {});
			this.usernamePlayer2 = res.data.nickname;
		}
		else if (!this.connectionPlayer3){
			this.connectionPlayer3 = Player;
			this.player3UserId = PlayerID;
			let res = await axios.get(`${SQLITE_DB_URL}/get-user-and-nickname-by-id/${this.player3UserId}`, {});
			this.usernamePlayer3 = res.data.nickname;
		}
		else if (!this.connectionPlayer4){
			this.connectionPlayer4 = Player;
			this.player4UserId = PlayerID;
			let res = await axios.get(`${SQLITE_DB_URL}/get-user-and-nickname-by-id/${this.player4UserId}`, {});
			this.usernamePlayer4 = res.data.nickname;
		}
		this.score.set(PlayerID, 0);
		socketToTournament.set(Player, this);
		this.userCount++;
	}

	public	removePlayer(Player : WebSocket, PlayerID : number){
		if (this.player1UserId == PlayerID){
			this.connectionPlayer1 = null;
			this.player1UserId = null;
			this.usernamePlayer1 = null;
		}
		else if (this.player2UserId == PlayerID){
			this.connectionPlayer2 = null;
			this.player2UserId = null;
			this.usernamePlayer2 = null;
		}
		else if (this.player3UserId == PlayerID){
			this.connectionPlayer3 = null;
			this.player3UserId = null;
			this.usernamePlayer3 = null;
		}
		else if (this.player4UserId == PlayerID){
			this.connectionPlayer4 = null;
			this.player4UserId = null;
			this.usernamePlayer4 = null;
		}
		else 
			return;
		
		this.userCount--;
		this.score.delete(PlayerID);
		// socketToTournament.delete(Player);
	}

	public getPos(pos : number) : string{
		if (!this.isOver)
			return "";
		else{
			if (this.score[this.player1UserId] == pos)
				return this.usernamePlayer1;
			else if (this.score[this.player2UserId] == pos)
				return this.usernamePlayer2;
			else if (this.score[this.player3UserId] == pos)
				return this.usernamePlayer3;
			else
				return this.usernamePlayer4;
		}
	}

	public async start(){

		this.match1 = new Game();
		this.match2 = new Game();
		this.match1.tournament = this;
		this.match2.tournament = this;

		this.match1.gameId = uuidv4();
		this.match2.gameId = uuidv4();

		games.set(this.match1.gameId, this.match1);
		games.set(this.match2.gameId, this.match2);

		this.match1.connectionPlayer1 = this.connectionPlayer1;
		this.match1.connectionPlayer2 = this.connectionPlayer2;
		this.match1.player1UserId = this.player1UserId;
		this.match1.player2UserId = this.player2UserId;
		socketToGame.set(this.connectionPlayer1, this.match1.gameId);
		socketToGame.set(this.connectionPlayer2, this.match1.gameId);

		this.match2.connectionPlayer1 = this.connectionPlayer3;
		this.match2.connectionPlayer2 = this.connectionPlayer4;
		this.match2.player1UserId = this.player3UserId;
		this.match2.player2UserId = this.player4UserId;
		socketToGame.set(this.connectionPlayer3, this.match2.gameId);
		socketToGame.set(this.connectionPlayer4, this.match2.gameId);

		this.started = true;
		this.match1.Start();
		this.match2.Start();
	}

	public async continue(winnerSock : WebSocket, winnerId : number, loserSock : WebSocket, loserId : number){

		await wait(3000);

		
		if (!this.matchWinners){
			
			this.matchWinners = new Game();
			this.matchLosers = new Game();
			this.matchWinners.tournament = this;
			this.matchLosers.tournament = this;
			this.matchWinners.gameId = uuidv4();
			this.matchLosers.gameId = uuidv4();
			
			games.set(this.matchWinners.gameId, this.matchWinners);
			games.set(this.matchLosers.gameId, this.matchLosers);
			
			this.matchWinners.connectionPlayer1 = winnerSock;
			this.matchWinners.player1UserId = winnerId;
			
			this.matchLosers.connectionPlayer1 = loserSock;
			this.matchLosers.player1UserId = loserId;
			
			socketToGame.set(winnerSock, this.matchWinners.gameId);
			socketToGame.set(loserSock, this.matchLosers.gameId);
		}
		else{
			
			this.matchWinners.connectionPlayer2 = winnerSock;
			this.matchWinners.player2UserId = winnerId;
			
			this.matchLosers.connectionPlayer2 = loserSock;
			this.matchLosers.player2UserId = loserId;
			
			socketToGame.set(winnerSock, this.matchWinners.gameId);
			socketToGame.set(loserSock, this.matchLosers.gameId);
			
			this.secondRound = true;
			this.matchWinners.Start();
			this.matchLosers.Start();
		}
	}


}


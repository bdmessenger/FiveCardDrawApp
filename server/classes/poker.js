const Hand = require('pokersolver').Hand;

class Poker {
    constructor(id, hostPlayer, deck, minBet = 100){
        this.id = id;
        this.host = hostPlayer.id;
        this.players = [hostPlayer];
        this.isGameplay = false;
        this.process = 'IDLE';
        this.deck = deck;
        this.currentTurn = -1;
        this.potAmount = 0;
        this.minBet = minBet;
        this.raiseAmount = minBet;
        this.dealer = -1;
        this.messages = [];
    }

    addPlayer(player) {
        if(this.players.length < 2) {
            return this.players.push(player);
        }
        return null;
    }

    removePlayer(player) {
        const playerIndex = this.players.findIndex(ele => ele.id === player.id);
        if(playerIndex > -1) {
            return this.players.splice(playerIndex, 1);
        }
        return null;
    }

    startGame() {
        this.isGameplay = true;
        this.newRound();
    }

    newRound() {
        if(this.players.length === 2) {
            if(this.deck.length() < 20) {
                this.deck.createDeck();
            }

            this.clearMessages();
            this.addMessage('Round Begin.');
            this.process = 'WAITING_ON_BETS';
            this.players[0].newRoundStats();
            this.players[1].newRoundStats();
            const dealer = this.selectNextDealer();
            this.currentTurn = dealer;
            this.raiseAmount = this.minBet;
            this.players[dealer].setBetAmount((this.minBet / 2), false);
            this.players[dealer].betAmount = (this.minBet / 2);
            const bigBlind = dealer === 0 ? 1 : 0;
            this.players[bigBlind].setBetAmount(this.minBet, false);
            this.potAmount = 0;
            return true;
        }
        return false;
    }

    clearMessages() {
        this.messages = [];
    }

    addMessage(message) {
        if(message) this.messages.push(message);
    }

    backToLobby() {
        if(this.players.length === 1) {
            this.players[0].resetPlayerStats(true);
            this.host = this.players[0].id;
            this.isGameplay = false;
            this.deck.createDeck();
            this.currentTurn = -1;
            this.potAmount = 0;
            this.process = 'IDLE';
            this.dealer = -1;
            this.raiseAmount = 0;
            this.messages = [];
            return true;
        }
        return false;
    }

    selectNextDealer() {
        if(this.dealer === -1) {
            this.dealer = 0;
            this.players[0].toggleDealer();
        } else {
            this.switchDealer();
        }

        this.addMessage(`${this.players[this.dealer].name}'s Turn.`);
        return this.dealer;
    }

    switchTurn() {
        if(this.currentTurn === -1) {
            this.currentTurn = 0;
        } else {
            this.currentTurn = this.currentTurn === 0 ? 1 : 0;
        }
        this.addMessage(`${this.players[this.currentTurn].name}'s Turn.`);
        return this.currentTurn;
    }

    switchDealer() {
        if(this.players.length === 2 && this.players[this.dealer]) {
            this.players[this.dealer].toggleDealer();
            this.dealer = this.dealer === 0 ? 1 : 0;
            this.players[this.dealer].toggleDealer();
        }
    }

    playerBet(pIndex, amount) {
        if(this.players.length === 2 && pIndex < 2 && pIndex > -1) {
            let playerBetAmount = 0;
            
            if(this.players[pIndex].buyInAmount === amount) {
                playerBetAmount = this.players[pIndex].allIn();
                this.addMessage(`${this.players[this.currentTurn].name} is all in.`);
            }
            else if(this.raiseAmount === amount) {
                playerBetAmount = this.players[pIndex].call(this.raiseAmount);
                this.addMessage(`${this.players[this.currentTurn].name} calls.`);
            }
            else {
                playerBetAmount = this.players[pIndex].setBetAmount(amount);
                this.addMessage(`${this.players[this.currentTurn].name} bets ${amount}.`);
            }

            if(playerBetAmount > this.raiseAmount) {
                this.raiseAmount = playerBetAmount;
                const opponent = this.players[pIndex === 0 ? 1 : 0];
                if(opponent.action !== 'ALLIN') opponent.idle();
            }
            return true;
        }
        return false;
    }

    playerCheck(pIndex) {
        if(this.players.length === 2 && pIndex < 2 && pIndex > -1) {
            this.players[pIndex].check();
            this.addMessage(`${this.players[pIndex].name} checks.`);
            return true;
        }
        return false;
    }

    playerFold(pIndex) {
        if(this.players.length === 2 && pIndex < 2 && pIndex > -1) {
            this.players[pIndex].fold();
            this.addMessage(`${this.players[pIndex].name} folds.`);
            return true;
        }
        return false;
    }

    playerDiscards(pIndex, handIndexes) {
        if(this.players.length === 2 && pIndex < 2 && pIndex > -1) {
            this.players[pIndex].discards(handIndexes);
            this.addMessage(`${this.players[pIndex].name} discards ${handIndexes.length} card(s).`);
            return true;
        }
        return false;
    }

    emptyBetsToPot() {
        if(this.players.length === 2) {
            this.potAmount += (this.players[0].emptyBetAmount() + this.players[1].emptyBetAmount());
            return true;
        }
        return false;
    }

    drawCardsForPlayers() {
        if(this.players.length === 2) {
            for(let i = 0; i <= 4; i++) {
                for(let p = 0; p <= 1; p++) {
                    if(this.players[p].hand.length < 5) {
                        this.players[p].hand.push(this.deck.draw());
                    }
                }
            }
            return true;
        }
        return false;
    }

    determineWinner() {
        const activePlayers = this.players.filter(player => player.action !== 'FOLD');
        if(activePlayers.length === 2) {
            const player1Hand = Hand.solve(activePlayers[0].hand.map(card => card.data));
            const player2Hand = Hand.solve(activePlayers[1].hand.map(card => card.data));

            const winner = Hand.winners([player1Hand, player2Hand]);

            if(winner.length === 2) {
                const splitPotAmount = Math.round(this.potAmount / 2);
                for(let i = 0; i < 2; i++) {
                    activePlayers[i].isWinner = true;
                    activePlayers[i].buyInAmount += splitPotAmount;
                }
                this.addMessage('Both players are tied.');
                return 2;
            } else {
                if(player1Hand.cardPool === winner[0].cardPool) {
                    activePlayers[0].isWinner = true;
                    activePlayers[0].buyInAmount += this.potAmount;
                    this.addMessage(`${activePlayers[0].name} wins with ${player1Hand.name}.`);
                    return 0;
                }

                activePlayers[1].isWinner = true;
                activePlayers[1].buyInAmount += this.potAmount;
                this.addMessage(`${activePlayers[1].name} wins with ${player2Hand.name}.`);
                return 1;
            }
        } else if (activePlayers.length === 1) {
            activePlayers[0].isWinner = true;
            activePlayers[0].buyInAmount += this.potAmount;
            this.addMessage(`${activePlayers[0].name} wins.`);
            return this.players.findIndex(player => player.isWinner);
        }

        return -1;
    }

    resetPlayersActions() {
        if(this.players.length === 2) {
            if(this.players[0].action !== 'ALLIN') this.players[0].idle();
            if(this.players[1].action !== 'ALLIN') this.players[1].idle();
            return true;
        }
        return false;
    }

    isConfirmBets() {
        if(this.players.length === 2) {
            const allInPlayers = this.players.filter(player => player.action === 'ALLIN');

            if(allInPlayers.length === 2 || (allInPlayers.length === 1 && this.players.find(player => player.action !== 'ALLIN' && player.action !== 'IDLE'))) {
                return true;
            }
            
            if(this.players.filter(player => player.action !== 'IDLE').length === 2) return true;
        }
        return false;
    }

    processing(callback, lastProcess = this.process) {
        if(this.players.length === 2) {
            switch(this.process) {
                case 'WAITING_ON_FINAL_BETS':
                case 'WAITING_ON_BETS':
                    if(this.isConfirmBets()) {
                        this.raiseAmount = 0;
                        this.emptyBetsToPot();
                        if(this.process === 'WAITING_ON_BETS') {
                            this.process = 'DRAWING_CARDS';
                            callback();
                            return this.processing(callback, 'WAITING_ON_BETS');
                        } else {
                            this.process = 'SHOWDOWN';
                            callback();
                            return this.processing(callback);
                        }
                    }
                    this.switchTurn();
                    callback();
                    return this.process;
                case 'DRAWING_CARDS':
                    this.drawCardsForPlayers();
                    this.switchTurn();
                    this.resetPlayersActions();
                    if(lastProcess === 'WAITING_ON_BETS') {
                        this.process = 'WAITING_ON_DISCARDS';
                    } else if (lastProcess === 'WAITING_ON_DISCARDS') {
                        this.process = 'WAITING_ON_FINAL_BETS';
                    }

                    if(lastProcess === 'WAITING_ON_DISCARDS' && this.players.some(player => player.action === 'ALLIN')) {
                        this.process = 'SHOWDOWN';
                        callback();
                        return this.processing(callback);
                    }

                    callback();
                    return this.process;
                case 'WAITING_ON_DISCARDS':
                    if(this.players[0].isHandDiscarded && this.players[1].isHandDiscarded) {
                        this.process = 'DRAWING_CARDS';
                        callback();
                        return this.processing(callback, 'WAITING_ON_DISCARDS');
                    }
                    this.switchTurn();
                    callback();
                    return this.process;
                case 'SHOWDOWN':
                    this.determineWinner();
                    callback(false);
                    setTimeout(() => {
                        this.newRound();
                        callback();
                    }, 10000);
                default:
                    return new Error('Invalid Game Process...');
            }
        }
    }
}

module.exports = Poker;
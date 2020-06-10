class Player {
    constructor(id, name, gameId, isHost) {
        this.id = id;
        this.gameId = gameId;
        this.name = name;
        this.isHost = isHost;
        this.buyInAmount = 50000;
        this.action = 'IDLE';
        this.hand = [];
        this.isWinner = false;
        this.isDealer = false;
        this.isHandDiscarded = false;
        this.betAmount = 0;
    }

    resetPlayerStats(isHost = false) {
        this.isHost = isHost;
        this.replenishBuyInAmount();
        this.turn = false;
        this.newRoundStats();
        this.isDealer = false;
    }

    replenishBuyInAmount() {
        this.buyInAmount = 50000;
    }

    newRoundStats() {
        if(this.buyInAmount === 0) this.replenishBuyInAmount();
        this.action = 'IDLE';
        this.hand = [];
        this.isWinner = false;
        this.betAmount = 0;
        this.isHandDiscarded = false;
    }

    setBetAmount(amount, action = true) {
        if(action) this.action = 'BET'
        this.buyInAmount -= amount;
        this.betAmount += amount;
        return this.betAmount;
    }

    call(raiseAmount) {
        this.action = 'CALL';
        this.setBetAmount(raiseAmount - this.betAmount, false);
        return this.betAmount;
    }

    allIn() {
        this.action = 'ALLIN';
        this.setBetAmount(this.buyInAmount, false);
        return this.betAmount;
    }

    check() {
        this.action = 'CHECK';
    }

    fold() {
        this.action = 'FOLD';
    }

    idle() {
        this.action = 'IDLE';
    }

    toggleDealer() {
        this.isDealer = !this.isDealer;
    }

    emptyBetAmount() {
        const prevBet = this.betAmount;
        this.betAmount = 0;
        return prevBet;
    }

    discards(indexes) {
        this.isHandDiscarded = true;
        for(let i = 0; i < indexes.length; i++) {
            this.hand[indexes[i]] = null;
        }
        this.hand = this.hand.filter(card => card);
        return this.hand;
    }
}

module.exports = Player;
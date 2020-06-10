class Deck {
    constructor() {
        this.cards = [];
        this.createDeck();
    }

    createDeck() {
        const cards = [];
        const values = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];
        const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
        for(let suit of suits) {
            for(let value of values) {
                cards.push({
                    value,
                    suit,
                    data: `${value === '10' ? 'T' : value[0]}${suit[0]}`
                })
            }
        }
        this.cards = cards;
        this.shuffleDeck();
    }

    shuffleDeck() {
        const deck = this.cards;
        let randomCard;
        let temp;
        for(let index = deck.length - 1; index > -1; index -= 1) {
            randomCard = Math.floor(Math.random() * deck.length);
            temp = deck[index];
            deck[index] = deck[randomCard];
            deck[randomCard] = temp;
        }
    }

    draw() {
        if(this.cards) {
            return this.cards.pop();
        }
    }

    length() {
        return this.cards.length;
    }
}

module.exports = Deck;
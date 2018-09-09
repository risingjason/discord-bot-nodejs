module.exports = class Deck {
  constructor() {
    this.deck = [];
    this.dealtCards = [];

    const suits = ['Spades', 'Hearts', 'Clubs', 'Diamonds'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    for (const suit of suits) {
      for (const value of values) {
        this.deck.push({suit: suit, value: value});
      }
    }

    // new deck objects should be shuffled
    this.shuffle();
  }
  shuffle() {
    const {deck} = this;
    let temp = [];
    let randIdx;
    let size = deck.length;

    // Fisher-Yates shuffle
    // pick random element from old array and put into new array
    while (size !== 0) {
      randIdx = Math.floor(Math.random() * size--);
      temp.push(deck[randIdx]);
      deck.splice(randIdx, 1);
    }
    this.deck = temp;
    return this;
  }
  deal() {
    const card = this.deck.pop();
    this.dealtCards.push(card);
    return card;
  }
  renew() {
    this.deck = this.deck.concat(this.dealtCards);
    this.shuffle();
  }
};

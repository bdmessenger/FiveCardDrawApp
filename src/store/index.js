import React, {createContext, useReducer} from 'react';

const initialState = {
    player: null,
    game: null
};
const store = createContext(initialState);
const { Provider } = store;

const UPDATE_STATE = 'UPDATE_STATE';

function reducer(state, action) {
    switch(action.type) {
        case UPDATE_STATE:
            const { player, game, hideOpponentCards} = action.state;
            if(game && hideOpponentCards) {
                const opponent = game.players.find(p => p.id !== player.id);
                if(opponent) {
                    opponent.hand = opponent.hand.map(card => ({value: null, suit: null, data: null}));
                }
            }
            return {
                player,
                game
            };
            
        default:
            throw new Error();
    }
}

const StateProvider = ({socket, children}) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    return <Provider value={{socket, state, dispatch}}>{children}</Provider>
};

export { store };
export default StateProvider;
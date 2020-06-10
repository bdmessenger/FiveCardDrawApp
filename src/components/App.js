import React, {useContext, useEffect} from 'react';
import { store } from '../store';

import Game from './game';
import Modal from './utils/Modal';
import CreateDisplayName from './CreateDisplayName';
import LobbyModal from './LobbyModal';

function App() {
    const {socket, state, dispatch} = useContext(store);
    const {player, game} = state;

    useEffect(() => {
        socket.on('DISPATCH_SERVER_STATE', ({player, game, hideOpponentCards = true}) => {
            dispatch({
                type: 'UPDATE_STATE',
                state: {
                    player,
                    game,
                    hideOpponentCards
                }
            });
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNameConfirm = (name) => {
        if(name !== '') {
            socket.emit('PLAYER_JOINED_IN', name);
        }
    }

    return (
        <div className="container  mt-2 mx-auto xl:w-2/6  md:border-red-400 md:w-3/4 lg:border-blue-400 lg:w-3/4">
          <svg width="100%" viewBox="0 0 1200 1650">
            {
                (!game || !game.isGameplay) &&
                <Modal
                    content={
                        !player ?
                        <CreateDisplayName
                        handleNameConfirm={handleNameConfirm}
                        />
                        : 
                        <LobbyModal player={player} game={game} socket={socket} />
                    }
                />
            }

            {
                game && game.isGameplay &&
                <Game player={player} game={game} socket={socket} />
            }
          </svg>
        </div>
    );
}

export default App;
import React, {useState} from 'react';

import numeral from 'numeral';

import Player from './Player';
import Button from '../utils/Button';
import Modal from '../utils/Modal';
import BetModal from './BetModal';

function Game(props) {

    const {player, game, socket} = props;

    const [betAmount, setBetAmount] = useState(game.raiseAmount);
    const [isBetModalOpen, setBetModal] = useState(false);
    const [isExitMenuOpen, setExitMenu] = useState(false);
    const [discardCards, setDiscardCards] = useState({
        0: false,
        1: false,
        2: false,
        3: false,
        4: false 
    });

    const opponent = game.players.find(ele => ele.id !== player.id);
    const yourTurn = game.players[game.currentTurn].id === player.id;
    const inGameControlsStatus = ((game.process === 'WAITING_ON_BETS' || game.process === 'WAITING_ON_DISCARDS' || game.process === 'WAITING_ON_FINAL_BETS') && player.action === 'IDLE');

    const handleBetAmount = e => {
        const value = e.target.value === '' ? e.target.value : parseInt(e.target.value);
        setBetAmount(value);
    }

    const handleModalExit = () => {
        if(!isExitMenuOpen) {
            setBetModal(false);
        }
        else setExitMenu(false);
    }

    const handleBetConfirm = (setError) => {
        const playerNewBetAmount = betAmount + player.betAmount;
        if(typeof betAmount === 'number' && betAmount > 0 && betAmount <= player.buyInAmount && playerNewBetAmount >= game.raiseAmount && playerNewBetAmount <= (opponent.buyInAmount + opponent.betAmount)) {
            socket.emit('PLAYER_BET', {gameId: game.id, betAmount});
            setBetModal(false);
        } else {
            setError('Invalid Bet!');
        }
    }

    const handleDiscardConfirm = () => {
        if(game && game.process === 'WAITING_ON_DISCARDS') {
            const handIndexes = Object.keys(discardCards).filter(key => discardCards[key] !== false);
            socket.emit('PLAYER_DISCARDS', {gameId: game.id, handIndexes});
            setDiscardCards({
                0: false,
                1: false,
                2: false,
                3: false,
                4: false 
            });
        }
    }

    return(
        <g id="game">
            <g id="messageBoard">
                <line x1="30" x2="1200" y1="655" y2="655" stroke="white" strokeWidth={4}/>
                <line x1="505" x2="740" y1="720" y2="720" stroke="rgba(255,255,255,0.6)" strokeWidth="3"/>
                <text x="620" y="700" fontSize="40" fill="rgba(255,255,255,0.9)" dominantBaseline="middle" textAnchor="middle">Pot: {game.potAmount <= 99999 ? numeral(game.potAmount).format('$0,0') : numeral(game.potAmount).format('$0.00a')}</text>
                <text x={620} y={770} fontSize={50} fill="rgba(255,255,255,0.9)" dominantBaseline="middle" textAnchor="middle">{game.messages && game.messages[game.messages.length - 2] && `${game.messages[game.messages.length - 2]}..`}</text>
                <text x={620} y={860} fontSize={73} fill="white" dominantBaseline="middle" textAnchor="middle">{game.messages && game.messages[game.messages.length - 1]}</text>
                <line x1="30" x2="1200" y1="920" y2="920" stroke="white" strokeWidth={4}/>
            </g>

            <g id="exitButton">
                <path
                    className="svg-action-button"
                    transform="translate(1065,10) scale(0.15,0.15)"
                    fill="white" 
                    d="M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 
                    10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 
                    436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 
                    0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"
                />
                <rect className="svg-action-button" x="1045" y="5" width="110" height="85" fill="transparent" onClick={() => setExitMenu(true)} />
            </g>

            <Player
                x={300}
                y={130} 
                name={opponent.name}
                buyInAmount={opponent.buyInAmount}
                isDealer={opponent.isDealer}
                betAmount={opponent.betAmount}
                isWinner={opponent.isWinner}
                type="opponent"
                hand={opponent.hand}
                action={opponent.action}
                turn={!yourTurn}
                gameProcess={game.process}
                setDiscardCards={setDiscardCards}
            />

            <Player
                x={300}
                y={1460}
                name={player.name}
                buyInAmount={player.buyInAmount}
                isDealer={player.isDealer}
                betAmount={player.betAmount}
                isWinner={player.isWinner}
                hand={player.hand}
                action={player.action}
                type="you"
                turn={yourTurn}
                gameProcess={game.process}
                setDiscardCards={setDiscardCards}
            />

            {
                inGameControlsStatus && yourTurn && 
                <g id="controls" transform="translate(0, -30)">
                    {
                        (game.process === 'WAITING_ON_BETS' || game.process === 'WAITING_ON_FINAL_BETS') ?
                        <>
                            {
                                opponent.action !== 'ALLIN' && game.raiseAmount <= player.buyInAmount &&
                                <Button
                                    classname="svg-action-button"
                                    x={20}
                                    y={1430}
                                    value="   Bet  "
                                    fill="gold"
                                    onClick={() => {
                                        setBetAmount(0);
                                        setBetModal(true);
                                    }}
                                />
                            }

                            <Button
                                classname="svg-action-button"
                                x={20}
                                y={1330}
                                value=" All-In "
                                fill="gold"
                                onClick={() => socket.emit('PLAYER_ALL_IN', game.id)}
                            />

                            {
                                game.raiseAmount !== (player.buyInAmount + player.betAmount) &&
                                (player.betAmount === game.raiseAmount ?
                                <Button
                                    classname="svg-action-button"
                                    x={20}
                                    y={1530}
                                    value="  Check "
                                    fill="gold"
                                    onClick={() => socket.emit('PLAYER_CHECK', game.id)}
                                />
                                :
                                <Button
                                    classname="svg-action-button"
                                    x={20}
                                    y={1540}
                                    value="   Call "
                                    fill="gold"
                                    onClick={() => socket.emit('PLAYER_CALL', game.id)}
                                />)
                            }
                                
                        </> :

                        <Button 
                            classname="svg-action-button"
                            x={450} 
                            y={1350} 
                            value={`Discard ${Object.values(discardCards).filter(status => status).length}`} 
                            fill="yellow"
                            onClick={handleDiscardConfirm}
                        />
                    }


                    <Button 
                        classname="svg-action-button"
                        x={965} 
                        y={1450} 
                        value=" Fold " 
                        fill="cyan"
                        onClick={() => socket.emit('PLAYER_FOLD', game.id)}
                    />
                </g>
            }

            <Modal 
                content={
                    (isBetModalOpen &&
                    <BetModal 
                        betAmount={betAmount} 
                        minBet={game.raiseAmount - player.betAmount}
                        handleBetAmount={handleBetAmount}
                        handleModalExit={handleModalExit}
                        handleBetConfirm={handleBetConfirm}
                    />)
                    ||
                    (isExitMenuOpen &&
                    <>
                        <text x={340} y={60} dominantBaseline="middle" textAnchor="middle" fontSize={70}>
                            Leave Game?
                        </text>

                        <Button
                            x={220}
                            y={220}
                            value="Accept"
                            fill="#5affa3"
                            onClick={() => socket.emit('LEAVE_GAME', game.id)}
                        />
                        <Button
                            x={200}
                            y={120}
                            value="Decline"
                            fill="#ffb65a"
                            onClick={handleModalExit}
                        />
                    </>)
                }
            />
        </g>
    );
}

export default Game;
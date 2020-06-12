import React, {useState} from 'react';
import Button from './utils/Button';

export default function LobbyModal(props) {
    const {player, game, socket} = props;

    const [isWaitingRoom, setWaitingRoom] = useState(false);
    const [isPassCodeMenu, setPassCodeMenu] = useState(false);
    const [passCode, setPassCode] = useState('');

    const hostPlayer = game && game.players.find(player => player.isHost);
    const playerTwo = game && game.players.find(player => !player.isHost);

    return(
        <g>
            <Button
                x={25}
                y={30}
                value=" X "
                fill="crimson"
                textFill="white"
                onClick={() => socket.emit('LEAVE_GAME', game ? game.id : null)}
                scale={0.7}
            />

            {
                !isWaitingRoom ?
                <g id="mainMenu">
                    <text x="330" y="120" textAnchor="middle" dominantBaseline="middle" fontSize="80">{player.name}</text>
                    {
                        !isPassCodeMenu ?
                        <g id="menuOptions">
                            <Button
                                x={140}
                                y={188}
                                value=" Host "
                                fill="gold"
                                textFill="black"
                                onClick={() => socket.emit('CREATE_GAME', (data, status) => {
                                    if(data) setPassCode(data);
                                    setWaitingRoom(status);
                                })}
                                scale={0.85}
                            />
                            <Button
                                x={340}
                                y={188}
                                value=" Join "
                                fill="gold"
                                textFill="black"
                                onClick={() => setPassCodeMenu(true)}
                                scale={0.85}
                            />
                        </g>
                        :
                        <>
                            <foreignObject transform="scale(3,3)" x={48} y={54} width={190} height={30}>
                                <input 
                                    className="focus:outline-none border border-gray-500 px-1" 
                                    type="text" 
                                    placeholder="Enter passcode..." 
                                    value={passCode}
                                    onChange={(e) => setPassCode(e.target.value)}
                                    maxLength="12"
                                    size={12}
                                />
                            </foreignObject>
                            <Button
                                x={100}
                                y={255}
                                value=" Back "
                                fill="gold"
                                textFill="black"
                                onClick={() => {
                                    setPassCode('');
                                    setPassCodeMenu(false);
                                }}
                                scale={0.85}
                            />
                            <Button
                                x={310}
                                y={255}
                                value=" Confirm "
                                fill="gold"
                                textFill="black"
                                onClick={() => socket.emit('PLAYER_JOINED_GAME', passCode.trim(), (status) => {
                                    if(status) {
                                        setPassCodeMenu(false);
                                        setWaitingRoom(true);
                                    }
                                })}
                                scale={0.85}
                            />
                        </>
                    }  
                </g>
                :
                <g id="waitingRoom">
                    <line x1="80" x2="630" y1="265" y2="265" stroke="gray"/>
                    {
                        (hostPlayer && hostPlayer.id === player.id) ?
                            <>
                                {
                                    !playerTwo ?
                                    <text x="350" y="310" textAnchor="middle" dominantBaseline="middle" fontSize="50">Passcode: {passCode}</text>
                                    :
                                    <Button
                                        x={150}
                                        y={275}
                                        value=" Start Game "
                                        fill="gold"
                                        textFill="black"
                                        scale={0.85}
                                        onClick={() => socket.emit('BEGIN_GAME', game.id)}
                                    />
                                }
                            </>
                        :
                        <text x="350" y="310" textAnchor="middle" dominantBaseline="middle" fontSize="45">Waiting for host to begin game...</text>
                    }

                    <text 
                    x={330} y={70} 
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={65}
                    >{hostPlayer && hostPlayer.name}</text>
                    <text 
                    x={335} y={145} 
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={40}
                    >VS.</text>
                    <text 
                    x={330} y={220} 
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={58}
                    >{playerTwo ? playerTwo.name : 'Waiting On Player...'}</text>
                </g>
            }
        </g>
    );
}
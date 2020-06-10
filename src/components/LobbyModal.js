import React from 'react';
import Button from './utils/Button';

export default function LobbyModal(props) {
    const {player, game, socket} = props;

    const host = game.players.find(player => player.isHost);
    const playerTwo = game.players.find(player => !player.isHost);

    return(
        <g>
            <Button
                x={40}
                y={30}
                value=" X "
                fill="crimson"
                textFill="white"
                onClick={() => socket.emit('LEAVE_GAME', game.id)}
                scale={0.7}
            />

            <text 
              x={330} y={70} 
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={65}
            >{host.name}</text>

<           text 
              x={335} y={150} 
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={40}
            >VS.</text>

            {
                !playerTwo ?
                <text 
                x={350} y={230} 
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={48}
                >Waiting On Player...</text>
                :
                <>
                    <text 
                    x={330} y={230} 
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={65}
                    >{playerTwo.name}</text>
                    {
                        player.isHost ?
                        <Button
                            x={185}
                            y={280}
                            value=" Begin Game "
                            fill="crimson"
                            textFill="white"
                            onClick={() => socket.emit('BEGIN_GAME', game.id)}
                            scale={0.7}
                        />
                        :
                        <text 
                            x={350} y={300} 
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={38}
                        >
                            Waiting for host to start the game...
                        </text>
                    }
                </>
            }
        </g>
    );
}
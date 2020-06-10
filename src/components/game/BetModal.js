import React, { useState, useEffect } from 'react';
import Button from '../utils/Button';

export default function BetModal(props) {
    const {
        betAmount = 0,
        minBet = 100, 
        handleBetAmount = () => console.log('handleBetAmount'),
        handleModalExit = () => console.log('handleModalExit'),
        handleBetConfirm = () => console.log('handleBetConfirm')
    } = props;

    const [error, setError] = useState('');

    useEffect(() => {
        document.querySelector('#betInputContainer').focus();

        return () => setError('')
    }, []);

    const confirmBet = () => {
        handleBetConfirm(setError);
    }


    return(
        <>
            <foreignObject x="25" y="25" width="180" height="30" transform="scale(3,3)">
                <input id="betInputContainer" className="focus:outline-none text-center border border-blue-400" min={minBet} type="number" value={betAmount === 0 ? null : betAmount} onChange={handleBetAmount}/>
            </foreignObject>

            <text x={330} y={40} dominantBaseline="middle" textAnchor="middle" fontSize={50}>
                Bet Amount:
            </text>

            <text x={330} y={200} dominantBaseline="middle" textAnchor="middle" fontSize={50} fill="red">
                {error}
            </text>
            <Button
                x={230}
                y={240}
                value="Confirm Bet"
                fill="#5affa3"
                onClick={confirmBet}
            />
            <Button
                x={60}
                y={240}
                value="Exit"
                fill="#ffb65a"
                onClick={handleModalExit}
            />
        </>
    );
}
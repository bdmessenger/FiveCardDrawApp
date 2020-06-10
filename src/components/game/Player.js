import React from 'react';
import numeral from 'numeral';
import Card from './Card';



export default function Player(props) {
    const { 
        x = 0, y = 0, 
        scale = 1, 
        name, buyInAmount,
        isDealer,
        betAmount = 0,
        isWinner,
        type = 'you',
        hand = [],
        turn = false,
        gameProcess = 'IDLE',
        setDiscardCards = null
    } = props;

    return(
        <g id={type === 'you' ? 'yourPlayer' : 'opponentPlayer'} transform={`translate(${x},${y}) scale(${scale}, ${scale})`}>
            { type === 'you' ?
                <g transform="translate(-300, -1490)">
                    <g className="cardPlaceHolders">
                        {
                            [85, 295, 505, 715, 925].map((x, index) => <Card key={`placeholder${index + 1}`} x={x} y={1000} backSideOpacity={0.2} />)
                        }
                    </g>

                    {
                        hand.map((card, i) => {
                            return (
                                <g key={`playerCard${i + 1}`}>
                                    <Card suit={card.suit} value={card.value} x={(210 * i) + 85} y={1000} />
                                    {
                                        gameProcess === 'WAITING_ON_DISCARDS' && turn &&
                                        <>
                                            <g transform={`translate(${(i * 210) + 130},0)`}>
                                                <text x="0" y="1100" fontSize="25">Click here</text>
                                                <text x="-20" y="1200" fontSize="25">To Select Card</text>
                                                <text x="-5" y="1230" fontSize="25">For Discard</text>
                                            </g>
                                            <rect 
                                                x={(210 * i) + 85} y={1000} 
                                                width={200} height={300} 
                                                style={{fill: 'transparent', opacity: 0.1}} 
                                                onMouseOver={(e) => e.target.style.cursor = 'pointer'} 
                                                onMouseOut={(e) => e.target.style.cursor = 'auto'}
                                                onClick={(e) => {
                                                    if(e.target.style.fill === 'transparent') {
                                                        e.target.style.fill = 'black';
                                                        e.target.style.opacity = 0.3;
                                                        setDiscardCards(state => ({...state, [i]: true}));
                                                    } else {
                                                        e.target.style.fill = 'transparent';
                                                        e.target.style.opacity = 0.1;
                                                        setDiscardCards(state => ({...state, [i]: false}));
                                                    }
                                                }} 
                                            />
                                        </>
                                    }
                                </g>
                            ); 
                        })
                    }
                </g>

                :


                <g transform="translate(-180, -560) scale(0.8,0.8)">
                    <g className="cardPlaceHolders">
                        {
                            [85, 295, 505, 715, 925].map((x, index) => <Card key={`placeholder${index + 1}`} x={x} y={1000} backSideOpacity={0.2} />)
                        }
                    </g>

                    {
                        hand.map((card, i) => {
                            return <Card key={i} suit={card.suit} value={card.value} x={(210 * i) + 85} y={1000} />;
                        })
                    }
                </g>
            }

            <g transform={`${type === 'you' ? 'translate(-40,5) scale(1.2,1.2)' : 'translate(-10,0) scale(1.1,1.1)'}`}>
                {
                    betAmount !== 0 &&
                    <g className="playerBet" transform={`translate(-20, ${type === 'you' ? '-240' : '0'})`}>
                        <rect fill="#94d3ac" x={170} rx={50} y={110} width={300} height={80}/>
                        <text x="315" y="155" fontSize="50" dominantBaseline="middle" textAnchor="middle">Bet: {numeral(betAmount).format(betAmount > 99999 ? '$0.00 a' : '$0,0')}</text>
                    </g>
                }
                
                <g className="playerInfo">
                    <text x={300} y={0} fontSize={48} fill="white" dominantBaseline="middle" textAnchor="middle">{type !== 'you' ? name : numeral(buyInAmount).format(buyInAmount > 99999 ? '$0.00 a' : '$0,0')}</text>
                    <line x1="220" x2="390" y1="35" y2="35" stroke="white" strokeWidth="4" />
                    <text x={300} y={75} fontSize={42} fill="white" dominantBaseline="middle" textAnchor="middle">{type !== 'you' ? numeral(buyInAmount).format(buyInAmount > 99999 ? '$0.00 a' : '$0,0') : name}</text>
                </g>

                {
                    isDealer &&
                    <g id="dealer" transform="translate(-50,-20)">
                        <circle cx="500" cy="50" r="30" fill="white" stroke="black" />
                        <text x="502" y="55" fontSize="42" dominantBaseline="middle" textAnchor="middle" stroke="black" strokeWidth="2px">D</text>
                    </g>
                }

                {
                    isWinner &&
                    <path 
                        transform="translate(245, -120) scale(0.5,0.5)" 
                        id="crown" 
                        fill="gold" 
                        stroke="black" 
                        strokeWidth="1" 
                        d="M 22.67,140.67
                        C 22.67,140.67 0.33,22.33 0.33,22.33
                        0.33,22.33 63.00,81.33 63.00,81.33
                        63.00,81.33 114.67,1.00 114.67,1.00
                        114.67,1.00 164.00,81.67 164.00,81.67
                        164.00,81.67 231.67,22.67 231.67,22.67
                        231.67,22.67 206.33,139.33 206.33,139.33
                        206.33,139.33 202.75,147.12 202.75,147.12
                        202.75,147.12 197.62,152.75 197.62,152.75
                        197.62,152.75 186.88,160.12 186.88,160.12
                        186.88,160.12 172.75,167.25 172.75,167.25
                        172.75,167.25 152.38,173.38 152.38,173.38
                        152.38,173.38 138.12,176.12 138.12,176.12
                        138.12,176.12 131.62,177.00 131.62,177.00
                        131.62,177.00 97.50,177.12 97.50,177.12
                        97.50,177.12 75.12,173.62 75.12,173.62
                        75.12,173.62 54.62,167.12 54.62,167.12
                        54.62,167.12 41.25,160.38 41.25,160.38
                        41.25,160.38 32.00,152.75 32.00,152.75
                        32.00,152.75 24.88,144.25 24.88,144.25
                        24.88,144.25 23.25,141.75 23.25,141.75"
                    />
                }
            </g>
        </g>
    );
}
import React from 'react';

function Card(props) {
    const {value = null, suit = null, x = 0, y = 0, scale = 1, backSideOpacity = 1} = props;

    const suits = {
        diamonds: '♦',
        hearts: '♥',
        clubs: '♣',
        spades: '♠'
    };

    if(value && suit) {
        const currentValue = value.length > 2 ? value[0] : value;
        const color = (suit === 'diamonds' || suit === 'hearts') ? 'red' : 'black';
        
        return(
            <g transform={`translate(${x},${y}) scale(${scale}, ${scale})`}>
                <rect stroke="black" x={0} y={0} rx={5} width={200} height={300} fill="white" />
                <text x={100} y={150} fontSize={80} dominantBaseline="middle" fill={color} textAnchor="middle">{suits[suit]}</text>
                <text x={30} y={45} fontSize={60} dominantBaseline="middle" fill={color} textAnchor="middle">{currentValue}</text>
                <text x={-170} y={-250} transform="rotate(-180)" fontSize={60} fill={color} dominantBaseline="middle" textAnchor="middle">{currentValue}</text>
            </g>
        );
    } else {
        return(
            <g transform={`translate(${x},${y}) scale(${scale}, ${scale})`} opacity={backSideOpacity}>
                <rect stroke="black" x={0} y={0} rx={5} width={200} height={300} fill="white" />
                <rect x={10} y={10} rx={5} width={180} height={280} fill="#df5974" />
                <g id="hexagon" transform={`translate(${-15},${275}) scale(0.8,0.8)`} opacity={0.3} fill="white">
                    <path d="M168-127.1c0.5,0,1,0.1,1.3,0.3l53.4,30.5c0.7,0.4,1.3,1.4,1.3,2.2v61c0,0.8-0.6,1.8-1.3,2.2L169.3-0.3 c-0.7,0.4-1.9,0.4-2.6,0l-53.4-30.5c-0.7-0.4-1.3-1.4-1.3-2.2v-61c0-0.8,0.6-1.8,1.3-2.2l53.4-30.5C167-127,167.5-127.1,168-127.1 L168-127.1z"></path>
                    <path d="M112-222.5c0.5,0,1,0.1,1.3,0.3l53.4,30.5c0.7,0.4,1.3,1.4,1.3,2.2v61c0,0.8-0.6,1.8-1.3,2.2l-53.4,30.5 c-0.7,0.4-1.9,0.4-2.6,0l-53.4-30.5c-0.7-0.4-1.3-1.4-1.3-2.2v-61c0-0.8,0.6-1.8,1.3-2.2l53.4-30.5 C111-222.4,111.5-222.5,112-222.5L112-222.5z"></path>
                    <path d="M168-317.8c0.5,0,1,0.1,1.3,0.3l53.4,30.5c0.7,0.4,1.3,1.4,1.3,2.2v61c0,0.8-0.6,1.8-1.3,2.2L169.3-191 c-0.7,0.4-1.9,0.4-2.6,0l-53.4-30.5c-0.7-0.4-1.3-1.4-1.3-2.2v-61c0-0.8,0.6-1.8,1.3-2.2l53.4-30.5 C167-317.7,167.5-317.8,168-317.8L168-317.8z"></path>
                </g>
            </g>
        )
    }
    
}

export default Card;
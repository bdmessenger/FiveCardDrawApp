import React from 'react';
import Button from './utils/Button';

export default function CreateDisplayName(props) {
    const {displayName, setDisplayName, handleNameConfirm} = props;
    

    return(
        <g>
            <text 
              x={345} y={60} 
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={50}
            >Welcome to Five-Card Draw!</text>
            <foreignObject transform="scale(3,3)" x={48} y={40} width={190} height={30}>
                <input 
                    className="focus:outline-none border border-gray-500 px-1" 
                    type="text" 
                    placeholder="display name..." 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength="13"
                    size={13}
                />
            </foreignObject>
            <Button
                x={210}
                y={230}
                value="Join In"
                fill="magenta"
                textFill="white"
                onClick={() => handleNameConfirm(displayName)}
            />
        </g>
    );
}
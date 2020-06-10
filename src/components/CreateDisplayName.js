import React, {useState} from 'react';
import Button from './utils/Button';

export default function CreateDisplayName(props) {
    const {handleNameConfirm} = props;
    const [name, setName] = useState('');

    

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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength="15"
                    size={13}
                />
            </foreignObject>
            <Button
                x={210}
                y={230}
                value="Join In"
                fill="magenta"
                textFill="white"
                onClick={() => handleNameConfirm(name)}
            />
        </g>
    );
}
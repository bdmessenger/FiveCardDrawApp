import React from 'react';

export default function Button(props) {
    const {classname = 'svg-button', x = 0, y = 0, scale = 1, value, fill = "white", textFill = "black", onClick = null} = props;

    const textWidthSize = 37.5 * value.length;

    return(
        <g className={classname} transform={`translate(${x}, ${y}) scale(${scale}, ${scale})`} onClick={onClick}>
            <rect rx={10} width={textWidthSize} height={80} fill={fill} stroke="black" />
            <text 
                x={textWidthSize / 2} y={90 / 2} 
                fontSize={70} 
                dominantBaseline="middle" textAnchor="middle"
                fill={textFill}
            >{value}</text>
        </g>
    );
}
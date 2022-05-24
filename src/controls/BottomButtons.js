import React from 'react';
import * as d3 from 'd3';
import './BottomButtons.css';

const BottomButtons = (props) => {
	return (
		<div className="bottomButtons">
			<button className="play button" onClick={props.onPlay}>{props.playing ? 'Stop' : 'Play'}</button>
		</div>
	);
};

export default BottomButtons;
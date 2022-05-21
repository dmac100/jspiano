import React from 'react';
import * as d3 from 'd3';
import './Controls.css';

const Controls = (props) => {
	return (
		<div className="controls">
			<button className="play button" onClick={props.onPlay}>{props.playing ? 'Stop' : 'Play'}</button>
		</div>
	);
};

export default Controls;
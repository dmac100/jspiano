import React from 'react';
import * as d3 from 'd3';
import './TopButtons.css';

const TopButtons = (props) => {
	return (
		<div className="topButtons">
		<button className="showScore button" onClick={props.onToggleShowScore}>{props.showScore ? 'Hide Score' : 'Show Score'}</button>
			<button className="showScroll button" onClick={props.onToggleShowScroll}>{props.showScroll ? 'Hide Scroll' : 'Show Scroll'}</button>
		</div>
	);
};

export default TopButtons;
import React from 'react';
import './BottomButtons.css';

const BottomButtons = (props) => {
	return (
		<div className="bottomButtons">
			<div className="grid">
				<span className="left">
				</span>

				<span className="center">
					<button className="play button" onClick={props.onPlay}>{props.playing ? 'Stop' : 'Play'}</button>
				</span>

				<span className="right">
					Repeats:
					<button className="repeatStart button" onClick={props.onRepeatStart}>Start</button>
					<button className="repeatEnd button" onClick={props.onRepeatEnd}>End</button>
					<button className="repeatClear button" onClick={props.onRepeatClear}>Clear</button>
				</span>
			</div>
		</div>
	);
};

export default BottomButtons;
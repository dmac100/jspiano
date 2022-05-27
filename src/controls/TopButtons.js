import React from 'react';
import * as d3 from 'd3';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import MidiSetup from './MidiSetup.js';
import './TopButtons.css';

const TopButtons = (props) => {
	return (
		<div className="topButtons">
			<button className="showScore button" onClick={props.onToggleShowScore}>{props.showScore ? 'Hide Score' : 'Show Score'}</button>
			<button className="showScroll button" onClick={props.onToggleShowScroll}>{props.showScroll ? 'Hide Scroll' : 'Show Scroll'}</button>

			<Popup modal position="Center" trigger={<button className="setup button">Setup</button>}>
				{ close => (
					<div className="popup">
					    <button className="close" onClick={close}>&times;</button>
					    <div className="content">
					    	<MidiSetup/>
						</div>
					</div>
				)}
			</Popup>
		</div>
	);
};

export default TopButtons;
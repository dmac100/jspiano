import React from 'react';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import MidiSetup from './MidiSetup.js';
import './TopButtons.css';

const TopButtons = (props) => {
	function openSetup(close) {
		return (
			<div className="popup">
				<button className="close" onClick={close}>&times;</button>
				<div className="content">
					<MidiSetup/>
				</div>
			</div>
		);
	}

	return (
		<div className="topButtons">
			<button className="open button" onClick={props.onOpen}>Open</button>
			
			<Popup modal position="Center" trigger={<button className="setup button">Setup</button>}>{openSetup}</Popup>

			<button className="showScore button" onClick={props.onToggleShowScore}>{props.showScore ? 'Hide Score' : 'Show Score'}</button>
			<button className="showScroll button" onClick={props.onToggleShowScroll}>{props.showScroll ? 'Hide Scroll' : 'Show Scroll'}</button>
		</div>
	);
};

export default TopButtons;
import React from 'react';
import * as opensheetmusicdisplay from 'opensheetmusicdisplay';
import _ from 'underscore';
import './Score.css';

function usePrevious(value) {
	const ref = React.useRef();
	React.useEffect(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
}

const Score = props => {
	const scrollRef = React.useRef();
	const scoreRef = React.useRef();

	const prevProps = usePrevious(props);

	const [cursor, setCursor] = React.useState();

	React.useEffect(() => {
		if(!prevProps || props.musicXml !== prevProps.musicXml) {
			renderSvg();
		}
	});

	setCursorPosition(props.position);

	function getWholeNoteTime(position) {
		const notes = _.sortBy(props.musicXml.notes, note => note.startTime);
		for(let note of notes) {
			if(note.startTime >= position) {
				return note.wholeNoteStartTime;
			}
		}
		return 0;
	}

	function setCursorPosition(position) {
		if(!cursor) return;

		const targetTime = getWholeNoteTime(position);

		if(cursor.iterator.currentTimeStamp.realValue > targetTime) {
			cursor.reset();
		}

		// Advance cursor until past targetTime.
		let currentTime = cursor.iterator.currentTimeStamp.realValue;
		while(currentTime < targetTime) {
			cursor.next();
			currentTime = cursor.iterator.currentTimeStamp.realValue;
		}

		cursor.show();

		cursor.cursorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

		window.cursorElement = cursor.cursorElement;
		window.scroll = scrollRef.current;
	}

	function renderSvg() {
		const score = scoreRef.current;

		if(props.musicXml) {
			score.innerHTML = '';

			const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(scoreRef.current, {
				backend: 'svg',
				autoResize: false,
				drawTitle: false
			});

			osmd.load(props.musicXml.xml)
				.then(osmd.render());

			setCursor(osmd.cursor);
		}
	}

	return (
		<div className="scoreScroll" ref={scrollRef}>
			<div className="score" ref={scoreRef}>
			</div>
		</div>
	);
};

export default Score;
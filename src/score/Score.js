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
			if(note.startTime + 1 >= position) {
				console.log(position, note.startTime, note.wholeNoteStartTime);
				return note.wholeNoteStartTime;
			}
		}
		return -1;
	}

	function setCursorPosition(position) {
		if(!cursor) return;

		const targetTime = getWholeNoteTime(position);

		if(targetTime == -1) return;


		if(cursor.iterator.currentTimeStamp.realValue > targetTime + 0.00001) {
			cursor.reset();
		}

		const iterator = cursor.iterator;

		// Advance cursor until past targetTime.
		let currentTime = iterator.currentTimeStamp.realValue;
		while(currentTime < targetTime) {
			iterator.moveToNext();
			currentTime = iterator.currentTimeStamp.realValue;
		}

		cursor.show();

		cursor.cursorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
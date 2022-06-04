import React from 'react';
import * as opensheetmusicdisplay from 'opensheetmusicdisplay';
import {MusicPartManagerIterator} from 'opensheetmusicdisplay';
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
	const [osmd, setOsmd] = React.useState();
	const [overlayLines, setOverlayLines] = React.useState([]);

	React.useEffect(() => {
		if(!prevProps || props.musicXml !== prevProps.musicXml) {
			renderSvg();
		}

		if(osmd) {
			if(!prevProps || props.repeatStart !== prevProps.repeatStart || props.repeatEnd !== prevProps.repeatEnd || props.repeatEnabled !== prevProps.repeatEnabled) {
				updateRepeatMarks(osmd);
			}
		}
	});
	

	setCursorPosition(props.position);

	function getNoteAtPosition(osmd, position) {
		const targetTime = getWholeNoteTime(position);

		const iterator = new MusicPartManagerIterator(osmd.sheet);

		while(!iterator.endReached) {
			if(iterator.currentTimeStamp.realValue >= targetTime - 0.00001) {
				if(iterator.currentVoiceEntries) {
					for(let voiceEntry of iterator.currentVoiceEntries) {
						for(let note of voiceEntry.notes) {
							return note;
						}
					}
				}
			}

			iterator.moveToNext();
		}

		return null;
	}

	function updateRepeatMarks(osmd) {
		if(props.repeatEnabled) {
			addRepeatMarks(osmd, props.repeatStart, props.repeatEnd);
		} else {
			clearRepeatMarks();
		}
	}

	function addRepeatMarks(osmd, startPosition, endPosition) {
		const startNote = getNoteAtPosition(osmd, startPosition);
		const endNote = getNoteAtPosition(osmd, endPosition);

		clearRepeatMarks();
		const newOverlayLines = [];

		osmd.GraphicSheet.MeasureList.forEach(measureList => {
			const staffPositions = measureList.flatMap(measure => {
				return measure.staffEntries.map(staffEntry => staffEntry.boundingBox.absolutePosition.y)
			});

			const staffTop = _.min(staffPositions);
			const staffBottom = _.max(staffPositions) + 4;

			measureList.forEach(measure => {
				measure.staffEntries.forEach(staffEntry => {
					staffEntry.graphicalVoiceEntries.forEach(graphicalVoiceEntry => {
						graphicalVoiceEntry.notes.forEach(note => {
							const bbox = note.getSVGGElement().getBBox();
							const noteLeft = (bbox.x - 5) / 10;
							const noteRight = (bbox.x + bbox.width + 5) / 10;

							if(note.sourceNote === startNote) {
								newOverlayLines.push(osmd.Drawer.DrawOverlayLine(
									{ x: noteLeft, y: staffTop },
									{ x: noteLeft, y: staffBottom },
									osmd.GraphicSheet.MusicPages[0],
									"#FF0000FF",
									0.4
								));
							}

							if(note.sourceNote === endNote) {
								newOverlayLines.push(osmd.Drawer.DrawOverlayLine(
									{ x: noteRight, y: staffTop },
									{ x: noteRight, y: staffBottom },
									osmd.GraphicSheet.MusicPages[0],
									"#FF0000FF",
									0.4
								));
							}
						});
					});
				});
			});

			setOverlayLines(newOverlayLines);
		});
	}

	function clearRepeatMarks() {
		overlayLines.forEach(element => element.remove());
		setOverlayLines([]);
	}

	function onClick(event) {
		const score = scoreRef.current;

		const units = opensheetmusicdisplay.unitInPixels;
		const x = (event.clientX - score.getBoundingClientRect().x) / units;
		const y = (event.clientY - score.getBoundingClientRect().y) / units;

		if(osmd) {
			const nearestNote = osmd.graphic.GetNearestNote({x, y}, 5);
			if(nearestNote) {
				const wholeNotes = nearestNote.sourceNote.getAbsoluteTimestamp().realValue;
				const note = _.min(props.musicXml.notes, note => Math.abs(wholeNotes - note.wholeNoteStartTime));
				props.onScroll(note.startTime);
			}
		}
	}

	function getWholeNoteTime(position) {
		if(position === 0) {
			return 0;
		}

		const notes = _.sortBy(props.musicXml.notes, note => -note.startTime);
		for(let note of notes) {
			if(note.startTime <= position + 1) {
				return note.wholeNoteStartTime;
			}
		}
		return -1;
	}

	function setCursorPosition(position) {
		if(!cursor) return;

		const targetTime = getWholeNoteTime(position);

		if(targetTime === -1) return;

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

		if(props.musicXml && props.musicXml.xml) {
			score.innerHTML = '';

			const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(scoreRef.current, {
				backend: 'svg',
				autoResize: false,
				drawTitle: false
			});

			osmd.load(props.musicXml.xml)
				.then(osmd.render());

			setCursor(osmd.cursor);

			setOsmd(osmd);

			updateRepeatMarks(osmd);
		}
	}

	return (
		<div className="scoreScroll" ref={scrollRef}>
			<div className="score" ref={scoreRef} onClick={onClick}>
			</div>
		</div>
	);
};

export default Score;
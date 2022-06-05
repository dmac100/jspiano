import React from 'react';
import * as d3 from 'd3';
import './Scroll.css';
import getNoteColor from '../model/colors.js';

function usePrevious(value) {
	const ref = React.useRef();
	React.useEffect(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
}

const keyWidth = 12;
const leftMargin = 10;

function getNoteTop(totalHeight, note, scale) {
	const startTime = note.startTimeDivisions * scale;
	const duration = note.durationDivisions * scale;
	
	return totalHeight - startTime - duration;
}

function getPosition(pitch) {
	let position = 10;
		
	// Add a key width for each note above A0, or 2 key widths around the black key gaps between B/C and E/F.
	for(let x = 1; x <= pitch - 21; x++) {
		if(x % 12 === 3 || x % 12 === 8) {
			position += keyWidth;
		}
		position += keyWidth;
	}
	
	return position;
}

function getActiveTracks(tracks) {
	const activeTracks = new Set();
	tracks.filter(track => track.active).forEach(track => activeTracks.add(track.id));
	return activeTracks;
}

/*
* Disable onScroll callback for some time after setting scrollTop so we don't send back a value we just received.
* Prevents small jumps back and forth in the scrolling.
*/
class OnScrollDisabledTimer {
	constructor() {
		this.timer = 0;
		this.onScrollDisabled = false;
	}

	disableOnScroll() {
		if(this.timer != 0) {
			clearTimeout(this.timer);
		}

		this.onScrollDisabled = true;
		this.timer = setTimeout(() => this.onScrollDisabled = false, 100);
	}

	isOnScrollDisabled() {
		return this.onScrollDisabled;
	}
}

const Scroll = props => {
	const scrollRef = React.createRef();
	const svgRef = React.createRef();

	const prevProps = usePrevious(props);

	const scale = (props.scale / 10) + 0.1;
	const totalHeight = props.musicXml ? (props.musicXml.length * scale) + 1000 : 2000;

	const [onScrollDisabledTimer, setOnScrollDisabledTimer] = React.useState(new OnScrollDisabledTimer());

	React.useEffect(() => {
		scrollRef.current.scrollTop = (totalHeight / scale - props.position) * scale - scrollRef.current.clientHeight;
		onScrollDisabledTimer.disableOnScroll();

		if(!prevProps || props.musicXml !== prevProps.musicXml || props.tracks !== prevProps.tracks || props.scale !== prevProps.scale) {
			renderSvg();
		}
	});

	function onScroll() {
		if(!onScrollDisabledTimer.isOnScrollDisabled()) {
			props.onScroll((totalHeight - (scrollRef.current.scrollTop + scrollRef.current.clientHeight)) / scale);
		}
	}

	function renderSvg() {
		const svg = svgRef.current;

		d3.select(svg).selectAll("*").remove();

		const white = '#fff';
		const black = '#000';
		const grey220 = 'rgb(220,220,220)';
		const grey240 = 'rgb(240,240,240)';

		const clientWidth = keyWidth * 104;

		d3.select(svg)
			.attr("width", clientWidth)
			.attr("height", totalHeight);

		// Draw grey guide lines showing the position of the black notes.
		for(let x = 2; x < 105; x++) {
			// Check whether this is a black note.
			if(x % 14 === 1 || x % 14 === 3 || x % 14 === 13 || x % 14 === 7 || x % 14 === 9) {
				d3.select(svg)
					.append("rect")
					.attr("x", leftMargin + (x - 1) * keyWidth - 2)
					.attr("y", 0)
					.attr("width", keyWidth)
					.attr("height", totalHeight)
					.attr("stroke", grey220)
					.attr("fill", (x % 14 === 7 || x % 14 === 9) ? grey240 : grey220);
			}
		}

		if(props.musicXml) {
			// Draw the barlines.
			props.musicXml.measures.forEach(measure => {
				const measureStartY = totalHeight - (measure.startTimeDivisions * scale);
				const measureEndY = totalHeight - (measure.endTimeDivisions * scale);

				for(let i = 0; i < measure.beats; i++) {
					const measureY = measureStartY + (measureEndY - measureStartY) * (i / measure.beats);

					d3.select(svg)
						.append("line")
						.attr("x1", leftMargin)
						.attr("y1", measureY)
						.attr("x2", leftMargin + clientWidth)
						.attr("y2", measureY)
						.attr("stroke", (i === 0) ? black : grey220)
				}
			});

			const activeTracks = getActiveTracks(props.tracks);

			// Draw the note markers.
			props.musicXml.notes.forEach(note => {
				if(activeTracks.has(note.part.partId)) {
					const pitch = note.pitch.getMidiNumber();
					const duration = note.durationDivisions * scale;

					const y = getNoteTop(totalHeight, note, scale);

					d3.select(svg)
						.append("rect")
						.attr("x", leftMargin + getPosition(pitch) - 1)
						.attr("y", y)
						.attr("rx", 3)
						.attr("ry", 3)
						.attr("width", keyWidth * 0.9)
						.attr("height", duration)
						.attr("stroke", black)
						.attr("fill", getNoteColor(note));
				}
			});
		}
	}	

	return (
		<div className="scrollScroll" ref={scrollRef} onScroll={onScroll}>
			<svg className="svg" ref={svgRef}>
			</svg>
		</div>
	);
};

export default Scroll;
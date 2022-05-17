import React from 'react';
import raw from "raw.macro";
import * as d3 from 'd3';
import './Scroll.css';
import MusicXmlParser from '../parser/musicXmlParser.js';

function usePrevious(value) {
	const ref = React.useRef();
	React.useEffect(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
}

const keyWidth = 12;
const leftMargin = 10;
const scale = 1;

const musicXml = MusicXmlParser.parse(raw("../testfiles/Chopin - Nocturne 9-2.xml"));

function getNoteTop(totalHeight, note) {
	const startTime = note.startTime / scale;
	const duration = note.duration / scale;
	
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

function getNoteColor(note) {
	const track = note.part.index % trackColors.length;
	return note.pitch.isBlackKey() ? trackColors[track].darker() : trackColors[track];
}

const trackColors = [
	d3.rgb(220, 220, 80),
	d3.rgb(80, 220, 220),
	d3.rgb(220, 80, 220),
	d3.rgb(220, 80, 80),
	d3.rgb(80, 220, 80),
	d3.rgb(80, 80, 220),
	d3.rgb(250, 180, 0),
	d3.rgb(170, 210, 200),
	d3.rgb(230, 220, 120),
	d3.rgb(255, 240, 80),
	d3.rgb(220, 200, 230)
];

const Scroll = props => {
	const scrollRef = React.createRef();
	const svgRef = React.createRef();

	const prevProps = usePrevious(props);

	React.useEffect(() => {
		scrollRef.current.scrollTop = props.position;
		if(!prevProps || props.rects !== prevProps.rects) {
			renderSvg();
		}
	});

	function onScroll() {
		props.onScroll(scrollRef.current.scrollTop);
	}

	function renderSvg() {
		const svg = svgRef.current;

		d3.select(svg).selectAll("*").remove();

		const white = '#fff';
		const black = '#000';
		const grey220 = 'rgb(220,220,220)';
		const grey240 = 'rgb(240,240,240)';

		const clientWidth = keyWidth * 104;

		const totalHeight = musicXml.notes.reduce((max, note) => Math.max(max, note.startTime + note.duration), 0);

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

		// Draw the barlines.
		musicXml.measures.forEach(measure => {
			const measureStartY = totalHeight - (measure.startTime / scale);
			const measureEndY = totalHeight - (measure.endTime / scale);

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

		// Draw the note markers.
		musicXml.notes.forEach(note => {
			const pitch = note.pitch.getMidiNumber();
			const duration = note.duration / scale;

			const y = getNoteTop(totalHeight, note);

			d3.select(svg)
				.append("rect")
				.attr("x", leftMargin + getPosition(pitch) - 1)
				.attr("y", y)
				.attr("width", keyWidth * 0.9)
				.attr("height", duration)
				.attr("stroke", black)
				.attr("fill", getNoteColor(note));
		});
	}	

	return (
		<div className="scrollScroll" ref={scrollRef} onScroll={onScroll}>
			<svg className="svg" ref={svgRef}>
			</svg>
		</div>
	);
};

export default Scroll;
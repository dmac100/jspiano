import React from 'react';
import Pitch from '../model/pitch.js'
import getNoteColor from '../model/colors.js';
import * as d3 from 'd3';
import './Keyboard.css';

const topMargin = 20;
const leftMargin = 20;

const keyWidth = 24;
const keyHeight = 90;
const blackKeyHeight = 50;
const blackMargin = 5;
const borderWidth = 9;
const nWhiteKeys = 52;

const Keyboard = (props) => {
	const svgRef = React.useRef();

	React.useEffect(() => renderSvg());

	function getSelectedColor(pitch) {
		for(var note of props.playingNotes) {
			if(note.pitch.equals(pitch)) {
				return getNoteColor(note);
			}
		}
		return null;
	}

	function renderSvg() {
		const svg = svgRef.current;

		d3.select(svg)
			.attr("width", nWhiteKeys * keyWidth + borderWidth * 2 + leftMargin)
			.attr("height", 120);

		d3.select(svg).selectAll("*").remove();

		const white = '#fff';
		const black = '#000';
		const grey30 = 'rgb(30,30,30)';
		const grey50 = 'rgb(50,50,50)';
		const grey80 = 'rgb(80,80,80)';
		const grey120 = 'rgb(120,120,120)';

		let pitch = new Pitch("a0");

		// Draw the border of the keyboard.
		d3.select(svg)
			.append("rect")
			.attr("x", leftMargin - borderWidth)
			.attr("y", topMargin - borderWidth - 1)
			.attr("width", nWhiteKeys * keyWidth + borderWidth * 2 + 1)
			.attr("height", keyHeight + borderWidth + 2)
			.attr("fill", grey30);

		// Draw a gradient above the keyboard.
		const gradient = d3.select(svg).append("defs").append("linearGradient")
			.attr("id", "gradient")
			.attr("x1", "0%")
			.attr("x2", "0%")
			.attr("y1", "0%")
			.attr("y2", "100%");

		gradient.append("stop")
			.attr("offset", "0%")
			.style("stop-color", grey120)
			.style("stop-opacity", 1)

		gradient.append("stop")
			.attr("offset", "100%")
			.style("stop-color", grey30)
			.style("stop-opacity", 1);

		d3.select(svg)
			.append("rect")
			.attr("x", leftMargin - borderWidth + 1)
			.attr("y", topMargin - borderWidth)
			.attr("width", nWhiteKeys * keyWidth + borderWidth * 2 - 1)
			.attr("height", topMargin)
			.attr("fill", 'url(#gradient)');

		// Draw every white key.
		for(let x = 0; x < nWhiteKeys; x++) {
			const selected = getSelectedColor(pitch);

			// Draw rectangle for the key.
			d3.select(svg)
				.append("rect")
				.attr("x", leftMargin + keyWidth * x)
				.attr("y", topMargin)
				.attr("width", keyWidth)
				.attr("height", keyHeight)
				.attr("fill", (selected == null) ? white : selected)
				.attr("stroke", black);
			
			// Get the pitch of the next white key.
			pitch = pitch.nextSemitone();
			// Add an extra semitone except between B/C and E/F.
			if(x % 7 !== 1 && x % 7 !== 4) {
				pitch = pitch.nextSemitone();
			}
		}

		pitch = new Pitch("a#0");

		// Draw every black key.
		for(let x = 0; x < nWhiteKeys - 1; x++) {
			// Skip a black key between B/C and E/F.
			if(x % 7 === 1 || x % 7 === 4) {
				pitch = pitch.nextSemitone();
				continue;
			}
			
			const selected = getSelectedColor(pitch);
			
			const left = leftMargin + keyWidth * x + keyWidth / 2 + blackMargin;
			const width = keyWidth - blackMargin * 2 + 1;
			
			// Draw rectangle for the key.
			d3.select(svg)
				.append("rect")
				.attr("x", left)
				.attr("y", topMargin)
				.attr("width", width)
				.attr("height", blackKeyHeight)
				.attr("fill", (selected == null) ? black : selected)
				.attr("stroke", black);

			if(selected == null) {
				// Add a lower highlight to the key.
				d3.select(svg)
					.append("rect")
					.attr("x", left + 1)
					.attr("y", topMargin + blackKeyHeight - 5)
					.attr("width", width - 1)
					.attr("height", 5)
					.attr("fill", grey50)
					.attr("stroke", grey80);
			}
			
			// Get the pitch of the next black key.
			pitch = pitch.nextSemitone();
			pitch = pitch.nextSemitone();
		}
	}

	return (
		<svg className="keyboardSvg" ref={svgRef}>
		</svg>
	);
};

export default Keyboard;
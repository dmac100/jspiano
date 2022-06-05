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

function inRect(x, y, rect) {
	if(x < rect.x || x > rect.x + rect.width) return false;
	if(y < rect.y || y > rect.y + rect.height) return false;
	return true;
}

function getActiveTracks(tracks) {
	return new Set(tracks.filter(track => track.active).map(track => track.id));
}

const Keyboard = (props) => {
	const svgRef = React.useRef();

	const [pitchPressed, setPressedPitch] = React.useState(null);

	React.useEffect(() => renderSvg());

	function getSelectedColor(pitch, activeTracks) {
		for(let note of props.midiOnNotes) {
			if(note === pitch.getMidiNumber()) {
				return '#e33';
			}
		}

		for(let note of props.waitingNotes) {
			if(note.pitch.equals(pitch)) {
				return '#e33';
			}
		}

		for(let note of props.playingNotes) {
			if(note.pitch.equals(pitch) && activeTracks.has(note.part.partId)) {
				return getNoteColor(note);
			}
		}

		return null;
	}

	function getBlackKeys() {
		const keys = [];

		let pitch = new Pitch("a#0");

		// Draw every black key.
		for(let x = 0; x < nWhiteKeys - 1; x++) {
			// Skip a black key between B/C and E/F.
			if(x % 7 === 1 || x % 7 === 4) {
				pitch = pitch.nextSemitone();
				continue;
			}
			
			const left = leftMargin + keyWidth * x + keyWidth / 2 + blackMargin;
			const width = keyWidth - blackMargin * 2 + 1;

			keys.push({
				pitch,
				x: left,
				y: topMargin,
				width: width,
				height: blackKeyHeight
			});

			// Get the pitch of the next black key.
			pitch = pitch.nextSemitone();
			pitch = pitch.nextSemitone();
		}

		return keys;
	}

	function getWhiteKeys() {
		const keys = [];

		let pitch = new Pitch("a0");

		// Draw every white key.
		for(let x = 0; x < nWhiteKeys; x++) {
			keys.push({
				pitch,
				x: leftMargin + keyWidth * x,
				y: topMargin,
				width: keyWidth,
				height: keyHeight
			})

			// Get the pitch of the next white key.
			pitch = pitch.nextSemitone();
			// Add an extra semitone except between B/C and E/F.
			if(x % 7 !== 1 && x % 7 !== 4) {
				pitch = pitch.nextSemitone();
			}
		}

		return keys;
	}

	function onMouseDown(event) {
		const svg = svgRef.current;

		const pitch = getPitchForMouseEvent(event);
		if(pitch) {
			setPressedPitch(pitch);
			svg.setPointerCapture(event.pointerId);
			props.onMouseDown(pitch);
		}
	}

	function onMouseUp(event) {
		const svg = svgRef.current;

		svg.releasePointerCapture(event.pointerId);
		props.onMouseUp(pitchPressed);
	}

	function getPitchForMouseEvent(event) {
		const svg = svgRef.current;

		const clickX = event.clientX - svg.getBoundingClientRect().x;
		const clickY = event.clientY - svg.getBoundingClientRect().y;

		for(const key of getBlackKeys()) {
			if(inRect(clickX, clickY, key)) {
				return key.pitch;
			}
		}

		for(const key of getWhiteKeys()) {
			if(inRect(clickX, clickY, key)) {
				return key.pitch;
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
		const grey80 = 'rgb(80,80,80)';
		const grey120 = 'rgb(120,120,120)';

		const activeTracks = getActiveTracks(props.tracks);

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
		getWhiteKeys().forEach(key => {
			const selected = getSelectedColor(key.pitch, activeTracks);

			// Draw rectangle for the key.
			d3.select(svg)
				.append("rect")
				.attr("x", key.x)
				.attr("y", key.y)
				.attr("width", key.width)
				.attr("height", key.height)
				.attr("fill", (selected == null) ? white : selected)
				.attr("stroke", black);

			if(selected) {
				d3.select(svg)
					.append("rect")
					.attr("x", key.x + 1)
					.attr("y", key.y)
					.attr("width", key.width)
					.attr("height", key.height - 1)
					.attr("fill", "none")
					.attr("stroke", black);

			}
		})

		// Draw every black key.
		getBlackKeys().forEach(key => {
			const selected = getSelectedColor(key.pitch, activeTracks);

			// Draw rectangle for the key.
			d3.select(svg)
				.append("rect")
				.attr("x", key.x)
				.attr("y", key.y)
				.attr("width", key.width)
				.attr("height", key.height)
				.attr("fill", (selected == null) ? black : selected)
				.attr("stroke", black);

			if(selected == null) {
				// Add a lower highlight to the key.
				d3.select(svg)
					.append("rect")
					.attr("x", key.x + 1)
					.attr("y", key.y + blackKeyHeight - 5)
					.attr("width", key.width - 1)
					.attr("height", 5)
					.attr("fill", grey30)
					.attr("stroke", grey80);
			} else {
				d3.select(svg)
					.append("rect")
					.attr("x", key.x + 1)
					.attr("y", key.y)
					.attr("width", key.width - 2)
					.attr("height", key.height - 1)
					.attr("fill", "none")
					.attr("stroke", black);
			}
		});
	}

	return (
		<svg className="keyboardSvg" ref={svgRef} onPointerDown={onMouseDown} onPointerUp={onMouseUp}>
		</svg>
	);
};

export default Keyboard;
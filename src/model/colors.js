import * as d3 from 'd3';

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

function getNoteColor(note) {
	const track = note.part.index % trackColors.length;
	return note.pitch.isBlackKey() ? trackColors[track].darker() : trackColors[track];
}

export default getNoteColor
import React from 'react';
import * as d3 from 'd3';
import './Keyboard.css';

const Keyboard = (props) => {
	const svgRef = React.useRef();

	React.useEffect(() => renderSvg());

	function renderSvg() {
		const svg = svgRef.current;

		const rects = [
			{ x: 0, y: 0, color: '#acf' },
			{ x: 30, y: 0, color: '#fac' }
		];

		d3.select(svg)
			.attr("width", 800)
			.attr("height", 200);

		d3.select(svg)
			.selectAll("rect")
			.data(rects).enter().append("rect")
			.attr("x", d => d.x)
			.attr("y", d => d.y)
			.attr("width", 20)
			.attr("height", 50)
			.attr("fill", d => d.color);
	}

	return (
		<svg className="svg" ref={svgRef}>
		</svg>
	);
};

export default Keyboard;
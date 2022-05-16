import React from 'react';
import * as d3 from 'd3';
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
	const svgRef = React.useRef();

	const prevProps = usePrevious(props);

	React.useEffect(() => {
		scrollRef.current.scrollLeft = props.position;
		if(!prevProps || props.rects !== prevProps.rects) {
			renderSvg();
		}
	});

	function onScroll() {
		props.onScroll(scrollRef.current.scrollLeft);
	}

	function renderSvg() {
		const svg = svgRef.current;

		d3.select(svg)
			.attr("width", 200 * 1000 + 1000);

		d3.select(svg)
			.selectAll("rect")
			.data(props.rects).enter().append("rect")
			.attr("x", d => d.y)
			.attr("y", d => 10)
			.attr("width", 30)
			.attr("height", 50)
			.attr("fill", d => d.color)
			.attr("stroke", d => "#333");
	}	

	return (
		<div className="scoreScroll" ref={scrollRef} onScroll={onScroll}>
			<svg className="svg" ref={svgRef}>
			</svg>
		</div>
	);
};

export default Score;
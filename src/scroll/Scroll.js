import React from 'react';
import * as d3 from 'd3';
import './Scroll.css';

function usePrevious(value) {
	const ref = React.useRef();
	React.useEffect(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
}

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

		d3.select(svg)
			.attr("width", 1000)
			.attr("height", 200 * 1000 + 1000);

		d3.select(svg)
			.selectAll("rect")
			.data(props.rects).enter().append("rect")
			.attr("x", d => d.x)
			.attr("y", d => d.y)
			.attr("width", 30)
			.attr("height", 50)
			.attr("fill", d => d.color)
			.attr("stroke", d => "#333");
	}	

	return (
		<div className="scrollScroll" ref={scrollRef} onScroll={onScroll}>
			<svg className="svg" ref={svgRef}>
			</svg>
		</div>
	);
};

export default Scroll;
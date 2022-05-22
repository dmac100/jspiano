import React from 'react';
import * as opensheetmusicdisplay from 'opensheetmusicdisplay';
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

	React.useEffect(() => {
		scrollRef.current.scrollLeft = props.position;
		if(!prevProps || props.musicXml !== prevProps.musicXml) {
			renderSvg();
		}
	});

	function renderSvg() {
		const score = scoreRef.current;

		if(props.musicXml) {
			score.innerHTML = '';

			var osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(scoreRef.current, {
				backend: 'svg',
				autoResize: false,
				drawTitle: false
			});

			osmd.load(props.musicXml.xml)
				.then(osmd.render());
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
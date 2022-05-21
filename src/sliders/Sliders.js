import React from 'react';
import './Sliders.css';

import ReactSlider from 'react-slider'

const Sliders = (props) => {
	return (
		<div className="sliders">
			<div className="sliderGroup">
				<label>Tempo:</label>
				<ReactSlider className="slider" thumbClassName="sliderThumb" trackClassName="sliderTrack" onChange={props.onTempoChange} defaultValue={50}/>
			</div>
			<div className="sliderGroup">
				<label>Scale:</label>
				<ReactSlider className="slider" thumbClassName="sliderThumb" trackClassName="sliderTrack" onChange={props.onScaleChange} defaultValue={50}/>
			</div>
		</div>
	);
};

export default Sliders;
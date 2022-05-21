import React from 'react';
import './Tracks.css';

const Track = (props) => {
	function onActiveChange() {
		props.onChange({
			...props.track,
			active: !props.track.active
		});
	}

	function onWaitChange() {
		props.onChange({
			...props.track,
			wait: !props.track.wait
		});
	}

	return (
		<div className="track">
			<b>{props.track.name} </b>
			<b>({props.track.id}) </b>
			<label> Active: </label><input type="checkbox" checked={props.track.active} onChange={onActiveChange}/>
			<label> Wait: </label><input type="checkbox" checked={props.track.wait} onChange={onWaitChange}/>
		</div>
	);
};

const Tracks = (props) => {
	return (
		<div className="tracks">
			{props.tracks.map(track => <Track key={track.id} track={track} onChange={track => props.onChange(track)}/>)}
		</div>
	);
};

export default Tracks;
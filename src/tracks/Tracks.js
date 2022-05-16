import React from 'react';
import './Tracks.css';

const Track = (props) => {
	function onActiveChange() {
		props.onChange({
			...props.track,
			active: !props.track.active
		});
	}

	return (
		<div className="track">
			<b>{props.track.name} </b>
			<label>Active: </label><input type="checkbox" checked={props.track.active} onChange={onActiveChange}/>
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
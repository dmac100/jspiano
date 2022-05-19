import React from 'react';
import './App.css';

import raw from "raw.macro";
import Pitch from './model/pitch.js';
import Keyboard from './keyboard/Keyboard.js';
import Scroll from './scroll/Scroll.js';
import Score from './score/Score.js';
import Tracks from './tracks/Tracks.js';
import MusicXmlParser from './parser/musicXmlParser.js';

const musicXml = MusicXmlParser.parse(raw("./testfiles/Chopin - Nocturne 9-2.xml"));

function getPlayingNotes(musicXml, position) {
	const playingNotes = [];

	musicXml.notes.forEach(note => {
		if(note.startTime <= position && note.startTime + note.duration > position) {
			playingNotes.push(note);
		}
	});

	return playingNotes;
}

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			position: 0,
			tracks: this.createTracks(),
			musicXml: musicXml,
			playingNotes: []
		}

		this.onPositionChanged = this.onPositionChanged.bind(this);
		this.createTracks = this.createTracks.bind(this);
		this.onTrackChange = this.onTrackChange.bind(this);
		this.onKeyClicked = this.onKeyClicked.bind(this);
	}

	createTracks() {
		return [
			{ id: 1, name: "Right", active: true },
			{ id: 2, name: "Left", active: false }
		];
	}

	onKeyClicked(pitch) {
		console.log("CLICKED: ", pitch);
	}

	onTrackChange(track) {
		this.setState(prevState => ({
			tracks: prevState.tracks.map(t => (t.id === track.id) ? track : t)
		}));
	}

	onPositionChanged(position) {
		this.setState(prevState => ({
			position: position,
			playingNotes: getPlayingNotes(prevState.musicXml, position)
		}));
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<Tracks tracks={this.state.tracks} onChange={this.onTrackChange}/>
					<Score tracks={this.state.tracks} position={this.state.position} onScroll={this.onPositionChanged} musicXml={this.state.musicXml}/>
					<Scroll tracks={this.state.tracks} position={this.state.position} onScroll={this.onPositionChanged} musicXml={this.state.musicXml}/>
					<Keyboard playingNotes={this.state.playingNotes} onClick={this.onKeyClicked}/>
				</header>
			</div>
		);
	}
}

export default App;
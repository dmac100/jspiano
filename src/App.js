import React from 'react';
import './App.css';

import raw from "raw.macro";
import Pitch from './model/pitch.js';
import Keyboard from './keyboard/Keyboard.js';
import Scroll from './scroll/Scroll.js';
import Score from './score/Score.js';
import Tracks from './tracks/Tracks.js';
import Controls from './controls/Controls.js';
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

class PlayTimer {
	constructor() {
		this.timer = null;
	}

	startTimer() {
		this.stopTimer();

		this.timer = setInterval(() => {
			if(this.advanceCallback) {
				this.advanceCallback(5);
			}
		}, 10);
	}

	stopTimer() {
		if(this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	}

	setAdvanceCallback(callback) {
		this.advanceCallback = callback;
	}

}

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			position: 0,
			tracks: this.createTracks(),
			musicXml: musicXml,
			playingNotes: [],
			playing: false
		}

		this.onPositionChanged = this.onPositionChanged.bind(this);
		this.createTracks = this.createTracks.bind(this);
		this.onTrackChange = this.onTrackChange.bind(this);
		this.onKeyClicked = this.onKeyClicked.bind(this);
		this.togglePlay = this.togglePlay.bind(this);
		this.advance = this.advance.bind(this);

		this.playTimer = new PlayTimer();
		this.playTimer.setAdvanceCallback(this.advance);
	}

	advance(amount) {
		if(!this.state.playing) {
			this.playTimer.stopTimer();
		}

		this.setState(prevState => ({
			position: prevState.position + amount,
			playing: (prevState.position + amount >= prevState.musicXml.length) ? false : prevState.playing
		}));
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

	togglePlay() {
		if(this.state.playing) {
			this.setState({playing: false});
			this.playTimer.stopTimer();
		} else {
			this.setState({playing: true});
			this.playTimer.startTimer();
		}
	}

	render() {
		return (
			<div className="App">
				<div className="topContent">
					<Tracks tracks={this.state.tracks} onChange={this.onTrackChange}/>
				</div>
				{/*<Score tracks={this.state.tracks} position={this.state.position} onScroll={this.onPositionChanged} musicXml={this.state.musicXml}/>*/}

				<Scroll tracks={this.state.tracks} position={this.state.position} onScroll={this.onPositionChanged} musicXml={this.state.musicXml}/>

				<div className="bottomContent">
					<Keyboard playingNotes={this.state.playingNotes} onClick={this.onKeyClicked}/>
					<Controls onPlay={this.togglePlay} playing={this.state.playing}/>
				</div>
			</div>
		);
	}
}

export default App;
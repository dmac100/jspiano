import React from 'react';
import './App.css';
import raw from 'raw.macro';
import _ from 'underscore';

import Pitch from './model/pitch.js';
import Keyboard from './keyboard/Keyboard.js';
import Scroll from './scroll/Scroll.js';
import Score from './score/Score.js';
import Tracks from './tracks/Tracks.js';
import Controls from './controls/Controls.js';
import MusicXmlParser from './parser/musicXmlParser.js';
import Sliders from './sliders/Sliders.js';

const musicXml = MusicXmlParser.parse(raw("./testfiles/Chopin - Nocturne 9-2.xml"));

function getPlayingNotes(musicXml, tracks, position) {
	const activeTracks = new Set(tracks.filter(track => track.active).map(track => track.id));

	return musicXml.notes.filter(note => {
		if(!activeTracks.has(note.part.partId)) return false;

		return (note.startTime <= position && note.startTime + note.duration > position);
	});
}

function getWaitingNotes(musicXml, tracks, prevPosition, position) {
	const waitingTracks = new Set(tracks.filter(track => track.wait).map(track => track.id));

	const waitingNotes = musicXml.notes.filter(note => {
		if(!waitingTracks.has(note.part.partId)) return false;

		return (note.startTime > prevPosition && note.startTime <= position);
	});

	return _.uniq(waitingNotes, false, note => note.pitch.getMidiNumber());
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

function getActiveTracks(tracks) {
	return new Set(tracks.filter(track => track.active).map(track => track.id));
}

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			position: 0,
			tracks: this.createTracks(musicXml),
			musicXml: musicXml,
			playingNotes: [],
			waitingNotes: [],
			playing: false,
			tempo: 20,
			scale: 20
		};

		this.onPositionChanged = this.onPositionChanged.bind(this);
		this.createTracks = this.createTracks.bind(this);
		this.onTrackChange = this.onTrackChange.bind(this);
		this.onKeyClicked = this.onKeyClicked.bind(this);
		this.togglePlay = this.togglePlay.bind(this);
		this.advance = this.advance.bind(this);
		this.onKeyDown = this.onKeyDown.bind(this);
		this.setPositionSmooth = this.setPositionSmooth.bind(this);
		this.onTempoChange = this.onTempoChange.bind(this);
		this.onScaleChange = this.onScaleChange.bind(this);

		this.playTimer = new PlayTimer();
		this.playTimer.setAdvanceCallback(this.advance);
	}

	advance(amount) {
		if(!this.state.playing) {
			this.playTimer.stopTimer();
		}

		const tempo = this.state.tempo / 50;

		if(this.state.waitingNotes.length == 0) {
			this.setState(prevState => ({
				position: Math.round(prevState.position + (amount * tempo)),
				waitingNotes: getWaitingNotes(prevState.musicXml, prevState.tracks, prevState.position, prevState.position + (amount * tempo)),
				playing: (prevState.position + (amount * tempo) >= prevState.musicXml.length) ? false : prevState.playing
			}));
		}
	}

	createTracks(musicXml) {
		let parts = musicXml.notes.map(note => note.part);
		parts = _.uniq(parts, false, part => part.partId);
		parts = _.sortBy(parts, part => part.partId);

		return parts.map(part => ({
			id: part.partId,
			name: part.partName,
			active: true,
			wait: false
		}));
	}

	onKeyClicked(pitch) {
		this.setState(prevState => ({
			waitingNotes: prevState.waitingNotes.filter(note => !note.pitch.equals(pitch))
		}));
	}

	onTrackChange(track) {
		this.setState(prevState => ({
			tracks: prevState.tracks.map(t => (t.id === track.id) ? track : t)
		}));
	}

	onPositionChanged(position) {
		this.setState(prevState => ({
			position: Math.round(position),
			playingNotes: getPlayingNotes(prevState.musicXml, prevState.tracks, position)
		}));
	}

	togglePlay() {
		this.setState({
			playing: !this.state.playing,
			waitingNotes: []
		});

		if(this.state.playing) {
			this.playTimer.stopTimer();
		} else {
			this.playTimer.startTimer();
		}
	}

	onKeyDown(event) {
		if(!this.state.musicXml) return;

		const SPACE = 32;
		const PAGE_UP = 33;
		const PAGE_DOWN = 34;
		const HOME = 36;
		const END = 35;
		const ARROW_LEFT = 37;
		const ARROW_UP = 38;
		const ARROW_RIGHT = 39;
		const ARROW_DOWN = 40;

		if(event.keyCode === SPACE) {
			this.togglePlay();
		}

		const activeTracks = getActiveTracks(this.state.tracks);

		// Move to previous or next note on arrow up and down.
		if(event.keyCode === ARROW_UP || event.keyCode === ARROW_DOWN) {
			let position = null;
			for(let note of this.state.musicXml.notes) {
				if(activeTracks.has(note.part.partId)) {
					if(event.keyCode === ARROW_UP) {
						if(note.startTime > this.state.position) {
							if(!position || note.startTime < position) {
								position = note.startTime;
							}
						}
					} else if(event.keyCode === ARROW_DOWN) {
						if(note.startTime < this.state.position) {
							if(!position || note.startTime > position) {
								position = note.startTime;
							}
						}
					}
				}
			}

			if(position) {
				this.setPositionSmooth(position);
			}
		}

		// Move to previous or next measure on arrow left and right.
		if(event.keyCode === ARROW_LEFT || event.keyCode === ARROW_RIGHT) {
			let position = null;
			for(let measure of this.state.musicXml.measures) {
				if(event.keyCode === ARROW_LEFT) {
					if(measure.startTime < this.state.position) {
						if(!position || measure.startTime > position) {
							position = measure.startTime;
						}
					}
				} else if(event.keyCode === ARROW_RIGHT) {
					if(measure.startTime > this.state.position) {
						if(!position || measure.startTime < position) {
							position = measure.startTime;
						}
					}
				}
			}

			if(position) {
				this.setPositionSmooth(position);
			}
		}

		// Move to beginning or end on home and end.
		if(event.keyCode === HOME) {
			this.setPositionSmooth(0);
		} else if(event.keyCode === END) {
			this.setPositionSmooth(musicXml.length);
		}

		// Jump back or forward on page up and down.
		if(event.keyCode === PAGE_UP) {
			this.setPositionSmooth(this.state.position - this.state.musicXml.length / 20);
		} else if(event.keyCode === PAGE_DOWN) {
			this.setPositionSmooth(this.state.position + this.state.musicXml.length / 20);
		}
	}

	setPositionSmooth(newPosition) {
		var position = this.state.position;

		// Change position from current position to new position in steps.
		var steps = 10;
		var change = (newPosition - position) / steps;

		function scroll() {
			if(--steps >= 0) {
				position += change;
				this.setState({ position: Math.round(position) });
			} else {
				clearInterval(timer);
			}
		}

		const timer = setInterval(scroll.bind(this), 5);
	}

	onTempoChange(value) {
		this.setState({ tempo: value });
	}

	onScaleChange(value) {
		this.setState({ scale: value });
	}

	render() {
		return (
			<div className="App" onKeyDown={this.onKeyDown} tabIndex="0">
				<div className="topContent">
					<Tracks tracks={this.state.tracks} onChange={this.onTrackChange}/>
					<Sliders onTempoChange={this.onTempoChange} onScaleChange={this.onScaleChange} tempo={this.state.tempo} scale={this.state.scale}/>
				</div>
				{/*<Score tracks={this.state.tracks} position={this.state.position} onScroll={this.onPositionChanged} musicXml={this.state.musicXml}/>*/}

				<Scroll tracks={this.state.tracks} position={this.state.position} onScroll={this.onPositionChanged} musicXml={this.state.musicXml} scale={this.state.scale}/>

				<div className="bottomContent">
					<Keyboard tracks={this.state.tracks} playingNotes={this.state.playingNotes} waitingNotes={this.state.waitingNotes} onClick={this.onKeyClicked} onKeyUp={this.onKeyUp}/>
					<Controls onPlay={this.togglePlay} playing={this.state.playing}/>
				</div>
			</div>
		);
	}
}

export default App;
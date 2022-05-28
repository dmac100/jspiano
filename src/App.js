import React from 'react';
import raw from 'raw.macro';
import _ from 'underscore';
import Split from 'react-split';

import './App.css';

import Pitch from './model/pitch.js';
import Keyboard from './keyboard/Keyboard.js';
import Scroll from './scroll/Scroll.js';
import Score from './score/Score.js';
import Tracks from './tracks/Tracks.js';
import TopButtons from './controls/TopButtons.js';
import BottomButtons from './controls/BottomButtons.js';
import MusicXmlParser from './parser/musicXmlParser.js';
import Sliders from './sliders/Sliders.js';
import {playMidiNote, addMidiNoteOnListener, addMidiNoteOffListener} from './controls/MidiSetup.js';

const musicXml = MusicXmlParser.parse(raw("./testfiles/Chopin - Nocturne 9-2.xml"));

function getPlayingNotes(musicXml, tracks, position) {
	const activeTracks = getActiveTracks(tracks);

	return musicXml.notes.filter(note => {
		if(!activeTracks.has(note.part.partId)) return false;

		return (note.startTime <= position && note.startTime + note.duration > position);
	});
}

function getWaitingNotes(musicXml, tracks, prevPosition, position) {
	const waitingTracks = getWaitingTracks(tracks);

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
				this.advanceCallback(4);
			}
		}, 50);
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

function getWaitingTracks(tracks) {
	return new Set(tracks.filter(track => track.wait).map(track => track.id));
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
			midiOnNotes: [],
			playing: false,
			tempo: 20,
			scale: 20,
			showScore: true,
			showScroll: true
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
		this.onToggleShowScroll = this.onToggleShowScroll.bind(this);
		this.onToggleShowScore = this.onToggleShowScore.bind(this);
		this.onNoteOn = this.onNoteOn.bind(this);
		this.onNoteOff = this.onNoteOff.bind(this);

		this.playTimer = new PlayTimer();
		this.playTimer.setAdvanceCallback(this.advance);

		addMidiNoteOnListener(this.onNoteOn);
		addMidiNoteOffListener(this.onNoteOff);
	}

	playNotes(musicXml, prevPosition, position) {
		const waitingTracks = getWaitingTracks(this.state.tracks);

		// Play the new notes started between prevPosition and position that aren't in a wait track.
		let notes = musicXml.notes.filter(note => {
			if(waitingTracks.has(note.part.partId)) return false;

			return (note.startTime > prevPosition && note.startTime <= position);
		});

		notes = _.uniq(notes, false, note => note.pitch.getMidiNumber());

		notes.forEach(note => {
			playMidiNote(note.pitch);
		});
	}

	playNotesAtPosition(musicXml, position) {
		// Play notes that begin at position
		let notes = musicXml.notes.filter(note => {
			return (note.startTime >= position - 1 && note.startTime <= position + 1);
		});

		notes = _.uniq(notes, false, note => note.pitch.getMidiNumber());

		notes.forEach(note => {
			playMidiNote(note.pitch);
		});
	}

	advance(amount) {
		if(!this.state.playing) {
			this.playTimer.stopTimer();
		}

		const tempo = this.state.tempo / 50;

		this.playNotes(this.state.musicXml, this.state.position, this.state.position + (amount * tempo));

		if(this.state.waitingNotes.length == 0) {
			this.setState(prevState => {
				const newPosition = Math.round(prevState.position + (amount * tempo));
				return {
					position: newPosition,
					waitingNotes: getWaitingNotes(
						prevState.musicXml,
						prevState.tracks,
						Math.max(prevState.minWaitingPosition, prevState.position),
						newPosition
					),
					playingNotes: getPlayingNotes(prevState.musicXml, prevState.tracks, newPosition),
					minWaitingPosition: (newPosition < prevState.minWaitingPosition - 5) ? newPosition : Math.max(prevState.minWaitingPosition, newPosition),
					playing: (prevState.position + (amount * tempo) >= prevState.musicXml.length) ? false : prevState.playing
				}
			});
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
		playMidiNote(pitch);
		this.onNoteOn(pitch);
	}

	onNoteOn(pitch) {
		this.setState(prevState => ({
			waitingNotes: prevState.waitingNotes.filter(note => !note.pitch.equals(pitch)),
			midiOnNotes: _.uniq(prevState.midiOnNotes.concat([pitch.getMidiNumber()]))
		}));
	}

	onNoteOff(pitch) {
		this.setState(prevState => ({
			midiOnNotes: prevState.midiOnNotes.filter(note => note !== pitch.getMidiNumber())
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
			waitingNotes: [],
			minWaitingPosition: this.state.position
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
			event.preventDefault();
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
					if(measure.startTime > this.state.position + 1) {
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
				this.setState(prevState => ({
					position: Math.round(position),
					waitingNotes: [],
					minWaitingPosition: 0,
					playingNotes: getPlayingNotes(prevState.musicXml, prevState.tracks, position)
				}));
			} else {
				this.playNotesAtPosition(this.state.musicXml, newPosition);
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

	onToggleShowScore() {
		this.setState(prevState => ({ showScore: !prevState.showScore || !prevState.showScroll }));
	}

	onToggleShowScroll() {
		this.setState(prevState => ({ showScroll: !prevState.showScroll || !prevState.showScore }));
	}

	render() {
		let middleContent = <div/>;

		let score = <div/>;
		let scroll = <div/>;

		if(this.state.showScore) {
			score = (<Score tracks={this.state.tracks} position={this.state.position} onScroll={this.onPositionChanged} musicXml={this.state.musicXml}/>);
		}

		if(this.state.showScroll) {
			scroll = (<Scroll tracks={this.state.tracks} position={this.state.position} onScroll={this.onPositionChanged} musicXml={this.state.musicXml} scale={this.state.scale}/>);
		}

		if(this.state.showScore && this.state.showScroll) {
			middleContent = (
				<Split className="split" direction="vertical" gutterSize={7} minSize={0}>
					{score}
					{scroll}
				</Split>
			);
		} else {
			middleContent = this.state.showScore ? score : scroll;

			if(this.state.showScore && this.state.showScroll) {
				middleContent = (
					<Split className="split" direction="vertical" gutterSize={7} minSize={0}>
						{middleContent}
					</Split>
				);
			}
		}

		return (
			<div className="App" onKeyDown={this.onKeyDown} tabIndex="0">
				<div className="topContent">
					<Tracks tracks={this.state.tracks} onChange={this.onTrackChange}/>
					<TopButtons showScroll={this.state.showScroll} showScore={this.state.showScore} onToggleShowScore={this.onToggleShowScore} onToggleShowScroll={this.onToggleShowScroll}/>
					<Sliders onTempoChange={this.onTempoChange} onScaleChange={this.onScaleChange} tempo={this.state.tempo} scale={this.state.scale}/>
				</div>

				{middleContent}

				<div className="bottomContent">
					<Keyboard tracks={this.state.tracks} playingNotes={this.state.playingNotes} waitingNotes={this.state.waitingNotes} midiOnNotes={this.state.midiOnNotes} onClick={this.onKeyClicked} onKeyUp={this.onKeyUp}/>
					<BottomButtons onPlay={this.togglePlay} playing={this.state.playing}/>
				</div>
			</div>
		);
	}
}

export default App;
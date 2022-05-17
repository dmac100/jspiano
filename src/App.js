import React from 'react';
import './App.css';

import Keyboard from './keyboard/Keyboard.js';
import Scroll from './scroll/Scroll.js';
import Score from './score/Score.js';
import Tracks from './tracks/Tracks.js';

class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			position: 0,
			rects: this.loadRects(),
			tracks: this.createTracks()
		}

		this.onPositionChanged = this.onPositionChanged.bind(this);
		this.createTracks = this.createTracks.bind(this);
		this.onTrackChange = this.onTrackChange.bind(this);
	}

	createTracks() {
		return [
			{ id: 1, name: "Right", active: true },
			{ id: 2, name: "Left", active: false }
		];
	}

	loadRects() {
		const rects = [];

		for(let i = 0; i < 200; i++) {
			rects.push({x: 60, y: 50 + i * 1000, color: '#ccaaaa'});
			rects.push({x: 300, y: 300 + i * 1000, color: '#ccccaa'});
			rects.push({x: 700, y: 700 + i * 1000, color: '#ccaacc'});
		}

		return rects;
	}

	onTrackChange(track) {
		this.setState(prevState => ({
			tracks: prevState.tracks.map(t => (t.id === track.id) ? track : t)
		}));
	}

	onPositionChanged(position) {
		this.setState({
			position: position
		});
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<Tracks tracks={this.state.tracks} onChange={this.onTrackChange}/>
					<Score tracks={this.state.tracks} position={this.state.position} onScroll={this.onPositionChanged} rects={this.state.rects}/>
					<Scroll tracks={this.state.tracks} position={this.state.position} onScroll={this.onPositionChanged} rects={this.state.rects}/>
					<Keyboard/>
				</header>
			</div>
		);
	}
}

export default App;
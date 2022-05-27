import {WebMidi} from 'webmidi';
import './MidiSetup.css';
import Pitch from '../model/pitch.js';

let midiInput = null;
let midiOutput = null;

const midiInputs = [];
const midiOutputs = [];

const noteOnListeners = [];

WebMidi.enable().then(function() {
	WebMidi.inputs.forEach(device => midiInputs.push(device));
	WebMidi.outputs.forEach(device => midiOutputs.push(device));
});

function playMidiNote(pitch) {
	if(midiOutput) {
		midiOutput.channels[1].sendNoteOn(pitch.getMidiNumber());
	}
}

function addMidiNoteOnListener(listener) {
	noteOnListeners.push(listener);
}

function onNoteOn(pitch) {
	noteOnListeners.forEach(listener => listener(pitch));
}

const MidiSetup = (props) => {
	function onSelectInput(event) {
		const selectedIndex = event.target.selectedIndex;
		if(selectedIndex >= 1) {
			if(midiInput) {
				midiInput.removeListener();
			}
			midiInput = midiInputs[selectedIndex - 1];
			midiInput.addListener("noteon", e => onNoteOn(new Pitch(e.note.number)));
		} else {
			midiInput = null;
		}
	}

	function onSelectOutput(event) {
		const selectedIndex = event.target.selectedIndex;
		if(selectedIndex >= 1) {
			midiOutput = midiOutputs[selectedIndex - 1];
		} else {
			midiOutput = null;
		}
	}

	return (
		<div className="midiSelect">
			<div>
				<label>MIDI Input: </label>
				<select onChange={onSelectInput} defaultValue={midiInput ? midiInput.name : ''}>
					<option></option>
					{midiInputs.map((device, index) => <option key={index} value={device.name}>{device.name}</option>)}
				</select>
			</div>

			<div>
				<label>MIDI Output: </label>
				<select onChange={onSelectOutput} defaultValue={midiOutput  ? midiOutput.name : ''}>
					<option></option>
					{midiOutputs.map((device, index) => <option key={index} value={device.name}>{device.name}</option>)}
				</select>
			</div>
		</div>
	);
};

export {playMidiNote, addMidiNoteOnListener};
export default MidiSetup;
const noteNames = "C, C#, D, D#, E, F, F#, G, G#, A, A#, B".split(", ");

class Pitch {
	/**
	 * Creates a new pitch from a noteName.
	 * @param noteName The name of the note with an octave such as: 'A#0', 'C4'.
	 */
	constructor(param) {
		if(param instanceof String || typeof param == 'string') {
			const noteName = param;
			const octave = noteName.charAt(noteName.length - 1) - '0';
			const name = noteName.substring(0, noteName.length - 1);
			
			const note = noteNames.indexOf(name.toUpperCase());
			
			if(octave < 0 || octave > 8) throw new Error("Invalid note");
			if(note < 0) throw new Error("Invalid note");
			
			this.midiNumber = octave * 12 + note + 12;
		} else if(param instanceof Pitch) {
			const pitch = param;
			this.midiNumber = pitch.midiNumber;
		} else {
			const midiNumber = param;
			this.midiNumber = +midiNumber;
		}
	}
	
	/**
	 * Returns the midi number for the pitch.
	 */
	getMidiNumber() {
		return this.midiNumber;
	}

	/**
	 * Returns the octave of the pitch.
	 */
	getOctave() {
		return Math.floor((this.midiNumber - 12 + 60) / 12 - (60 / 12));
	}

	/**
	 * Returns whether this would be a black key if played on a keyboard. 
	 */
	isBlackKey() {
		return this.getNoteName().indexOf("#") !== -1;
	}
	
	/**
	 * Returns the note name without the octave. For example: 'C' or 'D#'.
	 */
	getNoteName() {
		const name = (this.midiNumber - 12 + 60) % 12;
		return noteNames[name];
	}

	/**
	 * Returns the note name with the octave. For example: 'A#0' or 'C4'.
	 */
	getFullNoteName() {
		return this.getNoteName() + this.getOctave();
	}

	/**
	 * Return the pitch that is a semitone higher than this one.
	 */
	nextSemitone() {
		return new Pitch(this.midiNumber + 1);
	}

	/**
	 * Return the pitch that is a semitone lower than this one.
	 */
	previousSemitone() {
		return new Pitch(this.midiNumber - 1);
	}
	
	/**
	 * Returns the pitch transposed by the given amount.
	 */
	transpose(transpose) {
		return new Pitch(this.midiNumber + transpose);
	}

	/**
	 * Compares this pitch with another. Two pitches are equal if they have the same midi number.
	 */
	equals(other) {
		return (other instanceof Pitch && this.midiNumber === other.midiNumber);
	}

	isAbove(pitch) {
		return this.midiNumber > pitch.midiNumber;
	}
	
	isBelow(pitch) {
		return this.midiNumber < pitch.midiNumber;
	}
	
	/**
	 * Returns the position this note would appear on the grand staff relative to middle C.
	 * For example: 'C4' and 'C#4' return 0, 'D4' and 'D#4' return 1, 'B3' returns -1.
	 */
	getStaffPosition() {
		const letter = this.getNoteName().charAt(0);
		let distance = letter.charCodeAt(0) - 'C'.charCodeAt(0);
		if(letter < 'C') distance += 7;

		distance += (this.getOctave() - 4) * 7;
		
		return distance;
	}
	
	toString() {
		return this.getNoteName();
	}
}

export default Pitch;
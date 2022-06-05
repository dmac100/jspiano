import $ from "jquery";

import Pitch from "../model/pitch.js";

class MusicXmlParser {
	static parse(musicXml) {
		const notes = [];
		let measures = [];

		const xml = $.parseXML(musicXml);

		const scoreParts = new Map();

		$(xml).find("score-part").each((index, scorePart) => {
			const partId = $(scorePart).attr("id");
			const partName = $(scorePart).children("part-name").text().trim();
			const partAbbreviation = $(scorePart).children("part-abbreviation").text().trim();
			scoreParts.set(partId, { index, partId, partName, partAbbreviation });
		});

		$(xml).find("part").each((_, part) => {
			const partId = $(part).attr("id");

			let wholeNoteStartTime = 0;
			let prevWholeNoteStartTime = 0;
			let startTime = 0;
			let prevStartTime = 0;
			let tied = false;
			let beats = 4;
			let divisions = 120;

			measures = [];

			$(part).find("measure").each((measureIndex, measure) => {
				measures.push({index: measureIndex, startTime: startTime, beats: beats});

				$(measure).children().each((childIndex, child) => {
					if(child.tagName === 'attributes') {
						const attributeDivisions = +$(child).children("divisions").text();
						const attributeBeats = +$(child).find("beats").text();
						if(attributeBeats > 0) {
							beats = attributeBeats;
							measures[measures.length - 1].beats = beats;
						}
						if(attributeDivisions > 0) {
							divisions = attributeDivisions;
						}
					} if(child.tagName === 'note') {
						const duration = +$(child).children("duration").text();

						const pitch = $(child).find("pitch");

						const chord = $(child).find("chord");

						if(chord.length > 0) {
							startTime = prevStartTime;
							wholeNoteStartTime = prevWholeNoteStartTime;
						}

						if(pitch.length > 0 && duration > 0) {
							const step = $(pitch).find("step").text().trim();
							const alter = $(pitch).find("alter").text().trim();
							const octave = $(pitch).find("octave").text().trim();

							if(tied) {
								notes[notes.length - 1].duration += duration;
							} else {
								notes.push({
									pitch: new Pitch(step + octave).transpose(+alter),
									wholeNoteStartTime: wholeNoteStartTime,
									startTime: startTime,
									duration: duration,
									part: scoreParts.get(partId),
									measure: measureIndex
								});
							}
						}

						prevStartTime = startTime;
						startTime += duration;

						prevWholeNoteStartTime = wholeNoteStartTime;
						wholeNoteStartTime += (duration / divisions) / 4;

						const tie = $(child).find("tie");
						if(tie.length > 0) {
							const tieType = $(tie).attr("type");
							if(tieType === 'start') {
								tied = true;
							} else if(tieType === 'stop') {
								tied = false;
							}
						}
					} else if(child.tagName === 'backup') {
						const duration = +$(child).children("duration").text();
						startTime -= duration;
						wholeNoteStartTime -= (duration / divisions) / 4;
					} else if(child.tagName === 'forward') {
						const duration = +$(child).children("duration").text();
						startTime += duration;
						wholeNoteStartTime += (duration / divisions) / 4;

					}
				});

				measures[measures.length - 1].endTime = startTime;
			});
		});

		const length = notes.reduce((max, note) => Math.max(max, note.startTime + note.duration), 0)

		return { notes, measures, length, xml: musicXml };
	}
}

export default MusicXmlParser;
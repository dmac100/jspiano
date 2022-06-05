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

			let startTimeWholeNotes = 0;
			let prevStartTimeWholeNotes = 0;
			let startTimeDivisions = 0;
			let prevStartTimeDivisions = 0;
			let tied = false;
			let beats = 4;
			let divisions = 120;

			measures = [];

			$(part).find("measure").each((measureIndex, measure) => {
				measures.push({index: measureIndex, startTimeDivisions: startTimeDivisions, beats: beats});

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
						const durationDivisions = +$(child).children("duration").text();

						const pitch = $(child).find("pitch");

						const chord = $(child).find("chord");

						if(chord.length > 0) {
							startTimeDivisions = prevStartTimeDivisions;
							startTimeWholeNotes = prevStartTimeWholeNotes;
						}

						if(pitch.length > 0 && durationDivisions > 0) {
							const step = $(pitch).find("step").text().trim();
							const alter = $(pitch).find("alter").text().trim();
							const octave = $(pitch).find("octave").text().trim();

							if(tied) {
								notes[notes.length - 1].durationDivisions += durationDivisions;
							} else {
								notes.push({
									pitch: new Pitch(step + octave).transpose(+alter),
									startTimeWholeNotes,
									startTimeDivisions,
									durationDivisions,
									part: scoreParts.get(partId),
									measure: measureIndex
								});
							}
						}

						prevStartTimeDivisions = startTimeDivisions;
						startTimeDivisions += durationDivisions;

						prevStartTimeWholeNotes = startTimeWholeNotes;
						startTimeWholeNotes += (durationDivisions / divisions) / 4;

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
						const durationDivisions = +$(child).children("duration").text();
						startTimeDivisions -= durationDivisions;
						startTimeWholeNotes -= (durationDivisions / divisions) / 4;
					} else if(child.tagName === 'forward') {
						const durationDivisions = +$(child).children("duration").text();
						startTimeDivisions += durationDivisions;
						startTimeWholeNotes += (durationDivisions / divisions) / 4;

					}
				});

				measures[measures.length - 1].endTimeDivisions = startTimeDivisions;
			});
		});

		const length = notes.reduce((max, note) => Math.max(max, note.startTimeDivisions + note.durationDivisions), 0)

		return { notes, measures, length, xml: musicXml };
	}
}

export default MusicXmlParser;
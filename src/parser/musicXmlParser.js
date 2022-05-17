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

			let startTime = 0;
			let prevStartTime = 0;
			let tied = false;
			let beats = 4;

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
					} if(child.tagName === 'note') {
						const duration = +$(child).children("duration").text();

						const pitch = $(child).find("pitch");

						const chord = $(child).find("chord");

						if(chord.length > 0) {
							startTime = prevStartTime;
						}

						if(pitch.length > 0) {
							const step = $(pitch).find("step").text().trim();
							const alter = $(pitch).find("alter").text().trim();
							const octave = $(pitch).find("octave").text().trim();

							if(tied) {
								notes[notes.length - 1].duration += duration;
							} else {
								notes.push({
									pitch: new Pitch(step + octave).transpose(+alter),
									startTime: startTime,
									duration: duration,
									part: scoreParts.get(partId),
									measure: measureIndex
								});
							}
						}

						prevStartTime = startTime;
						startTime += duration;

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
					} else if(child.tagName === 'forward') {
						const duration = +$(child).children("duration").text();
						startTime += duration;
					}
				});

				measures[measures.length - 1].endTime = startTime;
			});
		});

		return { notes, measures };
	}
}

export default MusicXmlParser;
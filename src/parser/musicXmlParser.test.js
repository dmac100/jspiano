import raw from "raw.macro";

import MusicXmlParser from "./musicXmlParser.js";

test('gets measures and notes', () => {
	const parsed = MusicXmlParser.parse(raw("../testfiles/Chopin - Nocturne 9-2.xml"));

	expect(parsed.measures.length).toBe(36);

	expect(parsed.measures[35]).toEqual({
		index: 35,
		beats: 12,
		startTimeDivisions: 25200,
		endTimeDivisions: 25920
	});

	expect(parsed.notes.length).toBe(1283);

	expect(parsed.notes[parsed.notes.length - 1]).toEqual({
		durationDivisions: 360,
		part: {
			index: 1,
			partAbbreviation: "Pno.",
			partId: "P2",
			partName: "Piano"
		},
		measure: 35,
		pitch: {
			midiNumber: 46
		},
		startTimeWholeNotes: 53.25,
		startTimeDivisions: 25560
	});

	expect(parsed.length).toBe(25920);
});
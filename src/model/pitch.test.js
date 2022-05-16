import { render, screen } from '@testing-library/react';
import Pitch from './pitch.js';

test('creates a new pitch from name', () => {
	expect(new Pitch("C4").getMidiNumber()).toBe(60);
});

test('creates a new pitch from midi number', () => {
	expect(new Pitch(60).getMidiNumber()).toBe(60);
});

test('creates a new pitch from another pitch', () => {
	expect(new Pitch(new Pitch(60)).getMidiNumber()).toBe(60);
});

test('has note names', () => {
	expect(new Pitch(60).getFullNoteName()).toBe("C4");
	expect(new Pitch(61).getFullNoteName()).toBe("C#4");
	expect(new Pitch(62).getFullNoteName()).toBe("D4");

	expect(new Pitch(60).getNoteName()).toBe("C");
	expect(new Pitch(61).getNoteName()).toBe("C#");
	expect(new Pitch(62).getNoteName()).toBe("D");
});

test('has black keys', () => {
	expect(new Pitch("C4").isBlackKey()).toBe(false);
	expect(new Pitch("C#4").isBlackKey()).toBe(true);
});

test('has octaves', () => {
	expect(new Pitch(60).getOctave()).toBe(4);
	expect(new Pitch(50).getOctave()).toBe(3);
	expect(new Pitch(40).getOctave()).toBe(2);
});

test('equals', () => {
	expect(new Pitch(60).equals(new Pitch(60))).toBe(true);
	expect(new Pitch(60).equals(new Pitch(61))).toBe(false);
});

test('has next semitone', () => {
	expect(new Pitch(60).nextSemitone().equals(new Pitch(61))).toBe(true);
});

test('has previous semitone', () => {
	expect(new Pitch(60).previousSemitone().equals(new Pitch(59))).toBe(true);
});

test('can transpose', () => {
	expect(new Pitch(60).transpose(5).equals(new Pitch(65))).toBe(true);
});

test('is above or below a pitch', () => {
	expect(new Pitch(60).isAbove(new Pitch(50))).toBe(true);
	expect(new Pitch(60).isAbove(new Pitch(70))).toBe(false);

	expect(new Pitch(60).isBelow(new Pitch(50))).toBe(false);
	expect(new Pitch(60).isBelow(new Pitch(70))).toBe(true);
});

test('has staff position', () => {
	expect(new Pitch("A3").getStaffPosition()).toBe(-2);
	expect(new Pitch("A#3").getStaffPosition()).toBe(-2);
	expect(new Pitch("B3").getStaffPosition()).toBe(-1);
	expect(new Pitch("C4").getStaffPosition()).toBe(0);
	expect(new Pitch("C#4").getStaffPosition()).toBe(0);
	expect(new Pitch("D4").getStaffPosition()).toBe(1);
});
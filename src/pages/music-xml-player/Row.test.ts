import { describe, it, expect, beforeEach } from 'vitest';
import { Row, chromatic } from './Row';

describe('Row Class', () => {
  let row; //: Row;
  const set = [
    { pc: 0, octave: 4 },
    { pc: 1, octave: 4 },
    { pc: 2, octave: 4 },
    { pc: 3, octave: 4 },
    { pc: 4, octave: 4 },
    { pc: 5, octave: 4 },
    { pc: 6, octave: 4 },
    { pc: 7, octave: 4 },
    { pc: 8, octave: 4 },
    { pc: 9, octave: 4 },
    { pc: 10, octave: 4 },
    { pc: 11, octave: 4 },
  ];
  const range = Array.from({ length: 12 }, (_, i) => i);

  // Arrange: Initialize a fresh instance before every test
  beforeEach(() => {
    row = new Row();
  });

  describe.skip('Constructor & Getter', () => {
    it('should initialize with the provided constructor value', () => {
      expect(row.current).toBe(10);
    });
  });
  describe('Constructor', () => {
    it('should initialize default correctly', () => {
      const row = new Row();
      expect(row.row).toEqual(expect.arrayContaining(set));
      expect(row.row.length).toEqual(12);
    });
    it('should initialize correctly', () => {
      const row = new Row([0, 4, 7]);

      expect(row.row).toEqual([
        { pc: 0, octave: 4 },
        { pc: 4, octave: 4 },
        { pc: 7, octave: 4 },
      ]);
    });
  });
  describe('multiply()', () => {
    it('should multiply by 5', () => {
      const row = new Row(range);
      row.multiply(5);
      expect(row.row).toEqual([
        { pc: 0, octave: 4 },
        { pc: 5, octave: 4 },
        { pc: 10, octave: 4 },
        { pc: 3, octave: 4 },
        { pc: 8, octave: 4 },
        { pc: 1, octave: 4 },
        { pc: 6, octave: 4 },
        { pc: 11, octave: 4 },
        { pc: 4, octave: 4 },
        { pc: 9, octave: 4 },
        { pc: 2, octave: 4 },
        { pc: 7, octave: 4 },
      ]);
    });
  });
  describe('pitches()', () => {
    const row = new Row(range);
    expect(row.pitches()).toEqual(chromatic);
  });
  describe.skip('invert()', () => {
  });
  describe.skip('transpose()', () => {
  });
  describe.skip('reverse()', () => {
  });
  describe.skip('Combined Operations', () => {
    it('should handle sequential mutations correctly', () => {
      row.add(2).multiply(2); // (10 + 2) * 2
      expect(row.current).toBe(24);
    });
  });
});

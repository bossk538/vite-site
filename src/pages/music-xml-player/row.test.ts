import { Row } from './row';

const jestApi = globalThis as unknown as {
  describe?: (name: string, fn: () => void) => void;
  it?: (name: string, fn: () => void) => void;
  expect?: (actual: unknown) => any;
};

if (jestApi.describe && jestApi.it && jestApi.expect) {
  jestApi.describe('Row', () => {
    jestApi.it!('creates rows from pitch classes and clones independently', () => {
      const row = new Row([0, 4, 7]);
      const clone = row.clone();

      jestApi.expect!(row.row).toEqual([
        { pc: 0, octave: 4 },
        { pc: 4, octave: 4 },
        { pc: 7, octave: 4 },
      ]);
      clone.reverse();
      jestApi.expect!(row.row.map(({ pc }) => pc)).toEqual([0, 4, 7]);
      jestApi.expect!(clone.row.map(({ pc }) => pc)).toEqual([7, 4, 0]);
    });

    jestApi.it!('transposes and multiplies pitch classes', () => {
      const row = new Row([0, 11]);
      row.transpose(1);
      jestApi.expect!(row.row).toEqual([
        { pc: 1, octave: 4 },
        { pc: 0, octave: 5 },
      ]);

      row.multiply(5);
      jestApi.expect!(row.row.map(({ pc }) => pc)).toEqual([5, 0]);
    });

    jestApi.it!('inverts around the first pitch and reverses the row', () => {
      const row = new Row([0, 2, 4]);
      row.invert();
      jestApi.expect!(row.row).toEqual([
        { pc: 0, octave: 4 },
        { pc: 10, octave: 3 },
        { pc: 8, octave: 3 },
      ]);

      row.reverse();
      jestApi.expect!(row.row.map(({ pc }) => pc)).toEqual([8, 10, 0]);
    });

    jestApi.it!('converts pitches to MusicXML and pitch numbers', () => {
      const row = new Row([0, 1, 11]);
      jestApi.expect!(row.pitches()).toEqual([
        { step: 'C', alter: 0, octave: 4 },
        { step: 'C', alter: 1, octave: 4 },
        { step: 'B', alter: 0, octave: 4 },
      ]);
      jestApi.expect!(row.pitchesXml()).toEqual([
        '<pitch><step>C</step><alter>0</alter><octave>4</octave></pitch>',
        '<pitch><step>C</step><alter>1</alter><octave>4</octave></pitch>',
        '<pitch><step>B</step><alter>0</alter><octave>4</octave></pitch>',
      ]);
      jestApi.expect!(Row.pitchNumber({ step: 'C', alter: 1, octave: 4 })).toBe(49);
      jestApi.expect!(Row.pitchXml({ step: 'G', alter: 0, octave: 5 })).toBe(
        '<pitch><step>G</step><alter>0</alter><octave>5</octave></pitch>'
      );
    });

    jestApi.it!('composes rows by pitch-class lookup', () => {
      const row = new Row([2, 0, 1]);
      const mapping = Array.from({ length: 12 }, (_, pc) => ({ pc: (pc + 3) % 12, octave: 4 }));

      row.compose(mapping);
      jestApi.expect!(row.row).toEqual([
        { pc: 5, octave: 4 },
        { pc: 3, octave: 4 },
        { pc: 4, octave: 4 },
      ]);
    });
  });
}
/*
Example for simple calculator class:

import { describe, it, expect, beforeEach } from 'vitest';
import { Calculator } from './Calculator';

describe('Calculator Class', () => {
  let calc: Calculator;

  // Arrange: Initialize a fresh instance before every test
  beforeEach(() => {
    calc = new Calculator(10);
  });

  describe('Constructor & Getter', () => {
    it('should initialize with the provided constructor value', () => {
      expect(calc.current).toBe(10);
    });
  });

  describe('add()', () => {
    it('should correctly add a positive number', () => {
      // Act
      calc.add(5);
      // Assert
      expect(calc.current).toBe(15);
    });

    it('should correctly add a negative number', () => {
      calc.add(-3);
      expect(calc.current).toBe(7);
    });

    it('should support method chaining', () => {
      const result = calc.add(5);
      expect(result).toBe(calc);
      expect(result.current).toBe(15);
    });
  });

  describe('multiply()', () => {
    it('should correctly multiply by a positive integer', () => {
      calc.multiply(3);
      expect(calc.current).toBe(30);
    });

    it('should correctly multiply by zero', () => {
      calc.multiply(0);
      expect(calc.current).toBe(0);
    });

    it('should correctly multiply by a fraction', () => {
      calc.multiply(0.5);
      expect(calc.current).toBe(5);
    });
  });

  describe('Combined Operations', () => {
    it('should handle sequential mutations correctly', () => {
      calc.add(2).multiply(2); // (10 + 2) * 2
      expect(calc.current).toBe(24);
    });
  });
});
*/

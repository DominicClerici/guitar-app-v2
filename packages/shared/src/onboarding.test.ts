import { describe, expect, it } from 'vitest';

import { isLearningGoal, parseLearningGoals, parseSkillLevel } from './onboarding';

describe('parseSkillLevel', () => {
  it('keeps null as null, which is the only thing that means "not asked"', () => {
    expect(parseSkillLevel(null)).toBeNull();
    expect(parseSkillLevel(undefined)).toBeNull();
  });

  it('passes through a level it knows', () => {
    expect(parseSkillLevel('true_beginner')).toBe('true_beginner');
    expect(parseSkillLevel('expert')).toBe('expert');
  });

  it('treats skipping the question as an answer', () => {
    expect(parseSkillLevel('no_answer')).toBe('no_answer');
  });

  it('reads a level it does not know as answered', () => {
    // Written by a newer build. Something was chosen; this one just cannot name it, and asking
    // again would overwrite a real answer with whatever was picked the second time.
    expect(parseSkillLevel('virtuoso')).toBe('no_answer');
    expect(parseSkillLevel(7)).toBe('no_answer');
  });
});

describe('parseLearningGoals', () => {
  it('keeps null as null', () => {
    expect(parseLearningGoals(null)).toBeNull();
    expect(parseLearningGoals(undefined)).toBeNull();
  });

  it('reads an empty set as answered with nothing', () => {
    expect(parseLearningGoals([])).toEqual([]);
  });

  it('drops members it does not recognise and keeps the rest', () => {
    expect(parseLearningGoals(['learn_chords', 'learn_sitar', 'rhythm'])).toEqual([
      'learn_chords',
      'rhythm',
    ]);
  });

  it('reads a malformed value as answered with nothing', () => {
    expect(parseLearningGoals('learn_chords')).toEqual([]);
    expect(parseLearningGoals(42)).toEqual([]);
  });
});

describe('isLearningGoal', () => {
  it('narrows a stored string to a goal', () => {
    expect(isLearningGoal('music_theory')).toBe(true);
    expect(isLearningGoal('learn_sitar')).toBe(false);
  });
});

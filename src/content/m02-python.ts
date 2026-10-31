import type { Module } from '../types.ts';
import { m02a } from './m02a.ts';
import { m02b } from './m02b.ts';
import { m02c } from './m02c.ts';

export const m02: Module = {
  id: 'python',
  number: 2,
  title: 'Python Programming Fundamentals',
  short: 'Python',
  icon: 'code',
  description:
    'From your first variable to classes: every Python concept a data scientist uses daily, each with runnable examples, debugging practice and quizzes, finishing with generators, regular expressions and a pure-Python mini-project.',
  skills: ['Variables & types', 'Strings', 'Collections', 'Control flow', 'Functions', 'Comprehensions', 'Error handling', 'Files, CSV & JSON', 'OOP', 'Generators', 'Regular expressions'],
  lessons: [...m02a, ...m02b, ...m02c],
};

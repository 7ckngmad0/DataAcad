import type { Exercise, Lesson, Module } from '../types.ts';
import { m01 } from './m01-intro.ts';
import { m02 } from './m02-python.ts';
import { m03 } from './m03-math.ts';
import { m04 } from './m04-stats.ts';
import { m05 } from './m05-libraries.ts';
import { m06 } from './m06-eda.ts';
import { m07 } from './m07-viz.ts';
import { m08 } from './m08-sql.ts';
import { m09 } from './m09-bi.ts';
import { m10 } from './m10-ml.ts';
import { m11 } from './m11-advanced.ts';
import { m12 } from './m12-portfolio.ts';
export { PROJECTS } from './projects.ts';

export const MODULES: Module[] = [m01, m02, m03, m04, m05, m06, m07, m08, m09, m10, m11, m12];

export const ALL_LESSONS: Lesson[] = MODULES.flatMap((m) => m.lessons);
export const ALL_EXERCISES: (Exercise & { lessonId: string; moduleId: string })[] = MODULES.flatMap((m) =>
  m.lessons.flatMap((l) => l.exercises.map((e) => ({ ...e, lessonId: l.id, moduleId: m.id }))),
);

const lessonToModule = new Map<string, Module>();
MODULES.forEach((m) => m.lessons.forEach((l) => lessonToModule.set(l.id, m)));

export const moduleOf = (lessonId: string) => lessonToModule.get(lessonId);
export const getModule = (id: string) => MODULES.find((m) => m.id === id);
export const getLesson = (id: string) => ALL_LESSONS.find((l) => l.id === id);
export const lessonPath = (lessonId: string) => `/courses/${lessonToModule.get(lessonId)?.id}/${lessonId}`;

export function neighbours(lessonId: string) {
  const i = ALL_LESSONS.findIndex((l) => l.id === lessonId);
  return { prev: i > 0 ? ALL_LESSONS[i - 1] : undefined, next: i >= 0 && i < ALL_LESSONS.length - 1 ? ALL_LESSONS[i + 1] : undefined };
}

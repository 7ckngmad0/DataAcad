export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Lang = 'python' | 'sql';

export interface CodeExample {
  title: string;
  lang?: Lang; // default python
  code: string;
  /** Line-by-line (or block-by-block) explanation, Markdown allowed. */
  explanation: string[];
  /** Set false for code that cannot run in the browser (e.g. TensorFlow, installs). */
  runnable?: boolean;
  /** For SQL examples: which practice database to run against. */
  db?: string;
  /** The example deliberately raises an error (e.g. to teach reading tracebacks). */
  expectsError?: boolean;
}

export interface Mistake {
  mistake: string;
  fix: string;
}

export interface Exercise {
  id: string;
  title: string;
  type: 'write' | 'debug' | 'fill' | 'predict' | 'dataset';
  lang: Lang;
  difficulty: Difficulty;
  /** Markdown task description. */
  prompt: string;
  starter?: string;
  /** Reference solution (code), or the canonical answer for predict-type questions. */
  solution: string;
  /**
   * Python: assertions run after the learner's code in the same namespace.
   * The variable `_out` holds everything the learner's code printed.
   */
  tests?: string;
  /** For predict/fill text answers: accepted answers (compared case-insensitively, whitespace-trimmed). */
  accepted?: string[];
  /** SQL: practice database id. */
  db?: string;
  hints: string[];
}

interface QuestionBase {
  id: string;
  prompt: string;
  code?: string;
  explanation: string;
  difficulty: Difficulty;
}
export interface McqQuestion extends QuestionBase {
  kind: 'mcq';
  options: string[];
  answer: number;
}
export interface TextQuestion extends QuestionBase {
  kind: 'text';
  accepted: string[];
}
export type QuizQuestion = McqQuestion | TextQuestion;

export type WidgetId =
  | 'lifecycle'
  | 'data-type-sorter'
  | 'function-grapher'
  | 'derivative'
  | 'vectors'
  | 'matrix-multiply'
  | 'gradient-descent'
  | 'descriptive-stats'
  | 'probability-sim'
  | 'bayes'
  | 'distributions'
  | 'clt'
  | 'confidence-intervals'
  | 'correlation'
  | 'misleading-charts'
  | 'chart-gallery'
  | 'regression'
  | 'kmeans'
  | 'confusion-matrix'
  | 'overfitting'
  | 'neuron'
  | 'sql-schema';

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  difficulty: Difficulty;
  /** Optional specialization (shown with an "Optional" tag). */
  optional?: boolean;
  objectives: string[];
  intro: string;
  simple: string;
  technical: string;
  terms: [string, string][];
  realWorld: string;
  steps: string[];
  code: CodeExample[];
  mistakes: Mistake[];
  exercises: Exercise[];
  quiz: QuizQuestion[];
  summary: string[];
  resources: { label: string; url: string }[];
  widgets?: WidgetId[];
}

export interface Module {
  id: string;
  number: number;
  title: string;
  short: string;
  description: string;
  icon: string; // lucide icon name key, see components/Icon.tsx
  skills: string[];
  lessons: Lesson[];
}

export interface ProjectStep {
  title: string;
  detail: string; // markdown
  code?: string;
}

export interface Project {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  hours: number;
  skills: string[];
  objectives: string[];
  businessProblem: string;
  dataset: { file: string; description: string; columns: [string, string][] };
  libraries: string[];
  steps: ProjectStep[];
  expectedOutput: string[];
  evaluation: string[];
  reportTemplate: string;
  starter: string;
}

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, RotateCcw, Bot, Trophy } from 'lucide-react';
import type { QuizQuestion } from '../types';
import { Markdown } from './Markdown';
import { DifficultyChip } from './ui';
import { normalizeAnswer } from './ExerciseCard';

interface Props {
  questions: QuizQuestion[];
  onSubmit?: (correct: number, total: number, wrongIds: string[]) => void;
  context?: string;
  bestLabel?: string;
  shuffle?: boolean;
}

function shuffled<T>(a: T[]) {
  const c = [...a];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

/** Shuffles a multiple-choice question's options and remaps its answer index, so the correct option's position carries no information. */
function shuffleOptions(q: QuizQuestion): QuizQuestion {
  if (q.kind !== 'mcq') return q;
  const order = shuffled(q.options.map((_, i) => i));
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
}

const isCorrect = (q: QuizQuestion, a: string | number | undefined) =>
  a !== undefined && (q.kind === 'mcq' ? a === q.answer : q.accepted.some((x) => normalizeAnswer(x) === normalizeAnswer(String(a))));

export function Quiz({ questions, onSubmit, context, bestLabel, shuffle }: Props) {
  const navigate = useNavigate();
  const [round, setRound] = useState(0);
  const order = useMemo(
    () => (shuffle || round > 0 ? shuffled(questions) : questions).map(shuffleOptions),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [questions, round, shuffle],
  );
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);

  const answered = order.filter((q) => answers[q.id] !== undefined && String(answers[q.id]).trim() !== '').length;
  const correct = order.filter((q) => isCorrect(q, answers[q.id])).length;

  const submit = () => {
    setSubmitted(true);
    onSubmit?.(correct, order.length, order.filter((q) => !isCorrect(q, answers[q.id])).map((q) => q.id));
  };
  const retake = () => {
    setAnswers({});
    setSubmitted(false);
    setRound((r) => r + 1);
  };

  const review = (q: QuizQuestion) => {
    const mine = q.kind === 'mcq' ? q.options[answers[q.id] as number] : String(answers[q.id] ?? '');
    const right = q.kind === 'mcq' ? q.options[q.answer] : q.accepted[0];
    navigate('/tutor', {
      state: {
        mode: 'review',
        context,
        prompt: `Quiz question: ${q.prompt}${q.code ? `\n\`\`\`python\n${q.code}\n\`\`\`` : ''}${q.kind === 'mcq' ? `\nOptions: ${q.options.map((o, i) => `(${i + 1}) ${o}`).join('; ')}` : ''}\n\nI answered: ${mine}\nThe correct answer is: ${right}\n\nCan you help me understand why my answer was wrong?`,
      },
    });
  };

  const pct = Math.round((correct / order.length) * 100);

  return (
    <div className="space-y-4">
      {submitted && (
        <div className={`card flex flex-wrap items-center gap-4 p-5 ${pct >= 80 ? 'border-emerald-300 dark:border-emerald-800' : ''}`}>
          <Trophy className={pct >= 80 ? 'text-emerald-500' : 'text-amber-500'} size={32} />
          <div className="mr-auto">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {correct}/{order.length} correct · {pct}%
            </div>
            <div className="text-sm text-slate-500">
              {pct === 100 ? 'Perfect score!' : pct >= 80 ? 'Great work — you have a solid grasp of this.' : pct >= 50 ? 'Good effort. Review the explanations below and retake.' : 'Re-read the lesson sections, then retake the quiz.'}
              {bestLabel && ` · ${bestLabel}`}
            </div>
          </div>
          <button className="btn-secondary" onClick={retake}>
            <RotateCcw size={15} /> Retake quiz
          </button>
        </div>
      )}

      {order.map((q, i) => {
        const a = answers[q.id];
        const ok = isCorrect(q, a);
        return (
          <div key={q.id + round} className={`card p-5 ${submitted ? (ok ? 'border-emerald-300 dark:border-emerald-800' : 'border-rose-300 dark:border-rose-800') : ''}`}>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-400">Q{i + 1}</span>
              <DifficultyChip d={q.difficulty} />
              {submitted && (ok ? <CheckCircle2 size={18} className="ml-auto text-emerald-500" /> : <XCircle size={18} className="ml-auto text-rose-500" />)}
            </div>
            <Markdown className="font-medium">{q.prompt}</Markdown>
            {q.code && <pre className="mt-2 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-sm text-slate-100">{q.code}</pre>}
            <div className="mt-3">
              {q.kind === 'mcq' ? (
                <div className="grid gap-2">
                  {q.options.map((opt, oi) => {
                    const chosen = a === oi;
                    let cls = 'border-slate-200 hover:border-indigo-400 dark:border-slate-700';
                    if (chosen && !submitted) cls = 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50';
                    if (submitted && oi === q.answer) cls = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40';
                    else if (submitted && chosen) cls = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40';
                    return (
                      <button
                        key={oi}
                        disabled={submitted}
                        onClick={() => setAnswers((s) => ({ ...s, [q.id]: oi }))}
                        className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm transition ${cls}`}
                      >
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${chosen ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                          {String.fromCharCode(65 + oi)}
                        </span>
                        <Markdown>{opt}</Markdown>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  className="input font-mono"
                  placeholder="Type your answer…"
                  disabled={submitted}
                  value={(a as string) ?? ''}
                  onChange={(e) => setAnswers((s) => ({ ...s, [q.id]: e.target.value }))}
                />
              )}
            </div>
            {submitted && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800/60">
                {!ok && (
                  <div className="mb-1 font-medium text-slate-900 dark:text-white">
                    Correct answer: {q.kind === 'mcq' ? <Markdown className="inline">{q.options[q.answer]}</Markdown> : <code className="font-mono">{q.accepted[0]}</code>}
                  </div>
                )}
                <Markdown>{q.explanation}</Markdown>
                {!ok && (
                  <button className="btn-ghost mt-2 !px-2 !py-1 text-xs" onClick={() => review(q)}>
                    <Bot size={14} /> Ask the tutor to explain
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!submitted && (
        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={submit} disabled={answered < order.length}>
            Submit answers
          </button>
          <span className="text-sm text-slate-500">
            {answered}/{order.length} answered
          </span>
        </div>
      )}
    </div>
  );
}

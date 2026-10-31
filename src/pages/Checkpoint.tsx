import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Flag } from 'lucide-react';
import { getModule } from '../content';
import { useProgress } from '../lib/progress';
import { Quiz } from '../components/Quiz';
import { PageHeader } from '../components/ui';

const SIZE = 12;

export function Checkpoint() {
  const { moduleId } = useParams();
  const m = getModule(moduleId!);
  const { state, actions } = useProgress();
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => {
    if (!m) return [];
    // Draw questions round-robin across lessons so every lesson is represented.
    // Question ids are only unique within a lesson, so prefix them with the lesson id.
    const pools = m.lessons.map((l) => l.quiz.map((q) => ({ ...q, id: `${l.id}:${q.id}` })).sort(() => Math.random() - 0.5));
    const out = [];
    for (let round = 0; out.length < SIZE && pools.some((p) => p.length); round++) {
      for (const p of pools) if (p.length && out.length < SIZE) out.push(p.pop()!);
    }
    return out.sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m, seed]);
  if (!m) return <p>Module not found.</p>;
  const cp = state.checkpoints[m.id];

  return (
    <div className="mx-auto max-w-3xl">
      <Link to={`/courses/${m.id}`} className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-indigo-600"><ChevronLeft size={16} /> Module {m.number}</Link>
      <PageHeader title={`Checkpoint: ${m.title}`} subtitle={`${questions.length} mixed questions from all ${m.lessons.length} lessons. Score 80%+ to clear the checkpoint.`}>
        <Flag size={36} className="text-amber-500" />
      </PageHeader>
      {cp && <p className="mb-4 text-sm text-slate-500">Your best: {cp.best}/{cp.total} ({Math.round((cp.best / cp.total) * 100)}%)</p>}
      <Quiz
        key={seed}
        questions={questions}
        onSubmit={(c, t) => actions.recordCheckpoint(m.id, c, t)}
        context={`Module checkpoint for ${m.title}`}
      />
      <button className="btn-ghost mt-4" onClick={() => setSeed((s) => s + 1)}>Draw a new set of questions</button>
    </div>
  );
}

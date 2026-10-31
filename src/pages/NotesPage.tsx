import { Link } from 'react-router-dom';
import { Bookmark, BookmarkX, Download, NotebookPen, Search } from 'lucide-react';
import { ALL_LESSONS, lessonPath, moduleOf } from '../content';
import { useProgress } from '../lib/progress';
import { PageHeader } from '../components/ui';
import { Markdown } from '../components/Markdown';

export function NotesPage() {
  const { state, actions } = useProgress();
  // Keep course order, so notes read like a study guide.
  const bookmarked = ALL_LESSONS.filter((l) => state.bookmarks[l.id]);
  const noted = ALL_LESSONS.filter((l) => state.notes[l.id]);

  const exportNotes = () => {
    const md = ['# My DataScience Academy notes', '', ...noted.flatMap((l) => [`## ${moduleOf(l.id)?.number}. ${l.title}`, '', state.notes[l.id].trim(), ''])].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
    a.download = 'datascience-notes.md';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <PageHeader title="Notes & Bookmarks" subtitle="Lessons you saved for later and everything you wrote in “My notes”.">
        {noted.length > 0 && <button className="btn-secondary" onClick={exportNotes}><Download size={16} /> Export notes (.md)</button>}
      </PageHeader>

      <section className="card p-5">
        <h2 className="section-title"><Bookmark size={19} className="text-amber-500" /> Bookmarked lessons ({bookmarked.length})</h2>
        {bookmarked.length === 0 ? (
          <p className="text-sm text-slate-500">No bookmarks yet. Use the <b>Bookmark</b> button at the top of any lesson to save it here.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {bookmarked.map((l) => (
              <li key={l.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <Link to={lessonPath(l.id)} className="block truncate font-medium hover:text-indigo-600">{l.title}</Link>
                  <div className="text-xs text-slate-500">Module {moduleOf(l.id)?.number}: {moduleOf(l.id)?.title}{state.completedLessons[l.id] ? ' · completed' : ''}</div>
                </div>
                <button className="btn-ghost !p-1.5" onClick={() => actions.toggleBookmark(l.id)} aria-label={`Remove bookmark: ${l.title}`} title="Remove bookmark">
                  <BookmarkX size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="section-title"><NotebookPen size={19} className="text-indigo-500" /> My notes ({noted.length})</h2>
        {noted.length === 0 ? (
          <p className="card p-5 text-sm text-slate-500">You haven't written any notes yet. Every lesson has a <b>My notes</b> section near the end. Notes are also searchable (<Search size={13} className="inline" /> Ctrl+K).</p>
        ) : (
          noted.map((l) => (
            <article key={l.id} className="card p-5">
              <div className="mb-2 flex flex-wrap items-baseline gap-2">
                <Link to={`${lessonPath(l.id)}#notes`} className="font-semibold hover:text-indigo-600">{l.title}</Link>
                <span className="text-xs text-slate-500">Module {moduleOf(l.id)?.number}</span>
                <Link to={`${lessonPath(l.id)}#notes`} className="ml-auto text-xs text-indigo-600 hover:underline dark:text-indigo-400">Edit</Link>
              </div>
              <Markdown>{state.notes[l.id]}</Markdown>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

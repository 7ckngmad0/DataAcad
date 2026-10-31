import { lazy, Suspense } from 'react';
import { Route, Routes, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Layout } from './components/Layout';

// Each page is its own chunk, so heavy libraries (editor, charts, KaTeX) load only where they are used.
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));
const Roadmap = lazy(() => import('./pages/Roadmap').then((m) => ({ default: m.Roadmap })));
const Courses = lazy(() => import('./pages/Courses').then((m) => ({ default: m.Courses })));
const ModulePage = lazy(() => import('./pages/ModulePage').then((m) => ({ default: m.ModulePage })));
const LessonPage = lazy(() => import('./pages/LessonPage').then((m) => ({ default: m.LessonPage })));
const Checkpoint = lazy(() => import('./pages/Checkpoint').then((m) => ({ default: m.Checkpoint })));
const Practice = lazy(() => import('./pages/Practice').then((m) => ({ default: m.Practice })));
const Playground = lazy(() => import('./pages/Playground').then((m) => ({ default: m.Playground })));
const Projects = lazy(() => import('./pages/Projects').then((m) => ({ default: m.Projects })));
const ProjectPage = lazy(() => import('./pages/ProjectPage').then((m) => ({ default: m.ProjectPage })));
const Tutor = lazy(() => import('./pages/Tutor').then((m) => ({ default: m.Tutor })));
const ProgressPage = lazy(() => import('./pages/ProgressPage').then((m) => ({ default: m.ProgressPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const NotesPage = lazy(() => import('./pages/NotesPage').then((m) => ({ default: m.NotesPage })));

function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <Link to="/" className="btn-primary mt-4">Back to dashboard</Link>
    </div>
  );
}

export function App() {
  return (
    <Layout>
      <Suspense fallback={<div className="flex justify-center py-20 text-slate-400"><Loader2 className="animate-spin" /></div>}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:moduleId" element={<ModulePage />} />
        <Route path="/courses/:moduleId/checkpoint" element={<Checkpoint />} />
        <Route path="/courses/:moduleId/:lessonId" element={<LessonPage />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectPage />} />
        <Route path="/tutor" element={<Tutor />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </Layout>
  );
}

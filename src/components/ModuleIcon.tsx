import { Compass, Code2, Sigma, Dice5, Library, Sparkles, BarChart3, Database, Briefcase, BrainCircuit, Rocket, FolderGit2, type LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  compass: Compass,
  code: Code2,
  sigma: Sigma,
  dice: Dice5,
  library: Library,
  sparkles: Sparkles,
  chart: BarChart3,
  database: Database,
  briefcase: Briefcase,
  brain: BrainCircuit,
  rocket: Rocket,
  portfolio: FolderGit2,
};

export function ModuleIcon({ name, size = 20, className }: { name: string; size?: number; className?: string }) {
  const I = ICONS[name] ?? Compass;
  return <I size={size} className={className} />;
}

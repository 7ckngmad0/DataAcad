// Reports code examples whose explanation list doesn't line up with their non-blank code lines.
//   node scripts/check-explanations.ts
import { MODULES } from '../src/content/index.ts';

let total = 0;
let bad = 0;
for (const m of MODULES) {
  for (const l of m.lessons) {
    l.code.forEach((c, i) => {
      total++;
      const lines = c.code.split('\n').filter((s) => s.trim() !== '');
      if (lines.length !== c.explanation.length) {
        bad++;
        console.log(`${l.id} #${i + 1} "${c.title}": ${lines.length} non-blank lines, ${c.explanation.length} explanations`);
      }
    });
  }
}
console.log(`\n${bad} of ${total} examples misaligned`);

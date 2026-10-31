import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { sql } from '@codemirror/lang-sql';
import { keymap, EditorView } from '@codemirror/view';
import { Prec } from '@codemirror/state';
import { useMemo, useRef } from 'react';
import { useProgress } from '../lib/progress';
import { useIsDark } from '../lib/useIsDark';
import type { Lang } from '../types';

interface Props {
  value: string;
  onChange?: (v: string) => void;
  lang?: Lang;
  onRun?: () => void;
  readOnly?: boolean;
  minHeight?: string;
  maxHeight?: string;
}

export function CodeEditor({ value, onChange, lang = 'python', onRun, readOnly, minHeight = '80px', maxHeight = '480px' }: Props) {
  const dark = useIsDark();
  const { state } = useProgress();
  const runRef = useRef(onRun);
  runRef.current = onRun;
  const fontSize = state.settings.editorFontSize;

  const extensions = useMemo(
    () => [
      lang === 'sql' ? sql() : python(),
      Prec.highest(
        keymap.of([
          { key: 'Mod-Enter', run: () => (runRef.current?.(), true) },
          { key: 'Shift-Enter', run: () => (runRef.current?.(), true) },
        ]),
      ),
      EditorView.theme({ '&': { fontSize: `${fontSize}px` }, '.cm-content': { fontFamily: 'var(--font-mono)' } }),
      EditorView.lineWrapping,
    ],
    [lang, fontSize],
  );

  return (
    <CodeMirror
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      editable={!readOnly}
      theme={dark ? 'dark' : 'light'}
      extensions={extensions}
      minHeight={minHeight}
      maxHeight={maxHeight}
      basicSetup={{ lineNumbers: true, foldGutter: false, highlightActiveLine: !readOnly, autocompletion: true }}
      aria-label={`${lang} code editor`}
    />
  );
}

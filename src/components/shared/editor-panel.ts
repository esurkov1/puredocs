import { h } from '../../lib/dom';
import { highlightCode } from '../../lib/highlight';

/**
 * Auto-resize a plain textarea to fit its content.
 * Used for response body/headers textareas (NOT the editor panel).
 */
export function autoResizeTextarea(ta: HTMLTextAreaElement): void {
  ta.style.height = '0';
  ta.style.height = `${ta.scrollHeight}px`;
}

export function createEditorPanel(
  initialValue: string,
  lang: string,
  options?: { dataField?: string; onInput?: () => void },
): {
  wrap: HTMLElement;
  textarea: HTMLTextAreaElement;
  setValue: (v: string, highlightLang?: string) => void;
  syncLayout: () => void;
} {
  const editorWrap = h('div', { className: 'body-editor' });

  const highlightPre = h('pre', { className: 'body-highlight' });
  const highlightCodeEl = h('code', {});
  highlightPre.append(highlightCodeEl);

  const textarea = h('textarea', {
    className: 'textarea-json',
    spellcheck: 'false',
    rows: '1',
    autocomplete: 'off',
    ...(options?.dataField ? { 'data-field': options.dataField } : {}),
  }) as HTMLTextAreaElement;
  textarea.value = initialValue;

  /** Update the highlighted <pre> to mirror the textarea content */
  const applyHighlight = (text: string, hlLang: string) => {
    // A trailing newline is collapsed by <pre> — append a space to keep it visible
    const display = text.endsWith('\n') ? text + ' ' : (text || ' ');
    highlightCodeEl.innerHTML = highlightCode(display, hlLang);
  };

  applyHighlight(initialValue, lang);

  textarea.addEventListener('input', () => {
    applyHighlight(textarea.value, lang);
    options?.onInput?.();
  });

  editorWrap.append(highlightPre, textarea);

  return {
    wrap: editorWrap,
    textarea,
    setValue: (v, hlLang) => {
      textarea.value = v;
      applyHighlight(v, hlLang ?? lang);
    },
    syncLayout: () => {}, // no-op — CSS Grid handles layout
  };
}

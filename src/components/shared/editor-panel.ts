import { h } from '../../lib/dom';
import { highlightCode } from '../../lib/highlight';

const MIN_TEXTAREA_HEIGHT = 60;
const MAX_TEXTAREA_HEIGHT = 400;

export function autoResizeTextarea(ta: HTMLTextAreaElement): void {
  ta.style.height = 'auto';
  const contentHeight = Math.max(MIN_TEXTAREA_HEIGHT, ta.scrollHeight);
  
  if (contentHeight > MAX_TEXTAREA_HEIGHT) {
    ta.style.height = MAX_TEXTAREA_HEIGHT + 'px';
    ta.style.overflowY = 'auto';
  } else {
    ta.style.height = contentHeight + 'px';
    ta.style.overflowY = 'hidden';
  }
}

export function syncScrollFromTextarea(ta: HTMLTextAreaElement, pre: HTMLElement): void {
  pre.scrollTop = ta.scrollTop;
  pre.scrollLeft = ta.scrollLeft;
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
  const highlightCodeEl = h('code', { className: 'hljs' });
  highlightPre.append(highlightCodeEl);

  const textarea = h('textarea', {
    className: 'textarea-json',
    spellcheck: 'false',
    ...(options?.dataField ? { 'data-field': options.dataField } : {}),
  }) as HTMLTextAreaElement;
  textarea.value = initialValue;
  highlightCodeEl.innerHTML = highlightCode(initialValue || ' ', lang);
  const syncEditorLayout = (): void => {
    autoResizeTextarea(textarea);
    highlightPre.style.height = `${textarea.offsetHeight}px`;
    syncScrollFromTextarea(textarea, highlightPre);
  };
  syncEditorLayout();

  const updateHighlight = (val?: string, hlLang?: string) => {
    highlightCodeEl.innerHTML = highlightCode((val ?? textarea.value) || ' ', hlLang ?? lang);
  };

  textarea.addEventListener('input', () => {
    updateHighlight();
    syncEditorLayout();
    options?.onInput?.();
  });
  textarea.addEventListener('scroll', () => syncScrollFromTextarea(textarea, highlightPre));

  editorWrap.append(highlightPre, textarea);

  return {
    wrap: editorWrap,
    textarea,
    setValue: (v, hlLang) => {
      textarea.value = v;
      updateHighlight(v, hlLang ?? lang);
      syncEditorLayout();
    },
    syncLayout: syncEditorLayout,
  };
}

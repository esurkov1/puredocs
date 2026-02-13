import { h } from '../../lib/dom';
import { createBadge } from '../ui';

export interface SnapshotMetric {
  label: string;
  value: string | number;
}

export function createSummaryLine(
  metrics: SnapshotMetric[],
  methodCounts: Record<string, number>,
  emptyText: string = 'No operations',
): HTMLElement {
  const wrap = h('div', { className: 'summary-line' });

  for (const metric of metrics) {
    wrap.append(createBadge({
      text: `${metric.value} ${metric.label}`,
      kind: 'chip',
      size: 'm',
    }));
  }

  const orderedMethods = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options'];

  for (const method of orderedMethods) {
    const count = methodCounts[method] || 0;
    if (count === 0) continue;
    wrap.append(createBadge({
      kind: 'method',
      method,
      size: 'm',
      text: `${count} ${method.toUpperCase()}`,
    }));
  }

  if (!wrap.childNodes.length) {
    wrap.append(createBadge({
      text: emptyText,
      kind: 'chip',
      size: 'm',
    }));
  }

  return wrap;
}

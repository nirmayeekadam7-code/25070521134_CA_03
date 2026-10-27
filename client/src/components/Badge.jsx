// Colour-coded pill used for both status and priority
export function StatusBadge({ status }) {
  return <span className={`badge status-${status.replace(' ', '-').toLowerCase()}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`badge priority-${priority.toLowerCase()}`}>{priority}</span>;
}

export const CATEGORIES = [
  'Water', 'Electricity', 'Internet', 'Cleanliness',
  'Plumbing', 'Furniture', 'Mess/Food', 'Security', 'Other',
];
export const PRIORITIES = ['Low', 'Medium', 'High'];
export const STATUSES = ['Pending', 'In Progress', 'Resolved'];

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateTime = (date) =>
  new Date(date).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
  });

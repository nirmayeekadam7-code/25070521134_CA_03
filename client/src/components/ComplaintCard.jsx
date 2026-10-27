import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from './Badge.jsx';
import { formatDate } from '../constants.js';

export default function ComplaintCard({ complaint }) {
  return (
    <Link to={`/complaints/${complaint._id}`} className="card complaint-card">
      <div className="card-top">
        <StatusBadge status={complaint.status} />
        <PriorityBadge priority={complaint.priority} />
      </div>
      <h3>{complaint.title}</h3>
      <p className="muted clamp">{complaint.description}</p>
      <div className="card-meta">
        <span>{complaint.category}</span>
        <span>{complaint.location}</span>
        <span>{formatDate(complaint.createdAt)}</span>
      </div>
    </Link>
  );
}

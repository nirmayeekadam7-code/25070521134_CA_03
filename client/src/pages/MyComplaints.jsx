import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getError } from '../api';
import ComplaintCard from '../components/ComplaintCard.jsx';
import Spinner from '../components/Spinner.jsx';
import { CATEGORIES, STATUSES } from '../constants.js';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get('/complaints/mine', { params: filters })
      .then((res) => { setComplaints(res.data); setError(''); })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [filters]);

  const handleFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const hasFilters = filters.status || filters.category;

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <h1>My complaints</h1>
          <p className="muted">Everything you have reported, and where it stands.</p>
        </div>
        <Link to="/complaints/new" className="btn btn-primary">New complaint</Link>
      </div>

      <div className="filters">
        <select name="status" value={filters.status} onChange={handleFilter}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select name="category" value={filters.category} onChange={handleFilter}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {error && <div className="alert">{error}</div>}
      {loading ? (
        <Spinner />
      ) : complaints.length === 0 ? (
        <div className="empty">
          <h3>{hasFilters ? 'No complaints match these filters' : 'No complaints yet'}</h3>
          <p className="muted">
            {hasFilters ? 'Clear a filter to see more.' : 'Report a hostel or campus issue and track it here.'}
          </p>
          {!hasFilters && <Link to="/complaints/new" className="btn btn-primary">Report an issue</Link>}
        </div>
      ) : (
        <div className="grid">
          {complaints.map((c) => <ComplaintCard key={c._id} complaint={c} />)}
        </div>
      )}
    </main>
  );
}

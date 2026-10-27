import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getError } from '../api';
import Spinner from '../components/Spinner.jsx';
import { StatusBadge, PriorityBadge } from '../components/Badge.jsx';
import { CATEGORIES, PRIORITIES, STATUSES, formatDate } from '../constants.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = () =>
    api.get('/complaints/admin/stats').then((res) => setStats(res.data)).catch((err) => setError(getError(err)));

  useEffect(() => { loadStats(); }, []);

  // Reload the list whenever a filter changes (search waits 300ms while typing)
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .get('/complaints/admin/all', { params: filters })
        .then((res) => { setComplaints(res.data); setError(''); })
        .catch((err) => setError(getError(err)))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleFilter = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const maxCategory = stats?.byCategory?.[0]?.count || 1;

  return (
    <main className="page wide">
      <div className="page-head">
        <div>
          <h1>Complaints overview</h1>
          <p className="muted">Review reports from all students and update their status.</p>
        </div>
      </div>

      {stats && (
        <>
          <div className="stats">
            <div className="stat"><span>{stats.total}</span>Total</div>
            <div className="stat s-pending"><span>{stats.pending}</span>Pending</div>
            <div className="stat s-progress"><span>{stats.inProgress}</span>In progress</div>
            <div className="stat s-resolved"><span>{stats.resolved}</span>Resolved</div>
          </div>

          {stats.byCategory?.length > 0 && (
            <div className="card categories">
              <h2>Complaints by category</h2>
              {stats.byCategory.map((c) => (
                <div className="bar-row" key={c.category}>
                  <span className="bar-label">{c.category}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(c.count / maxCategory) * 100}%` }} />
                  </div>
                  <span className="bar-count">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="filters">
        <input name="search" value={filters.search} onChange={handleFilter} placeholder="Search by title" />
        <select name="status" value={filters.status} onChange={handleFilter}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select name="category" value={filters.category} onChange={handleFilter}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select name="priority" value={filters.priority} onChange={handleFilter}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      {error && <div className="alert">{error}</div>}
      {loading ? (
        <Spinner />
      ) : complaints.length === 0 ? (
        <div className="empty">
          <h3>No complaints found</h3>
          <p className="muted">Try changing the filters, or wait for students to report issues.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th><th>Student</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th><th></th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id}>
                  <td className="t-title">{c.title}</td>
                  <td>{c.user?.name}<br /><small className="muted">{c.user?.hostel} {c.user?.roomNumber}</small></td>
                  <td>{c.category}</td>
                  <td><PriorityBadge priority={c.priority} /></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{formatDate(c.createdAt)}</td>
                  <td><Link to={`/complaints/${c._id}`} className="btn btn-ghost small-btn">Open</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

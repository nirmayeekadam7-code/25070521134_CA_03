import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { getError } from '../api';
import Spinner from '../components/Spinner.jsx';
import { StatusBadge, PriorityBadge } from '../components/Badge.jsx';
import { STATUSES, formatDateTime } from '../constants.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ComplaintDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user.role === 'admin';

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // admin update form
  const [status, setStatus] = useState('Pending');
  const [remark, setRemark] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get(`/complaints/${id}`)
      .then((res) => {
        setComplaint(res.data);
        setStatus(res.data.status);
        setRemark(res.data.adminRemark || '');
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    setError('');
    try {
      const res = await api.put(`/complaints/${id}/status`, { status, remark });
      setComplaint(res.data);
      setMessage('Status updated.');
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this complaint? This cannot be undone.')) return;
    try {
      await api.delete(`/complaints/${id}`);
      navigate('/complaints');
    } catch (err) {
      setError(getError(err));
    }
  };

  if (loading) return <Spinner />;
  if (!complaint) {
    return (
      <main className="page narrow">
        <div className="alert">{error || 'Complaint not found.'}</div>
        <Link to="/" className="btn btn-ghost">Go back</Link>
      </main>
    );
  }

  const canEdit = !isAdmin && complaint.status === 'Pending';

  return (
    <main className="page narrow">
      <Link to={isAdmin ? '/admin' : '/complaints'} className="back">Back to {isAdmin ? 'dashboard' : 'my complaints'}</Link>

      {error && <div className="alert" style={{ marginBottom: '1rem' }}>{error}</div>}
      {message && <div className="alert success" style={{ marginBottom: '1rem' }}>{message}</div>}

      <div className="detail card">
        <div className="card-top">
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
        <h1>{complaint.title}</h1>
        <p className="description">{complaint.description}</p>

        <dl className="facts">
          <div><dt>Category</dt><dd>{complaint.category}</dd></div>
          <div><dt>Location</dt><dd>{complaint.location}</dd></div>
          <div><dt>Reported</dt><dd>{formatDateTime(complaint.createdAt)}</dd></div>
          {isAdmin && (
            <div>
              <dt>Reported by</dt>
              <dd>{complaint.user?.name || 'Unknown'} ({complaint.user?.hostel || 'Hostel N/A'} {complaint.user?.roomNumber || ''})<br />
                <small className="muted">{complaint.user?.email || ''}</small></dd>
            </div>
          )}
        </dl>

        {complaint.adminRemark && (
          <div className="remark">
            <strong>Warden's remark</strong>
            <p>{complaint.adminRemark}</p>
          </div>
        )}

        {canEdit && (
          <div className="actions left">
            <Link to={`/complaints/${id}/edit`} className="btn btn-ghost">Edit</Link>
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        )}
        {!isAdmin && !canEdit && (
          <p className="muted small">This complaint is being handled, so it can no longer be edited or deleted.</p>
        )}
      </div>

      {isAdmin && (
        <form onSubmit={handleStatusUpdate} className="card form">
          <h2>Update status</h2>
          {error && <div className="alert">{error}</div>}
          {message && <div className="alert success">{message}</div>}
          <label>Status
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>Remark for the student
            <textarea rows="3" value={remark} onChange={(e) => setRemark(e.target.value)}
              placeholder="Plumber will visit tomorrow morning." />
          </label>
          <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save update'}</button>
        </form>
      )}

      <div className="card">
        <h2>History</h2>
        <ol className="timeline">
          {[...(complaint.statusHistory || [])].reverse().map((h, i) => (
            <li key={i}>
              <StatusBadge status={h.status} />
              <div>
                <p>{h.remark || 'Status changed'}</p>
                <small className="muted">{h.changedBy} on {formatDateTime(h.changedAt)}</small>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { getError } from '../api';
import Spinner from '../components/Spinner.jsx';
import { CATEGORIES, PRIORITIES } from '../constants.js';
import { useAuth } from '../context/AuthContext.jsx';

// Used for both "New complaint" and "Edit complaint"
export default function ComplaintForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    location: [user?.hostel, user?.roomNumber].filter(Boolean).join(', '),
    priority: 'Medium',
  });
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/complaints/${id}`)
      .then((res) => {
        const c = res.data;
        if (c.status !== 'Pending') return navigate(`/complaints/${id}`, { replace: true });
        setForm({
          title: c.title || '',
          category: c.category || '',
          description: c.description || '',
          location: c.location || '',
          priority: c.priority || 'Medium',
        });
      })
      .catch((err) => setError(getError(err)))
      .finally(() => setLoading(false));
  }, [id, isEdit, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) return setError('Give your complaint a short title.');
    if (!form.category) return setError('Choose a category.');
    if (!form.location.trim()) return setError('Enter the location of the issue.');
    if (form.description.trim().length < 10) return setError('Describe the issue in at least 10 characters.');

    setBusy(true);
    try {
      const res = isEdit
        ? await api.put(`/complaints/${id}`, form)
        : await api.post('/complaints', form);
      navigate(`/complaints/${res.data._id}`);
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <main className="page narrow">
      <h1>{isEdit ? 'Edit complaint' : 'Report an issue'}</h1>
      <p className="muted">
        {isEdit ? 'You can edit while the complaint is still Pending.' : 'The warden will see this as soon as you submit.'}
      </p>

      <form onSubmit={handleSubmit} className="form card-form" noValidate>
        {error && <div className="alert">{error}</div>}
        <label>Title
          <input name="title" value={form.title} onChange={handleChange} maxLength={100} placeholder="Tap leaking in bathroom" />
        </label>
        <div className="row">
          <label>Category
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>Priority
            <select name="priority" value={form.priority} onChange={handleChange}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
        </div>
        <label>Location
          <input name="location" value={form.location} onChange={handleChange} placeholder="Block B, Room 214" />
        </label>
        <label>Description
          <textarea name="description" rows="5" value={form.description} onChange={handleChange} maxLength={1000}
            placeholder="What is wrong, since when, and how it affects you." />
        </label>
        <div className="actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>
            {busy ? 'Saving...' : isEdit ? 'Save changes' : 'Submit complaint'}
          </button>
        </div>
      </form>
    </main>
  );
}

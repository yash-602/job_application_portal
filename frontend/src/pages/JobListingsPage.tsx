import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { jobsAPI } from '../services/api';
import { Briefcase, MapPin, Clock, Search, AlertCircle } from 'lucide-react';
import type { JobListing } from '../types';

export default function JobListingsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    jobsAPI.getOpenListings().then(res => {
      setJobs(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const departments = ['all', ...new Set(jobs.map(j => j.department))];

  const filtered = jobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'all' || j.department === deptFilter;
    return matchSearch && matchDept;
  });

  const handleApply = async (jobId: string) => {
    setApplyingId(jobId);
    try {
      const res = await jobsAPI.apply(jobId);
      setMessage({ text: res.data.message, type: 'success' });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to apply.';
      setMessage({ text: msg, type: 'error' });
    } finally {
      setApplyingId(null);
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  if (loading) return <div className="dashboard"><div className="dashboard-content" style={{ textAlign: 'center', paddingTop: 100 }}><div className="btn spinner" /></div></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="dashboard-header animate-fade-in-up">
          <div>
            <h1>Open Positions</h1>
            <p className="greeting">Find your next role at Undocked</p>
          </div>
        </div>

        {!user?.profileComplete && (
          <div className="form-message error" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={16} />
            Complete your profile before applying. <a href="/profile" style={{ color: 'var(--accent-red)', textDecoration: 'underline' }}>Go to Profile</a>
          </div>
        )}

        {message.text && <div className={`form-message ${message.type}`}>{message.text}</div>}

        <div className="table-header" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-input)', borderRadius: 'var(--radius-full)', padding: '8px 16px', border: '1px solid var(--border-color)' }}>
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search positions..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '0.85rem', width: 180, outline: 'none' }} />
            </div>
          </div>
          <div className="table-filters">
            {departments.map(d => (
              <button key={d} className={`filter-btn ${deptFilter === d ? 'active' : ''}`} onClick={() => setDeptFilter(d)}>
                {d === 'all' ? 'All' : d}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
          {filtered.map((job, i) => (
            <div key={job.id} className="feature-card animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 4 }}>{job.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-red)', fontWeight: 500 }}>{job.department}</span>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'rgba(229,62,62,0.1)', color: 'var(--accent-red)', borderRadius: 'var(--radius-full)', fontWeight: 500 }}>{job.type}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 16, lineHeight: 1.5 }}>{job.description}</p>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {job.location}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Briefcase size={12} /> {job.salary}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <button className="btn btn-primary btn-full btn-sm" disabled={!user?.profileComplete || applyingId === job.id}
                onClick={() => handleApply(job.id)}>
                {applyingId === job.id ? 'Applying...' : !user?.profileComplete ? 'Complete Profile to Apply' : 'Apply Now'}
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No positions found.</div>
        )}
      </div>
    </div>
  );
}

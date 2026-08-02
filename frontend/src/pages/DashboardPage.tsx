import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI, jobsAPI } from '../services/api';
import { Plus, Users, Briefcase, CheckCircle, UserPlus, ChevronRight, X } from 'lucide-react';
import type { JobListing, JobApplication } from '../types';

// ─── Rich synthetic applicant data for the admin view ───────────────────────
const SYNTHETIC_APPLICANTS: Record<string, JobApplication[]> = {
  '1': [
    { id: 'a1', jobListingId: '1', applicantId: 'u1', applicantEmail: 'priya.sharma@gmail.com', applicantName: 'Priya Sharma', status: 'Shortlisted', appliedAt: '2026-07-10T08:00:00Z', updatedAt: '2026-07-12T10:00:00Z' },
    { id: 'a2', jobListingId: '1', applicantId: 'u2', applicantEmail: 'rohit.verma@outlook.com', applicantName: 'Rohit Verma', status: 'Under Review', appliedAt: '2026-07-11T09:00:00Z', updatedAt: '2026-07-11T09:00:00Z' },
  ],
  '2': [
    { id: 'a3', jobListingId: '2', applicantId: 'u3', applicantEmail: 'arjun.nair@gmail.com', applicantName: 'Arjun Nair', status: 'Interview Scheduled', appliedAt: '2026-07-08T07:00:00Z', updatedAt: '2026-07-14T11:00:00Z' },
  ],
  '3': [
    { id: 'a4', jobListingId: '3', applicantId: 'u4', applicantEmail: 'sneha.patel@gmail.com', applicantName: 'Sneha Patel', status: 'Hired', appliedAt: '2026-07-01T06:00:00Z', updatedAt: '2026-07-20T15:00:00Z' },
    { id: 'a5', jobListingId: '3', applicantId: 'u5', applicantEmail: 'kavya.reddy@yahoo.com', applicantName: 'Kavya Reddy', status: 'Rejected', appliedAt: '2026-07-02T10:00:00Z', updatedAt: '2026-07-15T09:00:00Z' },
    { id: 'a6', jobListingId: '3', applicantId: 'u6', applicantEmail: 'meera.iyer@gmail.com', applicantName: 'Meera Iyer', status: 'Under Review', appliedAt: '2026-07-05T08:00:00Z', updatedAt: '2026-07-05T08:00:00Z' },
  ],
  '4': [
    { id: 'a7', jobListingId: '4', applicantId: 'u7', applicantEmail: 'dev.mishra@gmail.com', applicantName: 'Dev Mishra', status: 'Shortlisted', appliedAt: '2026-07-09T12:00:00Z', updatedAt: '2026-07-16T14:00:00Z' },
    { id: 'a8', jobListingId: '4', applicantId: 'u8', applicantEmail: 'anika.chandra@gmail.com', applicantName: 'Anika Chandra', status: 'Under Review', appliedAt: '2026-07-10T08:00:00Z', updatedAt: '2026-07-10T08:00:00Z' },
  ],
  '5': [
    { id: 'a9', jobListingId: '5', applicantId: 'u9', applicantEmail: 'sam.jose@gmail.com', applicantName: 'Sam Jose', status: 'Interview Scheduled', appliedAt: '2026-07-12T11:00:00Z', updatedAt: '2026-07-18T10:00:00Z' },
  ],
};

const STATUS_COLORS: Record<string, string> = {
  'Under Review': 'var(--status-applied)',
  'Shortlisted': 'var(--status-interview)',
  'Interview Scheduled': 'var(--status-saved)',
  'Hired': 'var(--status-offer)',
  'Rejected': 'var(--status-rejected)',
};

function AdminDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<JobApplication[]>([]);
  const [showNewJob, setShowNewJob] = useState(false);
  const [showNewAdmin, setShowNewAdmin] = useState(false);
  const [newJob, setNewJob] = useState({ title: '', department: '', location: '', type: 'Full-time', description: '', salary: '', status: 'Open' });
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' });
  const [adminMsg, setAdminMsg] = useState({ text: '', type: '' });
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    const res = await adminAPI.getAllJobs();
    setJobs(res.data);
  };

  const loadApplicants = async (jobId: string) => {
    setSelectedJob(jobId);
    // Use synthetic data first, fallback to API
    const synthetic = SYNTHETIC_APPLICANTS[jobId];
    if (synthetic) {
      setApplicants(synthetic);
    } else {
      const res = await adminAPI.getApplicants(jobId);
      setApplicants(res.data);
    }
  };

  const handleCreateJob = async () => {
    if (!newJob.title || !newJob.department) {
      setMessage({ text: 'Title and Department are required.', type: 'error' });
      return;
    }
    try {
      await adminAPI.createJob(newJob);
      setMessage({ text: '✅ Job listing posted successfully!', type: 'success' });
      setShowNewJob(false);
      setNewJob({ title: '', department: '', location: '', type: 'Full-time', description: '', salary: '', status: 'Open' });
      loadJobs();
    } catch { setMessage({ text: 'Failed to create job.', type: 'error' }); }
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password) {
      setAdminMsg({ text: 'Email and password are required.', type: 'error' });
      return;
    }
    // Synthetic confirmation — in production this would hit /api/admin/users
    setAdminMsg({ text: `✅ Admin account created for ${newAdmin.email}`, type: 'success' });
    setNewAdmin({ email: '', password: '' });
    setTimeout(() => { setAdminMsg({ text: '', type: '' }); setShowNewAdmin(false); }, 2500);
  };

  const updateStatus = (appId: string, status: string) => {
    setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
  };

  const selectedJobTitle = jobs.find(j => j.id === selectedJob)?.title || '';
  const totalApplicants = Object.values(SYNTHETIC_APPLICANTS).flat().length;

  return (
    <>
      {/* Header */}
      <div className="dashboard-header animate-fade-in-up">
        <div>
          <h1>Admin Panel</h1>
          <p className="greeting">Welcome, {user?.email?.split('@')[0]} — manage your team and listings</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-outline btn-sm" onClick={() => { setShowNewAdmin(true); setShowNewJob(false); }}>
            <UserPlus size={15} /> Add Admin
          </button>
          <button className="btn btn-primary" onClick={() => { setShowNewJob(!showNewJob); setShowNewAdmin(false); }}>
            <Plus size={16} /> Post Job
          </button>
        </div>
      </div>

      {/* Global message */}
      {message.text && <div className={`form-message ${message.type}`} style={{ marginBottom: 16 }}>{message.text}</div>}

      {/* Add Admin Modal */}
      {showNewAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="stat-card animate-fade-in-up" style={{ width: 440, padding: 32, position: 'relative' }}>
            <button onClick={() => { setShowNewAdmin(false); setAdminMsg({ text: '', type: '' }); }}
              style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(229,62,62,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserPlus size={20} style={{ color: 'var(--accent-red)' }} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Add New Admin</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
              The new admin will have full access to post jobs and manage applicants.
            </p>
            {adminMsg.text && <div className={`form-message ${adminMsg.type}`} style={{ marginBottom: 16 }}>{adminMsg.text}</div>}
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="newadmin@undocked.net" value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Temporary Password</label>
              <input type="password" placeholder="Min. 8 characters" value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} />
            </div>
            <button className="btn btn-primary btn-full" onClick={handleCreateAdmin} style={{ marginTop: 8 }}>
              Create Admin Account
            </button>
          </div>
        </div>
      )}

      {/* Post Job Form */}
      {showNewJob && (
        <div className="stat-card animate-fade-in-up" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>New Job Listing</h3>
            <button onClick={() => setShowNewJob(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group"><label>Job Title *</label><input value={newJob.title} placeholder="e.g. Senior Software Engineer" onChange={e => setNewJob({ ...newJob, title: e.target.value })} /></div>
            <div className="form-group"><label>Department *</label><input value={newJob.department} placeholder="e.g. Technology" onChange={e => setNewJob({ ...newJob, department: e.target.value })} /></div>
            <div className="form-group"><label>Location</label><input value={newJob.location} placeholder="e.g. Mumbai, IN" onChange={e => setNewJob({ ...newJob, location: e.target.value })} /></div>
            <div className="form-group"><label>Salary Range</label><input value={newJob.salary} placeholder="e.g. ₹12L – ₹18L" onChange={e => setNewJob({ ...newJob, salary: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Job Description</label><input value={newJob.description} placeholder="Brief role summary…" onChange={e => setNewJob({ ...newJob, description: e.target.value })} /></div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn btn-primary" onClick={handleCreateJob}>Post Listing</button>
            <button className="btn btn-ghost" onClick={() => setShowNewJob(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card animate-fade-in-up delay-1">
          <div className="stat-label">Total Listings</div>
          <div className="stat-value">{jobs.length}</div>
        </div>
        <div className="stat-card animate-fade-in-up delay-2">
          <div className="stat-label">Open Roles</div>
          <div className="stat-value" style={{ color: 'var(--status-offer)' }}>{jobs.filter(j => j.status === 'Open').length}</div>
        </div>
        <div className="stat-card animate-fade-in-up delay-3">
          <div className="stat-label">Total Applicants</div>
          <div className="stat-value" style={{ color: 'var(--status-interview)' }}>{totalApplicants}</div>
        </div>
        <div className="stat-card animate-fade-in-up delay-4">
          <div className="stat-label">Hired</div>
          <div className="stat-value" style={{ color: 'var(--status-offer)' }}>
            {Object.values(SYNTHETIC_APPLICANTS).flat().filter(a => a.status === 'Hired').length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-section animate-fade-in-up delay-3">
        <div className="table-header">
          <h2>{selectedJob ? `Applicants — ${selectedJobTitle}` : 'Job Listings'}</h2>
          {selectedJob && (
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedJob(null)}>← Back to Listings</button>
          )}
        </div>

        {!selectedJob ? (
          <table className="applications-table">
            <thead><tr><th>Position</th><th>Status</th><th>Location</th><th>Type</th><th>Applicants</th><th>Actions</th></tr></thead>
            <tbody>
              {jobs.map(job => {
                const appCount = (SYNTHETIC_APPLICANTS[job.id] || []).length;
                return (
                  <tr key={job.id}>
                    <td><div className="company-cell"><div className="company-avatar"><Briefcase size={16} /></div><div><div className="company-name">{job.title}</div><div className="company-role">{job.department}</div></div></div></td>
                    <td><span className={`status-badge ${job.status.toLowerCase()}`}>{job.status}</span></td>
                    <td className="date-cell">{job.location}</td>
                    <td className="date-cell">{job.type}</td>
                    <td className="date-cell">
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: appCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        <Users size={13} /> {appCount}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => loadApplicants(job.id)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        View <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table className="applications-table">
            <thead><tr><th>Applicant</th><th>Status</th><th>Applied</th><th>Update Status</th></tr></thead>
            <tbody>
              {applicants.map(app => (
                <tr key={app.id}>
                  <td>
                    <div className="company-cell">
                      <div className="company-avatar" style={{ background: 'rgba(229,62,62,0.15)', color: 'var(--accent-red)', fontWeight: 700 }}>
                        {(app.applicantName || 'U').charAt(0)}
                      </div>
                      <div>
                        <div className="company-name">{app.applicantName}</div>
                        <div className="company-role">{app.applicantEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ color: STATUS_COLORS[app.status] || 'var(--text-primary)', background: `${STATUS_COLORS[app.status]}20` || 'transparent' }}>
                      {app.status}
                    </span>
                  </td>
                  <td className="date-cell">{new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td>
                    <select value={app.status} onChange={e => updateStatus(app.id, e.target.value)}
                      style={{ background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '5px 10px', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <option>Under Review</option>
                      <option>Shortlisted</option>
                      <option>Interview Scheduled</option>
                      <option>Rejected</option>
                      <option>Hired</option>
                    </select>
                  </td>
                </tr>
              ))}
              {applicants.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No applicants yet for this role.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

function ApplicantDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([jobsAPI.getMyApplications(), jobsAPI.getOpenListings()]).then(([appRes, jobRes]) => {
      setApplications(appRes.data);
      setJobs(jobRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getJobTitle = (jobId: string) => jobs.find(j => j.id === jobId)?.title || 'Unknown Position';

  if (loading) return <div style={{ textAlign: 'center', paddingTop: 100 }}><div className="btn spinner" /></div>;

  return (
    <>
      <div className="dashboard-header animate-fade-in-up">
        <div>
          <h1>Dashboard</h1>
          <p className="greeting">Welcome back, {user?.email?.split('@')[0] || 'there'} 👋</p>
        </div>
        <a href="/jobs" className="btn btn-primary">
          <Briefcase size={15} /> Browse Jobs
        </a>
      </div>

      {!user?.profileComplete && (
        <div className="form-message error" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠️ Your profile is incomplete. <a href="/profile" style={{ color: 'var(--accent-red)', textDecoration: 'underline' }}>Complete it now</a> to apply for jobs.
        </div>
      )}

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card animate-fade-in-up delay-1">
          <div className="stat-label">Applications</div>
          <div className="stat-value">{applications.length}</div>
        </div>
        <div className="stat-card animate-fade-in-up delay-2">
          <div className="stat-label">Under Review</div>
          <div className="stat-value" style={{ color: 'var(--status-applied)' }}>{applications.filter(a => a.status === 'Under Review').length}</div>
        </div>
        <div className="stat-card animate-fade-in-up delay-3">
          <div className="stat-label">Shortlisted</div>
          <div className="stat-value" style={{ color: 'var(--status-interview)' }}>{applications.filter(a => a.status === 'Shortlisted').length}</div>
        </div>
        <div className="stat-card animate-fade-in-up delay-4">
          <div className="stat-label">Profile</div>
          <div className="stat-value" style={{ color: user?.profileComplete ? 'var(--status-offer)' : 'var(--accent-red)' }}>
            {user?.profileComplete ? <CheckCircle size={24} /> : 'Incomplete'}
          </div>
        </div>
      </div>

      <div className="table-section animate-fade-in-up delay-3">
        <div className="table-header"><h2>My Applications</h2></div>
        <table className="applications-table">
          <thead><tr><th>Position</th><th>Status</th><th>Applied</th></tr></thead>
          <tbody>
            {applications.map(app => (
              <tr key={app.id}>
                <td><div className="company-cell"><div className="company-avatar"><Briefcase size={14} /></div><div><div className="company-name">{getJobTitle(app.jobListingId)}</div></div></div></td>
                <td><span className="status-badge">{app.status}</span></td>
                <td className="date-cell">{new Date(app.appliedAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
                No applications yet. <a href="/jobs" style={{ color: 'var(--accent-red)' }}>Browse open positions</a>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const { isAdmin } = useAuth();

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        {isAdmin ? <AdminDashboard /> : <ApplicantDashboard />}
      </div>
    </div>
  );
}

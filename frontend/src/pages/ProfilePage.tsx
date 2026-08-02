import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profileAPI } from '../services/api';
import { User as UserIcon, Save, SkipForward } from 'lucide-react';
import type { UserProfile } from '../types';

export default function ProfilePage() {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    fullName: '', dateOfBirth: '', placeOfBirth: '', education: '',
    pastExperience: '', skills: [], linkedInUrl: '',
  });
  const [skillInput, setSkillInput] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileAPI.get().then(res => {
      setProfile(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills?.includes(skillInput.trim())) {
      setProfile({ ...profile, skills: [...(profile.skills || []), skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills?.filter(s => s !== skill) });
  };

  const completionPercentage = () => {
    const fields = [profile.fullName, profile.dateOfBirth, profile.placeOfBirth,
      profile.education, profile.pastExperience, profile.linkedInUrl];
    const filled = fields.filter(f => f && f.trim() !== '').length;
    const skillsComplete = (profile.skills?.length || 0) > 0 ? 1 : 0;
    return Math.round(((filled + skillsComplete) / 7) * 100);
  };

  const handleSave = async () => {
    try {
      setError('');
      await profileAPI.update(profile);
      await refreshProfile();
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setError('Failed to update profile.');
    }
  };

  if (loading) return <div className="dashboard"><div className="dashboard-content" style={{ textAlign: 'center', paddingTop: 100 }}><div className="btn spinner" /></div></div>;

  const pct = completionPercentage();

  return (
    <div className="dashboard">
      <div className="dashboard-content" style={{ maxWidth: 700 }}>
        <div className="dashboard-header animate-fade-in-up">
          <div>
            <h1>Your Profile</h1>
            <p className="greeting">Complete your profile to apply for jobs</p>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
            <SkipForward size={16} /> Skip for now
          </button>
        </div>

        {/* Progress Bar */}
        <div className="stat-card animate-fade-in-up delay-1" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="stat-label">Profile Completion</span>
            <span style={{ color: pct === 100 ? 'var(--status-offer)' : 'var(--accent-red)', fontWeight: 600 }}>{pct}%</span>
          </div>
          <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-full)', height: 8 }}>
            <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? 'var(--status-offer)' : 'var(--accent-red)', borderRadius: 'var(--radius-full)', transition: 'width 0.5s ease' }} />
          </div>
        </div>

        {message && <div className="form-message success">{message}</div>}
        {error && <div className="form-message error">{error}</div>}

        <div className="stat-card animate-fade-in-up delay-2">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <UserIcon size={20} style={{ color: 'var(--accent-red)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Personal Information</h2>
          </div>

          <div className="form-group">
            <label>Full Name *</label>
            <input value={profile.fullName || ''} onChange={e => setProfile({ ...profile, fullName: e.target.value })} placeholder="John Doe" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" value={profile.dateOfBirth || ''} onChange={e => setProfile({ ...profile, dateOfBirth: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Place of Birth</label>
              <input value={profile.placeOfBirth || ''} onChange={e => setProfile({ ...profile, placeOfBirth: e.target.value })} placeholder="City, Country" />
            </div>
          </div>

          <div className="form-group">
            <label>Education *</label>
            <input value={profile.education || ''} onChange={e => setProfile({ ...profile, education: e.target.value })} placeholder="B.Tech Computer Science, MIT" />
          </div>

          <div className="form-group">
            <label>Past Experience</label>
            <input value={profile.pastExperience || ''} onChange={e => setProfile({ ...profile, pastExperience: e.target.value })} placeholder="2 years at TCS as Software Engineer" />
          </div>

          <div className="form-group">
            <label>Skills</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Type a skill and press Enter" style={{ flex: 1 }} />
              <button className="btn btn-outline btn-sm" onClick={addSkill} type="button">Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {profile.skills?.map(skill => (
                <span key={skill} style={{ background: 'rgba(229,62,62,0.15)', color: 'var(--accent-red)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  {skill}
                  <button onClick={() => removeSkill(skill)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1 }}>&times;</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>LinkedIn URL</label>
            <input value={profile.linkedInUrl || ''} onChange={e => setProfile({ ...profile, linkedInUrl: e.target.value })} placeholder="https://linkedin.com/in/johndoe" />
          </div>

          <button className="btn btn-primary btn-full" onClick={handleSave} style={{ marginTop: 16 }}>
            <Save size={16} /> Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

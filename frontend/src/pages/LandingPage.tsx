import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Target,
  BarChart3,
  Bell,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
} from 'lucide-react';

const BRAND_NAMES = [
  'FedEx', 'DHL', 'UPS', 'Maersk', 'XPO',
  'Ryder', 'Amazon', 'Lineage', 'Penske', 'C.H. Robinson',
  'DSV', 'DB Schenker', 'Geodis', 'BollorÃ©', 'Expeditors',
];

const FEATURES = [
  {
    icon: <Target size={24} />,
    title: 'End-to-End Tracking',
    description:
      'Never lose track of your inventory. Organize all your warehouse operations in one beautiful dashboard.',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Supply Chain Analytics',
    description:
      'Gain insights into your supply chain with real-time statistics, capacity trends, and fulfillment rates.',
  },
  {
    icon: <Bell size={24} />,
    title: 'Smart Alerts',
    description:
      'Get timely alerts for low stock, shipping delays, and maintenance deadlines so you never miss a beat.',
  },
  {
    icon: <Shield size={24} />,
    title: 'Secure Infrastructure',
    description:
      'Your logistics data is encrypted and private. We ensure full compliance with industry standards.',
  },
  {
    icon: <Zap size={24} />,
    title: 'Lightning Fast Operations',
    description:
      'Built for speed. Manage shipments, update inventory, and handle orders in seconds with our streamlined interface.',
  },
  {
    icon: <Sparkles size={24} />,
    title: 'Modern Warehouse Design',
    description:
      'A premium, modern interface that makes warehouse management less stressful and more efficient.',
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={14} />
            Your Logistics, Simplified
          </div>

          <h1>
            Transform Your Supply Chain<br />
            <span className="highlight">With Confidence</span>
          </h1>

          <p className="hero-subtitle">
            From tracking shipments to managing warehouse inventory â€” stay organized,
            stay ahead, and never delay a delivery again.
          </p>

          <div className="hero-buttons">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg">
                Go to Dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Brands / Logos Scrolling Bar */}
      <section className="brands-section">
        <p>Trusted by top logistics teams at</p>
        <div style={{ overflow: 'hidden' }}>
          <div className="brands-track">
            {[...BRAND_NAMES, ...BRAND_NAMES].map((name, i) => (
              <span key={i} className="brand-item">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Everything You Need to <span className="highlight">Scale</span></h2>
          <p>
            Powerful features designed to streamline your warehouse operations and help you
            deliver faster.
          </p>
        </div>

        <div className="features-grid">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="feature-card animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>
          © {new Date().getFullYear()} Undocked. All rights reserved.
        </p>
      </footer>
    </>
  );
}


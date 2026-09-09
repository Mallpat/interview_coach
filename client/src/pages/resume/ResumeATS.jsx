import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Briefcase, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Search
} from 'lucide-react';
import { api } from '../../services/api';

const SAMPLE_RESUME = `ALEX CHEN
Full Stack Engineer | San Francisco, CA | alex.chen@example.com | github.com/alexchen | linkedin.com/in/alexchen

PROFESSIONAL SUMMARY
Senior Full Stack Engineer with 5+ years of experience architecting high-throughput distributed web applications and modern React frontend architectures. Spearheaded microservices migration reducing P99 latency by 45% and scaled APIs to 1.2M daily active users.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, SQL
Frontend: React, Next.js, Redux, Tailwind CSS, Vite, HTML5, CSS3
Backend & Cloud: Node.js, Express, PostgreSQL, Redis, Docker, AWS (S3, EC2), CI/CD, REST APIs, GraphQL
Testing & Tooling: Jest, Vitest, Git, Linux, Agile

PROFESSIONAL EXPERIENCE
Senior Software Engineer | TechScale Inc. | 2022 - Present
- Architected and deployed a real-time event streaming dashboard using React, WebSockets, and Node.js, boosting customer engagement by 35%.
- Optimized PostgreSQL database indexes and query plans, reducing average API response times from 450ms to 65ms under 5,000 req/sec load.
- Spearheaded migration to automated CI/CD pipelines with GitHub Actions and Docker, accelerating deployment frequency by 3x.
- Mentored 4 junior engineers on clean code architecture and test-driven development practices.

Software Engineer | NextWave Systems | 2019 - 2022
- Developed scalable customer-facing payment workflows with Stripe integrations, processing $4.2M in annual transactions.
- Refactored legacy monolithic services into modular REST microservices with Node.js and Express.
- Collaborated with UX designers to achieve 98% Lighthouse accessibility scores across core web journeys.

EDUCATION
B.S. in Computer Science | University of California, Berkeley | 2015 - 2019`;

const SAMPLE_JD = `Stripe - Senior Full Stack Engineer (Payments & Infrastructure)

About the Role:
We are looking for a Senior Full Stack Engineer to build reliable, high-performance financial systems that process billions of dollars daily.

Requirements:
- 4+ years of professional full-stack development experience.
- Strong proficiency in JavaScript, TypeScript, React, and Node.js.
- Deep experience with relational databases (PostgreSQL) and caching layers (Redis).
- Proven track record with microservices, Docker, Kubernetes, and CI/CD pipelines.
- Experience with payment systems, REST APIs, and event-driven architectures (Kafka).
- Excellent communication skills and passion for mentoring fellow engineers.`;

export const ResumeATS = () => {
  const [activeTab, setActiveTab] = useState('ats'); // ats, jdMatcher
  const [resumeText, setResumeText] = useState(SAMPLE_RESUME);
  const [targetRole, setTargetRole] = useState('Full Stack Engineer');
  const [analyzing, setAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState(null);

  // JD Matcher state
  const [jdText, setJdText] = useState(SAMPLE_JD);
  const [jobTitle, setJobTitle] = useState('Senior Full Stack Engineer at Stripe');
  const [matching, setMatching] = useState(false);
  const [jdResult, setJdResult] = useState(null);

  const handleAnalyzeResume = async () => {
    if (!resumeText.trim()) return;
    setAnalyzing(true);
    try {
      const res = await api.analyzeResumeText(resumeText, targetRole);
      setAtsResult(res.analysis);
    } catch (err) {
      console.error('Failed to analyze resume:', err);
      alert('Error analyzing resume: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMatchJD = async () => {
    if (!resumeText.trim() || !jdText.trim()) return;
    setMatching(true);
    try {
      const res = await api.matchJobDescription({
        resumeText,
        jdText,
        jobTitle
      });
      setJdResult(res);
    } catch (err) {
      console.error('Failed to match JD:', err);
      alert('Error matching JD: ' + err.message);
    } finally {
      setMatching(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('ats')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'ats' ? 'rgba(0, 242, 254, 0.12)' : 'transparent',
            color: activeTab === 'ats' ? '#00F2FE' : '#94A3B8',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <FileText size={18} /> Resume ATS Analyzer
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('jdMatcher')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '10px',
            border: 'none',
            background: activeTab === 'jdMatcher' ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
            color: activeTab === 'jdMatcher' ? '#C4B5FD' : '#94A3B8',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Briefcase size={18} /> Job Description Matcher
        </button>
      </div>

      {/* TAB 1: RESUME ATS ANALYZER */}
      {activeTab === 'ats' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '1.5rem' }}>
          {/* Resume Input Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF' }}>Resume Text Input</h3>
              <button
                type="button"
                onClick={() => setResumeText(SAMPLE_RESUME)}
                style={{ background: 'none', border: 'none', color: '#00F2FE', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Load Sample Resume
              </button>
            </div>

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your plain-text or parsed resume content here..."
              style={{
                width: '100%',
                height: '420px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '1rem',
                color: '#CBD5E1',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                lineHeight: 1.5,
                resize: 'none',
                outline: 'none'
              }}
            />

            <button
              onClick={handleAnalyzeResume}
              disabled={analyzing}
              className="btn-primary"
              style={{ justifyContent: 'center', padding: '0.75rem' }}
            >
              <Sparkles size={18} />
              {analyzing ? 'Evaluating ATS Scoring Engine...' : 'Scan & Calculate ATS Score'}
            </button>
          </div>

          {/* Results Panel */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF' }}>ATS Screening Report</h3>

            {!atsResult ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
                <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                <p>Click "Scan & Calculate ATS Score" to evaluate formatting, action verbs, keyword density, and quantifiable impact.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Score Dial */}
                <div style={{
                  padding: '1.25rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 242, 254, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Overall ATS Compatibility</span>
                    <h4 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#00F2FE' }}>{atsResult.atsScore}%</h4>
                  </div>
                  <span className={atsResult.atsScore >= 80 ? 'badge badge-emerald' : 'badge badge-amber'}>
                    {atsResult.atsScore >= 80 ? 'Passes Screening' : 'Needs Polish'}
                  </span>
                </div>

                {/* Section Checkpoints */}
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: '0.5rem' }}>
                    Critical Sections Detected
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {Object.entries(atsResult.sectionBreakdown?.sectionsDetected || {}).map(([sec, present]) => (
                      <span
                        key={sec}
                        className={present ? 'badge badge-emerald' : 'badge badge-rose'}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {sec.toUpperCase()}: {present ? '✓' : 'MISSING'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metrics & Action Verbs Count */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Action Verbs Found</span>
                    <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF' }}>
                      {atsResult.sectionBreakdown?.actionVerbsCount} <span style={{ fontSize: '0.75rem', color: '#6EE7B7' }}>strong</span>
                    </p>
                  </div>

                  <div style={{ padding: '0.85rem', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Quantifiable Metrics</span>
                    <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFF' }}>
                      {atsResult.sectionBreakdown?.metricCount} <span style={{ fontSize: '0.75rem', color: '#6EE7B7' }}>detected</span>
                    </p>
                  </div>
                </div>

                {/* Strengths & Recommendations */}
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6EE7B7', display: 'block', marginBottom: '0.4rem' }}>
                    ATS Strengths
                  </span>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: '#CBD5E1' }}>
                    {atsResult.strengths?.map((st, i) => (
                      <li key={i} style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ color: '#10B981' }}>✓</span> {st}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FCD34D', display: 'block', marginBottom: '0.4rem' }}>
                    Actionable Improvements
                  </span>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: '#CBD5E1' }}>
                    {atsResult.improvements?.map((im, i) => (
                      <li key={i} style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ color: '#F59E0B' }}>→</span> {im}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: JOB DESCRIPTION MATCHER */}
      {activeTab === 'jdMatcher' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Inputs */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF' }}>Target Job Description</h3>
              <button
                type="button"
                onClick={() => { setJdText(SAMPLE_JD); setJobTitle('Senior Full Stack Engineer at Stripe'); }}
                style={{ background: 'none', border: 'none', color: '#C4B5FD', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Load Stripe JD
              </button>
            </div>

            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Target Role (e.g. Senior Full Stack Engineer at Stripe)"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#FFF',
                fontSize: '0.875rem'
              }}
            />

            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the complete job description text from LinkedIn, Greenhouse, or Lever..."
              style={{
                width: '100%',
                height: '340px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '10px',
                padding: '1rem',
                color: '#CBD5E1',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                lineHeight: 1.5,
                resize: 'none',
                outline: 'none'
              }}
            />

            <button
              onClick={handleMatchJD}
              disabled={matching}
              className="btn-primary"
              style={{
                justifyContent: 'center',
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
              }}
            >
              <Search size={18} />
              {matching ? 'Comparing Skills & Gaps...' : 'Compare Resume with Job Description'}
            </button>
          </div>

          {/* Match Results */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFF' }}>JD Match Breakdown</h3>

            {!jdResult ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
                <Briefcase size={48} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
                <p>Click "Compare Resume with Job Description" to detect matched skills, missing keywords, and tailored interview prep advice.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Match Score Card */}
                <div style={{
                  padding: '1.25rem',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Role Match Compatibility</span>
                    <h4 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#C4B5FD' }}>{jdResult.matchScore}%</h4>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>High Fit</span>
                </div>

                {/* Matched Skills */}
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6EE7B7', display: 'block', marginBottom: '0.5rem' }}>
                    Matched Skills Found in Resume ({jdResult.matchedSkills?.length})
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {jdResult.matchedSkills?.map((skill) => (
                      <span key={skill} className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FDA4AF', display: 'block', marginBottom: '0.5rem' }}>
                    Missing Keywords to Address ({jdResult.missingSkills?.length})
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {jdResult.missingSkills?.length > 0 ? (
                      jdResult.missingSkills.map((skill) => (
                        <span key={skill} className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: '#6EE7B7' }}>No critical missing skills!</span>
                    )}
                  </div>
                </div>

                {/* Customized Interview Talking Points */}
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#00F2FE', display: 'block', marginBottom: '0.5rem' }}>
                    Tailored Interview Talking Points
                  </span>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#CBD5E1' }}>
                    {jdResult.recommendations?.map((rec, i) => (
                      <li key={i} style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ color: '#00F2FE' }}>💡</span> {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

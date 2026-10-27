// Shared two-panel layout for Login and Signup
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <div className="brand light"><span className="brand-mark">C</span> CampusCare</div>
        <h2>Report it. Track it. See it fixed.</h2>
        <ol className="track">
          <li><b>Pending</b><span>You report the issue</span></li>
          <li><b>In progress</b><span>The warden takes it up</span></li>
          <li><b>Resolved</b><span>Fixed, with a remark</span></li>
        </ol>
      </aside>
      <section className="auth-main">
        <div className="auth-box">
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
        </div>
      </section>
    </div>
  );
}

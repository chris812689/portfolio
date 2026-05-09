// portfolio.jsx — Christopher Williams portfolio app

const { useState, useEffect, useRef, useMemo } = React;

// ── Hooks ────────────────────────────────────────────────────────────────────
function useTypewriter(words, { typeSpeed = 90, deleteSpeed = 40, pause = 1400 } = {}) {
  const [idx, setIdx] = useState(0);
  const [sub, setSub] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const word = words[idx % words.length];

  useEffect(() => {
    if (!deleting && sub === word.length) {
      const t = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(t);
    }
    if (deleting && sub === 0) {
      setDeleting(false);
      setIdx((i) => (i + 1) % words.length);
      return;
    }
    const t = setTimeout(
      () => setSub((s) => s + (deleting ? -1 : 1)),
      deleting ? deleteSpeed : typeSpeed
    );
    return () => clearTimeout(t);
  }, [sub, deleting, word, words.length, typeSpeed, deleteSpeed, pause]);

  return word.slice(0, sub);
}

function useInView(opts = { threshold: 0.25 }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        obs.disconnect();
      }
    }, opts);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function useCountUp(target, { duration = 1600, start = false } = {}) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf, t0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return n;
}

function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 120;
      let cur = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) cur = id;
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids.join(",")]);
  return active;
}

// ── Inline icons ─────────────────────────────────────────────────────────────
const Icon = {
  arrow: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>),
  download: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 4v12m-5-5 5 5 5-5M5 20h14"/></svg>),
  mail: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>),
  linkedin: (p) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.75V21h-4v-5.5c0-1.32-.03-3-1.85-3s-2.13 1.42-2.13 2.9V21h-4V9Z"/></svg>),
  github: (p) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.61.07-.61 1.01.07 1.54 1.04 1.54 1.04.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.69-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>),
  twitter: (p) => (<svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>),
  // Stat icons
  briefcase: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg>),
  chart: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>),
  users: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M17 11a3 3 0 0 0 0-6M22 20a5.5 5.5 0 0 0-4-5.3"/></svg>),
  award: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="9" r="6"/><path d="m8.5 13.5-2 7L12 18l5.5 2.5-2-7"/></svg>),
  // Skill / domain icons
  database: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><ellipse cx="12" cy="5.5" rx="8" ry="2.5"/><path d="M4 5.5v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-6M4 11.5v6c0 1.4 3.6 2.5 8 2.5s8-1.1 8-2.5v-6"/></svg>),
  bars: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 21V9M10 21V4M16 21v-9M4 21h18"/></svg>),
  py: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8 4.5a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3V9H8z"/><path d="M16 19.5a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3V15h8z"/><circle cx="10" cy="6" r=".7" fill="currentColor"/><circle cx="14" cy="18" r=".7" fill="currentColor"/></svg>),
  excel: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 16h18M9 4v16M15 4v16"/></svg>),
  brain: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5 3 3 0 0 0 2 5v1a3 3 0 0 0 6 0V4a3 3 0 0 0-3 0Z"/><path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-2 5v1a3 3 0 0 1-6 0"/></svg>),
  flow: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><path d="M9 6h6M18 9v6M9 6c0 6 6 6 6 12"/></svg>),
  layers: (p) => (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 12l10 5 10-5"/><path d="M2 17l10 5 10-5"/></svg>),
};

// ── Section: Nav ─────────────────────────────────────────────────────────────
function Nav({ active, t }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 24);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  const links = ["about", "skills", "stats", "portfolio", "contact"];
  return (
    <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <a href="#hero" className="nav-brand">
        <span className="nav-brand-mark" style={{ background: t.teal }}>cw</span>
        <span className="nav-brand-name">Christopher Williams</span>
      </a>
      <div className="nav-links">
        {links.map((l) => (
          <a key={l} href={`#${l}`} className={active === l ? "nav-active" : ""}>
            {l.charAt(0).toUpperCase() + l.slice(1)}
          </a>
        ))}
      </div>
      <a href="#contact" className="nav-cta" style={{ background: t.teal }}>
        Get in touch
      </a>
      <button className="nav-burger" onClick={() => setOpen((o) => !o)} aria-label="menu">
        <span /><span /><span />
      </button>
      {open && (
        <div className="nav-mobile" onClick={() => setOpen(false)}>
          {links.map((l) => (
            <a key={l} href={`#${l}`}>{l.charAt(0).toUpperCase() + l.slice(1)}</a>
          ))}
        </div>
      )}
    </nav>
  );
}

// ── Section: Hero ────────────────────────────────────────────────────────────
function Hero({ t }) {
  const word = useTypewriter(["Data Analyst", "SQL Developer", "Tableau Specialist"]);
  return (
    <section id="hero" className="hero" data-screen-label="01 Hero">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-glow" aria-hidden="true" style={{ background: `radial-gradient(circle at 70% 30%, ${t.teal}33, transparent 60%)` }} />
      <div className="hero-inner">
        <div className="hero-eyebrow">
          <span className="hero-dot" style={{ background: t.teal }} />
          <span>Available for new projects · Q3 2026</span>
        </div>
        <h1 className="hero-title">
          Hi, I'm <span className="serif-it" style={{ color: t.teal }}>Christopher Williams</span>.<br />
          I turn <span className="serif-it">messy</span> data<br />into decisions you can <span className="serif-it">act on</span>.
        </h1>
        <div className="hero-typer">
          <span className="hero-typer-prefix">$&nbsp;</span>
          <span className="hero-typer-text">{word}</span>
          <span className="hero-typer-caret" style={{ background: t.teal }} />
        </div>
        <div className="hero-cta">
          <a href="#portfolio" className="btn-primary" style={{ background: t.teal }}>
            View my work <Icon.arrow width="16" height="16" />
          </a>
          <a href="Christopher_Williams_Resume.pdf" download className="btn-ghost">
            <Icon.download width="16" height="16" /> Download résumé
          </a>
        </div>
        <div className="hero-meta">
          <div><b>6+ yrs</b> in analytics</div>
          <div><b>40+</b> dashboards shipped</div>
          <div><b>$12M</b> revenue influenced</div>
        </div>
      </div>
      <a href="#about" className="hero-scroll" aria-label="Scroll">
        <span className="hero-scroll-line" />
        <span>scroll</span>
      </a>
    </section>
  );
}

// ── Section: Marquee ─────────────────────────────────────────────────────────
function Marquee({ t }) {
const items = [
  { l: "SQL",                   star: true },
  { l: "Tableau",               star: false },
  { l: "Available Q3 2026",     star: true },
  { l: "Python",                star: false },
  { l: "HTML/CSS",              star: false },
  { l: "Woodstock → everywhere",star: true },
  { l: "JavaScript",            star: false },
  { l: "Webflow",               star: false },
  { l: "let's build",           star: true },
  { l: "A/B testing",           star: false },
  { l: "Power BI",              star: false },
];
  const colors = [t.teal, "#fbbf24", "#f97366", "#8b5cf6", "#0ea5e9", "#ec4899", "#22c55e"];
  const row = (
    <div className="marquee-row">
      {items.map((it, i) => (
        <span key={i} className="marquee-item">
          <span className="serif-it">{it.l}</span>
          <span className="marquee-star" style={{ color: colors[i % colors.length] }}>✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <section className="marquee" aria-hidden="true">
      <div className="marquee-track">{row}{row}</div>
    </section>
  );
}

// ── Section: About ───────────────────────────────────────────────────────────
function About({ t }) {
  return (
    <section id="about" className="section section-about" data-screen-label="02 About">
      <SectionHead num="01" eyebrow="About" title={<>A <span className="serif-it">pragmatic</span> analyst who likes the <span className="serif-it">boring</span> questions.</>} t={t} />
      <div className="about-grid">
        <div className="about-portrait">
          <div className="about-portrait-bg" style={{ background: `linear-gradient(135deg, ${t.teal}, #0f766e)` }} />
          <div className="about-portrait-frame">
            <img src="Profile_Pic.jpg" alt="Christopher Williams" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "18px" }} />
          </div>
          <div className="about-sticker about-sticker-1" style={{ background: "#fbbf24" }}>
            <span>★</span> 4 yrs experience
          </div>
          <div className="about-sticker about-sticker-3" style={{ background: "#fff", borderColor: t.teal, color: t.teal }}>
            <span style={{ color: t.teal }}>◉</span> Woodstock, GA
          </div>
        </div>
        <div className="about-copy">
          <p className="about-lede">
            For the last four years I've worked in data analytics at Pilot Flying J — a Fortune 500 trucking and travel center company — building SQL pipelines, Tableau dashboards and SSRS reports that went directly to C-suite leadership. The work speaks for itself.
          </p>
          <div className="about-tags">
            {[
              { l: "SQL",      c: t.teal },
              { l: "Tableau",  c: "#f97366" },
              { l: "Power BI", c: "#fbbf24" },
              { l: "SSRS",     c: "#22c55e" },
              { l: "Excel",    c: "#8b5cf6" },
              { l: "Python",   c: "#0ea5e9" },
              { l: "HTML/CSS", c: "#ec4899" },
            ].map((tag) => (
              <span key={tag.l} className="tag tag-color" style={{ "--tag-c": tag.c }}>{tag.l}</span>
            ))}
          </div>
          <a
            href="https://www.credly.com/users/christopher-williams.dfb463ca"
            target="_blank"
            rel="noopener noreferrer"
            className="cert-card"
            style={{ "--cert-teal": t.teal }}
          >
            <div className="cert-card-icon" style={{ background: `color-mix(in oklab, ${t.teal} 14%, white)`, color: t.teal }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div className="cert-card-body">
              <div className="cert-card-name">Tableau Desktop Specialist</div>
              <div className="cert-card-sub">Credly · Verified Certification</div>
            </div>
            <div className="cert-card-arrow" style={{ color: t.teal }}>
              <Icon.arrow width="16" height="16" />
            </div>
          </a>
          <div className="about-signature">— Chris</div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ num, eyebrow, title, t, align = "left" }) {
  return (
    <header className={`sect-head sect-head-${align}`}>
      <div className="sect-head-line">
        <span className="sect-num" style={{ color: t.teal }}>{num}</span>
        <span className="sect-rule" />
        <span className="sect-eyebrow">{eyebrow}</span>
      </div>
      <h2 className="sect-title">{title}</h2>
    </header>
  );
}

// ── Section: Skills (circular progress) ──────────────────────────────────────
function CircleSkill({ label, value, sub, icon: I, color, animate }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!animate) return;
    let raf, t0;
    const dur = 1400;
    const tick = (t) => {
      if (!t0) t0 = t;
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(eased * value);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, value]);
  const offset = c - (shown / 100) * c;
  return (
    <div className="skill" style={{ "--skill-tint": color }}>
      <div className="skill-ring">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(15,30,35,.08)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="skill-icon"><I width="22" height="22" /></div>
        <div className="skill-pct">{Math.round(shown)}<span>%</span></div>
      </div>
      <div className="skill-label">{label}</div>
      <div className="skill-sub">{sub}</div>
    </div>
  );
}

function Skills({ t }) {
  const [ref, inView] = useInView();
  const trackRef = useRef(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const items = [
    { label: "SQL",        value: 95, sub: "T-SQL · Joins · Stored Procedures",   icon: Icon.database, color: t.teal },
    { label: "Tableau",    value: 92, sub: "Dashboards · LOD calcs",              icon: Icon.bars,     color: "#f97366" },
    { label: "Python",     value: 84, sub: "pandas · automation",                 icon: Icon.py,       color: "#fbbf24" },
    { label: "Excel",      value: 90, sub: "Models · Power Query",                icon: Icon.excel,    color: "#22c55e" },
    { label: "Statistics", value: 78, sub: "A/B testing · regression",            icon: Icon.brain,    color: "#8b5cf6" },
    { label: "Power BI",   value: 82, sub: "DAX · Data Modeling",                 icon: Icon.bars,     color: "#0ea5e9" },
    { label: "SSRS",       value: 85, sub: "Paginated Reports · Subscriptions",   icon: Icon.chart,    color: "#a78bfa" },
    { label: "HTML/CSS",   value: 88, sub: "Responsive · Flexbox · Grid",         icon: Icon.flow,     color: "#ec4899" },
    { label: "JavaScript", value: 75, sub: "DOM · Fetch · ES6+",                  icon: Icon.brain,     color: "#0d9488" },
    { label: "Webflow",    value: 82, sub: "Layout · CMS · Interactions",         icon: Icon.layers,     color: "#f59e0b" },
  ];

  // Compute pages based on visible cards
  useEffect(() => {
    const recalc = () => {
      const el = trackRef.current;
      if (!el) return;
      const card = el.querySelector(".skill");
      if (!card) return;
      const cardW = card.getBoundingClientRect().width + 20; // gap
      const visible = Math.max(1, Math.round(el.clientWidth / cardW));
      setPageCount(Math.max(1, Math.ceil(items.length / visible)));
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    if (trackRef.current) ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [items.length]);

  const scrollByDir = (dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".skill");
    const cardW = card ? card.getBoundingClientRect().width + 28 : el.clientWidth * 0.85;
    el.scrollBy({ left: dir * cardW, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const p = Math.round((el.scrollLeft / el.scrollWidth) * pageCount);
    setPage(Math.min(pageCount - 1, p));
  };

  // Auto-cycle through cards
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || !inView) return;
    const id = setInterval(() => {
      const el = trackRef.current;
      if (!el) return;
      const card = el.querySelector(".skill");
      const cardW = card ? card.getBoundingClientRect().width + 28 : 320;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: cardW, behavior: "smooth" });
      }
    }, 3200);
    return () => clearInterval(id);
  }, [paused, inView]);

  return (
    <section id="skills" className="section section-skills" ref={ref} data-screen-label="03 Skills">
      <div className="skills-head">
        <SectionHead num="02" eyebrow="Skills" title={<>The tools I reach for, ranked <span className="serif-it">honestly</span>.</>} t={t} />
        <div className="carousel-ctrls">
          <button className="carousel-btn" onClick={() => scrollByDir(-1)} aria-label="Previous">
            <Icon.arrow width="16" height="16" style={{ transform: "rotate(180deg)" }} />
          </button>
          <button className="carousel-btn" onClick={() => scrollByDir(1)} aria-label="Next">
            <Icon.arrow width="16" height="16" />
          </button>
        </div>
      </div>
      <div
        className="skills-track"
        ref={trackRef}
        onScroll={onScroll}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
      >
        {items.map((s) => (
          <CircleSkill key={s.label} {...s} animate={inView} />
        ))}
      </div>
      <div className="carousel-dots">
        {Array.from({ length: pageCount }).map((_, i) => (
          <button
            key={i}
            className={`carousel-dot ${i === page ? "carousel-dot-on" : ""}`}
            style={i === page ? { background: t.teal } : null}
            onClick={() => {
              const el = trackRef.current;
              if (!el) return;
              el.scrollTo({ left: (el.scrollWidth / pageCount) * i, behavior: "smooth" });
            }}
            aria-label={`Page ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

// ── Section: Stats ───────────────────────────────────────────────────────────
function StatCard({ value, suffix, label, icon: I, color, animate }) {
  const n = useCountUp(value, { start: animate, duration: 1800 });
  return (
    <div className="stat">
      <div className="stat-icon" style={{ color }}>
        <I width="26" height="26" />
      </div>
      <div className="stat-value">
        {n.toLocaleString()}<span className="stat-suffix">{suffix}</span>
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Stats({ t }) {
  const [ref, inView] = useInView();
  const items = [
    { value: 4,   suffix: "",  label: "Years in analytics",          icon: Icon.briefcase, color: t.teal },
    { value: 17,  suffix: "",  label: "Tableau dashboards published", icon: Icon.chart,     color: "#fbbf24" },
    { value: 348, suffix: "",  label: "Books read",                   icon: Icon.users,     color: "#f97366" },
    { value: 150, suffix: "+", label: "Queries & reports delivered",  icon: Icon.award,     color: "#8b5cf6" },
  ];
  return (
    <section id="stats" className="section-stats" ref={ref} data-screen-label="04 Stats">
      <div className="section-stats-inner">
        <div className="stats-eyebrow">By the numbers</div>
        <div className="stats-grid">
          {items.map((s) => (
            <StatCard key={s.label} {...s} animate={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: Portfolio ───────────────────────────────────────────────────────
const TABLEAU_DASHBOARDS = [
  { id: 1, name: "SpotifyData_16583152459990/MutiPlot",                 label: "Spotify · Multi Plot Analysis", cat: "tableau" },
  { id: 2, name: "SalesToGeoLocation/SalesbyCity",                      label: "Sales by City · Geo Analysis",  cat: "tableau" },
  { id: 4, name: "WorldDemographics_16567800470460/WroldDemorgraphics", label: "World Demographics",             cat: "tableau" },
  { id: 5, name: "KivaLoans_16596964291920/KivaLoansDashboard",         label: "Kiva Loans Dashboard",           cat: "tableau" },
];

const PORTFOLIO_FILTERS = [
  { key: "all",     label: "All" },
  { key: "tableau", label: "Tableau Dashboards" },
  { key: "web",     label: "Web Projects" },
];

function TableauCard({ dash, t }) {
  const src = `https://public.tableau.com/views/${dash.name}?:showVizHome=no&:tabs=no&:toolbar=no`;
  const publicUrl = `https://public.tableau.com/views/${dash.name}`;
  return (
    <div className="viz-card">
      <div className="viz-card-embed">
        <div style={{ width: "100%", height: "600px" }}>
          <iframe
            src={src}
            title={dash.label}
            width="100%"
            height="100%"
            frameBorder="0"
            scrolling="no"
            allowFullScreen
            style={{ display: "block", minHeight: "600px", border: "0px" }}
          />
        </div>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="viz-card-overlay"
          style={{ "--teal": t.teal }}
        >
          <span className="viz-card-overlay-btn" style={{ background: t.teal }}>
            <Icon.arrow width="14" height="14" />
            Click to view full dashboard
          </span>
        </a>
      </div>
      <div className="viz-card-footer">
        <div className="viz-card-title">{dash.label}</div>
        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="viz-card-link" style={{ color: t.teal }}>
          View on Tableau Public <Icon.arrow width="13" height="13" />
        </a>
      </div>
    </div>
  );
}

function Portfolio({ t }) {
  const [filter, setFilter] = useState("all");
  const list = useMemo(
    () => TABLEAU_DASHBOARDS.filter((d) => filter === "all" || d.cat === filter),
    [filter]
  );
  return (
    <section id="portfolio" className="section" data-screen-label="05 Portfolio">
      <SectionHead num="03" eyebrow="Portfolio" title={<>A few things I've <span className="serif-it">built</span> recently.</>} t={t} />
      <div className="filters">
        {PORTFOLIO_FILTERS.map((f) => {
          const count = f.key === "all"
            ? TABLEAU_DASHBOARDS.length
            : TABLEAU_DASHBOARDS.filter((d) => d.cat === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`filter ${filter === f.key ? "filter-active" : ""}`}
              style={filter === f.key ? { background: t.teal, color: "#fff", borderColor: t.teal } : null}
            >
              {f.label}
              <span className="filter-count">{count}</span>
            </button>
          );
        })}
      </div>
      <div className="viz-grid">
        {list.length === 0 ? (
          <p className="viz-empty">No projects in this category yet.</p>
        ) : (
          list.map((d) => <TableauCard key={d.id} dash={d} t={t} />)
        )}
      </div>
    </section>
  );
}

// ── Section: Contact ─────────────────────────────────────────────────────────
function Contact({ t }) {
  const [form, setForm] = useState({ name: "", email: "", project: "analytics", msg: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | sent | error
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  const submit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("https://formspree.io/f/xzdojlwl", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, project: form.project, message: form.msg }),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", project: "analytics", msg: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };
  const nyTime = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }).format(now);

  return (
    <section id="contact" className="section-contact" data-screen-label="06 Contact">
      <div className="contact-shout">
        <div className="contact-shout-meta">
          <span className="contact-status">
            <span className="contact-status-dot" style={{ background: "#22c55e" }} />
            Available — Q3 2026
          </span>
          <span className="contact-time">Woodstock, GA · {nyTime}</span>
        </div>
        <h2 className="contact-headline">
          Let's <span className="serif-it" style={{ color: t.teal }}>talk</span><br />
          about your <span className="serif-it">data</span>.
        </h2>
      </div>

      <div className="contact-grid">
        <div className="contact-left">
          <p className="contact-lede">
            Drop a line — I usually reply within a day. Happy to chat about a full
            engagement, a one-week sprint, or just a <span className="serif-it">sanity check</span> on a model you're building.
          </p>
          <ul className="contact-list">
            <li>
              <span className="contact-icon" style={{ background: `color-mix(in oklab, ${t.teal} 18%, white)`, color: t.teal }}><Icon.mail width="20" height="20" /></span>
              <div>
                <div className="contact-k">Email</div>
                <a href="mailto:chris812689@gmail.com">chris812689@gmail.com</a>
              </div>
            </li>
            <li>
              <span className="contact-icon" style={{ background: "color-mix(in oklab, #0ea5e9 18%, white)", color: "#0ea5e9" }}><Icon.linkedin width="20" height="20" /></span>
              <div>
                <div className="contact-k">LinkedIn</div>
                <a href="https://www.linkedin.com/in/christopher-williams-8a6599186" target="_blank" rel="noopener noreferrer">linkedin.com/in/christopher-williams-8a6599186</a>
              </div>
            </li>
            <li>
              <span className="contact-icon" style={{ background: "color-mix(in oklab, #8b5cf6 18%, white)", color: "#8b5cf6" }}><Icon.github width="20" height="20" /></span>
              <div>
                <div className="contact-k">GitHub</div>
                <a href="https://github.com/chris812689" target="_blank" rel="noopener noreferrer">github.com/chris812689</a>
              </div>
            </li>
          </ul>
          <div className="contact-signature">
            <div className="contact-signature-name">Chris</div>
            <div className="contact-signature-sub">— signed, your future analyst</div>
          </div>
        </div>
        <form className="contact-form" onSubmit={submit}>
          <div className="contact-form-tag" style={{ background: t.teal }}>say hi</div>
          <div className="contact-form-row">
            <label>
              <span>Your name</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" required />
            </label>
            <label>
              <span>Email</span>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" required />
            </label>
          </div>
          <label>
            <span>What kind of project?</span>
            <div className="seg">
              {[
                { k: "analytics", v: "Analytics" },
                { k: "dashboard", v: "Dashboard" },
                { k: "web", v: "Web build" },
                { k: "other", v: "Other" },
              ].map((o) => (
                <button
                  key={o.k}
                  type="button"
                  className={form.project === o.k ? "seg-on" : ""}
                  style={form.project === o.k ? { background: t.teal, color: "#fff", borderColor: t.teal } : null}
                  onClick={() => setForm({ ...form, project: o.k })}
                >{o.v}</button>
              ))}
            </div>
          </label>
          <label>
            <span>Tell me about it</span>
            <textarea rows={5} value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} placeholder="A few sentences on what you're trying to figure out…" />
          </label>
          <button type="submit" className="btn-primary contact-submit" style={{ background: t.teal }} disabled={status === "loading" || status === "sent"}>
            {status === "sent" ? "Sent ✓ — talk soon" : status === "loading" ? "Sending…" : status === "error" ? "Failed — try again" : (<>Send message <Icon.arrow width="16" height="16" /></>)}
          </button>
        </form>
      </div>
      <footer className="footer">
        <div>© 2026 Christopher Williams · Made with <span className="serif-it" style={{ color: t.teal }}>care</span> in Woodstock, GA</div>
        <div className="footer-social">
          <a href="https://www.linkedin.com/in/christopher-williams-8a6599186" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer-li"><Icon.linkedin width="16" height="16" /></a>
          <a href="https://github.com/chris812689" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="footer-gh"><Icon.github width="16" height="16" /></a>
        </div>
      </footer>
    </section>
  );
}

// ── App root ─────────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "teal": "#14b8a6",
  "font": "Inter",
  "heroStyle": "gradient"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const active = useScrollSpy(["hero", "about", "skills", "stats", "portfolio", "contact"]);

  // Apply font family to root
  useEffect(() => {
    document.documentElement.style.setProperty("--font-sans",
      t.font === "Plus Jakarta Sans" ? `"Plus Jakarta Sans", system-ui, sans-serif` :
      t.font === "Manrope" ? `"Manrope", system-ui, sans-serif` :
      `"Inter", system-ui, sans-serif`);
  }, [t.font]);

  // Hero style class
  useEffect(() => {
    document.body.dataset.heroStyle = t.heroStyle;
  }, [t.heroStyle]);

  return (
    <div className="page">
      <Nav active={active} t={t} />
      <Hero t={t} />
      <Marquee t={t} />
      <About t={t} />
      <Skills t={t} />
      <Stats t={t} />
      <Portfolio t={t} />
      <Contact t={t} />

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakColor
          label="Accent"
          value={t.teal}
          options={["#14b8a6", "#0d9488", "#22d3ee", "#2dd4bf", "#0ea5e9"]}
          onChange={(v) => setTweak("teal", v)}
        />
        <TweakSelect
          label="Font"
          value={t.font}
          options={["Inter", "Manrope", "Plus Jakarta Sans"]}
          onChange={(v) => setTweak("font", v)}
        />
        <TweakRadio
          label="Hero style"
          value={t.heroStyle}
          options={["gradient", "grid", "solid"]}
          onChange={(v) => setTweak("heroStyle", v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

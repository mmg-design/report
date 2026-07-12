const { useEffect, useMemo, useRef, useState } = React;

const CSV_PATH = "./healthcare_swipe_file_tech_design_matrix.csv";
const ACCESS_KEY = "mmg_healthcare_report_access_v3";

// ConvertKit (Kit) email gate integration.
const CONVERTKIT_FORM_ID = "9675435";
const CONVERTKIT_API_KEY = "kit_02c16212e1bf567213223a2995dff6ba";

function subscribeToConvertKit(email) {
  if (!CONVERTKIT_FORM_ID || CONVERTKIT_FORM_ID === "YOUR_CONVERTKIT_FORM_ID") {
    console.warn("ConvertKit isn't connected yet. Add CONVERTKIT_FORM_ID and CONVERTKIT_API_KEY in healthcare-report.js.");
    return Promise.resolve();
  }
  return fetch(`https://api.kit.com/v4/forms/${CONVERTKIT_FORM_ID}/subscribers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": CONVERTKIT_API_KEY,
    },
    body: JSON.stringify({ email_address: email }),
  }).catch((error) => {
    console.error("ConvertKit subscribe failed", error);
  });
}

const sections = [
  { id: "websites", label: "Websites", icon: "./assets/section-icons/the-websites.svg" },
  { id: "industries", label: "Industries", icon: "./assets/section-icons/industries.svg" },
  { id: "messaging", label: "Messaging", icon: "./assets/section-icons/messaging.svg" },
  { id: "trust", label: "Trust", icon: "./assets/section-icons/proof.svg" },
  { id: "content", label: "Content", icon: "./assets/section-icons/content.svg" },
  { id: "conversion", label: "Conversion", icon: "./assets/section-icons/funnel.svg" },
  { id: "tech", label: "Tech stack", icon: "./assets/section-icons/tech-stack.svg" },
  { id: "design", label: "Design", icon: "./assets/section-icons/design.svg" },
  { id: "insights", label: "Insights", icon: "./assets/section-icons/insights.svg" },
];

const sectionMeta = Object.fromEntries(sections.map((section) => [section.id, section]));

const tabTooltips = {
  Counts: "Shows how many websites fall into each healthcare category.",
  "AI messaging": "Shows how many websites talk about AI in a place visitors can see quickly.",
  Audience: "Shows who each website seems to be speaking to, like providers, payers, or patients.",
  "CTA confidence": "Shows how clear we feel the main call-to-action is from the page.",
  "Customer logos": "Shows whether the page uses customer logos or logo strips as proof.",
  Security: "Shows whether the page mentions security, privacy, compliance, or trust language.",
  "Case studies": "Shows whether the page points to customer stories or real examples.",
  "Quantified proof": "Shows whether the page uses numbers to prove results, like percentages or savings.",
  "Content motion": "Shows whether the company is actively publishing blogs, resources, or education.",
  Downloads: "Shows whether the page offers a guide, report, checklist, or other downloadable resource.",
  Segmentation: "Shows how the navigation splits people by audience, product, use case, or solution.",
  "Form tools": "Shows whether chat, forms, booking tools, or similar conversion tools are visible.",
  "Main CTA": "Shows the main action the site asks visitors to take, like booking a demo.",
  CMS: "Shows which website platform appears to power the site, like Webflow or WordPress.",
  Frontend: "Shows which front-end framework or code layer appears to be used.",
  Tracking: "Shows whether analytics, ads, or tracking scripts were detected.",
  Experimentation: "Shows whether testing, personalization, or optimization tools were detected.",
  Motion: "Shows whether the site uses animation, movement, or interactive effects.",
  "Motion tech": "Shows the tools or libraries that may be powering those animations.",
  "Media style": "Shows the main visual style, like product screens, people photos, or abstract graphics.",
};

const sidebarCopy = {
  websites: {
    title: "The source set",
    body: "Start with the companies analyzed, then filter by category, CTA, trust signal, and tech stack.",
    stats: [
      ["100", "Healthcare websites in the benchmark"],
      ["12", "Healthcare industry categories"],
      ["50+", "Signals captured per website"],
    ],
  },
  industries: {
    title: "Category shape",
    body: "The sample leans toward provider enablement, AI, data infrastructure, consumer care, benefits, and behavioral health.",
    stats: [
      ["16", "Provider enablement sites"],
      ["16", "AI / clinical automation sites"],
      ["13", "Data and life sciences sites"],
    ],
  },
  messaging: {
    title: "Messaging pressure",
    body: "AI has become a front-door signal across healthcare, but category clarity and CTA language still carry the conversion work.",
    stats: [
      ["55", "Mention AI prominently"],
      ["38", "Do not mention AI prominently"],
      ["7", "Blocked or unknown"],
    ],
  },
  trust: {
    title: "Trust is the product",
    body: "Healthcare sites rely heavily on logos, security language, privacy links, case stories, and quantified outcomes.",
    stats: [
      ["81", "Use customer logos or logo-style proof"],
      ["98", "Mention security or compliance"],
      ["75", "Show case studies or customer stories"],
    ],
  },
  content: {
    title: "Content motion",
    body: "Most brands maintain blogs, resources, or education hubs. Downloadable assets are less universal.",
    stats: [
      ["89", "Show active content motion"],
      ["48", "Show downloadable resource signals"],
      ["91", "Use animation or motion signals"],
    ],
  },
  conversion: {
    title: "Conversion design",
    body: "Almost every site segments navigation, but only about half expose identifiable conversion or form tooling.",
    stats: [
      ["98", "Use segmented navigation"],
      ["49", "Expose conversion/chat/form tools"],
      ["77", "Segment by audience and solution"],
    ],
  },
  tech: {
    title: "Marketing infrastructure",
    body: "Webflow and WordPress dominate visible CMS signals. Experimentation and personalization are much less common.",
    stats: [
      ["90", "Have tracking scripts detected"],
      ["18", "Show experimentation or personalization"],
      ["35", "Have Webflow signals"],
    ],
  },
  design: {
    title: "Creative patterns",
    body: "Most sites blend product UI, people or clinician imagery, and abstract graphics. Purely static pages are rare.",
    stats: [
      ["91", "Show motion or animation signals"],
      ["59", "Have long captured pages"],
      ["7", "Have very long captured pages"],
    ],
  },
  insights: {
    title: "What marketers can use",
    body: "The practical value is not just the count. It is seeing where your site is table stakes, where it is behind, and where it can stand apart.",
    stats: [
      ["1", "Benchmark to guide your next website"],
      ["100", "Examples to mine for patterns"],
      ["12", "Ways to slice the market"],
    ],
  },
};

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quote = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quote && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quote = !quote;
    } else if (char === "," && !quote) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quote) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value.length)) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell.length || row.length) {
    row.push(cell);
    rows.push(row);
  }
  const headers = rows.shift();
  return rows.map((values) =>
    headers.reduce((record, header, index) => {
      record[header] = values[index] || "";
      return record;
    }, {})
  );
}

function countBy(rows, field, options = {}) {
  const counts = new Map();
  rows.forEach((row) => {
    const raw = row[field] || "Unknown";
    const values = options.split
      ? raw.split(";").map((value) => value.trim()).filter(Boolean)
      : [raw || "Unknown"];
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  });
  return Array.from(counts, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function percent(rows, field, yesValue = "yes") {
  if (!rows.length) return 0;
  return Math.round((rows.filter((row) => row[field] === yesValue).length / rows.length) * 100);
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function pinSenjaWidget() {
  const selectors = [
    'iframe[src*="senja.io"]',
    'iframe[title*="Senja"]',
    '[id*="senja" i]',
    '[class*="senja" i]',
  ];

  document.querySelectorAll(selectors.join(",")).forEach((element) => {
    if (element.tagName === "SCRIPT") return;
    const style = window.getComputedStyle(element);
    if (element.tagName === "IFRAME" || style.position === "fixed") {
      Object.assign(element.style, {
        left: "auto",
        right: "20px",
        bottom: "20px",
        zIndex: "30",
      });
    }

    // Senja renders its floating card inside an open shadow root, so the
    // host element's own position doesn't affect it — reach inside.
    const root = element.shadowRoot;
    if (!root) return;
    root.querySelectorAll("*").forEach((inner) => {
      if (window.getComputedStyle(inner).position !== "fixed") return;
      Object.assign(inner.style, {
        left: "auto",
        right: "20px",
        bottom: "20px",
        zIndex: "30",
      });
    });
  });
}

function App() {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [hasAccess, setHasAccess] = useState(() => window.localStorage?.getItem(ACCESS_KEY) === "true");
  const [gateOpen, setGateOpen] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [pendingScrollTarget, setPendingScrollTarget] = useState(null);
  const [activeSection, setActiveSection] = useState("websites");
  const [websiteQuery, setWebsiteQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All");
  const [signalFilter, setSignalFilter] = useState("All");
  const [industryTab, setIndustryTab] = useState("Counts");
  const [messagingTab, setMessagingTab] = useState("AI messaging");
  const [trustTab, setTrustTab] = useState("Customer logos");
  const [contentTab, setContentTab] = useState("Content motion");
  const [conversionTab, setConversionTab] = useState("Segmentation");
  const [techTab, setTechTab] = useState("CMS");
  const [designTab, setDesignTab] = useState("Motion");

  useEffect(() => {
    if (Array.isArray(window.REPORT_DATA)) {
      setRows(window.REPORT_DATA);
      setStatus("ready");
      return;
    }
    fetch(CSV_PATH)
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load ${CSV_PATH}`);
        return response.text();
      })
      .then((text) => {
        setRows(parseCsv(text));
        setStatus("ready");
      })
      .catch((error) => {
        console.error(error);
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    pinSenjaWidget();
    const observer = new MutationObserver(pinSenjaWidget);
    observer.observe(document.body, { childList: true, subtree: true });
    const interval = window.setInterval(pinSenjaWidget, 1200);

    return () => {
      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("gate-is-open", gateOpen);
    return () => document.body.classList.remove("gate-is-open");
  }, [gateOpen]);

  const gateDismissedRef = useRef(false);

  useEffect(() => {
    if (hasAccess) return undefined;

    const handleScroll = () => {
      if (gateDismissedRef.current) return;
      const hero = document.querySelector(".hero");
      if (!hero) return;
      const triggerPoint = hero.offsetTop + hero.offsetHeight - 120;
      if (window.scrollY < triggerPoint || gateOpen) return;
      setPendingScrollTarget(null);
      setGateOpen(true);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasAccess, gateOpen]);

  useEffect(() => {
    if (status !== "ready") return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id);
      },
      { rootMargin: "-22% 0px -55% 0px", threshold: [0.1, 0.24, 0.4] }
    );
    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [status]);

  useEffect(() => {
    if (status !== "ready") return undefined;
    const revealItems = document.querySelectorAll(".chart-card:not(.is-visible), .bottom-cta:not(.is-visible)");
    if (!revealItems.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.18 }
    );

    revealItems.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [status, industryTab, messagingTab, trustTab, contentTab, conversionTab, techTab, designTab]);

  const metrics = useMemo(() => {
    const total = rows.length;
    return {
      total,
      categories: countBy(rows, "market_category").length,
      aiYes: rows.filter((row) => row.ai_in_prominent_messaging === "yes").length,
      trackingYes: rows.filter((row) => row.tracking_scripts_detected === "yes").length,
      logosYes: rows.filter((row) => row.customer_logos_detected === "yes").length,
      securityYes: rows.filter((row) => row.security_or_compliance_mentions_detected === "yes").length,
      caseStudiesYes: rows.filter((row) => row.case_studies_detected === "yes").length,
      motionYes: rows.filter((row) => row.animation_motion_detected === "yes").length,
    };
  }, [rows]);

  const industries = useMemo(() => ["All", ...countBy(rows, "market_category").map((item) => item.label)], [rows]);
  const filteredRows = useMemo(() => {
    const query = websiteQuery.trim().toLowerCase();
    return rows.filter((row) => {
      const queryMatch =
        !query ||
        [row.company, row.url, row.market_category, row.primary_audience, row.offer_type, row.main_cta_live]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const industryMatch = industryFilter === "All" || row.market_category === industryFilter;
      const signalMatch =
        signalFilter === "All" ||
        (signalFilter === "AI prominent" && row.ai_in_prominent_messaging === "yes") ||
        (signalFilter === "Customer logos" && row.customer_logos_detected === "yes") ||
        (signalFilter === "Security" && row.security_or_compliance_mentions_detected === "yes") ||
        (signalFilter === "Case studies" && row.case_studies_detected === "yes") ||
        (signalFilter === "Experimentation" && row.experimentation_personalization_detected === "yes");
      return queryMatch && industryMatch && signalMatch;
    });
  }, [rows, websiteQuery, industryFilter, signalFilter]);

  if (status === "loading") return <div className="loading">Loading the healthcare website benchmark...</div>;
  if (status === "error") {
    return (
      <div className="error">
        <div>
          <h1>Could not load the report data.</h1>
          <p>Open this page through a local server so the CSV can be fetched by the browser.</p>
        </div>
      </div>
    );
  }

  const sidebar = sidebarCopy[activeSection] || sidebarCopy.websites;
  const activeMeta = sectionMeta[activeSection] || sectionMeta.websites;

  const requestAccess = (target = "websites") => {
    if (hasAccess) {
      scrollToSection(target);
      return;
    }
    setPendingScrollTarget(target);
    setGateOpen(true);
  };

  const unlockReport = (email) => {
    window.localStorage?.setItem(ACCESS_KEY, "true");
    window.localStorage?.setItem(`${ACCESS_KEY}_email`, email);
    subscribeToConvertKit(email);
    setHasAccess(true);
    setGateOpen(false);
    window.setTimeout(() => setConfettiActive(true), 120);
    window.setTimeout(() => setConfettiActive(false), 2900);
    window.setTimeout(() => scrollToSection(pendingScrollTarget || "websites"), 80);
  };

  const closeGate = () => {
    gateDismissedRef.current = true;
    setGateOpen(false);
    setPendingScrollTarget(null);
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 40);
  };

  return (
    <div className="site-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-mark">
            <img src="./assets/mmg-logo.png" alt="MMG Design" />
          </div>
          <nav className="nav" aria-label="Report sections">
            {sections.map((section) => (
              <button
                key={section.id}
                className={activeSection === section.id ? "is-active" : ""}
                onClick={() => requestAccess(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow hero-eyebrow">
              <img src="./assets/hipaa.svg" alt="" />
              2026 Healthcare Web Report
            </p>
            <h1>
              A <span className="scribble-underline">deep dive</span> analysis of 100+{" "}
              <br />
              healthcare marketing websites.
            </h1>
            <p className="hero-copy">
              A data-backed teardown of how healthcare companies use AI messaging, trust signals, content, CTAs, tech stacks,
              and design patterns to explain complex products and convert high-stakes audiences.
            </p>
            <div className="hero-actions">
              <button className="button button-primary" type="button" onClick={() => requestAccess("websites")}>
                View the analysis
              </button>
              <a
                className="button button-secondary"
                href="https://www.figma.com/design/OFspJtK4N2LMYeWv96PA4d/Healthcare-Website-Swipe-File?node-id=180-18&t=M5qU2mShWpJXCQVN-1"
                target="_blank"
                rel="noreferrer"
              >
                <FigmaIcon />
                Open the source file
              </a>
            </div>
          </div>

          <div className="hero-card" aria-label="Healthcare website report preview image">
            <img src="./assets/hero-image.png" alt="Collage preview of healthcare website analysis cards and charts" />
          </div>
        </div>
      </section>

      <div className="report-layout">
        <main className="main-flow">
          <WebsitesSection rows={rows} filteredRows={filteredRows} industries={industries} websiteQuery={websiteQuery} setWebsiteQuery={setWebsiteQuery} industryFilter={industryFilter} setIndustryFilter={setIndustryFilter} signalFilter={signalFilter} setSignalFilter={setSignalFilter} />
          <IndustriesSection rows={rows} tab={industryTab} setTab={setIndustryTab} />
          <MessagingSection rows={rows} tab={messagingTab} setTab={setMessagingTab} />
          <TrustSection rows={rows} tab={trustTab} setTab={setTrustTab} />
          <ContentSection rows={rows} tab={contentTab} setTab={setContentTab} />
          <ConversionSection rows={rows} tab={conversionTab} setTab={setConversionTab} />
          <TechSection rows={rows} tab={techTab} setTab={setTechTab} />
          <DesignSection rows={rows} tab={designTab} setTab={setDesignTab} />
          <InsightsSection />
        </main>

        <aside className="sticky-panel" aria-label="Current section snapshot">
          <div className="sticky-content">
            <div className="sidebar-kicker">
              <span className="sidebar-icon">
                <img src={activeMeta.icon} alt="" />
              </span>
              <span className="sidebar-label">{activeMeta.label || "Overview"}</span>
            </div>
            <h3>{sidebar.title}</h3>
            <p>{sidebar.body}</p>
            {sidebar.stats.map(([value, label]) => (
              <div className="sidebar-stat" key={`${value}-${label}`}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <BottomCta />

      {gateOpen && <AccessGate onSubmit={unlockReport} onClose={closeGate} />}
      {confettiActive && <ConfettiBurst />}
    </div>
  );
}

function ConfettiBurst() {
  const pieces = Array.from({ length: 46 }, (_, index) => ({
    id: index,
    left: `${5 + ((index * 23) % 90)}%`,
    delay: `${(index % 9) * 55}ms`,
    drift: `${((index % 11) - 5) * 26}px`,
    rotate: `${(index * 29) % 180}deg`,
  }));

  return (
    <div className="confetti-burst" aria-hidden="true">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          style={{
            "--left": piece.left,
            "--delay": piece.delay,
            "--drift": piece.drift,
            "--rotate": piece.rotate,
          }}
        />
      ))}
    </div>
  );
}

function AccessGate({ onSubmit, onClose }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();
    if (!isValidEmail(normalizedEmail)) {
      setError("Give us a real email. The robots are already disappointed enough.");
      return;
    }
    onSubmit(normalizedEmail);
  };

  return (
    <div className="access-gate" role="dialog" aria-modal="true" aria-labelledby="access-gate-title">
      <div className="access-gate-card">
        <div className="access-gate-bg" aria-hidden="true">
          <img src="./assets/footer-cta/footer-cta-bg.webp" alt="" />
        </div>
        <button className="access-gate-close" type="button" onClick={onClose} aria-label="Close email gate">
          ×
        </button>
        <div className="access-gate-content">
          <div className="access-gate-icon">
            <img src="./assets/footer-cta/mmg-icon.svg" alt="" />
          </div>
          <p className="access-gate-kicker">Tiny Toll Booth</p>
          <h2 id="access-gate-title">Want the full thing?</h2>
          <p>
            We spent 30+ hours on this, so the least dramatic trade is your email.
            You get the full deep dive, and we send one useful newsletter a month. No daily inbox confetti.
          </p>
          <form className="access-gate-form" onSubmit={submit}>
            <label htmlFor="report-email">Work email</label>
            <div className="access-gate-field">
              <input
                id="report-email"
                type="email"
                value={email}
                placeholder="you@company.com"
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError("");
                }}
                autoFocus
              />
              <button className="button button-primary" type="submit">
                Read the full deep dive
              </button>
            </div>
            {error && <div className="access-gate-error">{error}</div>}
          </form>
          <div className="access-gate-proof" aria-label="Report scope">
            <span className="access-gate-proof-item">100+ websites analyzed</span>
            <span className="access-gate-proof-item">50+ benchmarks</span>
            <span className="access-gate-proof-item">12 healthcare sectors</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FigmaIcon() {
  return (
    <svg className="figma-icon" viewBox="0 0 38 56" aria-hidden="true" focusable="false">
      <path fill="#ff4d12" d="M19 0H9.5a9.5 9.5 0 0 0 0 19H19V0Z" />
      <path fill="#ff7262" d="M19 0h9.5a9.5 9.5 0 0 1 0 19H19V0Z" />
      <path fill="#a259ff" d="M19 19H9.5a9.5 9.5 0 0 0 0 19H19V19Z" />
      <path fill="#1abcfe" d="M28.5 19a9.5 9.5 0 1 1 0 19 9.5 9.5 0 0 1 0-19Z" />
      <path fill="#0acf83" d="M19 38H9.5a9.5 9.5 0 1 0 9.5 9.5V38Z" />
    </svg>
  );
}

function Section({ id, eyebrow, title, copy, children, mint = false }) {
  return (
    <section id={id} className={`section ${mint ? "mint" : ""}`}>
      <div className="section-header">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <p>{copy}</p>
      </div>
      {children}
    </section>
  );
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tab ${active === tab ? "is-active" : ""}`}
          onClick={() => onChange(tab)}
          data-tooltip={tabTooltips[tab]}
          aria-label={tabTooltips[tab] ? `${tab}: ${tabTooltips[tab]}` : tab}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function BottomCta() {
  const profiles = [
    ["./assets/footer-cta/profile-jeff.webp", "Jeff Bray"],
    ["./assets/footer-cta/profile-allison.webp", "Allison Small"],
    ["./assets/footer-cta/profile-matt.webp", "Matt Buchan"],
    ["./assets/footer-cta/profile-four.webp", "MMG client"],
  ];

  return (
    <section className="bottom-cta" aria-label="Talk with MMG Design">
      <div className="bottom-cta-bg" aria-hidden="true">
        <img src="./assets/footer-cta/footer-cta-bg.webp" alt="" />
      </div>
      <div className="bottom-cta-content">
        <div className="bottom-cta-icon">
          <img src="./assets/footer-cta/mmg-icon.svg" alt="" />
        </div>
        <h2>
          <span>Let’s build a site that</span>
          <span>doesn’t hold you back.</span>
        </h2>
        <div className="bottom-cta-action">
          <div className="bottom-cta-proof" aria-label="50 plus happy clients">
            <div className="bottom-cta-profiles">
              {profiles.map(([src, alt], index) => (
                <span className="bottom-cta-profile" key={src} style={{ "--i": index }}>
                  <img src={src} alt={alt} />
                </span>
              ))}
            </div>
            <div className="bottom-cta-stars">
              <img src="./assets/footer-cta/stars.svg" alt="" />
              <span>50+ happy clients</span>
            </div>
          </div>
          <a className="button button-primary bottom-cta-button" href="https://www.mmg.studio/contact" target="_blank" rel="noreferrer">
            Chat with Andy
          </a>
        </div>
      </div>
    </section>
  );
}

function BarChart({ data, limit = 10 }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="bar-list">
      {data.slice(0, limit).map((item) => (
        <div className="bar-row" key={item.label}>
          <div className="bar-meta">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Donut({ value, total, label }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ "--pct": `${pct}%` }}>
        <div className="donut-inner">
          <div>
            <strong>{pct}%</strong>
            <span>{value} of {total}</span>
          </div>
        </div>
      </div>
      <p>{label}</p>
    </div>
  );
}

function WebsitesSection(props) {
  const { filteredRows, industries, websiteQuery, setWebsiteQuery, industryFilter, setIndustryFilter, signalFilter, setSignalFilter } = props;
  return (
    <Section
      id="websites"
      eyebrow="Start here"
      title="The websites analyzed"
      copy="Search the benchmark, filter by industry, and scan the main CTA and signal profile for each company."
    >
      <div className="filters">
        <input value={websiteQuery} onChange={(event) => setWebsiteQuery(event.target.value)} placeholder="Search company, category, CTA, or audience" />
        <select value={industryFilter} onChange={(event) => setIndustryFilter(event.target.value)}>
          {industries.map((industry) => (
            <option key={industry}>{industry}</option>
          ))}
        </select>
        <select value={signalFilter} onChange={(event) => setSignalFilter(event.target.value)}>
          {["All", "AI prominent", "Customer logos", "Security", "Case studies", "Experimentation"].map((signal) => (
            <option key={signal}>{signal}</option>
          ))}
        </select>
      </div>
      <div className="company-grid">
        {filteredRows.map((row) => (
          <article className="company-card" key={row.index}>
            <div className="company-card-top">
              <span>#{row.index.padStart ? row.index.padStart(2, "0") : row.index}</span>
              <span>{row.market_category}</span>
            </div>
            <h3>{row.company}</h3>
            <p>{row.offer_type}</p>
            <div className="company-cta">Main CTA: {row.main_cta_live || "Not detected"}</div>
            <div className="tag-row">
              <span className="tag">AI: {row.ai_in_prominent_messaging}</span>
              <span className="tag">Security: {row.security_or_compliance_mentions_detected}</span>
              <span className="tag">Proof: {row.customer_logos_detected}</span>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

function IndustriesSection({ rows, tab, setTab }) {
  const data = countBy(rows, "market_category");
  return (
    <Section id="industries" eyebrow="Market map" title="Healthcare categories" copy="See which healthcare segments dominate the set and how the benchmark breaks down by market." mint>
      <Tabs tabs={["Counts"]} active={tab} onChange={setTab} />
      <div className="chart-card">
        <BarChart data={data} limit={12} />
      </div>
    </Section>
  );
}

function MessagingSection({ rows, tab, setTab }) {
  const field = tab === "CTA confidence" ? "cta_confidence" : tab === "Audience" ? "primary_audience" : "ai_in_prominent_messaging";
  return (
    <Section id="messaging" eyebrow="Positioning" title="Messaging, AI, and audience focus" copy="This section captures how healthcare brands explain themselves, who they address, and whether AI appears in prominent homepage messaging.">
      <Tabs tabs={["AI messaging", "Audience", "CTA confidence"]} active={tab} onChange={setTab} />
      <div className="chart-grid">
        <div className="chart-card">
          <BarChart data={countBy(rows, field)} limit={10} />
        </div>
        <div className="chart-card">
          <Donut value={rows.filter((row) => row.ai_in_prominent_messaging === "yes").length} total={rows.length} label="Sites with AI in prominent messaging" />
        </div>
      </div>
    </Section>
  );
}

function TrustSection({ rows, tab, setTab }) {
  const map = {
    "Customer logos": "customer_logos_detected",
    "Security": "security_or_compliance_mentions_detected",
    "Case studies": "case_studies_detected",
    "Quantified proof": "quantified_case_study_signal_detected",
  };
  const field = map[tab];
  return (
    <Section id="trust" eyebrow="Proof" title="Trust signals and evidence" copy="Healthcare websites need to reduce risk quickly. Logos, compliance language, customer stories, and quantified outcomes do a lot of that work." mint>
      <Tabs tabs={Object.keys(map)} active={tab} onChange={setTab} />
      <div className="chart-grid">
        <div className="chart-card">
          <BarChart data={countBy(rows, field)} />
        </div>
        <div className="chart-card">
          <Donut value={rows.filter((row) => row[field] === "yes").length} total={rows.length} label={`${tab} detected`} />
        </div>
      </div>
    </Section>
  );
}

function ContentSection({ rows, tab, setTab }) {
  const field = tab === "Downloads" ? "free_or_downloadable_resource_detected" : "active_content_motion_detected";
  return (
    <Section id="content" eyebrow="Education" title="Content motion and resource strategy" copy="Most sites publish or organize educational content. Fewer make downloadable assets obvious from the homepage.">
      <Tabs tabs={["Content motion", "Downloads"]} active={tab} onChange={setTab} />
      <div className="chart-grid">
        <div className="chart-card">
          <BarChart data={countBy(rows, field)} />
        </div>
        <div className="chart-card">
          <Donut value={rows.filter((row) => row[field] === "yes").length} total={rows.length} label={`${tab} signal`} />
        </div>
      </div>
    </Section>
  );
}

function ConversionSection({ rows, tab, setTab }) {
  const map = {
    Segmentation: "segmented_navigation_type",
    "Form tools": "conversion_chat_forms_detected",
    "Main CTA": "main_cta_live",
  };
  return (
    <Section id="conversion" eyebrow="Funnel" title="Conversion and navigation patterns" copy="Healthcare sites frequently segment by audience, product, condition, or use case. The visible conversion stack varies more widely." mint>
      <Tabs tabs={Object.keys(map)} active={tab} onChange={setTab} />
      <div className="chart-card">
        <BarChart data={countBy(rows, map[tab])} limit={tab === "Main CTA" ? 14 : 8} />
      </div>
    </Section>
  );
}

function TechSection({ rows, tab, setTab }) {
  const map = {
    CMS: ["cms_platform_detected", true],
    Frontend: ["frontend_framework_detected", true],
    Tracking: ["tracking_scripts_detected", false],
    Experimentation: ["experimentation_personalization_detected", false],
  };
  const [field, split] = map[tab];
  return (
    <Section id="tech" eyebrow="Infrastructure" title="CMS, tracking, and growth tooling" copy="The tech layer shows what healthcare marketers are using to publish, measure, test, and route demand.">
      <Tabs tabs={Object.keys(map)} active={tab} onChange={setTab} />
      <div className="chart-card">
        <BarChart data={countBy(rows, field, { split })} limit={12} />
      </div>
    </Section>
  );
}

function DesignSection({ rows, tab, setTab }) {
  const map = {
    Motion: "animation_motion_detected",
    "Motion tech": "animation_motion_tech",
    "Media style": "design_media_style_signal",
  };
  return (
    <Section id="design" eyebrow="Aesthetics" title="Motion, media, and page shape" copy="Design patterns reveal how brands balance people, product UI, abstract healthcare graphics, and longer proof-heavy pages.">
      <Tabs tabs={Object.keys(map)} active={tab} onChange={setTab} />
      <div className="chart-card">
        <BarChart data={countBy(rows, map[tab], { split: tab === "Motion tech" })} limit={10} />
      </div>
    </Section>
  );
}

function InsightsSection() {
  const insights = [
    ["AI is mainstream, but not universal.", "More than half the set uses AI prominently, which means AI alone is no longer a differentiator. The better question is whether the claim is specific and credible."],
    ["Security is nearly table stakes.", "Almost every site mentions security, privacy, compliance, or legal trust signals. The opportunity is to make those signals easier to notice and understand."],
    ["Customer proof still matters.", "Logo strips, case stories, testimonials, and quantified outcomes remain one of the clearest ways to reduce buyer risk in healthcare."],
    ["Most sites are visually hybrid.", "The dominant style blends product UI, people imagery, and abstract graphics rather than relying on a single visual language."],
  ];
  return (
    <Section id="insights" eyebrow="Playbook" title="What this means for healthcare marketers" copy="The benchmark becomes useful when it helps teams decide what to copy, what to avoid, and where to create an advantage." mint>
      <div className="insight-grid">
        {insights.map(([title, body]) => (
          <article className="insight-card" key={title}>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

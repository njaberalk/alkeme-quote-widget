import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

// ---- Data ----

const USER_TYPES_INTERNAL = ["individual", "business"];

const INSURANCE_TYPES_INDIVIDUAL = ["Home", "Auto", "Life", "Other"];

const INSURANCE_TYPES_BUSINESS = [
  "General Liability",
  "Workers' Compensation",
  "Property",
  "Commercial Auto",
];

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

const INDUSTRIES = [
  "Construction","Healthcare","Manufacturing","Retail","Technology",
  "Food & Beverage","Transportation","Professional Services","Education","Other",
];

const EMPLOYEE_COUNTS = ["1-5", "6-25", "26-50", "51-100", "101-500", "500+"];

const LANG_KEY = "insurance-form-lang";

// ---- i18n ----

type Lang = "en" | "es";

const i18n = {
  en: {
    landingHeading: "Find the right coverage for you.",
    landingSubtext: "Answer a few quick questions to get started.",
    getStarted: "Get Started",
    letsGetStarted: "Let's get started",
    tellUsAboutYourself: "Tell us about yourself",
    aboutYourBusiness: "About your business",
    almostDone: "Almost done",
    iAm: "I'm",
    anIndividual: "an individual",
    aBusiness: "a business",
    readyToExplore: "ready to explore insurance and discover the right coverage for me.",
    selectAllThatApply: "Select all that apply",
    myFirstNameIs: "My first name is",
    andMyLastNameIs: "and my last name is",
    iNeedCoverageIn: ". I need coverage in",
    firstName: "first name",
    lastName: "last name",
    city: "city",
    state: "state",
    myBusinessIsIn: "My business is in",
    with: "with",
    withEmployees: "employees.",
    industry: "industry",
    count: "count",
    reachMeAt: "Reach me at",
    or: "or",
    phonePlaceholder: "(555) 123-4567",
    emailPlaceholder: "email@example.com",
    anythingElse: "Anything else we should know? (optional)",
    typeYourMessage: "Type your message here...",
    phoneError: "Please enter a valid phone number (10-digit US number)",
    emailError: "Please enter a valid email address",
    submitError: "Something went wrong. Please try again.",
    tryAgain: "Try Again",
    continue: "Continue \u2192",
    submit: "Submit \u2192",
    submitting: "Submitting...",
    done: "Done",
    startOver: "Start Over",
    back: "\u2190 Back",
    stay: "Stay",
    close: "Close",
    closeTheForm: "Close the form?",
    progressSaved: "Your progress has been saved. You can pick up where you left off.",
    allSet: "You're all set",
    weReceived: "We've received your information and will be in touch soon.",
    typeToSearch: "Type to search...",
    noResults: "No results",
    modalAriaLabel: "Insurance quote form",
    langToggleEn: "EN",
    langToggleEs: "ES",
    insuranceHome: "Home",
    insuranceAuto: "Auto",
    insuranceLife: "Life",
    insuranceOther: "Other",
    insuranceGL: "General Liability",
    insuranceWC: "Workers' Compensation",
    insuranceProperty: "Property",
    insuranceCA: "Commercial Auto",
    industryConstruction: "Construction",
    industryHealthcare: "Healthcare",
    industryManufacturing: "Manufacturing",
    industryRetail: "Retail",
    industryTechnology: "Technology",
    industryFood: "Food & Beverage",
    industryTransportation: "Transportation",
    industryProfessional: "Professional Services",
    industryEducation: "Education",
    industryOther: "Other",
  },
  es: {
    landingHeading: "Encuentra la cobertura adecuada para ti.",
    landingSubtext: "Responde unas preguntas r\u00e1pidas para comenzar.",
    getStarted: "Comenzar",
    letsGetStarted: "Empecemos",
    tellUsAboutYourself: "Cu\u00e9ntanos sobre ti",
    aboutYourBusiness: "Sobre tu negocio",
    almostDone: "Casi listo",
    iAm: "Soy",
    anIndividual: "un individuo",
    aBusiness: "una empresa",
    readyToExplore: "listo para explorar seguros y encontrar la cobertura correcta para m\u00ed.",
    selectAllThatApply: "Selecciona todas las que apliquen",
    myFirstNameIs: "Mi nombre es",
    andMyLastNameIs: "y mi apellido es",
    iNeedCoverageIn: ". Necesito cobertura en",
    firstName: "nombre",
    lastName: "apellido",
    city: "ciudad",
    state: "estado",
    myBusinessIsIn: "Mi negocio est\u00e1 en",
    with: "con",
    withEmployees: "empleados.",
    industry: "industria",
    count: "cantidad",
    reachMeAt: "Cont\u00e1ctame al",
    or: "o",
    phonePlaceholder: "(555) 123-4567",
    emailPlaceholder: "correo@ejemplo.com",
    anythingElse: "\u00bfAlgo m\u00e1s que debamos saber? (opcional)",
    typeYourMessage: "Escribe tu mensaje aqu\u00ed...",
    phoneError: "Por favor ingresa un n\u00famero de tel\u00e9fono v\u00e1lido (10 d\u00edgitos de EE.UU.)",
    emailError: "Por favor ingresa una direcci\u00f3n de correo electr\u00f3nico v\u00e1lida",
    submitError: "Algo sali\u00f3 mal. Por favor, intenta de nuevo.",
    tryAgain: "Intentar de nuevo",
    continue: "Continuar \u2192",
    submit: "Enviar \u2192",
    submitting: "Enviando...",
    done: "Listo",
    startOver: "Empezar de nuevo",
    back: "\u2190 Atr\u00e1s",
    stay: "Quedarse",
    close: "Cerrar",
    closeTheForm: "\u00bfCerrar el formulario?",
    progressSaved: "Tu progreso ha sido guardado. Puedes retomarlo donde lo dejaste.",
    allSet: "\u00a1Todo listo",
    weReceived: "Hemos recibido tu informaci\u00f3n y nos comunicaremos pronto.",
    typeToSearch: "Escribe para buscar...",
    noResults: "Sin resultados",
    modalAriaLabel: "Formulario de cotizaci\u00f3n de seguro",
    langToggleEn: "EN",
    langToggleEs: "ES",
    insuranceHome: "Hogar",
    insuranceAuto: "Auto",
    insuranceLife: "Vida",
    insuranceOther: "Otro",
    insuranceGL: "Responsabilidad General",
    insuranceWC: "Compensación Laboral",
    insuranceProperty: "Propiedad",
    insuranceCA: "Auto Comercial",
    industryConstruction: "Construcción",
    industryHealthcare: "Salud",
    industryManufacturing: "Manufactura",
    industryRetail: "Comercio",
    industryTechnology: "Tecnología",
    industryFood: "Alimentos y Bebidas",
    industryTransportation: "Transporte",
    industryProfessional: "Servicios Profesionales",
    industryEducation: "Educación",
    industryOther: "Otro",
  },
} as const;

const insuranceTypeKeys: Record<string, string> = {
  Home: "insuranceHome", Auto: "insuranceAuto", Life: "insuranceLife", Other: "insuranceOther",
  "General Liability": "insuranceGL", "Workers' Compensation": "insuranceWC",
  Property: "insuranceProperty", "Commercial Auto": "insuranceCA",
};

const industryKeys: Record<string, string> = {
  Construction: "industryConstruction", Healthcare: "industryHealthcare",
  Manufacturing: "industryManufacturing", Retail: "industryRetail",
  Technology: "industryTechnology", "Food & Beverage": "industryFood",
  Transportation: "industryTransportation", "Professional Services": "industryProfessional",
  Education: "industryEducation", Other: "industryOther",
};

function tLabel(t: Record<string, string>, key: string, maps: Record<string, string>): string {
  const k = maps[key];
  return k && t[k] ? t[k] : key;
}

// ---- Analytics ----

function trackEvent(name: string, detail: Record<string, unknown> = {}) {
  try {
    window.dispatchEvent(
      new CustomEvent("insurance-form-event", { detail: { event: name, ...detail } })
    );
  } catch { /* ignore */ }
}

// ---- Confetti ----

const CONFETTI_COLORS = ["#FFBF3C", "#ff6b6b", "#4ecdc4", "#45b7d1", "#96c93d"];

function Confetti() {
  const particles = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 1.8 + Math.random() * 1.4,
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
    }))
  ).current;

  return (
    <>
      <style>{`
        @keyframes ifwConfettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(340px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          borderRadius: "inherit",
        }}
      >
        {particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              top: 0,
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.5,
              backgroundColor: p.color,
              borderRadius: 2,
              animation: `ifwConfettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// ---- Main Component ----

export function InsuranceForm({ apiUrl }: { apiUrl: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  const [userType, setUserType] = useState(""); // "individual" | "business"
  const [insuranceTypes, setInsuranceTypes] = useState<string[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [industry, setIndustry] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState("");

  // Validation touch states
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Analytics ref
  const stepStartTime = useRef<number>(Date.now());
  const modalCardRef = useRef<HTMLDivElement>(null);

  // Announce step changes for a11y
  const [liveRegion, setLiveRegion] = useState("");

  // ---- Language restore ----
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "en" || saved === "es") setLang(saved);
    } catch { /* ignore */ }
  }, []);

  const toggleLang = () => {
    const next: Lang = lang === "en" ? "es" : "en";
    setLang(next);
    try { localStorage.setItem(LANG_KEY, next); } catch { /* ignore */ }
  };

  const t = i18n[lang];


  // ---- Pre-fill from URL params ----
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const pType = params.get("type");
      if (pType === "individual" || pType === "business") setUserType(pType);
      const pState = params.get("state");
      if (pState && US_STATES.includes(pState)) setState(pState);
      const pFirst = params.get("firstName");
      if (pFirst) setFirstName(pFirst);
      const pLast = params.get("lastName");
      if (pLast) setLastName(pLast);
      const pCity = params.get("city");
      if (pCity) setCity(pCity);
      const pLang = params.get("lang");
      if (pLang === "es") setLang("es");
    } catch { /* ignore */ }
  }, []);


  // ---- Analytics: step viewed ----
  useEffect(() => {
    if (!modalOpen) return;
    stepStartTime.current = Date.now();
    const stepNames: Record<number, string> = { 1: "coverage_type", 2: "personal_info", 3: "business_info", 4: "contact", 5: "success" };
    trackEvent("step_viewed", { step, stepName: stepNames[step] ?? `step_${step}` });
    const label = step === 1 ? t.letsGetStarted
      : step === 2 ? t.tellUsAboutYourself
      : step === 3 ? t.aboutYourBusiness
      : step === 4 ? t.almostDone
      : t.allSet;
    setLiveRegion(label);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, modalOpen]);

  // Focus trap in modal
  useEffect(() => {
    if (!modalOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement;
    requestAnimationFrame(() => {
      if (modalCardRef.current && !modalCardRef.current.contains(document.activeElement)) {
        modalCardRef.current.focus();
      }
    });
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const modal = modalCardRef.current;
      if (!modal) return;
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first || !modal.contains(document.activeElement)) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || !modal.contains(document.activeElement)) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleTab);
    return () => {
      document.removeEventListener("keydown", handleTab);
      previouslyFocused?.focus();
    };
  }, [modalOpen]);

  const handleUserTypeChange = (v: string) => {
    if (v !== userType) setInsuranceTypes([]);
    setUserType(v);
  };

  const toggleInsuranceType = (type: string) => {
    setInsuranceTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const isBusiness = userType === "business";
  const sentenceComplete = !!userType && insuranceTypes.length > 0;
  const phoneValid = phone.length === 10;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const personalComplete = firstName.trim().length > 0 && lastName.trim().length > 0 && city.trim().length > 0 && !!state;
  const businessComplete = !!industry && !!employeeCount;
  const contactComplete = phoneValid && emailValid;

  const canAdvance =
    (step === 1 && sentenceComplete) ||
    (step === 2 && personalComplete) ||
    (step === 3 && businessComplete) ||
    (step === 4 && contactComplete);

  const totalSteps = isBusiness ? 4 : 3;
  const currentDot = step === 1 ? 0 : step === 2 ? 1 : step === 3 ? 2 : (isBusiness ? 3 : 2);

  const completeStep = () => {
    const duration = Date.now() - stepStartTime.current;
    const stepNames: Record<number, string> = { 1: "coverage_type", 2: "personal_info", 3: "business_info", 4: "contact" };
    trackEvent("step_completed", { step, stepName: stepNames[step] ?? `step_${step}`, durationMs: duration });
  };

  const nextStep = () => {
    completeStep();
    setDirection("forward");
    if (step === 2 && !isBusiness) setStep(4);
    else setStep(step + 1);
  };

  const prevStep = () => {
    setDirection("back");
    if (step === 4 && !isBusiness) setStep(2);
    else setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(false);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          email, fullName: `${firstName.trim()} ${lastName.trim()}`, userType,
          insuranceType: insuranceTypes.join(", "),
          city, state, industry, employeeCount, phone, comments,
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
    } catch (e) {
      console.error("Submit error:", e);
      setSubmitting(false);
      setSubmitError(true);
      return;
    } finally {
      clearTimeout(timeout);
    }
    completeStep();
    trackEvent("form_submitted", { userType, insuranceTypes, state });
    setSubmitting(false);
    setDirection("forward");
    setStep(5);
  };

  const hasData = !!(userType || firstName || lastName || city || state || phone || email);

  // Beforeunload warning when user has entered data
  useEffect(() => {
    if (!hasData || step >= 5) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasData, step]);

  const tryClose = () => {
    if (hasData && step < 5) setShowConfirm(true);
    else {
      trackEvent("form_closed", { step });
      setModalOpen(false);
    }
  };

  const confirmClose = () => {
    trackEvent("form_closed", { step, confirmed: true });
    setShowConfirm(false);
    setModalOpen(false);
  };

  const handleOpen = () => {
    trackEvent("form_opened");
    setModalOpen(true);
    if (!hasData) { setStep(1); setDirection("forward"); }
  };

  const handleStartOver = () => {
    setUserType(""); setInsuranceTypes([]); setFirstName(""); setLastName("");
    setCity(""); setState(""); setIndustry(""); setEmployeeCount("");
    setPhone(""); setEmail(""); setComments("");
    setPhoneTouched(false); setEmailTouched(false);
    setSubmitError(false); setDirection("forward"); setStep(1);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [modalOpen]);

  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      if (showConfirm) setShowConfirm(false);
      else tryClose();
      return;
    }
    if (e.key !== "Enter" || submitting) return;
    const el = e.target as HTMLElement;
    if (el.tagName === "TEXTAREA") return;
    if (el.classList.contains("ifw-select-search")) return;
    if (!canAdvance) return;
    e.preventDefault();
    if (step === 4) handleSubmit();
    else nextStep();
  };

  // Display label for userType in dropdown trigger
  const userTypeLabel = userType === "individual" ? t.anIndividual : userType === "business" ? t.aBusiness : "";

  return (
    <div className="ifw" lang={lang}>
      <div className="ifw-content" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* Landing */}
        <div className="ifw-fade-in" style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 40, display: "flex", justifyContent: "center" }}>
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <rect width="60" height="60" rx="14" fill="#FFBF3C" />
              <path d="M18 30 L26.5 38.5 L42 22" stroke="#25475E" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="ifw-sentence-heading" style={{ marginBottom: 16 }}>{t.landingHeading}</h1>
          <p className="ifw-subtitle" style={{ marginBottom: 40 }}>
            {t.landingSubtext}
          </p>
          <button className="ifw-btn-primary" aria-label={t.getStarted} onClick={handleOpen}>
            {t.getStarted}
          </button>
        </div>
      </div>

      {/* Aria live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
      >
        {liveRegion}
      </div>

      {/* Modal */}
      {modalOpen && createPortal(
        <div
          className="ifw-modal-overlay"
          lang={lang}
          onClick={(e) => { if (e.target === e.currentTarget) tryClose(); }}
        >
          <div
            ref={modalCardRef}
            className="ifw-modal-card"
            role="dialog"
            aria-modal="true"
            aria-label={t.modalAriaLabel}
            tabIndex={-1}
            onKeyDown={handleModalKeyDown}
          >
            {step < 5 && (
              <button className="ifw-modal-close" onClick={tryClose} aria-label={t.close}>
                &times;
              </button>
            )}

            {/* Top bar: language toggle + progress dots */}
            {step < 5 && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
                {/* Language toggle */}
                <button
                  type="button"
                  onClick={toggleLang}
                  aria-label={lang === "en" ? "Switch to Spanish" : "Cambiar a ingl\u00e9s"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "inherit",
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    fontSize: 12,
                    fontWeight: lang === "en" ? 700 : 400,
                    color: lang === "en" ? "var(--ifw-accent)" : "var(--ifw-text-muted)",
                    letterSpacing: 1,
                    transition: "color 0.2s",
                  }}>
                    {t.langToggleEn}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--ifw-text-muted)" }}>|</span>
                  <span style={{
                    fontSize: 12,
                    fontWeight: lang === "es" ? 700 : 400,
                    color: lang === "es" ? "var(--ifw-accent)" : "var(--ifw-text-muted)",
                    letterSpacing: 1,
                    transition: "color 0.2s",
                  }}>
                    {t.langToggleEs}
                  </span>
                </button>

                {/* Progress dots */}
                <div className="ifw-progress-dots" style={{ marginBottom: 0 }}>
                  {Array.from({ length: totalSteps }, (_, i) => (
                    <div key={i} className={`ifw-progress-dot ${i === currentDot ? "active" : ""} ${i < currentDot ? "completed" : ""}`} />
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <ModalStep key="step1" direction={direction}>
                <div className="ifw-divider-text ifw-fade-in">{t.letsGetStarted}</div>

                <h1 className="ifw-sentence-heading">
                  {t.iAm}{" "}
                  <SentenceSelect
                    value={userTypeLabel}
                    onChange={(label) => {
                      const internal = label === t.anIndividual ? "individual" : label === t.aBusiness ? "business" : label;
                      handleUserTypeChange(internal);
                    }}
                    options={[t.anIndividual, t.aBusiness]}
                    placeholder="select one"
                    ariaLabel="I am"
                    t={t}
                  />
                  {userType && (
                    <span className="ifw-fade-in">
                      {" "}{t.readyToExplore}
                    </span>
                  )}
                </h1>

                {userType && (
                  <div style={{ marginTop: 32 }} className="ifw-fade-in">
                    <p className="ifw-divider-text" style={{ marginBottom: 16 }}>
                      {t.selectAllThatApply}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {(isBusiness ? INSURANCE_TYPES_BUSINESS : INSURANCE_TYPES_INDIVIDUAL).map((type) => {
                        const selected = insuranceTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            aria-pressed={selected}
                            aria-label={tLabel(t, type, insuranceTypeKeys)}
                            className={`ifw-pill-multi ${selected ? "selected ifw-pill-bounce" : ""}`}
                            onClick={() => toggleInsuranceType(type)}
                            onAnimationEnd={(e) => {
                              (e.currentTarget as HTMLButtonElement).classList.remove("ifw-pill-bounce");
                            }}
                          >
                            {selected && (
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }}
                                aria-hidden="true"
                              >
                                <path d="M2 7L5.5 10.5L12 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                            {tLabel(t, type, insuranceTypeKeys)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {sentenceComplete && (
                  <div style={{ marginTop: 40 }} className="ifw-fade-in">
                    <button
                      className="ifw-btn-primary"
                      aria-label={t.continue}
                      onClick={nextStep}
                    >
                      {t.continue}
                    </button>
                  </div>
                )}
              </ModalStep>
            )}

            {step === 2 && (
              <ModalStep key="step2" direction={direction}>
                <button onClick={prevStep} className="ifw-back-btn" aria-label={t.back}>{t.back}</button>
                <div className="ifw-divider-text ifw-fade-in">{t.tellUsAboutYourself}</div>

                <h1 className="ifw-sentence-heading">
                  {t.myFirstNameIs}{" "}
                  <InlineInput
                    value={firstName}
                    onChange={setFirstName}
                    placeholder={t.firstName}
                    autoFocus
                    ariaLabel="First name"
                    autoComplete="given-name"
                  />
                  {firstName.trim().length > 0 && (
                    <span className="ifw-fade-in">
                      {" "}{t.andMyLastNameIs}{" "}
                      <InlineInput
                        value={lastName}
                        onChange={setLastName}
                        placeholder={t.lastName}
                        ariaLabel="Last name"
                        autoComplete="family-name"
                      />
                    </span>
                  )}
                  {lastName.trim().length > 0 && (
                    <span className="ifw-fade-in">
                      {t.iNeedCoverageIn}{" "}
                      <InlineInput
                        value={city}
                        onChange={setCity}
                        placeholder={t.city}
                        ariaLabel="City"
                        autoComplete="address-level2"
                      />
                      ,{" "}
                      <SentenceSelect
                        value={state}
                        onChange={setState}
                        options={US_STATES}
                        placeholder={t.state}
                        searchable
                        ariaLabel="State"
                        t={t}
                      />
                    </span>
                  )}
                  .
                </h1>

                {personalComplete && (
                  <div style={{ marginTop: 40 }} className="ifw-fade-in">
                    <button
                      className="ifw-btn-primary"
                      aria-label={t.continue}
                      onClick={nextStep}
                    >
                      {t.continue}
                    </button>
                  </div>
                )}
              </ModalStep>
            )}

            {step === 3 && (
              <ModalStep key="step3" direction={direction}>
                <button onClick={prevStep} className="ifw-back-btn" aria-label={t.back}>{t.back}</button>
                <div className="ifw-divider-text ifw-fade-in">{t.aboutYourBusiness}</div>

                <h1 className="ifw-sentence-heading">
                  {t.myBusinessIsIn}{" "}
                  <SentenceSelect
                    value={industry}
                    onChange={setIndustry}
                    options={INDUSTRIES}
                    placeholder={t.industry}
                    ariaLabel="Industry"
                    t={t}
                    labelMap={(v) => tLabel(t, v, industryKeys)}
                  />
                  {industry && (
                    <span className="ifw-fade-in">
                      {" "}{t.with}{" "}
                      <SentenceSelect
                        value={employeeCount}
                        onChange={setEmployeeCount}
                        options={EMPLOYEE_COUNTS}
                        placeholder={t.count}
                        ariaLabel="Employee count"
                        t={t}
                      />
                      {" "}{t.withEmployees}
                    </span>
                  )}
                </h1>

                {businessComplete && (
                  <div style={{ marginTop: 40 }} className="ifw-fade-in">
                    <button
                      className="ifw-btn-primary"
                      aria-label={t.continue}
                      onClick={nextStep}
                    >
                      {t.continue}
                    </button>
                  </div>
                )}
              </ModalStep>
            )}

            {step === 4 && (
              <ModalStep key="step4" direction={direction}>
                <button onClick={prevStep} className="ifw-back-btn" aria-label={t.back}>{t.back}</button>
                <div className="ifw-divider-text ifw-fade-in">{t.almostDone}</div>

                <h1 className="ifw-sentence-heading">
                  {t.reachMeAt}{" "}
                  <PhoneInput
                    value={phone}
                    onChange={setPhone}
                    placeholder={t.phonePlaceholder}
                    autoFocus
                    onBlur={() => setPhoneTouched(true)}
                    ariaLabel="Phone number"
                    autoComplete="tel-national"
                    ariaDescribedBy={phoneTouched && phone.length > 0 && !phoneValid ? "ifw-phone-error" : undefined}
                  />
                  {phoneValid && (
                    <span className="ifw-fade-in">
                      {" "}{t.or}{" "}
                      <InlineInput
                        value={email}
                        onChange={setEmail}
                        placeholder={t.emailPlaceholder}
                        type="email"
                        onBlur={() => setEmailTouched(true)}
                        ariaLabel="Email address"
                        autoComplete="email"
                        ariaDescribedBy={emailTouched && email.trim().length > 0 && !emailValid ? "ifw-email-error" : undefined}
                      />
                      .
                    </span>
                  )}
                </h1>

                {phoneTouched && phone.length > 0 && !phoneValid && (
                  <p id="ifw-phone-error" className="ifw-error-text ifw-fade-in" role="alert">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }}>
                      <path d="M8 1.5L14.5 13.5H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M8 6.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
                    </svg>
                    {t.phoneError}
                  </p>
                )}
                {emailTouched && email.trim().length > 0 && !emailValid && (
                  <p id="ifw-email-error" className="ifw-error-text ifw-fade-in" role="alert">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }}>
                      <path d="M8 1.5L14.5 13.5H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M8 6.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
                    </svg>
                    {t.emailError}
                  </p>
                )}

                {contactComplete && (
                  <div style={{ marginTop: 32 }} className="ifw-fade-in">
                    <p className="ifw-subtitle" style={{ marginBottom: 16 }}>
                      {t.anythingElse}
                    </p>
                    <textarea
                      className="ifw-comments-field"
                      rows={3}
                      placeholder={t.typeYourMessage}
                      value={comments}
                      onChange={(e) => setComments(e.target.value.slice(0, 500))}
                      maxLength={500}
                      aria-label="Additional comments"
                    />
                    <div style={{ fontSize: 13, marginTop: 8, color: comments.length >= 475 ? "#fbbf24" : "var(--ifw-text-muted)", transition: "color 0.2s ease" }}>
                      {comments.length} / 500
                    </div>
                  </div>
                )}

                {submitError && contactComplete && (
                  <div className="ifw-submit-error ifw-fade-in" role="alert" style={{ marginTop: 20 }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                      <path d="M8 1.5L14.5 13.5H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M8 6.5V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
                    </svg>
                    <span>{t.submitError}</span>
                    <button type="button" className="ifw-submit-error-retry" onClick={handleSubmit}>
                      {t.tryAgain}
                    </button>
                  </div>
                )}

                {contactComplete && (
                  <div style={{ marginTop: 32 }} className="ifw-fade-in">
                    <button
                      className="ifw-btn-primary"
                      onClick={handleSubmit}
                      disabled={submitting}
                      aria-label={submitting ? t.submitting : t.submit}
                    >
                      {submitting && <span className="ifw-spinner" />}
                      {submitting ? t.submitting : t.submit}
                    </button>
                  </div>
                )}
              </ModalStep>
            )}

            {step === 5 && (
              <ModalStep key="step5" direction="forward">
                <Confetti />
                <div className="ifw-success" style={{ position: "relative" }}>
                  <div style={{ fontSize: 60, marginBottom: 24 }} className="ifw-fade-in">&#127881;</div>
                  <h1 className="ifw-sentence-heading ifw-fade-in" style={{ marginBottom: 16 }}>
                    {t.allSet}, {firstName}!
                  </h1>
                  <p className="ifw-subtitle ifw-fade-in" style={{ fontSize: 20, animationDelay: "0.5s", animationFillMode: "both" }}>
                    {t.weReceived}
                  </p>
                  <div className="ifw-fade-in" style={{ marginTop: 32, animationDelay: "0.8s", animationFillMode: "both", display: "flex", gap: 12, justifyContent: "center" }}>
                    <button
                      className="ifw-btn-primary"
                      aria-label={t.done}
                      onClick={() => setModalOpen(false)}
                    >
                      {t.done}
                    </button>
                    <button
                      className="ifw-confirm-leave"
                      aria-label={t.startOver}
                      onClick={handleStartOver}
                    >
                      {t.startOver}
                    </button>
                  </div>
                </div>
              </ModalStep>
            )}

            {/* Confirm close dialog */}
            {showConfirm && (
              <div className="ifw-confirm-overlay" role="alertdialog" aria-modal="true" aria-label="Confirm close">
                <div className="ifw-confirm-card">
                  <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{t.closeTheForm}</h3>
                  <p style={{ fontSize: 14, color: "#8fb0c2", marginBottom: 24 }}>
                    {t.progressSaved}
                  </p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                    <button className="ifw-confirm-stay" aria-label={t.stay} onClick={() => setShowConfirm(false)}>{t.stay}</button>
                    <button className="ifw-confirm-leave" aria-label={t.close} onClick={confirmClose}>{t.close}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}

      {/* Global pill-bounce keyframes injected once */}
      <style>{`
        @keyframes ifwPillBounce {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.18); }
          70%  { transform: scale(0.93); }
          100% { transform: scale(1); }
        }
        .ifw-pill-bounce {
          animation: ifwPillBounce 0.32s ease-out !important;
        }
      `}</style>
    </div>
  );
}

// ============================================================
// Modal Step Wrapper
// ============================================================

function ModalStep({ children, direction }: { children: React.ReactNode; direction: "forward" | "back" }) {
  const [show, setShow] = useState(false);
  const prefersReduced = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current;
  useEffect(() => { setShow(true); }, []);
  if (prefersReduced) return <div>{children}</div>;
  const startX = direction === "forward" ? 40 : -40;
  return (
    <div style={{
      opacity: show ? 1 : 0,
      transform: show ? "translateX(0)" : `translateX(${startX}px)`,
      transition: "all 0.4s ease",
    }}>
      {children}
    </div>
  );
}

// ============================================================
// Custom Dropdown
// ============================================================

function SentenceSelect({
  value, onChange, options, placeholder, searchable = false, ariaLabel, t, labelMap,
}: {
  value: string; onChange: (v: string) => void;
  options: string[]; placeholder: string; searchable?: boolean; ariaLabel?: string;
  t: (typeof i18n)[Lang]; labelMap?: (v: string) => string;
}) {
  const getLabel = labelMap ?? ((v: string) => v);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const idPrefix = useRef(`ifw-${Math.random().toString(36).slice(2, 7)}`).current;

  const closeAndFocus = () => { setOpen(false); setTimeout(() => triggerRef.current?.focus(), 0); };

  const filtered = searchable && search
    ? options.filter((o) => getLabel(o).toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => { setHighlightedIndex(-1); }, [search]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        closeAndFocus();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") { closeAndFocus(); return; }
      if (filtered.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter") {
        if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
          e.preventDefault();
          e.stopPropagation();
          onChange(filtered[highlightedIndex]);
          closeAndFocus();
        } else if (filtered.length === 1) {
          e.preventDefault();
          e.stopPropagation();
          onChange(filtered[0]);
          closeAndFocus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, filtered, highlightedIndex, onChange]);

  useEffect(() => {
    if (!open) { setSearch(""); setHighlightedIndex(-1); return; }
    if (searchable) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [open, searchable]);

  // Close on scroll outside dropdown
  useEffect(() => {
    if (!open) return;
    const handleScroll = (e: Event) => {
      if (dropdownRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open]);

  useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const dropdownMaxH = 260;
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;

      let top: number;
      if (spaceBelow >= dropdownMaxH || spaceBelow >= spaceAbove) {
        top = rect.bottom + 8;
      } else {
        top = Math.max(8, rect.top - 8 - Math.min(dropdownMaxH, spaceAbove));
      }

      let left = rect.left;
      if (left + 220 > window.innerWidth) left = window.innerWidth - 228;
      if (left < 8) left = 8;

      setPos({ top, left });
    }
  }, [open]);

  return (
    <span style={{ display: "inline", verticalAlign: "baseline" }}>
      <button
        ref={triggerRef}
        type="button"
        className={`ifw-select-trigger ${value ? "has-value" : ""}`}
        aria-label={ariaLabel ?? placeholder}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {value ? getLabel(value) : placeholder}
        <svg className="ifw-select-arrow" width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && createPortal(
        <div
          ref={dropdownRef}
          className="ifw-select-dropdown"
          role="listbox"
          aria-label={ariaLabel ?? placeholder}
          aria-activedescendant={highlightedIndex >= 0 ? `${idPrefix}-${highlightedIndex}` : undefined}
          style={{ position: "fixed", top: pos.top, left: pos.left, maxHeight: Math.min(260, window.innerHeight - pos.top - 8) }}
        >
          {searchable && (
            <input
              ref={searchInputRef}
              type="text"
              className="ifw-select-search"
              placeholder={t.typeToSearch}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search options"
            />
          )}
          {filtered.map((opt, idx) => (
            <button
              key={opt}
              type="button"
              role="option"
              id={`${idPrefix}-${idx}`}
              aria-selected={value === opt}
              className={`ifw-select-option ${value === opt ? "active" : ""} ${idx === highlightedIndex ? "highlighted" : ""}`}
              onClick={() => { onChange(opt); closeAndFocus(); }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              ref={(el) => { if (idx === highlightedIndex && el) el.scrollIntoView({ block: "nearest" }); }}
            >
              {getLabel(opt)}
            </button>
          ))}
          {searchable && filtered.length === 0 && (
            <div className="ifw-select-empty">{t.noResults}</div>
          )}
        </div>,
        document.body,
      )}
    </span>
  );
}

// ============================================================
// Shared Components
// ============================================================

function InlineInput({
  value, onChange, placeholder, type = "text", autoFocus = false, onBlur, ariaLabel, autoComplete, ariaDescribedBy,
}: {
  value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; autoFocus?: boolean;
  onBlur?: () => void; ariaLabel?: string; autoComplete?: string; ariaDescribedBy?: string;
}) {
  const display = value || placeholder;
  return (
    <span className="ifw-text-field-wrap">
      <span className="ifw-text-field-sizer" aria-hidden="true">{display}</span>
      <input
        type={type}
        className={`ifw-text-field ${value ? "has-value" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        onBlur={onBlur}
        aria-label={ariaLabel ?? placeholder}
        autoComplete={autoComplete}
        aria-describedby={ariaDescribedBy}
      />
    </span>
  );
}

function PhoneInput({
  value, onChange, autoFocus = false, placeholder = "(555) 123-4567", onBlur, ariaLabel, autoComplete, ariaDescribedBy,
}: {
  value: string; onChange: (v: string) => void; autoFocus?: boolean;
  placeholder?: string; onBlur?: () => void; ariaLabel?: string; autoComplete?: string; ariaDescribedBy?: string;
}) {
  const formatPhone = (digits: string) => {
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const displayValue = value ? formatPhone(value) : "";
  const display = displayValue || placeholder;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(digits);
  };

  return (
    <span className="ifw-text-field-wrap">
      <span className="ifw-text-field-sizer" aria-hidden="true">{display}</span>
      <input
        type="tel"
        inputMode="numeric"
        className={`ifw-text-field ${value ? "has-value" : ""}`}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        autoFocus={autoFocus}
        onBlur={onBlur}
        aria-label={ariaLabel ?? "Phone number"}
        autoComplete={autoComplete}
        aria-describedby={ariaDescribedBy}
      />
    </span>
  );
}

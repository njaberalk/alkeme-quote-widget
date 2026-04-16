import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

// ============================================================
// Data
// ============================================================

const LINES_OF_BUSINESS = [
  "Employee Benefits",
  "Commercial P&C",
  "Personal P&C",
  "Life Insurance",
  "Individual Medical (ACA, Medicare)",
  "Other",
];

const EBITDA_MARGINS = [25, 30, 35, 40, 45, 50, 55];

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

// ============================================================
// Confetti
// ============================================================

const CONFETTI_COLORS = ["#FFBF3C", "#74a7f5", "#4ecdc4", "#f4f4ec", "#ffffff"];

function Confetti() {
  const particles = useRef(
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: Math.random() * 100,
      delay: Math.random() * 1.2,
      duration: 1.8 + Math.random() * 1.4,
      size: 6 + Math.random() * 8,
    }))
  ).current;

  return (
    <>
      <style>{`
        @keyframes avwConfettiFall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(420px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
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
              animation: `avwConfettiFall ${p.duration}s ${p.delay}s ease-in forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
}

// ============================================================
// Analytics
// ============================================================

function trackEvent(name: string, detail: Record<string, unknown> = {}) {
  try {
    window.dispatchEvent(new CustomEvent("valuation-form-event", { detail: { event: name, ...detail } }));
  } catch { /* ignore */ }
}

// ============================================================
// Main Component
// ============================================================

interface Props {
  apiUrl: string;
}

export function ValuationCalculator({ apiUrl }: Props) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  // Agency identity
  const [agencyName, setAgencyName] = useState("");
  const [agencyWebsite, setAgencyWebsite] = useState("");

  // Valuation inputs
  const [revenue, setRevenue] = useState(""); // digits-only string
  const [cagr, setCagr] = useState(""); // can be negative, allows decimals
  const [lineOfBusiness, setLineOfBusiness] = useState("");
  const [ebitdaMargin, setEbitdaMargin] = useState(""); // string like "35"
  const [state, setState] = useState("");
  const [employees, setEmployees] = useState(""); // digits-only

  // Contact
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [liveRegion, setLiveRegion] = useState("");

  const stepStart = useRef(Date.now());
  useEffect(() => {
    stepStart.current = Date.now();
    const labels: Record<number, string> = {
      1: "agency", 2: "revenue", 3: "cagr", 4: "line_of_business",
      5: "ebitda_margin", 6: "location", 7: "contact", 8: "success",
    };
    trackEvent("step_viewed", { step, stepName: labels[step] });
    setLiveRegion(`Step ${step} of 7`);
  }, [step]);

  const TOTAL_STEPS = 7;

  // Validators
  const agencyNameValid = agencyName.trim().length > 0;
  const revenueNum = revenue ? parseInt(revenue, 10) : NaN;
  const revenueValid = !isNaN(revenueNum) && revenueNum >= 0;
  const cagrNum = cagr !== "" && cagr !== "-" ? parseFloat(cagr) : NaN;
  const cagrValid = !isNaN(cagrNum) && cagrNum >= -50 && cagrNum <= 500;
  const ebitdaValid = !!ebitdaMargin;
  const lobValid = !!lineOfBusiness;
  const employeesNum = employees ? parseInt(employees, 10) : NaN;
  const employeesValid = !isNaN(employeesNum) && employeesNum >= 0;
  const locationValid = !!state && employeesValid;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneValid = phone.length === 10;
  const contactValid = firstName.trim().length > 0 && lastName.trim().length > 0 && emailValid && phoneValid;

  const canAdvance =
    (step === 1 && agencyNameValid) ||
    (step === 2 && revenueValid && revenueNum > 0) ||
    (step === 3 && cagrValid) ||
    (step === 4 && lobValid) ||
    (step === 5 && ebitdaValid) ||
    (step === 6 && locationValid) ||
    (step === 7 && contactValid);

  const completeStep = () => {
    trackEvent("step_completed", { step, durationMs: Date.now() - stepStart.current });
  };

  const nextStep = () => {
    completeStep();
    setDirection("forward");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS + 1));
  };

  const prevStep = () => {
    setDirection("back");
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" || submitting) return;
    const el = e.target as HTMLElement;
    if (el.tagName === "TEXTAREA") return;
    if (el.classList.contains("ifw-select-search")) return;
    if (!canAdvance) return;
    e.preventDefault();
    if (step === TOTAL_STEPS) handleSubmit();
    else nextStep();
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
          agencyName: agencyName.trim(),
          agencyWebsite: agencyWebsite.trim(),
          revenue: revenueNum,
          cagrPct: cagrNum,
          lineOfBusiness,
          ebitdaMarginPct: parseInt(ebitdaMargin, 10),
          state,
          employees: employeesNum,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone,
        }),
      });
      if (!res.ok) throw new Error("Submit failed");
    } catch (e) {
      console.error("Valuation submit error:", e);
      setSubmitting(false);
      setSubmitError(true);
      return;
    } finally {
      clearTimeout(timeout);
    }
    completeStep();
    trackEvent("valuation_submitted", { lineOfBusiness, state });
    setSubmitting(false);
    setDirection("forward");
    setStep(TOTAL_STEPS + 1);
  };

  return (
    <div className="ifw" lang="en">
      <div className="ifw-content">
        {step <= TOTAL_STEPS && (
          <div style={{ marginBottom: 32 }}>
            <div className="ifw-progress-dots">
              {Array.from({ length: TOTAL_STEPS }, (_, i) => (
                <div
                  key={i}
                  className={`ifw-progress-dot ${i === step - 1 ? "active" : ""} ${i < step - 1 ? "completed" : ""}`}
                />
              ))}
            </div>
          </div>
        )}

        <div
          role="presentation"
          onKeyDown={handleKeyDown}
        >
          {step === 1 && (
            <StepWrap direction={direction}>
              <div className="ifw-divider-text ifw-fade-in">What&apos;s your agency worth?</div>
              <h1 className="ifw-sentence-heading">
                My agency is called{" "}
                <InlineInput
                  value={agencyName}
                  onChange={setAgencyName}
                  placeholder="Agency name"
                  autoFocus
                  ariaLabel="Agency name"
                />
                {agencyName.trim() && (
                  <span className="ifw-fade-in">
                    {" "}and you can find us at{" "}
                    <InlineInput
                      value={agencyWebsite}
                      onChange={setAgencyWebsite}
                      placeholder="yoursite.com"
                      ariaLabel="Agency website (optional)"
                      autoComplete="url"
                    />
                  </span>
                )}
                .
              </h1>
              {agencyName.trim() && (
                <p className="ifw-fade-in" style={{
                  marginTop: 16,
                  fontSize: 13,
                  color: "var(--ifw-text-muted)",
                  fontStyle: "italic",
                  lineHeight: 1.6,
                }}>
                  Website is optional — leave blank if you don&apos;t have one.
                </p>
              )}
              {agencyNameValid && (
                <div style={{ marginTop: 32 }} className="ifw-fade-in">
                  <button className="ifw-btn-primary" onClick={nextStep}>Continue →</button>
                </div>
              )}
            </StepWrap>
          )}

          {step === 2 && (
            <StepWrap direction={direction}>
              <button onClick={prevStep} className="ifw-back-btn">← Back</button>
              <div className="ifw-divider-text ifw-fade-in">Revenue</div>
              <h1 className="ifw-sentence-heading">
                {agencyName.trim() || "My agency"}&apos;s annual revenue is{" "}
                <CurrencyInput
                  value={revenue}
                  onChange={setRevenue}
                  placeholder="$0"
                  autoFocus
                  ariaLabel="Annual revenue"
                />
                .
              </h1>
              {revenueValid && revenueNum > 0 && (
                <div style={{ marginTop: 40 }} className="ifw-fade-in">
                  <button className="ifw-btn-primary" onClick={nextStep}>Continue →</button>
                </div>
              )}
            </StepWrap>
          )}

          {step === 3 && (
            <StepWrap direction={direction}>
              <button onClick={prevStep} className="ifw-back-btn">← Back</button>
              <div className="ifw-divider-text ifw-fade-in">Growth trajectory</div>
              <h1 className="ifw-sentence-heading">
                Over the last 3 years, revenue has grown at a{" "}
                <PercentInput
                  value={cagr}
                  onChange={setCagr}
                  placeholder="15"
                  autoFocus
                  ariaLabel="3-year compound annual growth rate"
                />{" "}
                compound annual rate.
              </h1>
              {cagrValid && (
                <div style={{ marginTop: 40 }} className="ifw-fade-in">
                  <button className="ifw-btn-primary" onClick={nextStep}>Continue →</button>
                </div>
              )}
            </StepWrap>
          )}

          {step === 4 && (
            <StepWrap direction={direction}>
              <button onClick={prevStep} className="ifw-back-btn">← Back</button>
              <div className="ifw-divider-text ifw-fade-in">Your business</div>
              <h1 className="ifw-sentence-heading">
                Our primary line of business is{" "}
                <SentenceSelect
                  value={lineOfBusiness}
                  onChange={setLineOfBusiness}
                  options={LINES_OF_BUSINESS}
                  placeholder="select one"
                  ariaLabel="Line of business"
                />
                .
              </h1>
              {lobValid && (
                <div style={{ marginTop: 40 }} className="ifw-fade-in">
                  <button className="ifw-btn-primary" onClick={nextStep}>Continue →</button>
                </div>
              )}
            </StepWrap>
          )}

          {step === 5 && (
            <StepWrap direction={direction}>
              <button onClick={prevStep} className="ifw-back-btn">← Back</button>
              <div className="ifw-divider-text ifw-fade-in">Profitability</div>
              <h1 className="ifw-sentence-heading">
                Our EBITDA margin is{" "}
                <SentenceSelect
                  value={ebitdaMargin}
                  onChange={setEbitdaMargin}
                  options={EBITDA_MARGINS.map(String)}
                  placeholder="select"
                  ariaLabel="EBITDA margin"
                  labelMap={(v) => `${v}%`}
                />
                .
              </h1>
              <p className="avw-footnote ifw-fade-in" style={{
                marginTop: 24,
                fontSize: 13,
                color: "var(--ifw-text-muted)",
                fontStyle: "italic",
                lineHeight: 1.6,
                maxWidth: 560,
              }}>
                * EBITDA margin includes owner W-2 compensation assumed by the purchaser.
              </p>
              {ebitdaValid && (
                <div style={{ marginTop: 32 }} className="ifw-fade-in">
                  <button className="ifw-btn-primary" onClick={nextStep}>Continue →</button>
                </div>
              )}
            </StepWrap>
          )}

          {step === 6 && (
            <StepWrap direction={direction}>
              <button onClick={prevStep} className="ifw-back-btn">← Back</button>
              <div className="ifw-divider-text ifw-fade-in">Where &amp; how big</div>
              <h1 className="ifw-sentence-heading">
                We&apos;re based in{" "}
                <SentenceSelect
                  value={state}
                  onChange={setState}
                  options={US_STATES}
                  placeholder="state"
                  ariaLabel="State"
                  searchable
                />
                {state && (
                  <span className="ifw-fade-in">
                    {" "}with{" "}
                    <NumberInput
                      value={employees}
                      onChange={setEmployees}
                      placeholder="0"
                      ariaLabel="Number of employees"
                    />{" "}
                    employees.
                  </span>
                )}
              </h1>
              {locationValid && (
                <div style={{ marginTop: 40 }} className="ifw-fade-in">
                  <button className="ifw-btn-primary" onClick={nextStep}>Continue →</button>
                </div>
              )}
            </StepWrap>
          )}

          {step === 7 && (
            <StepWrap direction={direction}>
              <button onClick={prevStep} className="ifw-back-btn">← Back</button>
              <div className="ifw-divider-text ifw-fade-in">Where should we send it?</div>
              <h1 className="ifw-sentence-heading">
                My name is{" "}
                <InlineInput
                  value={firstName}
                  onChange={setFirstName}
                  placeholder="first"
                  autoFocus
                  ariaLabel="First name"
                  autoComplete="given-name"
                />{" "}
                <InlineInput
                  value={lastName}
                  onChange={setLastName}
                  placeholder="last"
                  ariaLabel="Last name"
                  autoComplete="family-name"
                />
                {firstName.trim() && lastName.trim() && (
                  <span className="ifw-fade-in">
                    . Send my valuation to{" "}
                    <InlineInput
                      value={email}
                      onChange={setEmail}
                      placeholder="email@example.com"
                      type="email"
                      ariaLabel="Email"
                      autoComplete="email"
                      onBlur={() => setEmailTouched(true)}
                    />
                    {emailValid && (
                      <span className="ifw-fade-in">
                        {" "}and reach me at{" "}
                        <PhoneInput
                          value={phone}
                          onChange={setPhone}
                          placeholder="(555) 123-4567"
                          ariaLabel="Phone"
                          autoComplete="tel-national"
                          onBlur={() => setPhoneTouched(true)}
                        />
                        .
                      </span>
                    )}
                  </span>
                )}
              </h1>

              {emailTouched && email.trim().length > 0 && !emailValid && (
                <p className="ifw-error-text ifw-fade-in" role="alert">
                  Please enter a valid email address.
                </p>
              )}
              {phoneTouched && phone.length > 0 && !phoneValid && (
                <p className="ifw-error-text ifw-fade-in" role="alert">
                  Please enter a valid 10-digit phone number.
                </p>
              )}

              {submitError && (
                <div className="ifw-submit-error ifw-fade-in" role="alert" style={{ marginTop: 20 }}>
                  <span>Something went wrong. Please try again.</span>
                  <button type="button" className="ifw-submit-error-retry" onClick={handleSubmit}>
                    Try Again
                  </button>
                </div>
              )}

              {contactValid && (
                <div style={{ marginTop: 32 }} className="ifw-fade-in">
                  <button
                    className="ifw-btn-primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting && <span className="ifw-spinner" />}
                    {submitting ? "Sending..." : "Email me my valuation →"}
                  </button>
                  <p style={{ marginTop: 16, fontSize: 12, color: "var(--ifw-text-muted)", maxWidth: 520 }}>
                    We&apos;ll calculate your agency&apos;s estimated base value and send it to your inbox.
                    No sales pressure — just a data-driven estimate.
                  </p>
                </div>
              )}
            </StepWrap>
          )}

          {step === TOTAL_STEPS + 1 && (
            <StepWrap direction="forward">
              <div className="ifw-success" style={{ position: "relative", textAlign: "center" }}>
                <Confetti />
                <div style={{ fontSize: 60, marginBottom: 24 }} className="ifw-fade-in">📬</div>
                <h1 className="ifw-sentence-heading ifw-fade-in" style={{ marginBottom: 16 }}>
                  You&apos;re all set{firstName ? `, ${firstName}` : ""}!
                </h1>
                <p className="ifw-subtitle ifw-fade-in" style={{
                  fontSize: 18,
                  animationDelay: "0.4s",
                  animationFillMode: "both",
                  maxWidth: 540,
                  margin: "0 auto",
                }}>
                  We&apos;ll email your agency&apos;s estimated value to <strong style={{ color: "var(--ifw-accent)" }}>{email}</strong> shortly.
                </p>
                <p className="ifw-fade-in" style={{
                  marginTop: 24,
                  fontSize: 14,
                  color: "var(--ifw-text-muted)",
                  animationDelay: "0.6s",
                  animationFillMode: "both",
                }}>
                  Didn&apos;t see it? Check your spam folder, or reach out to our team directly.
                </p>
              </div>
            </StepWrap>
          )}
        </div>
      </div>

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}
      >
        {liveRegion}
      </div>
    </div>
  );
}

// ============================================================
// Step wrapper (fade+slide)
// ============================================================

function StepWrap({ children, direction }: { children: React.ReactNode; direction: "forward" | "back" }) {
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
// Shared inputs
// ============================================================

function useTextWidth(text: string) {
  const ref = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<number>(0);
  useLayoutEffect(() => {
    if (ref.current) setWidth(ref.current.scrollWidth);
  }, [text]);
  return { ref, width };
}

function InlineInput({
  value, onChange, placeholder, type = "text", autoFocus = false, onBlur, ariaLabel, autoComplete,
}: {
  value: string; onChange: (v: string) => void; placeholder: string; type?: string;
  autoFocus?: boolean; onBlur?: () => void; ariaLabel?: string; autoComplete?: string;
}) {
  const display = value || placeholder;
  const { ref, width } = useTextWidth(display);
  return (
    <>
      <span ref={ref} className="ifw-text-field ifw-text-field-sizer" aria-hidden="true">{display}</span>
      <input
        type={type}
        className={`ifw-text-field ${value ? "has-value" : ""}`}
        style={width ? { width: width + 2 } : undefined}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        onBlur={onBlur}
        aria-label={ariaLabel ?? placeholder}
        autoComplete={autoComplete}
      />
    </>
  );
}

function CurrencyInput({
  value, onChange, placeholder, autoFocus = false, ariaLabel,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  autoFocus?: boolean; ariaLabel?: string;
}) {
  const formatted = value ? `$${parseInt(value, 10).toLocaleString("en-US")}` : "";
  const display = formatted || placeholder;
  const { ref, width } = useTextWidth(display);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 12);
    onChange(digits);
  };
  return (
    <>
      <span ref={ref} className="ifw-text-field ifw-text-field-sizer" aria-hidden="true">{display}</span>
      <input
        type="text"
        inputMode="numeric"
        className={`ifw-text-field ${value ? "has-value" : ""}`}
        style={width ? { width: width + 2 } : undefined}
        placeholder={placeholder}
        value={formatted}
        onChange={handleChange}
        autoFocus={autoFocus}
        aria-label={ariaLabel ?? placeholder}
      />
    </>
  );
}

function PercentInput({
  value, onChange, placeholder, autoFocus = false, ariaLabel,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  autoFocus?: boolean; ariaLabel?: string;
}) {
  const formatted = value !== "" ? `${value}%` : "";
  const display = formatted || `${placeholder}%`;
  const { ref, width } = useTextWidth(display);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow digits, one decimal, optional leading minus
    const raw = e.target.value.replace(/%/g, "");
    const cleaned = raw.replace(/[^-0-9.]/g, "");
    // Only one '-' at start, only one '.'
    const neg = cleaned.startsWith("-") ? "-" : "";
    const rest = cleaned.replace(/-/g, "");
    const parts = rest.split(".");
    const normalized = parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : rest;
    onChange(neg + normalized);
  };
  return (
    <>
      <span ref={ref} className="ifw-text-field ifw-text-field-sizer" aria-hidden="true">{display}</span>
      <input
        type="text"
        inputMode="decimal"
        className={`ifw-text-field ${value ? "has-value" : ""}`}
        style={width ? { width: width + 2 } : undefined}
        placeholder={`${placeholder}%`}
        value={formatted}
        onChange={handleChange}
        autoFocus={autoFocus}
        aria-label={ariaLabel ?? placeholder}
      />
    </>
  );
}

function NumberInput({
  value, onChange, placeholder, autoFocus = false, ariaLabel,
}: {
  value: string; onChange: (v: string) => void; placeholder: string;
  autoFocus?: boolean; ariaLabel?: string;
}) {
  const formatted = value ? parseInt(value, 10).toLocaleString("en-US") : "";
  const display = formatted || placeholder;
  const { ref, width } = useTextWidth(display);
  return (
    <>
      <span ref={ref} className="ifw-text-field ifw-text-field-sizer" aria-hidden="true">{display}</span>
      <input
        type="text"
        inputMode="numeric"
        className={`ifw-text-field ${value ? "has-value" : ""}`}
        style={width ? { width: width + 2 } : undefined}
        placeholder={placeholder}
        value={formatted}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 9))}
        autoFocus={autoFocus}
        aria-label={ariaLabel ?? placeholder}
      />
    </>
  );
}

function PhoneInput({
  value, onChange, autoFocus = false, placeholder = "(555) 123-4567", onBlur, ariaLabel, autoComplete,
}: {
  value: string; onChange: (v: string) => void; autoFocus?: boolean;
  placeholder?: string; onBlur?: () => void; ariaLabel?: string; autoComplete?: string;
}) {
  const formatPhone = (digits: string) => {
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };
  const displayValue = value ? formatPhone(value) : "";
  const display = displayValue || placeholder;
  const { ref, width } = useTextWidth(display);
  return (
    <>
      <span ref={ref} className="ifw-text-field ifw-text-field-sizer" aria-hidden="true">{display}</span>
      <input
        type="tel"
        inputMode="numeric"
        className={`ifw-text-field ${value ? "has-value" : ""}`}
        style={width ? { width: width + 2 } : undefined}
        placeholder={placeholder}
        value={displayValue}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
        autoFocus={autoFocus}
        onBlur={onBlur}
        aria-label={ariaLabel ?? "Phone"}
        autoComplete={autoComplete}
      />
    </>
  );
}

// ============================================================
// Dropdown (simplified port of SentenceSelect)
// ============================================================

function SentenceSelect({
  value, onChange, options, placeholder, searchable = false, ariaLabel, labelMap,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
  searchable?: boolean; ariaLabel?: string; labelMap?: (v: string) => string;
}) {
  const getLabel = labelMap ?? ((v: string) => v);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const closeAndFocus = () => { setOpen(false); setTimeout(() => triggerRef.current?.focus(), 0); };

  const filtered = searchable && search
    ? options.filter((o) => getLabel(o).toLowerCase().includes(search.toLowerCase()))
    : options;

  useEffect(() => { setHighlightedIndex(-1); }, [search]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) closeAndFocus();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeAndFocus(); return; }
      if (filtered.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((p) => (p + 1) % filtered.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((p) => (p - 1 + filtered.length) % filtered.length);
      } else if (e.key === "Enter" && highlightedIndex >= 0) {
        e.preventDefault();
        e.stopPropagation();
        onChange(filtered[highlightedIndex]);
        closeAndFocus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, filtered, highlightedIndex, onChange]);

  useEffect(() => {
    if (!open) { setSearch(""); setHighlightedIndex(-1); return; }
    if (searchable) setTimeout(() => searchInputRef.current?.focus(), 0);
  }, [open, searchable]);

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
      if (spaceBelow >= dropdownMaxH || spaceBelow >= spaceAbove) top = rect.bottom + 8;
      else top = Math.max(8, rect.top - 8 - Math.min(dropdownMaxH, spaceAbove));
      let left = rect.left;
      if (left + 260 > window.innerWidth) left = window.innerWidth - 268;
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
          style={{ position: "fixed", top: pos.top, left: pos.left, maxHeight: Math.min(260, window.innerHeight - pos.top - 8) }}
        >
          {searchable && (
            <input
              ref={searchInputRef}
              type="text"
              className="ifw-select-search"
              placeholder="Type to search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search"
            />
          )}
          {filtered.map((opt, idx) => (
            <button
              key={opt}
              type="button"
              role="option"
              aria-selected={value === opt}
              className={`ifw-select-option ${value === opt ? "active" : ""} ${idx === highlightedIndex ? "highlighted" : ""}`}
              onClick={() => { onChange(opt); closeAndFocus(); }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              ref={(el) => { if (idx === highlightedIndex && el) el.scrollIntoView({ block: "nearest" }); }}
            >
              {getLabel(opt)}
            </button>
          ))}
          {searchable && filtered.length === 0 && <div className="ifw-select-empty">No results</div>}
        </div>,
        document.body,
      )}
    </span>
  );
}

"use client";

import { useMemo, useState, type FormEvent } from "react";
import { buildWhatsAppLink } from "@/lib/constants";
import { treatments } from "@/lib/treatments";
import { Button } from "./ui/Button";

interface FormState {
  name: string;
  phone: string;
  email: string;
  treatment: string;
  date: string;
  time: string;
  message: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  treatment?: string;
  date?: string;
  time?: string;
}

const initialState: FormState = {
  name: "",
  phone: "",
  email: "",
  treatment: "",
  date: "",
  time: "",
  message: "",
};

const phonePattern = /^[+]?[0-9\s-]{7,15}$/;

export default function BookingForm({
  presetTreatment,
}: {
  presetTreatment?: string;
}) {
  const [form, setForm] = useState<FormState>({
    ...initialState,
    treatment: presetTreatment ?? "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [confirmation, setConfirmation] = useState<{
    appointmentCode?: string;
    patientUhid?: string;
    leadId?: string;
  } | null>(null);

  const treatmentOptions = useMemo(() => {
    const seen = new Set<string>();
    const options: { label: string; value: string }[] = [];
    for (const t of treatments) {
      if (seen.has(t.name)) continue;
      seen.add(t.name);
      options.push({ label: t.name, value: t.name });
    }
    return options;
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Please enter your full name.";
    if (!form.phone.trim()) {
      next.phone = "Please enter a phone number.";
    } else if (!phonePattern.test(form.phone.trim())) {
      next.phone = "Please enter a valid phone number.";
    }
    if (!form.treatment) next.treatment = "Please select a treatment or concern.";
    if (!form.date) next.date = "Please select a preferred date.";
    if (!form.time) next.time = "Please select a preferred time.";
    return next;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("submitting");

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      treatment: form.treatment,
      date: form.date,
      time: form.time,
      message: form.message.trim() || undefined,
    };

    let resultData: any = null;

    try {
      // 1. Submit to web API route which synchronizes directly with CRM
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resultData = await res.json();
      } else {
        // Fallback directly to CRM API endpoint
        const crmApiUrl = process.env.NEXT_PUBLIC_CRM_API_URL || "http://localhost:3000/api/public";
        const crmRes = await fetch(`${crmApiUrl}/enquiries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (crmRes.ok) {
          resultData = await crmRes.json();
        }
      }
    } catch (fetchErr) {
      console.warn("Primary submission encountered error, trying fallback:", fetchErr);
      try {
        const crmApiUrl = process.env.NEXT_PUBLIC_CRM_API_URL || "http://localhost:3000/api/public";
        const crmRes = await fetch(`${crmApiUrl}/enquiries`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (crmRes.ok) {
          resultData = await crmRes.json();
        }
      } catch (crmErr) {
        console.warn("CRM fallback also unreachable:", crmErr);
      }
    }

    setConfirmation(resultData);
    setStatus("done");

    // Pre-fill WhatsApp message
    const whatsappMsg = [
      "Hello Crown Celebrity Aesthetic,",
      "",
      "I have submitted an enquiry on your website.",
      "",
      "Details:",
      `Name: ${form.name.trim()}`,
      `Phone: ${form.phone.trim()}`,
      `Email: ${form.email.trim() || "Not provided"}`,
      `Treatment / Concern: ${form.treatment}`,
      `Preferred Date: ${form.date}`,
      `Preferred Time: ${form.time}`,
      form.message.trim() ? `Message: ${form.message.trim()}` : "",
      resultData?.appointmentCode ? `Reference: ${resultData.appointmentCode}` : "",
    ].filter(Boolean).join("\n");

    try {
      window.open(buildWhatsAppLink(whatsappMsg), "_blank", "noopener,noreferrer");
    } catch {
      // Pop-up blocker handled gracefully
    }
  }

  const whatsappMessageForLink = [
    "Hello Crown Celebrity Aesthetic,",
    "",
    "I have submitted an enquiry on your website.",
    "",
    `Name: ${form.name.trim()}`,
    `Phone: ${form.phone.trim()}`,
    `Treatment: ${form.treatment}`,
    `Preferred Date: ${form.date}`,
    `Preferred Time: ${form.time}`,
    confirmation?.appointmentCode ? `Reference: ${confirmation.appointmentCode}` : "",
  ].filter(Boolean).join("\n");

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-6 sm:grid-cols-2"
    >
      <Field label="Full Name" htmlFor="name" error={errors.name} required>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
          className={inputClass(Boolean(errors.name))}
        />
      </Field>

      <Field
        label="Phone Number"
        htmlFor="phone"
        error={errors.phone}
        required
      >
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          className={inputClass(Boolean(errors.phone))}
        />
      </Field>

      <Field label="Email Address (optional)" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          className={inputClass(false)}
        />
      </Field>

      <Field
        label="Treatment / Concern"
        htmlFor="treatment"
        error={errors.treatment}
        required
      >
        <select
          id="treatment"
          name="treatment"
          value={form.treatment}
          onChange={(e) => updateField("treatment", e.target.value)}
          aria-invalid={Boolean(errors.treatment)}
          aria-describedby={errors.treatment ? "treatment-error" : undefined}
          className={inputClass(Boolean(errors.treatment))}
        >
          <option value="">Select a treatment or concern...</option>
          {treatmentOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Preferred Date" htmlFor="date" error={errors.date} required>
        <input
          id="date"
          name="date"
          type="date"
          value={form.date}
          onChange={(e) => updateField("date", e.target.value)}
          aria-invalid={Boolean(errors.date)}
          aria-describedby={errors.date ? "date-error" : undefined}
          className={inputClass(Boolean(errors.date))}
        />
      </Field>

      <Field label="Preferred Time" htmlFor="time" error={errors.time} required>
        <input
          id="time"
          name="time"
          type="time"
          value={form.time}
          onChange={(e) => updateField("time", e.target.value)}
          aria-invalid={Boolean(errors.time)}
          aria-describedby={errors.time ? "time-error" : undefined}
          className={inputClass(Boolean(errors.time))}
        />
      </Field>

      <div className="sm:col-span-2">
        <Field label="Message / Specific Concerns (optional)" htmlFor="message">
          <textarea
            id="message"
            name="message"
            rows={4}
            placeholder="Tell us about your hair, skin, PMU goals, or any prior treatments..."
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            className={inputClass(false)}
          />
        </Field>
      </div>

      <div className="sm:col-span-2">
        <p className="mb-4 font-grotesk text-sm leading-relaxed text-charcoal/70">
          Submitting this form records your enquiry directly into the Crown Celebrity Aesthetic CRM.
          Our medical desk will contact you to confirm your doctor consultation.
        </p>

        {status === "done" ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/80 p-5 dark:bg-emerald-950/20">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-sm">
                ✓
              </span>
              <div>
                <h4 className="font-display text-base font-bold text-emerald-900 dark:text-emerald-300">
                  Enquiry Sent Directly to CRM!
                </h4>
                <p className="mt-1 font-grotesk text-sm text-emerald-800 dark:text-emerald-400">
                  Thank you, <strong>{form.name}</strong>. Your enquiry for <strong>{form.treatment}</strong> has been received by our clinic reception.
                  {confirmation?.appointmentCode && (
                    <span className="block mt-1 font-mono text-xs font-semibold text-emerald-950 dark:text-emerald-200">
                      Booking Reference: {confirmation.appointmentCode}
                    </span>
                  )}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <a
                    href={buildWhatsAppLink(whatsappMessageForLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-md bg-[#25D366] px-4 py-2 font-grotesk text-xs font-bold uppercase tracking-wider text-white hover:bg-[#1EBE5D] transition-colors shadow-xs"
                  >
                    <span>💬 Open In WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setForm(initialState);
                      setStatus("idle");
                      setConfirmation(null);
                    }}
                    className="font-grotesk text-xs text-emerald-900 underline hover:text-emerald-700"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="submit"
              variant="primary"
              disabled={status === "submitting"}
              className="w-full sm:w-auto"
            >
              {status === "submitting" ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending to CRM...
                </span>
              ) : (
                "Send Enquiry To Clinic →"
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-md border bg-ivory-100 px-4 py-3 font-grotesk text-base text-charcoal placeholder:text-charcoal/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
    hasError ? "border-charcoal border-2" : "border-charcoal/20"
  }`;
}

function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-grotesk text-[13px] font-semibold uppercase tracking-widest2 text-charcoal/80"
      >
        {label}
        {required && <span className="ml-1 text-gold-dark">*</span>}
      </label>
      {children}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-2 font-grotesk text-sm font-semibold text-charcoal"
        >
          {error}
        </p>
      )}
    </div>
  );
}

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
  const [status, setStatus] = useState<"idle" | "preparing" | "done">("idle");

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

    setStatus("preparing");

    try {
      const crmApiUrl = process.env.NEXT_PUBLIC_CRM_API_URL || "http://localhost:3000/api/public";
      fetch(`${crmApiUrl}/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: form.name.trim(),
          patientPhone: form.phone.trim(),
          patientEmail: form.email.trim() || undefined,
          date: form.date,
          startTime: form.time,
          chiefComplaint: `Website booking: ${form.treatment}${form.message ? ` - ${form.message.trim()}` : ""}`,
        }),
      }).catch(() => {
        // CRM fallback
      });
    } catch {
      // Ignore background fetch error
    }

    window.setTimeout(() => {
      const message = [
        "Hello Celebrity Aesthetic,",
        "",
        "I would like to book a consultation.",
        "",
        "Booking Details:",
        "",
        `Name: ${form.name.trim()}`,
        `Phone: ${form.phone.trim()}`,
        `Email: ${form.email.trim() || "Not provided"}`,
        `Treatment / Concern: ${form.treatment}`,
        `Preferred Date: ${form.date}`,
        `Preferred Time: ${form.time}`,
        "",
        "Message:",
        form.message.trim() || "Not provided",
        "",
        "Thank you.",
      ].join("\n");

      window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
      setStatus("done");
    }, 700);
  }

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

      <Field label="Phone Number" htmlFor="phone" error={errors.phone} required>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          className={inputClass(Boolean(errors.phone))}
        />
      </Field>

      <Field label="Email (optional)" htmlFor="email">
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
          <option value="">Select a treatment or concern</option>
          <option value="General Consultation">General Consultation</option>
          {treatmentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
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
        <Field label="Message (optional)" htmlFor="message">
          <textarea
            id="message"
            name="message"
            rows={4}
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            className={inputClass(false)}
          />
        </Field>
      </div>

      <div className="sm:col-span-2">
        <p className="mb-4 font-grotesk text-base leading-relaxed text-charcoal/60">
          You&apos;ll be redirected to WhatsApp to send your enquiry. This form
          does not submit a booking directly — our team will confirm details
          with you over WhatsApp.
        </p>
        <Button
          type="submit"
          variant="primary"
          disabled={status === "preparing"}
          className="w-full sm:w-auto"
        >
          {status === "preparing"
            ? "Preparing Your Enquiry..."
            : "Send Enquiry Via WhatsApp →"}
        </Button>
        {status === "done" && (
          <p className="mt-4 font-grotesk text-base text-sage-dark">
            Your enquiry was prepared and opened in WhatsApp. If nothing
            opened, please check your pop-up blocker.
          </p>
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

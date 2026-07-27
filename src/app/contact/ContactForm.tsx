"use client";

import React, { useState } from "react";
import Label from "@/components/Label/Label";
import Input from "@/shared/Input/Input";
import Textarea from "@/shared/Textarea/Textarea";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import { submitContactForm } from "./actions";

const ContactForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await submitContactForm({ name, email, message });
      setResult(res);
      if (res.ok) {
        setName("");
        setEmail("");
        setMessage("");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="grid grid-cols-1 gap-6" onSubmit={handleSubmit}>
      <label className="block">
        <Label>Full name</Label>
        <Input
          placeholder="Example Doe"
          type="text"
          className="mt-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <Label>Email address</Label>
        <Input
          type="email"
          placeholder="example@example.com"
          className="mt-1"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label className="block">
        <Label>Message</Label>
        <Textarea
          className="mt-1"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </label>
      {result && (
        <p className={`text-sm ${result.ok ? "text-green-600" : "text-red-600"}`}>{result.message}</p>
      )}
      <div>
        <ButtonPrimary type="submit" disabled={submitting}>
          {submitting ? "Sending…" : "Send Message"}
        </ButtonPrimary>
      </div>
    </form>
  );
};

export default ContactForm;

"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setError(null);
    if (!selected) return setFile(null);
    if (!allowedTypes.includes(selected.type)) {
      setFile(null);
      return setError("Please select a JPEG, PNG, or WebP image.");
    }
    if (selected.size > 10 * 1024 * 1024) {
      setFile(null);
      return setError("The image must be 10 MB or smaller.");
    }
    setFile(selected);
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return setError("Choose your resume image first.");
    setError(null);
    setIsSubmitting(true);
    try {
      const body = new FormData();
      body.append("resume", file);
      const result = await fetch(`${API_URL}/api/resumes`, {
        method: "POST",
        body,
      });
      const payload = await result.json();
      if (!result.ok)
        throw new Error(payload.error ?? "Unable to generate your profile.");
      router.push(
        `/profile?resumeId=${payload.resumeId}&token=${payload.accessToken}`,
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to generate your profile.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Resume extractor</p>
        <h1>Your resume, clearly structured.</h1>
        <p className="lede">
          Upload one image and we’ll turn the important details into a readable
          profile.
        </p>
      </section>
      <form className="upload-card" onSubmit={handleSubmit}>
        <label className="file-drop" htmlFor="resume">
          <span className="upload-icon">↑</span>
          <span className="file-title">
            {file ? file.name : "Choose a resume image"}
          </span>
          <span className="file-note">JPEG, PNG, or WebP · up to 10 MB</span>
          <input
            id="resume"
            name="resume"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={chooseFile}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button
          className="primary-button"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Extracting your profile…" : "Generate profile"}
        </button>
      </form>
    </main>
  );
}

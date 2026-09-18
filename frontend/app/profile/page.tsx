"use client";
/* eslint-disable @next/next/no-img-element */

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
type NullableString = string | null;
type Profile = {
  imageUrl: string;
  originalFilename: string;
  extractedData: {
    fullName: NullableString;
    email: NullableString;
    phone: NullableString;
    location: NullableString;
    summary: NullableString;
    skills: string[];
    experience: Array<{
      company: NullableString;
      position: NullableString;
      startDate: NullableString;
      endDate: NullableString;
      description: NullableString;
    }>;
    education: Array<{
      institution: NullableString;
      degree: NullableString;
      fieldOfStudy: NullableString;
      startDate: NullableString;
      endDate: NullableString;
    }>;
    certifications: string[];
  };
};
const present = (value: NullableString) => value || "Not provided";
function ProfileContent() {
  const params = useSearchParams();
  const resumeId = params.get("resumeId");
  const token = params.get("token");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const linkError =
    !resumeId || !token ? "This profile link is incomplete." : error;
  useEffect(() => {
    if (!resumeId || !token) return;
    fetch(`${API_URL}/api/resumes/${resumeId}?token=${token}`)
      .then(async (result) => {
        const payload = await result.json();
        if (!result.ok)
          throw new Error(payload.error ?? "Unable to load this profile.");
        setProfile(payload);
      })
      .catch((loadError) =>
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load this profile.",
        ),
      );
  }, [resumeId, token]);
  if (linkError)
    return (
      <main className="shell">
        <section className="message-card">
          <h1>Profile unavailable</h1>
          <p>{linkError}</p>
          <Link href="/">Upload another resume</Link>
        </section>
      </main>
    );
  if (!profile)
    return (
      <main className="shell">
        <section className="message-card">
          <p className="eyebrow">Working</p>
          <h1>Loading your profile…</h1>
        </section>
      </main>
    );
  const data = profile.extractedData;
  return (
    <main className="shell profile-shell">
      <header className="profile-header">
        <div>
          <p className="eyebrow">Extracted profile</p>
          <h1>{present(data.fullName)}</h1>
          <p>
            {[data.email, data.phone, data.location]
              .filter(Boolean)
              .join(" · ") || "Contact details not found"}
          </p>
        </div>
        <Link href="/" className="secondary-link">
          New upload
        </Link>
      </header>
      <div className="profile-grid">
        <aside className="resume-preview">
          <img
            src={profile.imageUrl}
            alt={`Uploaded resume: ${profile.originalFilename}`}
          />
          <p>{profile.originalFilename}</p>
        </aside>
        <article className="details-card">
          {data.summary && (
            <section>
              <h2>Summary</h2>
              <p>{data.summary}</p>
            </section>
          )}
          <section>
            <h2>Skills</h2>
            <div className="chips">
              {data.skills.length ? (
                data.skills.map((skill) => <span key={skill}>{skill}</span>)
              ) : (
                <p>None found</p>
              )}
            </div>
          </section>
          <section>
            <h2>Experience</h2>
            {data.experience.length ? (
              data.experience.map((item, index) => (
                <div className="timeline-item" key={`${item.company}-${index}`}>
                  <strong>{present(item.position)}</strong>
                  <p>
                    {present(item.company)} ·{" "}
                    {[item.startDate, item.endDate].filter(Boolean).join(" – ")}
                  </p>
                  {item.description && <p>{item.description}</p>}
                </div>
              ))
            ) : (
              <p>None found</p>
            )}
          </section>
          <section>
            <h2>Education</h2>
            {data.education.length ? (
              data.education.map((item, index) => (
                <div
                  className="timeline-item"
                  key={`${item.institution}-${index}`}
                >
                  <strong>{present(item.degree)}</strong>
                  <p>
                    {present(item.institution)}
                    {item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <p>None found</p>
            )}
          </section>
          {data.certifications.length > 0 && (
            <section>
              <h2>Certifications</h2>
              <div className="chips">
                {data.certifications.map((certification) => (
                  <span key={certification}>{certification}</span>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="shell">
          <section className="message-card">
            <p className="eyebrow">Working</p>
            <h1>Loading your profile…</h1>
          </section>
        </main>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}

import Link from "next/link";
import { GhostSVG } from "@/components/ui/GhostSVG";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <div style={{ color: "var(--color-primary)" }}>
            <GhostSVG size={32} />
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Privacy Policy
          </h1>
        </div>
        <div style={{ color: "var(--color-muted)" }}>
          <p className="text-xs mb-6" style={{ color: "var(--color-subtle)" }}>
            Last updated: February 2026
          </p>

          {[
            [
              "What We Collect",
              "For registered users: name, username, email address, hashed password, theme preference, and message retention setting. For anonymous senders: IP address, country, city, device type, and browser (collected for safety purposes). For all users: usage analytics via Umami (privacy-friendly, no personal data).",
            ],
            [
              "How We Use Your Data",
              "To operate the Gwam service, send email notifications, enforce content moderation, prevent abuse, and improve the product. We do not sell your personal data to third parties.",
            ],
            [
              "Anonymous Messaging",
              'Message content is stored encrypted at rest. Sender metadata (IP, country, device) is stored for 6 months for safety purposes. Recipients cannot see sender identity — only metadata is accessible via the "Get Hint" feature (future paid feature).',
            ],
            [
              "Cookies & Analytics",
              "Gwam uses Umami Analytics (self-hosted, GDPR-compliant) for usage analytics. No third-party tracking cookies are used. AdSense may set cookies for ad personalization — you can opt out via Google Ad Settings.",
            ],
            [
              "Data Retention",
              "Messages are deleted after the period set by the recipient (1–12 months). Account data is retained until you delete your account. IP logs are retained for 6 months.",
            ],
            [
              "Your Rights",
              "You may request access to, correction of, or deletion of your personal data by contacting privacy@dumostech.com. We will respond within 30 days.",
            ],
            [
              "Security",
              "We use industry-standard encryption (HTTPS, bcrypt password hashing) and regular security audits. However, no system is 100% secure.",
            ],
            [
              "Children",
              "Gwam is not intended for children under 13. We do not knowingly collect data from children under 13.",
            ],
            [
              "Changes",
              "We may update this Privacy Policy. We will notify registered users via email of significant changes.",
            ],
            [
              "Contact",
              "For privacy inquiries: privacy@dumostech.com · Dumostech, Nigeria.",
            ],
          ].map(([title, body]) => (
            <div key={title as string} className="mb-6">
              <h2
                className="text-base font-semibold mb-2"
                style={{ color: "var(--color-text)" }}
              >
                {title}
              </h2>
              <p className="text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
        <Link
          href="/"
          className="text-sm"
          style={{ color: "var(--color-primary)" }}
        >
          ← Back to Gwam
        </Link>
      </div>
    </div>
  );
}

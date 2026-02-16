import Link from "next/link";
import { GhostSVG } from "@/components/ui/GhostSVG";

export default function TermsPage() {
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
            Terms of Service
          </h1>
        </div>
        <div
          className="prose prose-invert max-w-none"
          style={{ color: "var(--color-muted)" }}
        >
          <p className="text-xs mb-6" style={{ color: "var(--color-subtle)" }}>
            Last updated: February 2026
          </p>

          {[
            [
              "1. Acceptance",
              "By using Gwam, you agree to these Terms. If you do not agree, do not use the service.",
            ],
            [
              "2. Eligibility",
              "You must be at least 13 years old to use Gwam. By using Gwam, you confirm you meet this requirement.",
            ],
            [
              "3. Acceptable Use",
              "You agree not to use Gwam to send threatening, harassing, defamatory, obscene, or illegal content. You agree not to impersonate others or send spam. Abusive messages are logged by IP and may be reported to authorities.",
            ],
            [
              "4. Anonymous Messaging",
              "Gwam is designed for anonymous communication. While senders are anonymous to recipients, Gwam logs IP addresses and device metadata for safety and abuse prevention purposes.",
            ],
            [
              "5. Content Moderation",
              "Gwam uses automated keyword filtering and human review to detect and remove abusive content. We reserve the right to delete any content and suspend any account that violates these Terms.",
            ],
            [
              "6. Message Retention",
              "Messages are retained for the period set by the recipient (default: 6 months). After this period, messages are permanently deleted.",
            ],
            [
              "7. Advertising",
              "Gwam displays advertisements to support the free service. By using Gwam, you consent to the display of relevant ads.",
            ],
            [
              "8. Limitation of Liability",
              'Gwam is provided "as is" without warranties of any kind. Dumostech shall not be liable for any indirect, incidental, or consequential damages arising from your use of Gwam.',
            ],
            [
              "9. Changes",
              "We may update these Terms at any time. Continued use of Gwam after changes constitutes acceptance of the new Terms.",
            ],
            [
              "10. Contact",
              "For questions about these Terms, contact us at legal@dumostech.com.",
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

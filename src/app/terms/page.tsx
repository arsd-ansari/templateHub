import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/constants/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms and conditions for using ${SITE_NAME} and downloading its Excel templates and resources.`,
  alternates: { canonical: "/terms" }
};

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">Last updated: 2 June 2026</p>

      <div className="prose mt-6">
        <p>
          These Terms of Service ("Terms") govern your use of {SITE_NAME} (the "Site") at{" "}
          <a href={SITE_URL}>{SITE_URL}</a>. By accessing or using the Site, you agree to be bound by these
          Terms. If you do not agree, please do not use the Site.
        </p>

        <h2>Use of the Site</h2>
        <p>
          {SITE_NAME} provides free Excel templates, spreadsheet resources, and related articles for
          general informational purposes. You may use the Site and download templates for your personal or
          internal business use.
        </p>

        <h2>Templates and content licence</h2>
        <ul className="ml-6 list-disc">
          <li>You may download, edit, and use our templates for personal and commercial projects.</li>
          <li>
            You may not resell, redistribute, or republish our templates or content as your own, or offer
            them for download on another website without permission.
          </li>
          <li>All trademarks, branding, and original content remain the property of {SITE_NAME}.</li>
          <li>
            Paid packs (including the GST Compliance Pack) are a one-time licence for your own use. You
            may not share the zip or republish pack-only files.
          </li>
        </ul>

        <h2>No professional advice</h2>
        <p>
          Our templates and articles (including those covering accounting, tax, GST, payroll, and finance
          topics) are provided for general guidance only and do not constitute professional, legal,
          financial, or tax advice. You are responsible for verifying all formulas, figures, and
          compliance requirements before relying on any template. Always consult a qualified professional
          for your specific situation.
        </p>

        <h2>Disclaimer of warranties</h2>
        <p>
          The Site and all content are provided "as is" and "as available" without warranties of any kind,
          whether express or implied, including fitness for a particular purpose and accuracy. We do not
          warrant that the Site will be uninterrupted, error-free, or free of harmful components.
        </p>

        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, {SITE_NAME} shall not be liable for any indirect,
          incidental, or consequential damages, or any loss of data or profits, arising from your use of
          the Site or any template downloaded from it.
        </p>

        <h2>Third-party links and advertising</h2>
        <p>
          The Site may contain advertising (including Google AdSense) and links to third-party websites. We
          are not responsible for the content, products, or practices of any third-party sites or
          advertisers. Your interactions with them are solely between you and that third party.
        </p>

        <h2>Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the Site after changes are posted
          constitutes acceptance of the revised Terms.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these Terms can be sent through our <a href="/contact">contact page</a>.
        </p>
      </div>
    </div>
  );
}

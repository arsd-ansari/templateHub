import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/constants/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${SITE_NAME} collects, uses, and protects your information, including the use of cookies and Google AdSense advertising.`,
  alternates: { canonical: "/privacy" }
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-10">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-[var(--muted-foreground)]">Last updated: 25 August 2026</p>

      <div className="prose mt-6">
        <p>
          This Privacy Policy explains how {SITE_NAME} ("we", "us", or "our") collects, uses, and
          safeguards information when you visit <a href={SITE_URL}>{SITE_URL}</a> (the "Site"). By using
          the Site you agree to the practices described here.
        </p>

        <h2>Information we collect</h2>
        <p>We aim to collect as little personal information as possible. We may collect:</p>
        <ul className="ml-6 list-disc">
          <li>
            <strong>Information you provide</strong> — for example, your name, email address, and message
            when you use our contact form.
          </li>
          <li>
            <strong>Usage data</strong> — pages viewed, templates downloaded, referring pages, browser
            type, device type, and approximate location, collected automatically through analytics and
            server logs.
          </li>
          <li>
            <strong>Cookies and similar technologies</strong> — small files stored on your device to
            remember preferences and to support analytics and advertising (see below).
          </li>
        </ul>

        <h2>How we use information</h2>
        <ul className="ml-6 list-disc">
          <li>To provide, operate, and improve the Site and its templates and content.</li>
          <li>To respond to your enquiries and support requests.</li>
          <li>To understand how the Site is used and to measure content performance.</li>
          <li>To display relevant advertising and to keep the Site free to use.</li>
        </ul>

        <h2>Cookies</h2>
        <p>
          We and our partners use cookies and similar technologies to operate the Site, remember your
          preferences (such as light/dark theme), measure traffic, and serve advertising. You can control
          or delete cookies through your browser settings. Disabling cookies may affect some features of
          the Site.
        </p>

        <h2>Advertising and Google AdSense</h2>
        <p>
          We use third-party advertising companies, including <strong>Google AdSense</strong>, to serve
          ads when you visit the Site. These companies may use information about your visits to this and
          other websites in order to provide advertisements about goods and services of interest to you.
        </p>
        <p>
          For visitors in the European Economic Area (EEA), the United Kingdom, and Switzerland we use
          Google&apos;s certified Consent Management Platform (CMP) under the IAB Europe Transparency
          and Consent Framework. The consent banner lets you choose <strong>Consent</strong>,{" "}
          <strong>Do not consent</strong>, or <strong>Manage options</strong> before personalized ads
          and advertising cookies are used. You can change that choice later using the consent link
          Google shows on the Site.
        </p>
        <ul className="ml-6 list-disc">
          <li>
            Third-party vendors, including Google, use cookies to serve ads based on your prior visits to
            this Site or other websites.
          </li>
          <li>
            Google&apos;s use of advertising cookies (including the DoubleClick cookie) enables it and its
            partners to serve ads to you based on your visit to this Site and/or other sites on the
            internet.
          </li>
          <li>
            You may opt out of personalized advertising by visiting{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
              Google Ads Settings
            </a>
            .
          </li>
          <li>
            You can also opt out of a third-party vendor&apos;s use of cookies for personalized
            advertising at{" "}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">
              aboutads.info
            </a>
            .
          </li>
        </ul>
        <p>
          For more information about how Google uses data when you use our partners&apos; sites or apps,
          see{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google&apos;s policy
          </a>
          .
        </p>

        <h2>US state privacy rights</h2>
        <p>
          If you live in California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa,
          Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode
          Island, Tennessee, Texas, Utah, or Virginia, your state privacy law gives you additional
          rights over your personal information.
        </p>
        <p>
          We do not sell your personal information for money. However, using your information to show
          personalized advertising may count as a &quot;sale,&quot; &quot;sharing,&quot; or
          &quot;targeted advertising&quot; under some of these laws. You can opt out at any time using
          the <strong>Do Not Sell or Share My Personal Information</strong> link that appears on the
          Site, which records your choice through Google&apos;s certified Consent Management Platform
          under the IAB Global Privacy Platform (GPP) framework.
        </p>
        <p>Depending on your state, you may also have the right to:</p>
        <ul className="ml-6 list-disc">
          <li>Know what categories of personal information we collect and why.</li>
          <li>Request a copy of the personal information we hold about you.</li>
          <li>Ask us to correct inaccurate personal information.</li>
          <li>Ask us to delete your personal information.</li>
          <li>Opt out of targeted advertising, profiling, and the sale or sharing of your data.</li>
          <li>Not be discriminated against for exercising any of these rights.</li>
        </ul>
        <p>
          To make any of these requests, contact us through our <a href="/contact">contact page</a>. We
          may need to verify your identity before we act on a request.
        </p>

        <h2>Third-party services</h2>
        <p>
          In addition to Google AdSense, we may use analytics providers (such as Google Analytics) to help
          us understand Site usage. These providers process data in accordance with their own privacy
          policies.
        </p>

        <h2>Your rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct, or delete your personal
          information, or to object to or restrict certain processing. Residents of the EEA, the UK, and
          Switzerland have rights under the GDPR, and residents of certain US states have the rights
          described under &quot;US state privacy rights&quot; above. To exercise any of these rights,
          contact us using the details below.
        </p>

        <h2>Children&apos;s privacy</h2>
        <p>
          The Site is not directed at children under 13, and we do not knowingly collect personal
          information from them.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page with an
          updated revision date.
        </p>

        <h2>Contact us</h2>
        <p>
          If you have questions about this Privacy Policy, please reach out through our{" "}
          <a href="/contact">contact page</a>.
        </p>
      </div>
    </div>
  );
}

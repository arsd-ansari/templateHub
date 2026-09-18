import Script from "next/script";
import { AdSenseLoader } from "@/components/consent/adsense-loader";
import { ADSENSE_CLIENT_ID } from "@/constants/site";

/**
 * Consent Mode v2 defaults for Google's certified CMP (AdSense Privacy & messaging).
 * EEA / UK / Switzerland start denied until the user chooses in the banner; every
 * other region stays granted. Must run before adsbygoogle.js, hence
 * beforeInteractive in the root layout.
 */
export function GoogleConsentScripts() {
  if (!ADSENSE_CLIENT_ID) return null;

  return (
    <>
      <Script id="google-consent-default" strategy="beforeInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;

gtag('consent', 'default', {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted'
});

gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500,
  region: ['AT','BE','BG','CH','CY','CZ','DE','DK','EE','ES','FI','FR','GB','GR','HR','HU','IE','IS','IT','LI','LT','LU','LV','MT','NL','NO','PL','PT','RO','SE','SI','SK']
});
        `.trim()}
      </Script>
      <AdSenseLoader />
    </>
  );
}

import { LEGAL_META as M } from "./company";

export const LEGAL_POLICIES = [
  {
    slug: "privacy",
    label: "Privacy Policy",
    summary:
      "What data Calovia collects when you log meals, sync steps, or use the public AI analyser — and how we protect it.",
    lastUpdated: M.effectiveDate,
    sections: [
      {
        title: "1. Who we are",
        paragraphs: [
          `${M.companyName} ("${M.companyName}", "we", "us", "our") provides ${M.tagline}. Our website and API let you photograph meals for AI nutrition analysis, log food and exercise, track steps, view progress charts, and build daily streaks.`,
          `This Privacy Policy describes how we handle personal data when you use ${M.productName}, including the free public meal analyser on our homepage. It applies alongside our Terms & Conditions.`,
        ],
      },
      {
        title: "2. Data we collect",
        paragraphs: ["We collect information in the following categories:"],
        list: [
          "Account & identity — email address, display name, Firebase user ID, password hash (managed by Firebase Authentication), optional Google sign-in profile data, and profile photo if you upload an avatar.",
          "Health & profile — height, weight, age, sex, calorie goals, BMI-related inputs, and fitness preferences you enter in your profile. These are used to personalise dashboards and burn calculations.",
          "Meal & image data — meal photos (JPEG, PNG, or WebP up to 10 MB), optional meal descriptions, AI-detected food items, estimated calories, protein, carbohydrates, fat, sugar, meal timestamps, and any corrections you make.",
          "Activity data — logged exercises (type, duration, intensity), estimated calories burned, step counts, distance, and sync preferences for Apple Health or Google Health Connect when you enable them.",
          "Usage & analytics — pages visited, features used, device/browser type, approximate location from IP address, referral source, and diagnostic logs when errors occur.",
          "Public analyser (no account) — images you upload on the homepage are processed to return a one-time analysis. We apply a limit of 5 analyses per day per IP address. These uploads are not linked to an account unless you later register and log meals while signed in.",
          "Communications — if you contact support or subscribe to optional email digests (e.g. weekly summary), we retain the content of those messages.",
        ],
      },
      {
        title: "3. How we use your data",
        paragraphs: ["We use collected data to:"],
        list: [
          "Operate core features: AI meal recognition, meal and activity logs, net calorie summaries, streak tracking, and progress charts.",
          "Authenticate sessions via Firebase and prevent fraud, abuse, and unauthorised API access.",
          "Calculate nutrition and activity estimates tailored to your profile (e.g. steps needed to burn a meal).",
          "Send transactional messages (security alerts, service updates) and optional notifications you enable in Settings.",
          "Improve accuracy, reliability, and performance of our models and infrastructure.",
          "Comply with law and enforce our Acceptable Use Policy and Terms.",
        ],
        paragraphsAfter: [
          "We do not sell your personal data. We do not display third-party advertising in the app.",
        ],
      },
      {
        title: "4. Legal bases (where applicable)",
        paragraphs: [
          "If you are in the European Economic Area, UK, or similar jurisdictions, we process data based on: (a) performance of our contract with you; (b) your consent (e.g. health sync, marketing emails); (c) legitimate interests in securing and improving the service; and (d) legal obligations.",
          "You may withdraw consent at any time without affecting the lawfulness of processing before withdrawal.",
        ],
      },
      {
        title: "5. AI processing & third parties",
        paragraphs: [
          "Meal images and prompts may be sent to third-party AI providers to generate nutrition estimates. Our backend supports providers such as Google Gemini, OpenAI, Groq, AWS Bedrock, or self-hosted Ollama depending on deployment configuration. Data is transmitted over encrypted connections and used only to deliver the analysis you request.",
          "Authentication is provided by Firebase (Google). Sign-in with Google is subject to Google's privacy policy in addition to ours.",
          "Health data sync uses platform APIs (Apple HealthKit, Google Health Connect) only when you opt in via Settings.",
          "Infrastructure partners (cloud hosting, database, file storage) process data on our behalf under contractual confidentiality and security obligations. Primary infrastructure may be located in " +
            M.dataRegion +
            ".",
        ],
      },
      {
        title: "6. Cookies & local storage",
        paragraphs: [
          "We use browser local storage to keep you signed in (access token), remember UI preferences, and store notification settings. We do not use third-party advertising cookies.",
          "You can clear site data via your browser; doing so will sign you out and reset local preferences.",
        ],
      },
      {
        title: "7. Retention",
        list: [
          "Account data is kept while your account is active.",
          "Meal images and logs remain until you delete them or delete your account.",
          "Public analyser images are retained only as long as needed to complete analysis and enforce rate limits, then deleted or anonymised.",
          "Backup copies may persist for up to 90 days after deletion for disaster recovery.",
          "We may retain minimal records (e.g. billing, legal holds) where required by law.",
        ],
      },
      {
        title: "8. Your rights & choices",
        paragraphs: [
          "Depending on your location, you may have the right to access, correct, delete, restrict, or port your data, and to object to certain processing.",
          "In-app: update profile details on the Profile page; adjust notification and sync toggles in Settings.",
          "Data export: request a copy via Settings → Export my data or email " +
            M.supportEmail +
            ".",
          "Account deletion: initiate from Settings → Delete my account or contact " +
            M.supportEmail +
            ". Deletion removes your profile, meal logs, uploaded images, and activity history, subject to backup retention noted above.",
          "Privacy requests: " + M.privacyEmail,
        ],
      },
      {
        title: "9. Security",
        paragraphs: [
          "We use HTTPS encryption, Firebase Authentication, server-side access controls, and rate limiting on public endpoints. No online service is completely secure — please use a strong, unique password and keep your device updated.",
        ],
      },
      {
        title: "10. International transfers",
        paragraphs: [
          "If you access Calovia from outside India, your data may be processed in India or in countries where our service providers operate. We take steps to ensure appropriate safeguards where required by applicable law.",
        ],
      },
      {
        title: "11. Children",
        paragraphs: [
          `Calovia is not directed at children under ${M.minAge}. We do not knowingly collect data from children. If you believe a child has provided us information, contact ${M.privacyEmail} and we will delete it promptly.`,
        ],
      },
      {
        title: "12. Changes",
        paragraphs: [
          "We may update this policy periodically. The \"Last updated\" date at the top reflects the latest version. Material changes will be posted on this page; continued use after changes constitutes acceptance.",
          `Questions: ${M.privacyEmail}`,
        ],
      },
    ],
  },
  {
    slug: "terms",
    label: "Terms & Conditions",
    summary:
      "The agreement between you and Calovia for using our nutrition tracking platform, subscriptions, and API.",
    lastUpdated: M.effectiveDate,
    sections: [
      {
        title: "1. Acceptance",
        paragraphs: [
          `These Terms & Conditions ("Terms") govern access to ${M.productName} at ${M.website}, our REST API, and related services. By creating an account, signing in (including via Google), or using the public meal analyser, you agree to these Terms, our Privacy Policy, Disclaimer, and Acceptable Use Policy.`,
          `If you do not agree, do not use ${M.productName}.`,
        ],
      },
      {
        title: "2. Eligibility",
        paragraphs: [
          `You must be at least ${M.minAge} years old and capable of entering a binding contract. If you use Calovia on behalf of an organisation, you represent that you have authority to bind that organisation.`,
          "You are responsible for all activity under your account and for keeping credentials confidential.",
        ],
      },
      {
        title: "3. The service",
        paragraphs: [`${M.productName} currently includes:`],
        list: [
          "AI-powered meal photo analysis and nutrition logging.",
          "Activity and exercise logging with estimated calories burned.",
          "Step tracking with optional Apple Health or Google Health Connect sync.",
          "Dashboards, macro breakdowns, streaks, and progress charts.",
          "A public homepage analyser (limited daily uses without an account).",
        ],
        paragraphsAfter: [
          "Features may change, be added, or be limited by plan. We strive for high availability but do not guarantee uninterrupted access.",
        ],
      },
      {
        title: "4. Plans & pricing",
        paragraphs: ["We offer Free and Pro tiers as described on our pricing page:"],
        list: [
          `Free — ₹0/month: up to ${M.freeAnalyzeLimit} public analyses per day, basic meal logging, and step tracking.`,
          `Pro — ₹${M.proPriceInr}/month: unlimited analyses, full meal history, step and activity sync, progress charts, and data export. A ${M.proTrialMonths}-month free trial may be offered to new subscribers.`,
        ],
        paragraphsAfter: [
          "Prices are in Indian Rupees unless stated otherwise. Taxes may apply at checkout. We may change pricing with reasonable notice; existing subscribers are typically grandfathered until renewal.",
        ],
      },
      {
        title: "5. Payments & subscriptions",
        paragraphs: [
          "Pro subscriptions are billed monthly through our payment processor. By subscribing, you authorise recurring charges until you cancel.",
          "Cancel anytime from Settings or your payment provider portal. Cancellation stops future billing; Pro access continues until the end of the current paid period, then your account reverts to Free.",
          "See our Refund & Returns policy for refund eligibility.",
        ],
      },
      {
        title: "6. Your content & licence",
        paragraphs: [
          "You retain ownership of photos and data you submit. You grant Calovia a worldwide, non-exclusive licence to host, process, and display your content solely to operate and improve the service (including AI analysis).",
          "You represent that you have the right to upload content and that it does not violate any third-party rights or applicable law.",
        ],
      },
      {
        title: "7. Acceptable use",
        paragraphs: [
          "You must comply with our Acceptable Use Policy. We may suspend or terminate accounts that violate these Terms or pose security or legal risk.",
        ],
      },
      {
        title: "8. Intellectual property",
        paragraphs: [
          "Calovia's name, logo, software, design, and documentation are our property or our licensors'. You may not copy, modify, or redistribute them except as permitted by these Terms or the EULA.",
        ],
      },
      {
        title: "9. Disclaimers",
        paragraphs: [
          "Calovia is a wellness tool, not a medical device. AI nutrition estimates are approximations. See our Disclaimer for full health-related limitations.",
          'THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT TO THE MAXIMUM EXTENT PERMITTED BY LAW.',
        ],
      },
      {
        title: "10. Limitation of liability",
        paragraphs: [
          "To the fullest extent permitted by law, Calovia and its officers, employees, and partners are not liable for indirect, incidental, special, consequential, or punitive damages, or loss of profits, data, or goodwill.",
          "Our total liability for any claim arising from the service is limited to the greater of (a) amounts you paid us in the 12 months before the claim, or (b) ₹1,000.",
          "Some jurisdictions do not allow certain limitations; in those cases our liability is limited to the minimum permitted by law.",
        ],
      },
      {
        title: "11. Indemnity",
        paragraphs: [
          "You agree to indemnify and hold Calovia harmless from claims arising from your misuse of the service, violation of these Terms, or infringement of third-party rights.",
        ],
      },
      {
        title: "12. Termination",
        paragraphs: [
          "You may stop using Calovia and delete your account at any time. We may suspend or terminate access for breach, inactivity, legal requirement, or discontinuation of the service. Sections that by nature should survive (licence restrictions, disclaimers, liability limits, governing law) will survive termination.",
        ],
      },
      {
        title: "13. Governing law & disputes",
        paragraphs: [
          `These Terms are governed by the laws of the ${M.jurisdiction}, without regard to conflict-of-law principles. Courts in ${M.courts} have exclusive jurisdiction, except where mandatory consumer protection law in your country requires otherwise.`,
          `Contact: ${M.legalEmail}`,
        ],
      },
    ],
  },
  {
    slug: "refund",
    label: "Refund & Returns",
    summary:
      "How refunds, cancellations, and the Pro free trial work for Calovia subscriptions.",
    lastUpdated: M.effectiveDate,
    sections: [
      {
        title: "1. Scope",
        paragraphs: [
          `${M.productName} is a digital subscription service delivered online. There are no physical products to ship or return. This policy applies to Pro plan payments made through ${M.website} or authorised app stores.`,
        ],
      },
      {
        title: "2. Free plan",
        paragraphs: [
          "The Free plan costs ₹0 and requires no payment. No refunds apply because no charge is made.",
        ],
      },
      {
        title: "3. Pro free trial",
        paragraphs: [
          `New subscribers may receive a ${M.proTrialMonths}-month free trial of Pro features. You will not be charged during the trial if you cancel before it ends.`,
          "If you do not cancel before the trial expires, your selected payment method will be charged ₹" +
            M.proPriceInr +
            "/month (or the price shown at signup) and billing will continue monthly until cancelled.",
          "Trial eligibility is limited to one trial per user or payment method, at our discretion.",
        ],
      },
      {
        title: "4. Refund eligibility",
        paragraphs: ["We may approve refunds in these situations:"],
        list: [
          "Accidental duplicate charge for the same billing period.",
          "Technical failure on our side that prevents Pro access for more than 48 consecutive hours after you report it to " +
            M.supportEmail +
            ".",
          "Unauthorized charge — report within 7 days of the transaction.",
          "First monthly charge: full refund within 7 days if you have not materially used Pro-only features (unlimited analyses, full history export, advanced charts) during that billing cycle.",
        ],
        paragraphsAfter: [
          "Refunds are generally not available for partial months after substantial Pro use, change of mind after the 7-day window, or failure to cancel before a trial converts to paid billing.",
          "Nothing in this policy limits your statutory rights under applicable consumer protection law in India or your country of residence.",
        ],
      },
      {
        title: "5. How to request a refund",
        paragraphs: [
          `Email ${M.supportEmail} with your account email, date of charge, payment reference (if available), and reason for the request. We respond within 5 business days.`,
          "Approved refunds are credited to the original payment method within 7–14 business days, depending on your bank or card issuer.",
        ],
      },
      {
        title: "6. Cancellation",
        paragraphs: [
          "Cancel Pro from Settings or through your payment provider. Cancellation is effective at the end of the current billing period — you keep Pro access until then.",
          "After downgrade to Free, Pro-only data (e.g. extended history) may become read-only or inaccessible according to plan limits displayed in the app.",
        ],
      },
      {
        title: "7. App store purchases",
        paragraphs: [
          "If you subscribed through Apple App Store or Google Play, refund requests must be submitted through that store's refund process; we cannot override their policies.",
        ],
      },
    ],
  },
  {
    slug: "disclaimer",
    label: "Disclaimer",
    summary:
      "Calovia provides wellness information — not medical advice. AI estimates may be wrong.",
    lastUpdated: M.effectiveDate,
    sections: [
      {
        title: "1. General",
        paragraphs: [
          `Information provided by ${M.productName} is for general wellness and educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment.`,
        ],
      },
      {
        title: "2. Not medical advice",
        paragraphs: [
          "Always seek the advice of a physician, registered dietitian, or other qualified health provider with questions about a medical condition, pregnancy, eating disorders, allergies, diabetes, or before starting any diet or exercise programme.",
          "Never disregard professional medical advice or delay seeking it because of something you read or logged in Calovia.",
        ],
      },
      {
        title: "3. AI meal analysis limitations",
        paragraphs: [
          "Meal photos are analysed by artificial intelligence. Estimated calories, macros, and food labels are approximations — not laboratory measurements. Accuracy varies with photo quality, portion visibility, mixed dishes, regional cuisines (including Indian home cooking), and model limitations.",
          "Do not use Calovia as your sole source for managing food allergies, insulin dosing, clinical nutrition, or any condition requiring precise nutrient tracking.",
        ],
      },
      {
        title: "4. Activity & calorie calculations",
        paragraphs: [
          "Calories burned, step counts, distance, and \"steps to burn this meal\" figures use general formulas and population averages. Individual metabolism, fitness level, terrain, and device sensors differ. Treat all numbers as guides, not precise medical measurements.",
        ],
      },
      {
        title: "5. Third-party integrations",
        paragraphs: [
          "Data synced from Apple Health, Google Health Connect, or other platforms reflects what those services provide. We are not responsible for errors or omissions in third-party health data.",
        ],
      },
      {
        title: "6. No emergency use",
        paragraphs: [
          "Calovia is not an emergency service. If you think you may have a medical emergency, call your local emergency number immediately.",
        ],
      },
      {
        title: "7. No warranty",
        paragraphs: [
          'The service and all content are provided "as is" and "as available" without warranty of any kind, express or implied, including accuracy, completeness, or fitness for a particular purpose.',
        ],
      },
      {
        title: "8. External links",
        paragraphs: [
          "Links to third-party websites or services are provided for convenience. We do not endorse and are not responsible for their content, privacy practices, or availability.",
        ],
      },
    ],
  },
  {
    slug: "eula",
    label: "EULA",
    summary:
      "Licence to use Calovia software — what you may and may not do with our application.",
    lastUpdated: M.effectiveDate,
    sections: [
      {
        title: "1. Agreement",
        paragraphs: [
          `This End User Licence Agreement ("EULA") is a legal agreement between you and ${M.companyName} for the ${M.productName} web application, client-side code, and related software components (the "Software"). By accessing or using the Software, you agree to this EULA and our Terms & Conditions.`,
        ],
      },
      {
        title: "2. Licence grant",
        paragraphs: [
          "Subject to your compliance with this EULA and payment of applicable fees, we grant you a limited, revocable, non-exclusive, non-transferable, non-sublicensable licence to install (where applicable) and use the Software for personal, non-commercial wellness tracking.",
        ],
      },
      {
        title: "3. Restrictions",
        paragraphs: ["You may not:"],
        list: [
          "Copy, modify, adapt, translate, or create derivative works of the Software except as permitted by law.",
          "Reverse engineer, decompile, or disassemble the Software except where expressly allowed by applicable law.",
          "Rent, lease, sell, sublicense, or commercially exploit the Software without a written agreement with us.",
          "Remove or alter copyright, trademark, or proprietary notices.",
          "Use automated tools (bots, scrapers) to access the Software beyond documented API limits.",
          "Use the Software to build a competing product or to extract training data at scale.",
        ],
      },
      {
        title: "4. Ownership",
        paragraphs: [
          "The Software is licensed, not sold. Calovia and its licensors retain all rights, title, and interest in the Software, including all updates and documentation.",
        ],
      },
      {
        title: "5. Updates",
        paragraphs: [
          "We may deploy updates, bug fixes, or new features automatically. Some updates may be required to continue using the service. Updates are governed by this EULA unless separate terms accompany them.",
        ],
      },
      {
        title: "6. Open-source components",
        paragraphs: [
          "The Software may include open-source libraries licensed under their own terms (e.g. React, Tailwind). Those licences apply to the relevant components only and may grant you additional rights for those portions.",
        ],
      },
      {
        title: "7. Termination",
        paragraphs: [
          "This licence terminates if you breach this EULA or our Terms, or if your account is closed. Upon termination you must stop using the Software. Sections on ownership, restrictions, disclaimers, and limitation of liability survive termination.",
        ],
      },
      {
        title: "8. Disclaimer & liability",
        paragraphs: [
          "THE SOFTWARE IS PROVIDED WITHOUT WARRANTY. TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR LIABILITY IS LIMITED AS DESCRIBED IN OUR TERMS & CONDITIONS AND DISCLAIMER.",
        ],
      },
    ],
  },
  {
    slug: "acceptable-use",
    label: "Acceptable Use",
    summary:
      "Rules for using Calovia fairly — including the public analyser and authenticated API.",
    lastUpdated: M.effectiveDate,
    sections: [
      {
        title: "1. Purpose",
        paragraphs: [
          `This Acceptable Use Policy ("AUP") supplements our Terms & Conditions. It applies to all users of ${M.productName}, including visitors using the public meal analyser without an account.`,
        ],
      },
      {
        title: "2. Permitted use",
        list: [
          "Track your own nutrition, activity, and wellness goals.",
          "Log meals on behalf of a minor or dependent only if you are their parent or legal guardian, or have explicit consent.",
          "Use the public analyser for personal, non-commercial evaluation within the published daily limit (" +
            M.freeAnalyzeLimit +
            " analyses per day per IP).",
          "Access our API with valid authentication for personal integration, subject to rate limits documented at our API reference.",
        ],
      },
      {
        title: "3. Prohibited conduct",
        paragraphs: ["You must not:"],
        list: [
          "Upload unlawful, harassing, defamatory, obscene, or sexually exploitative content.",
          "Upload images of people without their consent where privacy is expected, or content that infringes copyright or trademark.",
          "Attempt to bypass rate limits, authentication, or security controls (including on /public/analyze-food).",
          "Probe, scan, or test vulnerabilities without written authorisation.",
          "Use Calovia to distribute malware, spam, or phishing.",
          "Harvest or scrape other users' data.",
          "Impersonate Calovia staff or other users.",
          "Use the service for commercial meal-analysis resale, bulk labelling, or training third-party models without our consent.",
          "Provide medical advice to third parties using Calovia outputs as if they were clinical assessments.",
          "Use the service for any purpose that violates applicable law.",
        ],
      },
      {
        title: "4. API & automation",
        paragraphs: [
          "Authenticated API access requires a valid Firebase session token. Respect documented rate limits and do not share tokens. Excessive traffic that degrades service for others may result in throttling or suspension.",
          "Public endpoints are rate-limited by IP. Circumventing limits via proxies, VPN rotation, or multiple accounts is prohibited.",
        ],
      },
      {
        title: "5. Content moderation",
        paragraphs: [
          "We may review uploaded content for abuse, security, or legal compliance. We may remove content or suspend accounts without prior notice where necessary.",
        ],
      },
      {
        title: "6. Reporting abuse",
        paragraphs: [
          `Report violations to ${M.abuseEmail} with URLs, timestamps, and a description. We investigate good-faith reports promptly.`,
        ],
      },
      {
        title: "7. Enforcement",
        paragraphs: [
          "Violations may result in warnings, temporary suspension, permanent account termination, or referral to law enforcement. Repeated or severe abuse may be enforced without warning.",
        ],
      },
    ],
  },
  {
    slug: "accessibility",
    label: "Accessibility",
    summary:
      "How we design Calovia to be usable by people with disabilities, and how to request help.",
    lastUpdated: M.effectiveDate,
    sections: [
      {
        title: "1. Commitment",
        paragraphs: [
          `${M.companyName} is committed to making ${M.productName} accessible to people with disabilities. We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA where reasonably achievable for our web application.`,
        ],
      },
      {
        title: "2. Measures we take",
        list: [
          "Responsive layouts for mobile, tablet, and desktop screen sizes.",
          "Semantic HTML structure and heading hierarchy on primary pages.",
          "Visible focus indicators on interactive controls in supported browsers.",
          "Text labels and inline validation on login, registration, and settings forms.",
          "aria-label attributes on icon-only buttons (e.g. menu, camera controls).",
          "Colour contrast aligned with our brand palette (#1D9E75 on white/light backgrounds) for body text and primary actions.",
          "Keyboard-operable navigation for core flows (links, buttons, form fields).",
        ],
      },
      {
        title: "3. Known limitations",
        paragraphs: ["We are actively improving the following areas:"],
        list: [
          "Meal photo analysis is inherently visual; users who cannot photograph meals may rely on manual logging where available.",
          "Charts on the Progress and Dashboard pages may not yet include full screen-reader summaries for every data series.",
          "Some notification toggles in Settings are stored locally and may not sync across devices.",
          "Third-party sign-in (Google) and future payment flows are governed by those providers' accessibility features.",
        ],
      },
      {
        title: "4. Assistive technology",
        paragraphs: [
          "We test with current versions of major browsers (Chrome, Firefox, Safari, Edge) and common screen readers where feasible. Results may vary by operating system and assistive technology version.",
        ],
      },
      {
        title: "5. Feedback & accommodations",
        paragraphs: [
          `If you encounter a barrier or need information in an alternative format, contact ${M.accessibilityEmail}. Please include:`,
        ],
        list: [
          "The page URL or screen name.",
          "A description of the problem.",
          "Your device, browser, and assistive technology (if any).",
        ],
        paragraphsAfter: [
          "We aim to respond within 10 business days and will work with you to provide a reasonable accommodation or alternative access path where possible.",
        ],
      },
      {
        title: "6. Continuous improvement",
        paragraphs: [
          "Accessibility is an ongoing effort. We prioritise fixes for blockers that prevent core tasks: signing in, logging a meal, and viewing today's summary.",
        ],
      },
    ],
  },
  {
    slug: "impressum",
    label: "Impressum",
    summary:
      "Legal disclosure of the service provider (required in Germany, Austria, and similar jurisdictions).",
    lastUpdated: M.effectiveDate,
    sections: [
      {
        title: "1. Angaben gemäß § 5 TMG / Provider information",
        paragraphs: [
          `${M.companyName}`,
          `${M.tagline}`,
          `Website: ${M.website}`,
          `E-Mail: ${M.legalEmail}`,
        ],
      },
      {
        title: "2. Vertretungsberechtigt / Responsible for content",
        paragraphs: [
          `${M.companyName} Team`,
          `Contact: ${M.legalEmail}`,
        ],
      },
      {
        title: "3. EU dispute resolution",
        paragraphs: [
          "The European Commission provides a platform for online dispute resolution (ODR): https://ec.europa.eu/consumers/odr",
          "Our email address is available above. We are not obliged or willing to participate in dispute resolution proceedings before a consumer arbitration board unless required by applicable law.",
        ],
      },
      {
        title: "4. Liability for content",
        paragraphs: [
          "We create content on these pages with care. We are nevertheless responsible for our own content on these pages under general laws. We are not obligated to monitor transmitted or stored third-party information or to investigate circumstances indicating illegal activity.",
          "Obligations to remove or block use of information under general law remain unaffected.",
        ],
      },
      {
        title: "5. Liability for links",
        paragraphs: [
          "Our site may contain links to external websites over whose content we have no control. We therefore cannot accept liability for external content. The respective provider or operator is always responsible for linked pages.",
        ],
      },
      {
        title: "6. Copyright",
        paragraphs: [
          `Content and works on ${M.website} are subject to copyright law. Duplication, processing, distribution, or any form of commercialisation beyond permitted use requires prior written consent from ${M.companyName}.`,
        ],
      },
      {
        title: "7. India operations",
        paragraphs: [
          `For users in India, service terms are additionally governed by our Terms & Conditions under the laws of the ${M.jurisdiction}. Primary support: ${M.supportEmail}.`,
        ],
      },
    ],
  },
];

export function getPolicyBySlug(slug) {
  return LEGAL_POLICIES.find((p) => p.slug === slug) ?? null;
}

export function getAllPolicySlugs() {
  return LEGAL_POLICIES.map((p) => p.slug);
}

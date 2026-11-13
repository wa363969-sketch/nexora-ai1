import { Link } from 'react-router-dom';
import { HiArrowLeft, HiShieldCheck } from 'react-icons/hi2';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white">
        <HiArrowLeft className="w-4 h-4" /> Back to NEXORA
      </Link>

      <div className="space-y-2 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold">
          <HiShieldCheck className="w-4 h-4" /> Privacy & Data Sovereignty
        </div>
        <h1 className="text-3xl font-black text-white">Privacy Policy</h1>
        <p className="text-xs text-gray-400">Last updated: November 2024</p>
      </div>

      <div className="space-y-6 text-sm text-gray-300 leading-relaxed font-sans">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">1. Data Isolation & Security</h2>
          <p>
            NEXORA operates on top of secure Appwrite cloud or self-hosted infrastructure. All project data, tasks, notes, and user credentials remain strictly isolated to your organization workspace. We do not sell, rent, or monetize your company's proprietary intellectual property.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">2. AI Foundation Model Interactions</h2>
          <p>
            When utilizing the NEXORA AI Co-Pilot (powered by Gemini or OpenAI), prompts and context are transmitted via secure TLS endpoints exclusively to satisfy the active request. Your queries and private project data are <strong>never used to train public foundation models</strong>.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">3. Cookies & Session Storage</h2>
          <p>
            We use minimal local session cookies strictly to preserve your authentication token, selected dark/light theme, and command palette preferences.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-white">4. GDPR & CCPA Compliance</h2>
          <p>
            You have the absolute right to export, inspect, or permanently delete your account, project collections, and associated activity histories at any time through our Admin Console or by contacting our Data Protection Officer.
          </p>
        </section>
      </div>
    </div>
  );
}

import { useEffect } from 'react';
import Navbar from '../components/landing/Navbar';
import UserDashboardStrip from '../components/landing/UserDashboardStrip';
import Hero from '../components/landing/Hero';
import DashboardPreview from '../components/landing/DashboardPreview';
import AIFeature from '../components/landing/AIFeature';
import ProjectFeatures from '../components/landing/ProjectFeatures';
import TaskFeatures from '../components/landing/TaskFeatures';
import TeamFeatures from '../components/landing/TeamFeatures';
import AutomationFeatures from '../components/landing/AutomationFeatures';
import AnalyticsFeatures from '../components/landing/AnalyticsFeatures';
import Pricing from '../components/landing/Pricing';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import Newsletter from '../components/landing/Newsletter';
import Footer from '../components/landing/Footer';
import FloatingWhatsApp from '../components/FloatingWhatsApp';

export default function Landing() {
  useEffect(() => {
    document.title = 'NEXORA — Everything You Need to Work Smarter';
  }, []);

  return (
    <div className="min-h-screen bg-navy-950 overflow-hidden relative">
      <Navbar />
      <UserDashboardStrip />
      <Hero />
      <DashboardPreview />
      <AIFeature />
      <ProjectFeatures />
      <TaskFeatures />
      <TeamFeatures />
      <AutomationFeatures />
      <AnalyticsFeatures />
      <Pricing />
      <Testimonials />
      <FAQ />
      <Newsletter />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

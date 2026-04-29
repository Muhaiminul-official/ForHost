import Hero from '../components/Hero';
import NearbyDonors from '../components/NearbyDonors';
import WhyDonate from '../components/WhyDonate';
import RecentRequests from '../components/RecentRequests';
import DonationGuide from '../components/DonationGuide';
import Compatibility from '../components/Compatibility';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';

export default function Home() {
  return (
    <main>
      <Hero />
      <NearbyDonors />
      <WhyDonate />
      <RecentRequests />
      <DonationGuide />
      <Compatibility />
      <Testimonials />
      <CTA />
    </main>
  );
}

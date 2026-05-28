import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import PricingTable from '../components/billing/PricingTable';
import usePlan from '../hooks/usePlan';

const PricingPage = () => {
  const planState = usePlan();

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <AnimatedBackground />
      <Navbar compact />
      <div className="pt-16">
        <PricingTable planState={planState} />
      </div>
    </main>
  );
};

export default PricingPage;

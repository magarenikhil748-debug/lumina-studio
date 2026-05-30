import Navbar from '../components/Navbar';
import PricingTable from '../components/billing/PricingTable';
import usePlan from '../hooks/usePlan';

const PricingPage = () => {
  const planState = usePlan();

  return (
    <main className="lumina-page min-h-screen text-white">
      <Navbar />
      <div className="pt-16">
        <PricingTable planState={planState} />
      </div>
    </main>
  );
};

export default PricingPage;

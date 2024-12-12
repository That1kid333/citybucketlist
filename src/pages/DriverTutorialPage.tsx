import { Header } from '../components/Header';
import { DriverTutorial } from '../components/onboarding/DriverTutorial';

export default function DriverTutorialPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />
      <DriverTutorial />
    </div>
  );
}

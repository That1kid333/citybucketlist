import { Header } from '../components/Header';
import { Link } from 'react-router-dom';

export function ThankYouPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />
      <main className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold text-[#F5A623] mb-4">Thank You!</h1>
        <p className="text-xl text-neutral-300 mb-8">
          Your registration has been successfully submitted.
        </p>
        <p className="text-neutral-400 mb-8">
          We'll review your information and get back to you shortly.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-[#F5A623] text-white rounded-lg hover:bg-[#E09612] transition-colors"
        >
          Return Home
        </Link>
      </main>
    </div>
  );
}
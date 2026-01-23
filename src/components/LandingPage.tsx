import { motion } from 'framer-motion';
import {
  MoveRight,
  UsersRound,
  ShieldCheck,
  CircleDollarSign,
  Sprout,
  Sparkles,
  Star,
  MapPin,
} from 'lucide-react';

import { Button } from './ui/button';
import { Logo } from './Logo';
import { ServicesGrid } from './ServicesGrid';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

/* ---------------- SAFE STATIC VALUES ---------------- */
const userCount = 42;
const trustCount = 55;
const co2Saved = 2300;
const activeTrips = 120;

/* ---------------- TESTIMONIALS ---------------- */
const testimonials = [
  {
    quote:
      'Wassel saved me over 60% on my weekly commute from Dubai to Abu dhobi.',
    author: 'Ahmed K.',
    route: 'Dubai → Abu dhobi',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100&h=100',
  },
  {
    quote:
      'The Raje3 feature makes return trips simple and affordable.',
    author: 'Sarah M.',
    route: 'Riyadh → Jeddah',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=100&h=100',
  },
  {
    quote:
      'Safe, reliable, and eco-friendly. Exactly what the region needed.',
    author: 'Omar A.',
    route: 'Cairo → Alexandria',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=100&h=100',
  },
];

/* ================= COMPONENT ================= */
export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white">

      {/* ================= HEADER ================= */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Logo size="sm" />
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onLogin}>Sign In</Button>
            <Button onClick={onGetStarted}>Get Started</Button>
          </div>
        </div>
      </motion.header>

      {/* ================= HERO ================= */}
      <section className="pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
              <Sparkles className="w-4 h-4" /> Next-Generation Mobility
            </span>

            <h1 className="text-6xl font-bold">
              Share Your <span className="text-primary">Journey</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-xl">
              Smart, affordable, and sustainable travel across the Middle East.
            </p>

            <div className="flex gap-4">
              <Button size="lg" onClick={onGetStarted}>
                Start Your Journey <MoveRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document.getElementById('services')?.scrollIntoView({
                    behavior: 'smooth',
                  })
                }
              >
                Explore Services
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-6">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white overflow-hidden"
                  >
                    <ImageWithFallback
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="user"
                    />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                  +{userCount}k
                </div>
              </div>

              <div>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Trusted by {trustCount}K+ users
                </p>
              </div>
            </div>
          </motion.div>

          {/* IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <img
              src="/assets/wassel-logo.png"
              alt="Wassel App"
              className="rounded-3xl shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <div id="services">
        <ServicesGrid />
      </div>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-24 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur p-8 rounded-3xl"
            >
              <p className="italic mb-6">“{t.quote}”</p>
              <div className="flex items-center gap-4">
                <ImageWithFallback
                  src={t.image}
                  alt={t.author}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-bold">{t.author}</p>
                  <p className="text-sm text-white/70">{t.route}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center">
        <p>© 2025 Wassel. All rights reserved.</p>
      </footer>
    </div>
  );
}

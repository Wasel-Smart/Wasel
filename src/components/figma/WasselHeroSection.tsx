import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { ImageWithFallback } from './ImageWithFallback';
import { designTokens } from './FigmaDesignSystem';
import wasselLogo from 'figma:asset/1ccf434105a811706fd618a3b652ae052ecf47e1.png';

interface WasselHeroSectionProps {
  onGetStarted?: () => void;
  onSignIn?: () => void;
}

export const WasselHeroSection: React.FC<WasselHeroSectionProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#e0f2f1] via-white to-[#e0f2f1]">
      {/* Header - Matching your Figma design */}
      <header className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <ImageWithFallback
              src={wasselLogo}
              alt="Wassel Logo"
              className="w-12 h-12 rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-gray-900">Wassel</span>
              <span className="text-sm text-gray-600">واصل</span>
            </div>
          </div>

          {/* RTL Language Toggle (Arabic) */}
          <div className="flex items-center gap-4">
            <button 
              className="px-4 py-2 text-neutral-700 hover:text-primary transition-colors"
              type="button"
              aria-label="Switch to Arabic"
            >
              أنا واصل، أنت؟
            </button>
            <Button
              variant="ghost"
              onClick={onSignIn}
              className="text-gray-700 hover:text-primary hover:bg-primary/5"
            >
              Sign In
            </Button>
            <Button
              onClick={onGetStarted}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg shadow-lg"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <div className="inline-block">
              <div className="px-4 py-2 bg-primary-100 rounded-full">
                <span className="text-primary-700 font-medium text-sm">
                  Next-Generation Ride Sharing
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              Share Your Journey
              <br />
              <span className="text-gray-800">Across the Middle</span>
              <br />
              <span className="text-gray-800">East</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Connect with travelers, save money, and reduce your carbon footprint while exploring the beauty of the Middle East.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={onGetStarted}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all"
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-4 text-lg rounded-xl"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8">
              <div>
                <div className="text-3xl font-bold text-primary-600">10K+</div>
                <div className="text-sm text-neutral-600">Active Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">50K+</div>
                <div className="text-sm text-neutral-600">Rides Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">4.8★</div>
                <div className="text-sm text-neutral-600">User Rating</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Globe Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Background Circle with Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-primary-400 rounded-3xl shadow-2xl"></div>

              {/* Globe Illustration Container */}
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 60,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="relative w-full h-full"
                >
                  {/* Placeholder for actual globe illustration */}
                  <ImageWithFallback
                    src={wasselLogo}
                    alt="Wassel Globe"
                    className="w-full h-full object-contain drop-shadow-2xl"
                  />
                </motion.div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{
                  y: [-10, 10, -10],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-10 right-10 bg-white p-3 rounded-xl shadow-lg"
              >
                <div className="text-2xl">🚗</div>
              </motion.div>

              <motion.div
                animate={{
                  y: [10, -10, 10],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-20 left-10 bg-white p-3 rounded-xl shadow-lg"
              >
                <div className="text-2xl">🌍</div>
              </motion.div>

              <motion.div
                animate={{
                  y: [-15, 15, -15],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute top-1/2 -right-5 bg-white p-4 rounded-xl shadow-lg"
              >
                <div className="text-sm font-semibold text-primary-600">
                  Save 60%
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Wave at Bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-20"
        >
          <path
            d="M0,0 C300,100 900,100 1200,0 L1200,120 L0,120 Z"
            fill={designTokens.colors.primary[600]}
            fillOpacity="0.1"
          />
        </svg>
      </div>
    </div>
  );
};

export default WasselHeroSection;

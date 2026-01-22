import { motion } from 'motion/react';
import { MoveRight, UsersRound, ShieldCheck, CircleDollarSign, Sprout, Sparkles, Star, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Logo } from './Logo';
import { ServicesGrid } from './ServicesGrid';
import wasselLogo from 'figma:asset/1ccf434105a811706fd618a3b652ae052ecf47e1.png';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const testimonials = [
  {
    quote: "Wassel saved me over 60% on my weekly commute from Dubai to Abu Dhabi. The drivers are professional and friendly!",
    author: "Ahmed K.",
    route: "Dubai → Abu Dhabi",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100&h=100"
  },
  {
    quote: "I love the Raje3 feature! It makes planning return trips so much easier and more affordable.",
    author: "Sarah M.",
    route: "Riyadh → Jeddah",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=100&h=100"
  },
  {
    quote: "Safe, reliable, and eco-friendly. Wassel is exactly what the Middle East needed for modern travel.",
    author: "Omar A.",
    route: "Cairo → Alexandria",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=100&h=100"
  }
];

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white selection:bg-primary/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        {/* Floating orbs with 3D effect */}
        <motion.div 
          className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-[100px]"
          animate={{
            y: [0, 100, 0],
            x: [0, 50, 0],
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-full blur-[100px]"
          animate={{
            y: [0, -100, 0],
            x: [0, -50, 0],
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] bg-gradient-to-br from-accent/10 to-accent/5 rounded-full blur-[80px]"
          animate={{
            y: [0, -50, 0],
            x: [0, 100, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-teal-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 2, 0]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* Glass Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onLogin} className="hover:bg-primary/10 text-gray-700 hover:text-primary transition-colors">
              Sign In
            </Button>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105" onClick={onGetStarted}>
              Get Started
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 relative z-10"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-md border border-primary/20 rounded-full text-primary text-sm font-medium shadow-sm">
                <Sparkles className="w-4 h-4" />
                <span>Next-Generation Mobility</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold leading-tight tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
                  Share Your
                </span>
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-teal-500 to-secondary">
                  Journey
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Connect with travelers, save money, and reduce your carbon footprint with Wassel's smart AI-powered platform across the Middle East.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-lg h-16 px-8 rounded-2xl shadow-xl shadow-primary/25 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-primary/30"
                  onClick={onGetStarted}
                >
                  Start Your Journey
                  <MoveRight className="w-5 h-5 ml-2" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg h-16 px-8 rounded-2xl border-2 border-primary/20 text-primary hover:bg-primary/5 backdrop-blur-sm"
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Explore Services
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-8 border-t border-gray-100">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                      <ImageWithFallback 
                        src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-primary flex items-center justify-center text-white text-xs font-bold">
                    +{Math.floor(Math.random() * 30) + 30}k
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Trusted by {Math.floor(Math.random() * 20) + 40}K+ Users</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50, rotateY: 20 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 1 }}
              className="relative perspective-1000"
            >
              <div className="relative z-10 transform transition-transform hover:scale-[1.02] duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30 rounded-[3rem] blur-3xl transform rotate-6 scale-95" />
                <div className="bg-white/40 backdrop-blur-xl border border-white/50 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-2xl" />
                  <img 
                    src={wasselLogo} 
                    alt="Wassel App Interface" 
                    className="w-full h-auto drop-shadow-2xl rounded-2xl relative z-10" 
                  />
                  
                  {/* Floating Cards */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 z-20 border border-gray-100"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Sprout className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">CO2 Saved</p>
                      <p className="text-lg font-bold text-gray-900">{Math.floor(Math.random() * 3000) + 1500} kg</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-12 -right-6 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-4 z-20 border border-gray-100"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Active Trips</p>
                      <p className="text-lg font-bold text-gray-900">{Math.floor(Math.random() * 200) + 50} Live</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <div id="services">
        <ServicesGrid />
      </div>

      {/* Features Section */}
      <section className="bg-gray-50/50 py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose Wassel?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Built on values of convenience, trust, and affordability, redefining how the Middle East moves.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: CircleDollarSign, title: "Affordable Travel", text: "Share costs and save up to 70% on your journey", color: "text-primary", bg: "bg-primary/10" },
              { icon: UsersRound, title: "Smart Matching", text: "AI-powered system finds the perfect ride for you", color: "text-secondary", bg: "bg-secondary/10" },
              { icon: ShieldCheck, title: "Trust & Safety", text: "Verified users and transparent ratings", color: "text-accent", bg: "bg-accent/10" },
              { icon: Sprout, title: "Eco-Friendly", text: "Reduce emissions and help the environment", color: "text-green-600", bg: "bg-green-100" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className={`w-16 h-16 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 transform rotate-3`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trip Types with Glass Cards */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Flexible Trip Options</h2>
            <p className="text-xl text-gray-600">Choose the journey that fits your needs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-white to-teal-50 rounded-3xl p-1 shadow-xl border border-primary/20"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-[1.4rem] p-10 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="text-center relative z-10">
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl text-primary">→</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2 text-primary">Wasel (واصل)</h2>
                  <p className="text-gray-600 mb-8 text-lg">One-way trips for single destinations</p>
                  <ul className="text-left space-y-4 text-gray-700 max-w-xs mx-auto">
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">✓</div>
                      Perfect for one-time travel
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">✓</div>
                      Flexible scheduling
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">✓</div>
                      Lower commitment
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-white to-green-50 rounded-3xl p-1 shadow-xl border border-secondary/20"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-[1.4rem] p-10 h-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="text-center relative z-10">
                  <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl text-secondary">↔</span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2 text-secondary">Raje3 (راجع)</h2>
                  <p className="text-gray-600 mb-8 text-lg">Smart return trips with better value</p>
                  <ul className="text-left space-y-4 text-gray-700 max-w-xs mx-auto">
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">✓</div>
                      Round-trip convenience
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">✓</div>
                      Cost-effective pricing
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">✓</div>
                      Same driver comfort
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">What Our Community Says</h2>
            <p className="text-xl text-white/80">Join thousands of satisfied travelers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white text-lg italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <ImageWithFallback src={testimonial.image} alt={testimonial.author} className="w-12 h-12 rounded-full border-2 border-white/30" />
                  <div>
                    <p className="text-white font-bold">{testimonial.author}</p>
                    <p className="text-white/60 text-sm">{testimonial.route}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent to-pink-700" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
        
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">Ready to Start Your Journey?</h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join Wassel today and experience the future of mobility in the Middle East. Fast, safe, and affordable.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-accent hover:bg-gray-100 text-lg h-16 px-10 rounded-full shadow-2xl transition-all hover:scale-105"
              onClick={onGetStarted}
            >
              Get Started Now
              <MoveRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <Logo size="md" className="[&_h3]:text-white [&_p]:text-gray-400" />
              <p className="text-gray-400 leading-relaxed">
                Connecting travelers across the Middle East with smart, sustainable, and affordable mobility solutions.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Support</h4>
              <ul className="space-y-4">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 text-lg">Download App</h4>
              <p className="text-gray-400 mb-6">Get the best experience on your mobile device.</p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full bg-transparent border-gray-700 text-white hover:bg-white/10 justify-start h-12">
                  <span className="mr-2"></span> App Store
                </Button>
                <Button variant="outline" className="w-full bg-transparent border-gray-700 text-white hover:bg-white/10 justify-start h-12">
                  <span className="mr-2">▶</span> Google Play
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>&copy; 2025 Wassel Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
import { motion } from 'motion/react';
import { Box, Zap, Truck, Users, Heart, GraduationCap, Activity, KeyRound, Bus, Crown, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: any;
  image: string;
  color: string;
}

const services: Service[] = [
  {
    id: 'delivery',
    name: 'Delivery',
    description: 'Fast & secure package delivery',
    icon: Box,
    image: 'https://images.unsplash.com/photo-1758523670564-d1d6a734dc0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VyaWVyJTIwZGVsaXZlcnklMjBwYWNrYWdlJTIwc2VydmljZXxlbnwxfHx8fDE3NjczMTkwMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'scooters',
    name: 'Scooters',
    description: 'Eco-friendly last mile',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1742078684003-b51f83ba6470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVjdHJpYyUyMHNjb290ZXIlMjBjaXR5JTIwcmlkZXxlbnwxfHx8fDE3NjczMTkwMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-green-400 to-emerald-600'
  },
  {
    id: 'freight',
    name: 'Freight',
    description: 'Heavy cargo logistics',
    icon: Truck,
    image: 'https://images.unsplash.com/photo-1597266833335-ccd08f703654?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVpZ2h0JTIwdHJ1Y2slMjBjYXJnbyUyMGxvZ2lzdGljc3xlbnwxfHx8fDE3NjczMTkwMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-slate-600 to-slate-800'
  },
  {
    id: 'carpool',
    name: 'Carpool',
    description: 'Share rides, save money',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1706054535369-3544ec6d92c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHBlb3BsZSUyMGNhcnBvb2wlMjBkcml2ZXxlbnwxfHx8fDE3NjczMTkwMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-teal-500 to-teal-700'
  },
  {
    id: 'pets',
    name: 'Pets',
    description: 'Pet-friendly transport',
    icon: Heart,
    image: 'https://images.unsplash.com/photo-1761857125070-cd8072945784?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwZG9nJTIwaW4lMjBjYXIlMjB0cmF2ZWx8ZW58MXx8fHwxNzY3MzE5MDMyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-orange-400 to-red-500'
  },
  {
    id: 'school',
    name: 'School',
    description: 'Safe student commute',
    icon: GraduationCap,
    image: 'https://images.unsplash.com/photo-1685645647479-a0232f3fec6d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5ZWxsb3clMjBzY2hvb2wlMjBidXMlMjBzdHVkZW50c3xlbnwxfHx8fDE3NjczMTkwMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-yellow-400 to-amber-600'
  },
  {
    id: 'laundry',
    name: 'Laundry',
    description: 'Professional laundry service',
    icon: Truck,
    image: 'https://images.unsplash.com/photo-1582735689369-4fe89db0a2c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXVuZHJ5JTIwc2VydmljZSUyMGRlbGl2ZXJ5fGVufDF8fHx8MTc2NzMxOTAzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-purple-500 to-pink-600'
  },
  {
    id: 'medical',
    name: 'Medical',
    description: 'Non-emergency transport',
    icon: Activity,
    image: 'https://images.unsplash.com/photo-1721411480070-fcb558776d54?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwYW1idWxhbmNlJTIwdHJhbnNwb3J0fGVufDF8fHx8MTc2NzMxOTAzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-red-500 to-rose-700'
  },
  {
    id: 'rentals',
    name: 'Rentals',
    description: 'Flexible car rentals',
    icon: KeyRound,
    image: 'https://images.unsplash.com/photo-1604445415362-2a9840bd5ff6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob2xkaW5nJTIwY2FyJTIwa2V5cyUyMHJlbnRhbHxlbnwxfHx8fDE3NjczMTkwMzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'shuttles',
    name: 'Shuttles',
    description: 'Group transport services',
    icon: Bus,
    image: 'https://images.unsplash.com/photo-1764776401208-18c289c9c80c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBzaHV0dGxlJTIwYnVzJTIwdHJhdmVsfGVufDF8fHx8MTc2NzMxOTAzMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-blue-600 to-indigo-700'
  },
  {
    id: 'luxury',
    name: 'Luxury',
    description: 'Premium chauffeur rides',
    icon: Crown,
    image: 'https://images.unsplash.com/photo-1764090317825-9b76e437c8d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBibGFjayUyMGNhciUyMGNoYXVmZmV1cnxlbnwxfHx8fDE3NjczMTkwMzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    color: 'from-amber-500 to-yellow-600'
  }
];

export function ServicesGrid() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background blobs for glassmorphism effect */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-50 animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-full text-primary font-medium mb-4"
          >
            Our Ecosystem
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300"
          >
            Comprehensive Mobility Services
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            From daily commutes to luxury travel, Wassel provides everything you need to move freely.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              whileHover={{ 
                y: -15, 
                scale: 1.05,
                rotateY: 5,
                transition: { duration: 0.3 } 
              }}
              className="group relative h-64 rounded-2xl overflow-hidden shadow-xl cursor-pointer"
              style={{ perspective: '1000px' }}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <ImageWithFallback
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-colors" />
                
                {/* Shimmer effect on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.8 }}
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)'
                  }}
                />
              </div>

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <motion.div 
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} p-0.5 mb-4 shadow-2xl`}
                  whileHover={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: 1.2
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-full h-full bg-black/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                </motion.div>
                
                <motion.h3 
                  className="text-xl font-bold text-white mb-1"
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {service.name}
                </motion.h3>
                
                <motion.p 
                  className="text-sm text-gray-300 line-clamp-2"
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {service.description}
                </motion.p>
                
                <motion.div 
                  className="absolute top-4 right-4"
                  initial={{ opacity: 0, x: 10, scale: 0.8 }}
                  whileHover={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </motion.div>
              </div>
              
              {/* 3D glow effect on hover */}
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={{
                  boxShadow: `0 0 40px rgba(0,0,0,0.3), 0 20px 60px rgba(0,0,0,0.4)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
import { motion } from 'framer-motion'
import { Dumbbell, Users, Trophy, Clock, ChevronRight, Star, Zap, Target, Phone, Mail, MapPin } from 'lucide-react'
import Scene3D from '../components/Scene3D'

const LandingPage = () => {
  const servicios = [
    { icon: Dumbbell, titulo: 'Musculación', descripcion: 'Equipos de última generación para construir el cuerpo de un guerrero espartano.' },
    { icon: Users, titulo: 'Clases Grupales', descripcion: 'Entrena con tu legión. CrossFit, Spinning, Boxeo y más.' },
    { icon: Trophy, titulo: 'Entrenamiento Personal', descripcion: 'Guerreros expertos te guiarán hacia la victoria.' },
    { icon: Zap, titulo: 'Zona Cardio', descripcion: 'Forja tu resistencia como los legendarios 300.' },
  ]

  const planes = [
    { 
      nombre: 'Diario', 
      precio: 5, 
      periodo: 'día', 
      caracteristicas: ['Acceso por un día', 'Zona de pesas', 'Zona cardio', 'Vestuarios'],
      popular: false,
      icon: '⚔️'
    },
    { 
      nombre: 'Mensual', 
      precio: 30, 
      periodo: 'mes', 
      caracteristicas: ['Acceso ilimitado', 'Todas las zonas', 'Clases grupales', 'Vestuarios'],
      popular: true,
      icon: '🛡️'
    },
    { 
      nombre: 'Trimestral', 
      precio: 80, 
      periodo: '3 meses', 
      caracteristicas: ['Todo incluido', 'Mejor precio', 'Clases grupales', 'Casillero personal'],
      popular: false,
      icon: '🏛️'
    },
  ]

  const testimonios = [
    { nombre: 'Carlos M.', texto: 'En 3 meses logré la transformación que buscaba. ¡Los entrenadores son increíbles!', estrellas: 5 },
    { nombre: 'María G.', texto: 'El mejor gimnasio de la ciudad. El ambiente espartano te motiva a dar lo máximo.', estrellas: 5 },
    { nombre: 'Juan P.', texto: 'Las clases grupales son brutales. Nunca había sudado tanto en mi vida.', estrellas: 5 },
  ]

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <Scene3D />
        <div className="absolute inset-0 bg-gradient-to-b from-sparta-darker/80 via-sparta-darker/60 to-sparta-darker z-10" />
        
        <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-sparta text-5xl md:text-7xl lg:text-8xl font-black mb-6">
              <span className="text-gradient">SPARTA</span>
              <span className="text-white"> GYM</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-4 font-light">
              FORJA TU LEYENDA
            </p>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              Donde los guerreros nacen y las leyendas se forjan. 
              Únete a nuestra legión y transforma tu cuerpo y mente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="#planes"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="sparta-button text-lg flex items-center justify-center gap-2"
              >
                <span>Únete Ahora</span>
                <ChevronRight className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#servicios"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border-2 border-sparta-gold text-sparta-gold rounded font-semibold uppercase tracking-wider hover:bg-sparta-gold/10 transition-all"
              >
                Conoce Más
              </motion.a>
            </div>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-6 h-10 border-2 border-sparta-gold rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-sparta-gold rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-sparta-gold/10 via-sparta-bronze/10 to-sparta-gold/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { numero: '500+', label: 'Guerreros Activos' },
              { numero: '15+', label: 'Entrenadores Elite' },
              { numero: '2000m²', label: 'De Batalla' },
              { numero: '24/7', label: 'Siempre Abierto' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-sparta font-bold text-gradient mb-2">
                  {stat.numero}
                </div>
                <div className="text-gray-400 text-sm uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios Section */}
      <section id="servicios" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-sparta text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">NUESTROS</span>
              <span className="text-white"> SERVICIOS</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Todo lo que necesitas para convertirte en el guerrero que siempre quisiste ser.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicios.map((servicio, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-sparta p-6 text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-sparta-gold to-sparta-bronze rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <servicio.icon className="w-8 h-8 text-sparta-darker" />
                </div>
                <h3 className="font-sparta text-xl font-bold text-sparta-gold mb-2">
                  {servicio.titulo}
                </h3>
                <p className="text-gray-400 text-sm">
                  {servicio.descripcion}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Planes Section */}
      <section id="planes" className="py-24 px-4 bg-gradient-sparta">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-sparta text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">NUESTROS</span>
              <span className="text-white"> PLANES</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Precios accesibles para todos. ¡Ven y entrena con nosotros!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {planes.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, rotateY: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
                viewport={{ once: true }}
                className={`relative card-sparta p-8 ${plan.popular ? 'border-sparta-gold border-2' : ''}`}
              >
                {plan.popular && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring' }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sparta-gold text-sparta-darker px-4 py-1 rounded-full text-sm font-bold uppercase"
                  >
                    Recomendado
                  </motion.div>
                )}
                
                <div className="text-center mb-6">
                  <motion.div 
                    className="text-4xl mb-3"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    {plan.icon}
                  </motion.div>
                  <h3 className="font-sparta text-2xl font-bold text-sparta-gold mb-2">
                    {plan.nombre}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-sm text-gray-400">S/</span>
                    <motion.span 
                      className="text-5xl font-bold text-white"
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {plan.precio}
                    </motion.span>
                    <span className="text-gray-400">/{plan.periodo}</span>
                  </div>
                </div>

                <ul className="space-y-3">
                  {plan.caracteristicas.map((car, i) => (
                    <motion.li 
                      key={i} 
                      className="flex items-center gap-2 text-gray-300"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                    >
                      <Target className="w-4 h-4 text-sparta-gold flex-shrink-0" />
                      <span>{car}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonios Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-sparta text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">TESTIMONIOS</span>
              <span className="text-white"> DE GUERREROS</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonios.map((test, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card-sparta p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(test.estrellas)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-sparta-gold fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{test.texto}"</p>
                <p className="text-sparta-gold font-semibold">{test.nombre}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sparta-red/20 via-sparta-gold/20 to-sparta-red/20" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="font-sparta text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gradient">¿LISTO PARA</span>
              <span className="text-white"> LA BATALLA?</span>
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Únete a Sparta Gym y comienza tu transformación hoy mismo.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="sparta-button text-xl px-12 py-4"
            >
              ¡INSCRÍBETE AHORA!
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Contacto Section */}
      <section id="contacto" className="py-24 px-4 bg-sparta-dark">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-sparta text-4xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">CONTÁCTANOS</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card-sparta p-6 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-sparta-gold/20 rounded-full flex items-center justify-center">
                <Phone className="w-7 h-7 text-sparta-gold" />
              </div>
              <h3 className="font-semibold text-white mb-2">Teléfono</h3>
              <p className="text-gray-400">+51 987 654 321</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="card-sparta p-6 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-sparta-gold/20 rounded-full flex items-center justify-center">
                <Mail className="w-7 h-7 text-sparta-gold" />
              </div>
              <h3 className="font-semibold text-white mb-2">Email</h3>
              <p className="text-gray-400">info@spartagym.pe</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="card-sparta p-6 text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 bg-sparta-gold/20 rounded-full flex items-center justify-center">
                <MapPin className="w-7 h-7 text-sparta-gold" />
              </div>
              <h3 className="font-semibold text-white mb-2">Ubicación</h3>
              <p className="text-gray-400">Av. Los Guerreros 300, Lima</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-sparta-gold/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sparta-gold to-sparta-bronze rounded-full flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-sparta-darker" />
            </div>
            <span className="font-sparta text-lg font-bold text-gradient">SPARTA GYM</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 Sparta Gym. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

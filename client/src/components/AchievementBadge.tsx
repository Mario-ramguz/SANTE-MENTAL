import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AchievementBadgeProps {
  icon: string;
  name: string;
  description?: string;
  isNew?: boolean;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  icon,
  name,
  description,
  isNew = false,
}) => {
  const [showConfetti, setShowConfetti] = useState(isNew);

  useEffect(() => {
    if (isNew) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isNew]);

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      {/* Confeti animado cuando es nueva */}
      {showConfetti && (
        <>
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 200,
                  y: -200,
                  opacity: 0,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2,
                  ease: 'easeOut',
                  delay: i * 0.05,
                }}
              />
            ))}
          </motion.div>

          {/* Destello de luz */}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-300 to-orange-300 blur-xl"
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 1.5 }}
          />
        </>
      )}

      {/* Badge principal */}
      <motion.div
        className={`relative w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-lg border-4 ${
          isNew
            ? 'border-yellow-400 bg-gradient-to-br from-yellow-100 to-orange-100'
            : 'border-gray-300 bg-gradient-to-br from-gray-100 to-gray-50'
        }`}
        animate={isNew ? { scale: [1, 1.1, 1] } : {}}
        transition={isNew ? { duration: 0.6, repeat: 2 } : {}}
      >
        {icon}

        {/* Brillo en la esquina */}
        {isNew && (
          <motion.div
            className="absolute top-2 right-2 w-3 h-3 bg-white rounded-full opacity-60"
            animate={{ opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Nombre y descripción */}
      <div className="mt-4 text-center">
        <h3 className="font-bold text-foreground text-sm">{name}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      {/* Etiqueta "Nuevo" */}
      {isNew && (
        <motion.div
          className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          ¡Nuevo!
        </motion.div>
      )}
    </motion.div>
  );
};

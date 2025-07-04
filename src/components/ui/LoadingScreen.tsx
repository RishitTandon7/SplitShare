import React from 'react';
import { motion } from 'framer-motion';
import { Banknote } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotateZ: [0, 5, -5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5,
            ease: "easeInOut"
          }}
          className="mb-4 text-primary"
        >
          <Banknote size={48} />
        </motion.div>
        
        <h1 className="text-2xl font-bold mb-6 text-primary">SplitShare</h1>
        
        <div className="flex space-x-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ 
              repeat: Infinity, 
              duration: 1,
              delay: 0, 
              ease: "easeInOut" 
            }}
            className="w-3 h-3 rounded-full bg-primary"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ 
              repeat: Infinity, 
              duration: 1,
              delay: 0.2, 
              ease: "easeInOut" 
            }}
            className="w-3 h-3 rounded-full bg-primary"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ 
              repeat: Infinity, 
              duration: 1,
              delay: 0.4, 
              ease: "easeInOut" 
            }}
            className="w-3 h-3 rounded-full bg-primary"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
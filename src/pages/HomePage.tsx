import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Banknote, SplitSquareVertical, Group, Receipt, CreditCard, RefreshCw } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <SplitSquareVertical className="w-10 h-10 text-primary" />,
      title: 'Split Expenses Easily',
      description: 'Divide costs among friends, roommates, or travel companions with just a few taps.'
    },
    {
      icon: <Group className="w-10 h-10 text-primary" />,
      title: 'Create Groups',
      description: 'Organize expenses by creating different groups for various sharing scenarios.'
    },
    {
      icon: <Receipt className="w-10 h-10 text-primary" />,
      title: 'Track Balances',
      description: 'See who owes what at a glance with clear balance tracking and history.'
    },
    {
      icon: <CreditCard className="w-10 h-10 text-primary" />,
      title: 'UPI Integration',
      description: 'Settle debts directly through the app with integrated UPI payment options.'
    },
    {
      icon: <RefreshCw className="w-10 h-10 text-primary" />,
      title: 'Automatic Calculations',
      description: 'Let SplitShare handle all the math for splitting bills equally or unevenly.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-primary to-accent">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2 space-y-6 text-white">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold"
              >
                Split Expenses,<br />Not Friendships
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg md:text-xl text-white/90"
              >
                SplitShare makes it easy to track shared expenses, split bills, and settle up with friends and family.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="pt-4 flex flex-col sm:flex-row gap-4"
              >
                {user ? (
                  <Button 
                    size="lg"
                    variant="default"
                    className="bg-white text-primary hover:bg-white/90"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button 
                      size="lg"
                      variant="default"
                      className="bg-white text-primary hover:bg-white/90"
                      onClick={() => navigate('/auth')}
                    >
                      Get Started
                    </Button>
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                    >
                      Learn More
                    </Button>
                  </>
                )}
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="md:w-1/2 flex justify-center md:justify-end"
            >
              <div className="relative">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 opacity-75 blur"></div>
                <div className="relative bg-white p-5 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Banknote className="h-8 w-8 text-primary mr-2" />
                      <h3 className="font-bold">Trip to Goa</h3>
                    </div>
                    <span className="text-green-600 font-medium">₹3,500</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                          <span className="font-medium text-purple-600">R</span>
                        </div>
                        <span>Rahul paid</span>
                      </div>
                      <span className="font-medium">₹8,500</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="font-medium text-blue-600">Y</span>
                        </div>
                        <span>You owe</span>
                      </div>
                      <span className="font-medium text-red-500">₹2,125</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button variant="outline" className="w-full">Split</Button>
                    <Button variant="primary" className="w-full">Pay</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 px-4 container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose SplitShare?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simplify expense sharing with powerful features designed to make splitting costs hassle-free.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Split Expenses Hassle-Free?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of users who are already enjoying stress-free expense sharing with SplitShare.
          </p>
          
          {user ? (
            <Button 
              size="lg"
              variant="primary"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          ) : (
            <Button 
              size="lg"
              variant="primary"
              onClick={() => navigate('/auth')}
            >
              Get Started for Free
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Banknote className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold text-primary">SplitShare</span>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-muted-foreground hover:text-foreground">About</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Features</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Terms</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} SplitShare. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
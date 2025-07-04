import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Users, PlusCircle, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/groups', label: 'Groups', icon: Users },
    { path: '/expenses/new', label: 'Add Expense', icon: PlusCircle },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-card border-r border-border flex-col">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-primary">SplitShare</h1>
        </div>
        
        <nav className="flex-1 py-6 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-primary text-primary-foreground' 
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <IconComponent size={20} className="mr-3" />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute right-0 w-1 h-8 bg-accent rounded-l-md"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-border mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-destructive hover:bg-muted rounded-lg transition-all duration-200"
          >
            <LogOut size={20} className="mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="bg-card border-b border-border p-4 flex items-center justify-between md:hidden">
          <h1 className="text-xl font-bold text-primary">SplitShare</h1>
          <button 
            onClick={toggleMobileMenu}
            className="p-2 text-foreground hover:bg-muted rounded-md"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 bg-card border-b border-border z-50 md:hidden"
          >
            <nav className="py-2">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <li key={item.path}>
                      <button
                        onClick={() => {
                          navigate(item.path);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center px-6 py-3 ${
                          isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <IconComponent size={20} className="mr-3" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-6 py-3 text-destructive hover:bg-muted"
                  >
                    <LogOut size={20} className="mr-3" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </motion.div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden border-t border-border bg-card">
          <ul className="flex justify-around">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path} className="flex-1">
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full py-3 flex flex-col items-center ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <IconComponent size={20} />
                    <span className="text-xs mt-1">{item.label.split(' ')[0]}</span>
                    {isActive && (
                      <motion.div
                        layoutId="mobile-active-indicator"
                        className="absolute bottom-0 w-12 h-0.5 bg-primary rounded-t-md"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default Layout;
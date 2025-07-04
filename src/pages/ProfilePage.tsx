import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, LogOut, Camera, Save, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: 'Your Name',
    email: user?.email || '',
    phone: '+91 9876543210',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsEditing(false);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-lg p-6 shadow-sm"
          >
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                  <img 
                    src="https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-md">
                  <Camera size={16} />
                </button>
              </div>
              
              <h2 className="text-xl font-semibold mb-1">{formData.name}</h2>
              <p className="text-muted-foreground text-sm mb-4">{formData.email}</p>
              
              <div className="w-full space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={logout}
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
        
        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-6 shadow-sm mb-6"
          >
            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  leftIcon={<User size={18} />}
                />
                
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  leftIcon={<Mail size={18} />}
                />
                
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  leftIcon={<Phone size={18} />}
                />
                
                {isEditing && (
                  <div className="flex justify-end space-x-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                      leftIcon={<Save size={16} />}
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-card border border-border rounded-lg p-6 shadow-sm"
          >
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start">
                  <div className="p-2 bg-primary/10 rounded-full mr-3">
                    <Mail size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive email updates about your account activity</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-start">
                  <div className="p-2 bg-primary/10 rounded-full mr-3">
                    <Phone size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">SMS Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive text messages for important updates</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle size={20} className="text-destructive mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-destructive">Delete Account</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
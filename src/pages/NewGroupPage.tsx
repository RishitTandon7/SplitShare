import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, FileText, Image, Plus, X, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useGroupStore } from '../store/groupStore';
import { generateUniqueId } from '../lib/utils';

const coverImageOptions = [
  'https://images.pexels.com/photos/1078983/pexels-photo-1078983.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/2291367/pexels-photo-2291367.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/5490778/pexels-photo-5490778.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4553618/pexels-photo-4553618.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/4388167/pexels-photo-4388167.jpeg?auto=compress&cs=tinysrgb&w=600',
];

interface Member {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

const NewGroupPage: React.FC = () => {
  const navigate = useNavigate();
  const { addGroup } = useGroupStore();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  
  const [selectedCoverImage, setSelectedCoverImage] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([
    { id: '1', name: 'You', phone: '+91XXXXXXXXXX', avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150' },
  ]);
  const [newMember, setNewMember] = useState({ name: '', phone: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleNewMemberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({ ...prev, [name]: value }));
  };
  
  const addMember = () => {
    if (!newMember.name.trim()) {
      setErrors(prev => ({ ...prev, memberName: 'Name is required' }));
      return;
    }
    
    if (!newMember.phone.trim()) {
      setErrors(prev => ({ ...prev, memberPhone: 'Phone is required' }));
      return;
    }
    
    const newMemberId = generateUniqueId();
    setMembers(prev => [...prev, { ...newMember, id: newMemberId }]);
    setNewMember({ name: '', phone: '' });
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.memberName;
      delete newErrors.memberPhone;
      return newErrors;
    });
  };
  
  const removeMember = (id: string) => {
    if (id === '1') return; // Don't remove yourself
    setMembers(prev => prev.filter(member => member.id !== id));
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }
    
    if (members.length < 2) {
      newErrors.members = 'Add at least one more person to the group';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Create the group object
      const newGroup = {
        id: generateUniqueId(),
        name: formData.name,
        description: formData.description,
        members,
        createdAt: new Date(),
        totalExpenses: 0,
        coverImage: selectedCoverImage || undefined,
      };
      
      // Add the group
      addGroup(newGroup);
      
      // Navigate to the groups page
      navigate('/groups');
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft size={16} className="mr-1" />
        <span>Back</span>
      </button>
      
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Create New Group</h1>
        <p className="text-muted-foreground">Set up a group to track shared expenses</p>
      </header>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card border border-border rounded-lg p-6 shadow-sm"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              label="Group Name"
              name="name"
              placeholder="e.g., Trip to Goa, Apartment 4B"
              value={formData.name}
              onChange={handleChange}
              leftIcon={<Users size={18} />}
              error={errors.name}
              required
            />
            
            <div className="space-y-1.5">
              <label htmlFor="description" className="block text-sm font-medium text-foreground">
                Description (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <FileText size={18} />
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="pl-10 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Add a short description for your group..."
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Cover Image</h3>
            <div className="grid grid-cols-3 gap-3">
              {coverImageOptions.map((image, index) => (
                <div 
                  key={index}
                  className={`relative aspect-video rounded-md overflow-hidden cursor-pointer border-2 ${
                    selectedCoverImage === image ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedCoverImage(image)}
                >
                  <img 
                    src={image} 
                    alt={`Cover option ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                  {selectedCoverImage === image && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full">
                      <Check size={14} />
                    </div>
                  )}
                </div>
              ))}
              <div 
                className="aspect-video rounded-md border-2 border-dashed border-muted flex items-center justify-center cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setSelectedCoverImage(null)}
              >
                <div className="flex flex-col items-center text-muted-foreground">
                  <Image size={24} className="mb-1" />
                  <span className="text-xs">Custom</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Group Members</h3>
              <span className="text-sm text-muted-foreground">{members.length} members</span>
            </div>
            
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                      {member.avatar ? (
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                          {member.name.substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.phone}</p>
                    </div>
                  </div>
                  
                  {member.id !== '1' && (
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="p-1 text-muted-foreground hover:text-destructive rounded-full"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {errors.members && (
              <p className="text-sm text-destructive">{errors.members}</p>
            )}
            
            <div className="p-4 border border-dashed border-muted rounded-lg">
              <h4 className="text-sm font-medium mb-3">Add New Member</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input
                  placeholder="Name"
                  name="name"
                  value={newMember.name}
                  onChange={handleNewMemberChange}
                  error={errors.memberName}
                />
                <Input
                  placeholder="Phone Number"
                  name="phone"
                  value={newMember.phone}
                  onChange={handleNewMemberChange}
                  error={errors.memberPhone}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<Plus size={14} />}
                onClick={addMember}
              >
                Add Member
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/groups')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              leftIcon={<Check size={16} />}
            >
              Create Group
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default NewGroupPage;
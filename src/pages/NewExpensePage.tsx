import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Tag, Users, DollarSign, FileText, Check } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useGroupStore } from '../store/groupStore';
import { useExpenseStore } from '../store/expenseStore';
import { generateUniqueId } from '../lib/utils';

const categories = [
  'Food & Drinks',
  'Transportation',
  'Accommodation',
  'Entertainment',
  'Groceries',
  'Utilities',
  'Rent',
  'Shopping',
  'Other',
];

const NewExpensePage: React.FC = () => {
  const navigate = useNavigate();
  const { groups } = useGroupStore();
  const { addExpense } = useExpenseStore();
  
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    groupId: '',
    paidById: '1', // Default to current user
    notes: '',
  });
  
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
  const [splitAmounts, setSplitAmounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
  
  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const groupId = e.target.value;
    setFormData(prev => ({ ...prev, groupId }));
    
    if (groupId) {
      const group = groups.find(g => g.id === groupId);
      setSelectedGroup(group);
      
      // Initialize split amounts for all members
      const initialSplitAmounts: Record<string, number> = {};
      group?.members.forEach(member => {
        initialSplitAmounts[member.id] = 0;
      });
      setSplitAmounts(initialSplitAmounts);
    } else {
      setSelectedGroup(null);
      setSplitAmounts({});
    }
  };
  
  const calculateEqualSplit = () => {
    if (!selectedGroup || !formData.amount) return;
    
    const amount = parseFloat(formData.amount);
    const memberCount = selectedGroup.members.length;
    const equalAmount = amount / memberCount;
    
    const newSplitAmounts: Record<string, number> = {};
    selectedGroup.members.forEach((member: any) => {
      newSplitAmounts[member.id] = equalAmount;
    });
    
    setSplitAmounts(newSplitAmounts);
  };
  
  const handleSplitTypeChange = (type: 'equal' | 'custom') => {
    setSplitType(type);
    if (type === 'equal') {
      calculateEqualSplit();
    }
  };
  
  const handleSplitAmountChange = (memberId: string, value: string) => {
    const amount = value === '' ? 0 : parseFloat(value);
    setSplitAmounts(prev => ({
      ...prev,
      [memberId]: amount,
    }));
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }
    
    if (!formData.groupId) {
      newErrors.groupId = 'Please select a group';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (splitType === 'custom') {
      const totalSplit = Object.values(splitAmounts).reduce((sum, amount) => sum + amount, 0);
      const totalAmount = parseFloat(formData.amount);
      
      if (Math.abs(totalSplit - totalAmount) > 0.01) {
        newErrors.split = `Split amounts must equal the total (${totalAmount})`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Create the expense object
      const newExpense = {
        id: generateUniqueId(),
        groupId: formData.groupId,
        title: formData.title,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date),
        category: formData.category,
        notes: formData.notes,
        paidBy: selectedGroup.members.find((m: any) => m.id === formData.paidById),
        splitWith: selectedGroup.members.map((member: any) => ({
          id: member.id,
          name: member.name,
          avatar: member.avatar,
          amount: splitAmounts[member.id],
          paid: member.id === formData.paidById, // Payer has already paid their share
        })),
      };
      
      // Add the expense
      addExpense(newExpense);
      
      // Navigate back to the group details page
      navigate(`/groups/${formData.groupId}`);
    } catch (error) {
      console.error('Error adding expense:', error);
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
        <h1 className="text-3xl font-bold">Add New Expense</h1>
        <p className="text-muted-foreground">Create a new shared expense</p>
      </header>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card border border-border rounded-lg p-6 shadow-sm"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Expense Title"
              name="title"
              placeholder="e.g., Dinner at Restaurant"
              value={formData.title}
              onChange={handleChange}
              leftIcon={<FileText size={18} />}
              error={errors.title}
              required
            />
            
            <Input
              label="Amount"
              name="amount"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              leftIcon={<DollarSign size={18} />}
              error={errors.amount}
              required
            />
            
            <div className="space-y-1.5">
              <label htmlFor="groupId" className="block text-sm font-medium text-foreground">
                Group
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Users size={18} />
                </div>
                <select
                  id="groupId"
                  name="groupId"
                  value={formData.groupId}
                  onChange={handleGroupChange}
                  className={`flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.groupId ? 'border-destructive focus-visible:ring-destructive' : ''
                  }`}
                  required
                >
                  <option value="">Select a group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.groupId && (
                <p className="text-sm text-destructive">{errors.groupId}</p>
              )}
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="category" className="block text-sm font-medium text-foreground">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Tag size={18} />
                </div>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    errors.category ? 'border-destructive focus-visible:ring-destructive' : ''
                  }`}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>
            
            <Input
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              leftIcon={<Calendar size={18} />}
              required
            />
            
            <div className="space-y-1.5">
              <label htmlFor="paidById" className="block text-sm font-medium text-foreground">
                Paid By
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <Users size={18} />
                </div>
                <select
                  id="paidById"
                  name="paidById"
                  value={formData.paidById}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!selectedGroup}
                  required
                >
                  <option value="">Select who paid</option>
                  {selectedGroup?.members.map((member: any) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {selectedGroup && (
            <div className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Split Details</h3>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md ${
                      splitType === 'equal' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                    onClick={() => handleSplitTypeChange('equal')}
                  >
                    Split Equally
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md ${
                      splitType === 'custom' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                    onClick={() => handleSplitTypeChange('custom')}
                  >
                    Custom Split
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {selectedGroup.members.map((member: any) => (
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
                      <span>{member.name}</span>
                      {member.id === formData.paidById && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          Paid
                        </span>
                      )}
                    </div>
                    
                    {splitType === 'equal' ? (
                      <div className="text-right">
                        <span className="font-medium">
                          ₹{formData.amount ? (parseFloat(formData.amount) / selectedGroup.members.length).toFixed(2) : '0.00'}
                        </span>
                      </div>
                    ) : (
                      <div className="w-24">
                        <Input
                          type="number"
                          value={splitAmounts[member.id] || ''}
                          onChange={(e) => handleSplitAmountChange(member.id, e.target.value)}
                          className="h-8 text-right"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {errors.split && (
                <p className="text-sm text-destructive mt-2">{errors.split}</p>
              )}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label htmlFor="notes" className="block text-sm font-medium text-foreground">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Add any additional details about this expense..."
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              leftIcon={<Check size={16} />}
            >
              Save Expense
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default NewExpensePage;
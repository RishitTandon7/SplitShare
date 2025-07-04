import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Users, ArrowLeft, Calendar, Tag, MoreVertical, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import { useGroupStore } from '../store/groupStore';
import { useExpenseStore } from '../store/expenseStore';
import { formatCurrency } from '../lib/utils';

const GroupDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { groups } = useGroupStore();
  const { getGroupExpenses } = useExpenseStore();
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      const foundGroup = groups.find(g => g.id === id);
      if (foundGroup) {
        setGroup(foundGroup);
        setExpenses(getGroupExpenses(id));
      }
      setIsLoading(false);
    }
  }, [id, groups, getGroupExpenses]);
  
  if (isLoading) {
    return <div className="p-8 flex justify-center">Loading...</div>;
  }
  
  if (!group) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Group not found</h2>
        <p className="text-muted-foreground mb-6">The group you're looking for doesn't exist or has been deleted.</p>
        <Button variant="primary" onClick={() => navigate('/groups')}>
          Back to Groups
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/groups')}
          className="flex items-center text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Groups</span>
        </button>
        
        <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-6">
          {group.coverImage ? (
            <img 
              src={group.coverImage} 
              alt={group.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Users className="h-16 w-16 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{group.name}</h1>
            {group.description && (
              <p className="text-white/80">{group.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-semibold">Group Members</h2>
            <p className="text-muted-foreground">{group.members.length} members in this group</p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline"
              leftIcon={<Users size={16} />}
            >
              Manage Members
            </Button>
            <Button 
              variant="primary"
              leftIcon={<PlusCircle size={16} />}
              onClick={() => navigate('/expenses/new')}
            >
              Add Expense
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap -mx-2 mb-8">
          {group.members.map((member: any) => (
            <div key={member.id} className="px-2 mb-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full overflow-hidden mb-2">
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center text-xl">
                      {member.name.substring(0, 2)}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium">{member.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Expenses</h2>
          <span className="text-muted-foreground">Total: {formatCurrency(group.totalExpenses)}</span>
        </div>
        
        {expenses.length > 0 ? (
          <div className="space-y-4">
            {expenses.map((expense) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-card border border-border rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-4">
                      {expense.paidBy.avatar ? (
                        <img 
                          src={expense.paidBy.avatar} 
                          alt={expense.paidBy.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center">
                          {expense.paidBy.name.substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{expense.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar size={14} className="mr-1" />
                        <span>{expense.date.toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <Tag size={14} className="mr-1" />
                        <span>{expense.category}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium mr-4">{formatCurrency(expense.amount)}</span>
                    <div className="relative">
                      <button className="p-1 text-muted-foreground hover:text-foreground rounded-full">
                        <MoreVertical size={18} />
                      </button>
                      {/* Dropdown menu would go here */}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Paid by {expense.paidBy.name}</span>
                    <span className="text-sm">Split equally</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {expense.splitWith.map((member: any) => (
                      <div 
                        key={member.id} 
                        className={`flex items-center p-2 rounded-md ${
                          member.paid ? 'bg-green-50 text-green-700' : 'bg-muted'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
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
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{member.name}</p>
                          <p className="text-xs truncate">{formatCurrency(member.amount)}</p>
                        </div>
                        {member.paid && (
                          <span className="text-xs font-medium">Paid</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-muted/30 border border-dashed border-muted rounded-lg p-8 text-center">
            <Trash2 className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No expenses yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add your first expense to this group
            </p>
            <Button
              variant="outline"
              onClick={() => navigate('/expenses/new')}
            >
              Add Expense
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetailsPage;
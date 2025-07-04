import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowUpRight, ArrowDownRight, Banknote, Users, RefreshCcw, TrendingUp, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'activities'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    groups: any[];
    expenses: any[];
    balances: {
      totalOwed: number;
      totalOwing: number;
      netBalance: number;
    };
    spendingInsights: {
      category: string;
      totalAmount: number;
      percentage: number;
    }[];
  }>({
    groups: [],
    expenses: [],
    balances: {
      totalOwed: 0,
      totalOwing: 0,
      netBalance: 0
    },
    spendingInsights: []
  });
  
  useEffect(() => {
    if (!user) return;
  
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch user's groups with a simplified query
        const { data: groups, error: groupsError } = await supabase
          .from('groups')
          .select(`
            id,
            name,
            description,
            cover_image,
            created_at,
            group_members (
              id,
              user_id,
              role
            )
          `)
          .eq('group_members.user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (groupsError) throw groupsError;

        // Fetch recent expenses
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select(`
            id,
            title,
            amount,
            category,
            date,
            group:groups (
              id,
              name
            ),
            paid_by_user:profiles!paid_by (
              id,
              name,
              avatar_url
            )
          `)
          .order('date', { ascending: false })
          .limit(5);

        if (expensesError) throw expensesError;

        // Fetch user balances
        const { data: balances, error: balancesError } = await supabase
          .from('user_balances')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (balancesError) throw balancesError;

        // Fetch spending insights
        const { data: insights, error: insightsError } = await supabase
          .rpc('get_user_spending_insights', { 
            user_id: user.id,
            days_back: 30
          });

        if (insightsError) throw insightsError;

        setData({
          groups: groups || [],
          expenses: expenses || [],
          balances: {
            totalOwed: balances?.total_paid || 0,
            totalOwing: balances?.total_owed || 0,
            netBalance: balances?.net_balance || 0
          },
          spendingInsights: insights || []
        });
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  const { groups, expenses, balances, spendingInsights } = data;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your financial overview.</p>
      </header>
      
      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card border border-border rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-muted-foreground">You are owed</h3>
            <div className="p-2 bg-green-100 rounded-full">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(balances.totalOwed)}</p>
          <p className="text-sm text-muted-foreground mt-1">From 3 people</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-card border border-border rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-muted-foreground">You owe</h3>
            <div className="p-2 bg-red-100 rounded-full">
              <ArrowDownRight className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(balances.totalOwing)}</p>
          <p className="text-sm text-muted-foreground mt-1">To 2 people</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-card border border-border rounded-lg p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-muted-foreground">Total Balance</h3>
            <div className="p-2 bg-primary/10 rounded-full">
              <RefreshCcw className="h-5 w-5 text-primary" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${balances.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(balances.netBalance)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {balances.netBalance >= 0 ? 'Overall, you are owed money' : 'Overall, you owe money'}
          </p>
        </motion.div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          variant="primary" 
          leftIcon={<PlusCircle size={16} />}
          onClick={() => navigate('/expenses/new')}
        >
          Add an Expense
        </Button>
        <Button 
          variant="outline" 
          leftIcon={<Users size={16} />}
          onClick={() => navigate('/groups/new')}
        >
          Create a Group
        </Button>
        <Button 
          variant="outline" 
          leftIcon={<Banknote size={16} />}
        >
          Settle Up
        </Button>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex space-x-8">
          <button
            className={`pb-4 font-medium ${
              activeTab === 'overview'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`pb-4 font-medium ${
              activeTab === 'activities'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('activities')}
          >
            Recent Activities
          </button>
        </div>
      </div>
      
      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Groups */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Groups</h2>
              <Link to="/groups" className="text-primary hover:underline text-sm">
                View All
              </Link>
            </div>
            
            <div className="space-y-4">
              {groups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link to={`/groups/${group.id}`}>
                    <div className="flex">
                      <div className="w-24 h-24 bg-muted">
                        {group.cover_image && (
                          <img 
                            src={group.cover_image} 
                            alt={group.name} 
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4 flex-1">
                        <h3 className="font-semibold mb-1">{group.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          {group.description || `Group with ${group.group_members.length} members`}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex -space-x-2">
                            {group.group_members.slice(0, 3).map((member) => (
                              <div 
                                key={member.id} 
                                className="w-6 h-6 rounded-full border-2 border-background overflow-hidden bg-primary text-primary-foreground text-xs flex items-center justify-center"
                              >
                                {member.user_id.substring(0, 2).toUpperCase()}
                              </div>
                            ))}
                            {group.group_members.length > 3 && (
                              <div className="w-6 h-6 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">
                                +{group.group_members.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
              
              {groups.length === 0 && (
                <div className="bg-muted/30 border border-dashed border-muted rounded-lg p-8 text-center">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No groups yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Create a group to start tracking shared expenses
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/groups/new')}
                  >
                    Create Your First Group
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Spending Insights */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Spending Insights</h2>
              <span className="text-xs text-muted-foreground">Last 30 days</span>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-5 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Top Categories</h3>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              
              <div className="space-y-4">
                {spendingInsights.map((category, index) => (
                  <div key={category.category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{category.category}</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(category.totalAmount)}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          index === 0 ? 'bg-primary' :
                          index === 1 ? 'bg-accent' :
                          index === 2 ? 'bg-purple-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                
                {spendingInsights.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No spending data available</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">People You Owe</h3>
                <Button variant="ghost" size="sm" className="h-8 text-xs">
                  Settle All
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                      <img 
                        src="https://images.pexels.com/photos/3785077/pexels-photo-3785077.jpeg?auto=compress&cs=tinysrgb&w=150" 
                        alt="Rahul" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span>Rahul</span>
                  </div>
                  <span className="font-medium text-red-600">₹2,125</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                      <img 
                        src="https://images.pexels.com/photos/3781543/pexels-photo-3781543.jpeg?auto=compress&cs=tinysrgb&w=150" 
                        alt="Priya" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span>Priya</span>
                  </div>
                  <span className="font-medium text-red-600">₹1,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Recent Activities */
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Expenses</h2>
          
          <div className="space-y-4">
            {expenses.map((expense) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-card border border-border rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden mr-4">
                      {expense.paid_by_user.avatar_url ? (
                        <img 
                          src={expense.paid_by_user.avatar_url} 
                          alt={expense.paid_by_user.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center">
                          {expense.paid_by_user.name.substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{expense.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {expense.paid_by_user.name} paid {formatCurrency(expense.amount)} on {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">
                      {expense.paid_by_user.id === user.id ? 'You paid' : 'You owe'}
                    </span>
                    <p className={expense.paid_by_user.id === user.id ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {expenses.length === 0 && (
              <div className="bg-muted/30 border border-dashed border-muted rounded-lg p-8 text-center">
                <Banknote className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">No expenses yet</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Add your first expense to start tracking
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/expenses/new')}
                >
                  Add Your First Expense
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
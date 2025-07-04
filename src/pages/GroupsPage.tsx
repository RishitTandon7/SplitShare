import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlusCircle, Users, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useGroupStore } from '../store/groupStore';
import { formatCurrency } from '../lib/utils';

const GroupsPage: React.FC = () => {
  const navigate = useNavigate();
  const { groups } = useGroupStore();
  const [searchQuery, setSearchQuery] = React.useState('');
  
  const filteredGroups = groups.filter((group) => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">Manage your expense sharing groups</p>
        </div>
        
        <Button 
          variant="primary"
          leftIcon={<PlusCircle size={16} />}
          onClick={() => navigate('/groups/new')}
        >
          Create Group
        </Button>
      </header>
      
      <div className="mb-6">
        <Input
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search size={18} />}
        />
      </div>
      
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group, index) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Link to={`/groups/${group.id}`}>
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
                  <div className="h-40 bg-muted relative">
                    {group.coverImage ? (
                      <img 
                        src={group.coverImage} 
                        alt={group.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Users className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      {group.description || `Group with ${group.members.length} members`}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex -space-x-2">
                        {group.members.slice(0, 4).map((member) => (
                          <div 
                            key={member.id} 
                            className="w-8 h-8 rounded-full border-2 border-background overflow-hidden"
                          >
                            {member.avatar ? (
                              <img 
                                src={member.avatar} 
                                alt={member.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                {member.name.substring(0, 2)}
                              </div>
                            )}
                          </div>
                        ))}
                        {group.members.length > 4 && (
                          <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">
                            +{group.members.length - 4}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">Total</span>
                        <p className="font-medium">
                          {formatCurrency(group.totalExpenses)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-muted/30 border border-dashed border-muted rounded-lg p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          
          {searchQuery ? (
            <>
              <h3 className="text-lg font-medium mb-2">No groups found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find any groups matching "{searchQuery}"
              </p>
              <Button
                variant="outline"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-medium mb-2">No groups yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first group to start tracking shared expenses
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/groups/new')}
                leftIcon={<PlusCircle size={16} />}
              >
                Create Your First Group
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
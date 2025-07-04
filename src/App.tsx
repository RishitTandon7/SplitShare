import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailsPage from './pages/GroupDetailsPage';
import ProfilePage from './pages/ProfilePage';
import NewExpensePage from './pages/NewExpensePage';
import NewGroupPage from './pages/NewGroupPage';
import LoadingScreen from './components/ui/LoadingScreen';
import Layout from './components/layout/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/auth" element={
        user ? <Navigate to="/dashboard" replace /> : <AuthPage />
      } />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout>
            <DashboardPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/groups" element={
        <ProtectedRoute>
          <Layout>
            <GroupsPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/groups/new" element={
        <ProtectedRoute>
          <Layout>
            <NewGroupPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/groups/:id" element={
        <ProtectedRoute>
          <Layout>
            <GroupDetailsPage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/expenses/new" element={
        <ProtectedRoute>
          <Layout>
            <NewExpensePage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <ProfilePage />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="*" element={
        user ? <Navigate to="/" replace /> : <Navigate to="/auth" replace />
      } />
    </Routes>
  );
}

export default App;
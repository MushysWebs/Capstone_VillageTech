// Dashboard.js
import React from 'react';
import './Dashboard.css';
import CalendarView from './CalendarView';
import AuthGuard from './components/auth/AuthGuard';
import { useSession } from '@supabase/auth-helpers-react';

const Dashboard = ({ globalSearchTerm }) => {
  const session = useSession();
  const userFirstName = session?.user?.user_metadata?.first_name || 'User';
  return (
    <AuthGuard>
      <div className="dashboard-content">
        <CalendarView searchTerm={globalSearchTerm} userFirstName={userFirstName}/>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
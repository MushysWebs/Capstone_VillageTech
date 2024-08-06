import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import './Dashboard.css';
import CalendarView from './CalendarView';
import AuthGuard from './components/auth/AuthGuard';

const Dashboard = ({ globalSearchTerm }) => {
  const [userFirstName, setUserFirstName] = useState('User');
  const supabase = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const { data, error } = await supabase
            .from('staff')
            .select('first_name')
            .eq('user_id', session.user.id)
            .single();

          if (error) throw error;
          
          if (data) {
            setUserFirstName(data.first_name);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [session, supabase]);

  return (
    <AuthGuard>
      <div className="dashboard-content">
        <CalendarView searchTerm={globalSearchTerm} userFirstName={userFirstName} />
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
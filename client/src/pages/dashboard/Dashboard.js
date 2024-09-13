import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import './Dashboard.css';
import CalendarView from './calendarView/CalendarView';
import AuthGuard from '../../components/auth/AuthGuard';

const Dashboard = ({ globalSearchTerm }) => {
  const [firstName, setFirstName] = useState('');
  const supabase = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    async function fetchUserName() {
      if (session?.user?.id) {
        const { data, error } = await supabase
          .from('staff')
          .select('first_name')
          .eq('user_id', session.user.id)
          .single();

        if (data) {
          setFirstName(data.first_name);
        } else if (error) {
          console.error('Error fetching user name:', error);
        }
      }
    }

    fetchUserName();
  }, [session, supabase]);

  return (
    <AuthGuard>
      <div className="dashboard-content">
        <CalendarView searchTerm={globalSearchTerm} firstName={firstName} />
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
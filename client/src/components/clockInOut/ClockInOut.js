import React, { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';

const ClockInOut = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [lastClockIn, setLastClockIn] = useState(null);
  const supabase = useSupabaseClient();
  const session = useSession();

  useEffect(() => {
    checkClockInStatus();
  }, []);

  const checkClockInStatus = async () => {
    if (session?.user?.id) {
      const { data, error } = await supabase
        .from('time_clock')
        .select('*')
        .eq('staff_id', session.user.id)
        .is('clock_out', null)
        .order('clock_in', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setIsClockedIn(true);
        setLastClockIn(data[0].clock_in);
      }
    }
  };

  const handleClockIn = async () => {
    const { data, error } = await supabase
      .from('time_clock')
      .insert({
        staff_id: session.user.id,
        clock_in: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      });

    if (error) {
      console.error('Error clocking in:', error);
    } else {
      setIsClockedIn(true);
      setLastClockIn(new Date().toISOString());
    }
  };

  const handleClockOut = async () => {
    const { data, error } = await supabase
      .from('time_clock')
      .update({ clock_out: new Date().toISOString() })
      .eq('staff_id', session.user.id)
      .is('clock_out', null);

    if (error) {
      console.error('Error clocking out:', error);
    } else {
      setIsClockedIn(false);
      setLastClockIn(null);
    }
  };

  return (
    <div className="clock-in-out">
      {isClockedIn ? (
        <>
          <p>Clocked in at: {new Date(lastClockIn).toLocaleString()}</p>
          <button onClick={handleClockOut}>Clock Out</button>
        </>
      ) : (
        <button onClick={handleClockIn}>Clock In</button>
      )}
    </div>
  );
};

export default ClockInOut;
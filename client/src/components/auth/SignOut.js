import React from 'react';
import { useCookies } from 'react-cookie';
import { supabase } from './supabaseClient'; 

const SignoutButton = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['AuthToken']);

    const signOut = async () => {
        console.log('Signing out');
        await supabase.auth.signOut();
        removeCookie('authToken', { path: '/' }); 
        window.location.href = '/login'; 
    };

    return (
        <button onClick={signOut} style={{ 
            background: '#09ACE0',
            color: 'white',
            borderRadius: 3,
            border: 'none',
            padding: 8,
            }}>
            Sign Out
        </button>
    );
};

export default SignoutButton;
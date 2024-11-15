import React from 'react';
import { useCookies } from 'react-cookie';
import { supabase } from '../routes/supabaseClient';
import './SignOut.css'

const SignoutButton = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['AuthToken']);

    const signOut = async () => {
        console.log('Signing out');
        await supabase.auth.signOut();
        removeCookie('authToken', { path: '/' });
        window.location.href = '/login';
    };

    return (
        <button onClick={signOut} className='sign-out-button'>
            Sign Out
        </button>
    );
};

export default SignoutButton;
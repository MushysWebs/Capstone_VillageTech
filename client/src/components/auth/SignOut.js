import React from 'react';
import { useCookies } from 'react-cookie';

const SignoutButton = () => {
    const [cookies, setCookie, removeCookie] = useCookies(['AuthToken']);

    const signOut = () => {
        console.log('Signing out');
        removeCookie('authToken', { path: '/' }); // Add path or other attributes if needed
        window.location.reload(); // Reload the page to apply changes
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

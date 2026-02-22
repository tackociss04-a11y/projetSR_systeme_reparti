import React from 'react';

const LoginButton: React.FC = () => {
    const handleLogin = () => {
        // Logic for handling login goes here
        console.log('Login button clicked');
    };

    return (
        <button onClick={handleLogin} className="login-button">
            Login
        </button>
    );
};

export default LoginButton;
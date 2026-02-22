import React from 'react';

const SignupButton: React.FC = () => {
    const handleSignup = () => {
        // Logic for handling signup process
        console.log('Signup button clicked');
    };

    return (
        <button onClick={handleSignup} className="signup-button">
            Sign Up
        </button>
    );
};

export default SignupButton;
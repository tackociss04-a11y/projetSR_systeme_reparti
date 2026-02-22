import React from 'react';
import SignupButton from '../components/SignupButton';
import LoginButton from '../components/LoginButton';
import ServiceDescription from '../components/ServiceDescription';
import styles from '../styles/Home.module.css';

const Home: React.FC = () => {
    return (
        <div className={styles.container}>
            <h1>Bienvenue sur notre plateforme</h1>
            <ServiceDescription />
            <div className={styles.buttonContainer}>
                <SignupButton />
                <LoginButton />
            </div>
        </div>
    );
};

export default Home;
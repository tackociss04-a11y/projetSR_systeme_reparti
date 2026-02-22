import React from 'react';
import styles from '../styles/Home.module.css';

const ServiceDescription: React.FC = () => {
    return (
        <div className={styles.serviceDescription}>
            <h2>Nos Services</h2>
            <p>
                Nous offrons une gamme complète de services pour répondre à vos besoins. Que vous soyez à la recherche de solutions personnalisées ou de services standard, notre équipe est là pour vous aider.
            </p>
            <ul>
                <li>Consultation professionnelle</li>
                <li>Développement de logiciels sur mesure</li>
                <li>Support technique 24/7</li>
                <li>Formation et accompagnement</li>
            </ul>
            <img src="/images/services.jpg" alt="Services" className={styles.serviceImage} />
        </div>
    );
};

export default ServiceDescription;
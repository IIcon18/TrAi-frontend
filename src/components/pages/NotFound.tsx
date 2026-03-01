import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../SEOHead';

const NotFound: React.FC = () => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: '#1A1A1A',
            color: '#FFFFFF',
            textAlign: 'center',
            padding: '24px',
        }}>
            <SEOHead
                title="Страница не найдена"
                description="Запрошенная страница не существует"
                noIndex={true}
            />
            <h1 style={{ fontSize: '96px', fontWeight: 700, margin: 0, color: '#FF3B30' }}>404</h1>
            <h2 style={{ fontSize: '24px', fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}>
                Страница не найдена
            </h2>
            <p style={{ fontSize: '16px', color: '#999', marginBottom: '32px' }}>
                Запрошенная страница не существует или была перемещена.
            </p>
            <Link
                to="/login"
                style={{
                    padding: '12px 28px',
                    background: '#FF3B30',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                }}
            >
                На главную
            </Link>
        </div>
    );
};

export default NotFound;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { InputField } from '../components/ui/FormFields';
import { useToast } from '../context/ToastContext';
import styles from './Login.module.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Successfully logged in');
      } else {
        await signup(email, password);
        toast.success('Account created successfully');
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to authenticate');
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card className={styles.loginCard}>
        <div className={styles.brand}>
          <h2>FEX CRM</h2>
        </div>
        <h3 className={styles.title}>{isLogin ? 'Welcome Back' : 'Create Account'}</h3>
        <p className={styles.subtitle}>
          {isLogin ? 'Sign in to access your leads' : 'Join the team and start closing'}
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <InputField
            label="Email Address"
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputField
            label="Password"
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className={styles.toggle}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            className={styles.toggleBtn} 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-secondary">
      <div className="bg-white p-8 rounded border border-border-light w-full max-w-md">
        <h1 className="text-3xl font-bold text-text-primary mb-2 text-center">
          POS System
        </h1>
        <p className="text-text-secondary text-center mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-status-error bg-opacity-10 border border-status-error text-status-error p-3 rounded">
              {error}
            </div>
          )}

          <Input
            label="Username or Email"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary mt-4">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-text-primary hover:underline">
            Create one
          </Link>
        </p>

        <div className="mt-6 p-4 bg-bg-secondary rounded text-sm text-text-secondary">
          <p className="font-semibold mb-2">Test Credentials:</p>
          <p>Manager: manager / Manager@123</p>
          <p>Admin: admin / Admin@123</p>
          <p>Cashier: cashier / Cashier@123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;


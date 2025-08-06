import React, { useState } from 'react';
import bcrypt from 'bcryptjs';

function LoginView({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const correctUsername = 'admin';

  const bcryptHash = '$2a$10$m1MGusB3uFIK6UIEOeIhg.LIbM5KYMWoj9kTZu2LkGdzAG2r9Uw6m';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const isMatch = await bcrypt.compare(password, bcryptHash);

      if (username === correctUsername && isMatch) {
        onLoginSuccess();
      } else {
        setError('Invalid username or password.');
      }
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
      <div className="h-screen w-screen bg-slate-100 flex items-center justify-center font-sans">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-800 text-center">Admin Panel</h1>
          <p className="text-slate-500 mt-2 text-center mb-8">Sign in to monitor user activity.</p>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1" htmlFor="username">Username</label>
              <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="text-black w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-1" htmlFor="password">Password</label>
              <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="text-black w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-blue-700 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
  );
}

export default LoginView;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PublicNavbar from '../components/common/PublicNavbar';
import { login, googleLoginAuth } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await login(email, password);
      const { token, user } = response.data.data;
      setAuth(token, user);
      navigate('/home');
    } catch (err) {
      const errData = err.response?.data?.error;
      const msg = (typeof errData === 'object' ? errData.message : errData) || err.message || 'Failed to sign in. Please check your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);
    try {
      const response = await googleLoginAuth(credentialResponse.credential);
      const { token, user } = response.data.data;
      setAuth(token, user);
      navigate('/home');
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was unsuccessful. Please try again.');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] font-['DM_Sans'] flex flex-col text-[#F1F5F9]">
      <PublicNavbar />

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1E1E2E] border border-[#2D2D3F] rounded-2xl shadow-xl overflow-hidden">

          <div className="p-8">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold font-['Syne'] text-[#F1F5F9] mb-2">
                Welcome back
              </h1>
              <p className="text-[#94A3B8]">
                Sign in to continue to AI Resume Coach
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#94A3B8] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0A0A0F] border border-[#2D2D3F] rounded-lg px-4 py-3 text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] transition-colors"
                  placeholder="you@example.com"
                  disabled={loading}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#94A3B8]">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-[#6366F1] hover:text-[#22D3EE] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0A0A0F] border border-[#2D2D3F] rounded-lg px-4 py-3 text-[#F1F5F9] focus:outline-none focus:border-[#6366F1] transition-colors"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="text-[#F43F5E] text-sm mt-2 text-center p-3 bg-opacity-10 bg-[#F43F5E] rounded-lg border border-[#F43F5E] border-opacity-30">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#6366F1] hover:bg-[#4f46e5] text-white font-medium rounded-lg px-4 py-3 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#2D2D3F]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#1E1E2E] text-[#94A3B8]">Or continue with</span>
                </div>
              </div>
              <div className="mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                />
              </div>
            </div>

            <div className="mt-8 text-center text-[#94A3B8]">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-[#6366F1] hover:text-[#22D3EE] transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;

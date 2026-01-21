import React, { useState } from 'react';
import { UserRole, Region } from '../../types';
import { authService } from '../services/api';
import { LogIn, UserPlus } from 'lucide-react';

interface LoginProps {
    onLogin: (user: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Register State
    const [name, setName] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [address, setAddress] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegistering) {
                // Register Logic
                await authService.register({ name, email, password, contactNo, address });
                setIsRegistering(false);
                setError('Registration successful! Please login.');
            } else {
                // Login Logic
                const data = await authService.login(email, password);
                onLogin(data.user);
            }
        } catch (err: any) {
            console.error("Login Error:", err);
            setError(err.message || err.error_description || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-500/10 p-4 rounded-full">
                        <LogIn className="w-8 h-8 text-blue-400" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-white mb-2">
                    {isRegistering ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-center text-gray-400 mb-8">
                    IslandLink Sales Distribution System
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegistering && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Contact No</label>
                                <input
                                    type="text"
                                    value={contactNo}
                                    onChange={(e) => setContactNo(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Address/Region</label>
                                <select
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                                    required
                                >
                                    <option value="">Select Region</option>
                                    {Object.values(Region).map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : (isRegistering ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsRegistering(!isRegistering)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
                    </button>
                </div>

                {/* --- DEMO HELPERS (Optional, for easy testing) --- */}
                {!isRegistering && (
                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <p className="text-xs text-gray-500 mb-2">Demo Credentials (Click to copy):</p>
                        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                            <button onClick={() => { setEmail('admin@isdn.com'); setPassword('admin123'); }} className="bg-gray-700 p-1 rounded hover:bg-gray-600 text-gray-300">Admin</button>
                            <button onClick={() => { setEmail('shop@gmail.com'); setPassword('shop123'); }} className="bg-gray-700 p-1 rounded hover:bg-gray-600 text-gray-300">Customer</button>
                            <button onClick={() => { setEmail('central@isdn.com'); setPassword('rdc123'); }} className="bg-gray-700 p-1 rounded hover:bg-gray-600 text-gray-300">Logistics</button>
                            <button onClick={() => { setEmail('driver@isdn.com'); setPassword('logistics123'); }} className="bg-gray-700 p-1 rounded hover:bg-gray-600 text-gray-300">RDC Staff</button>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={async () => {
                                    if (!confirm('This requires "Confirm Email" to be DISABLED in Supabase. Proceed?')) return;
                                    setLoading(true);
                                    try {
                                        // Admin
                                        await authService.register({ name: 'Admin User', email: 'admin@isdn.com', password: 'admin123', contactNo: '', address: 'Head Office', role: 'head_office' });
                                        // RDC
                                        await authService.register({ name: 'Central RDC', email: 'central@isdn.com', password: 'rdc123', contactNo: '', address: 'Central', role: 'rdc_staff' });
                                        // Customer
                                        await authService.register({ name: 'Test Shop', email: 'shop@gmail.com', password: 'shop123', contactNo: '07711', address: 'Central', role: 'customer' });
                                        // Logistics
                                        await authService.register({ name: 'Driver', email: 'driver@isdn.com', password: 'logistics123', contactNo: '', address: 'Central', role: 'logistics' });

                                        alert('Demo users seeded! You can now login.');
                                    } catch (e: any) {
                                        alert('Error seeding: ' + e.message);
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                                className="text-xs text-blue-500 hover:text-blue-400 underline"
                            >
                                [Dev] Re-seed Demo Users (Fix Login)
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Login;

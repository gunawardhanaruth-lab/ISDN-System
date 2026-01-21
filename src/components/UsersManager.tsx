import React, { useState, useEffect } from 'react';
import { userService } from '../services/api'; // Ensure this is exported in api.ts
import { Users, Shield, MapPin, Phone } from 'lucide-react';

const UsersManager = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        userService.getAll()
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const roleColors: any = {
        'admin': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        'rdc': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'logistics': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
        'customer': 'bg-green-500/10 text-green-400 border-green-500/20',
    };

    return (
        <div className="space-y-6 animate-fade-in text-white">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="text-blue-400" />
                    User Management
                </h2>
                <div className="text-sm text-gray-400">
                    Total Users: {users.length}
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-700/50 text-gray-400 text-sm uppercase">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Location</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">Loading users...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-500">No users found.</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-750 transition-colors">
                                    <td className="p-4">
                                        <div className="font-medium text-white">{user.name}</div>
                                        <div className="text-xs text-gray-500 font-mono">{user.id.slice(0, 8)}...</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border capitalize ${roleColors[user.role] || 'bg-gray-700 text-gray-400'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-300">
                                        {user.contact_no ? (
                                            <div className="flex items-center gap-1">
                                                <Phone size={14} className="text-gray-500" /> {user.contact_no}
                                            </div>
                                        ) : <span className="text-gray-600">-</span>}
                                    </td>
                                    <td className="p-4 text-gray-300">
                                        {(user.region || user.address) ? (
                                            <div className="flex items-center gap-1">
                                                <MapPin size={14} className="text-gray-500" /> {user.region || user.address}
                                            </div>
                                        ) : <span className="text-gray-600">-</span>}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersManager;

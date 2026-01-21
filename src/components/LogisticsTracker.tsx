import React, { useState, useEffect } from 'react';
import { Region, UserRole, Order } from '../../types';
import { orderService } from '../services/api';
import { Truck, CheckCircle, MapPin, Clock, RefreshCw, Search } from 'lucide-react';

interface LogisticsTrackerProps {
    region: Region;
    userId: string;
}

const LogisticsTracker: React.FC<LogisticsTrackerProps> = ({ region, userId }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'pending' | 'delivered'>('pending');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchOrders = () => {
        setLoading(true);
        orderService.getAll(userId, UserRole.LOGISTICS, region)
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchOrders();
    }, [region, userId]);

    const markAsDelivered = async (orderId: string) => {
        if (!confirm('Confirm delivery for this order?')) return;
        try {
            await orderService.updateStatus(orderId, 'Delivered');
            fetchOrders();
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update order status");
        }
    };

    const filteredOrders = orders.filter(o =>
        (filter === 'pending' ? o.status !== 'Delivered' : o.status === 'Delivered') &&
        o.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Truck className="text-orange-400" />
                    Delivery Tracking: <span className="text-orange-300">{region}</span>
                </h2>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search Order ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-sm text-white focus:outline-none focus:border-orange-500 w-full md:w-48"
                        />
                        <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
                    </div>
                    <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('delivered')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'delivered' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Delivered
                        </button>
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map(order => (
                    <div key={order.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-orange-500/30 transition-colors">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-gray-500">#{order.id.slice(0, 8)}</span>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold border ${order.status === 'Delivered' ? 'bg-green-900/30 text-green-400 border-green-800' :
                                    order.status === 'Dispatched' ? 'bg-blue-900/30 text-blue-400 border-blue-800' :
                                        'bg-yellow-900/30 text-yellow-400 border-yellow-800'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white">{order.customer_name || 'Unknown Customer'}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin size={14} />
                                    <span>{order.region}</span>
                                </div>
                            </div>
                            <div className="text-sm text-gray-300">
                                Total: <span className="font-mono text-orange-400">LKR {order.total_amount?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                            {order.status !== 'Delivered' && (
                                <button
                                    onClick={() => markAsDelivered(order.id)}
                                    className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-green-900/20"
                                >
                                    <CheckCircle size={18} />
                                    Mark Delivered
                                </button>
                            )}
                            <button className="text-sm text-blue-400 hover:text-blue-300 underline">
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredOrders.length === 0 && !loading && (
                <div className="p-12 text-center border border-gray-800 rounded-xl bg-gray-800/50">
                    <Truck className="mx-auto text-gray-600 mb-3" size={48} />
                    <p className="text-gray-500 text-lg">No {filter} deliveries found in {region}.</p>
                </div>
            )}
        </div>
    );
};

export default LogisticsTracker;

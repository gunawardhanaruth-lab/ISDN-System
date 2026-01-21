import React, { useState, useEffect } from 'react';
import { UserRole, Region, OrderStatus } from '../../types';
import { orderService } from '../services/api';
import { ClipboardList, CheckCircle, Truck, AlertCircle, FileText } from 'lucide-react';
import InvoiceView from './InvoiceView';

interface OrdersManagerProps {
    userRole: UserRole;
    region: Region;
    userId: string;
}

const OrdersManager: React.FC<OrdersManagerProps> = ({ userRole, region, userId }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any>(null);
    const [searchId, setSearchId] = useState('');

    const fetchOrders = () => {
        setLoading(true);
        orderService.getAll(userId, userRole, region)
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchOrders();
    }, [userId, userRole, region]);

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            await orderService.updateStatus(orderId, newStatus);
            fetchOrders(); // Refresh
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const statusColors: any = {
        [OrderStatus.PENDING]: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        [OrderStatus.CONFIRMED]: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        [OrderStatus.DISPATCHED]: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        [OrderStatus.DELIVERED]: 'bg-green-500/10 text-green-400 border-green-500/20',
        [OrderStatus.CANCELLED]: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const filteredOrders = orders.filter(order =>
        order.id.toLowerCase().includes(searchId.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Invoice Modal */}
            {selectedInvoiceOrder && (
                <InvoiceView order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <ClipboardList className="text-blue-400" />
                    {userRole === UserRole.RETAIL_CUSTOMER ? 'My Orders' : `Order Requests (${region})`}
                </h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Track Order ID..."
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 pl-10 text-sm text-white focus:outline-none focus:border-blue-500 w-full md:w-64"
                    />
                    <ClipboardList size={16} className="absolute left-3 top-2.5 text-gray-500" />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map(order => (
                    <div key={order.id} className="bg-gray-800 rounded-xl border border-gray-700 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gray-600 transition-all">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-white font-mono font-bold text-lg">#{order.id.slice(0, 8)}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || 'bg-gray-700 text-gray-400'}`}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                {new Date(order.order_date).toLocaleDateString()} • {order.customer_name}
                            </p>
                            <p className="text-blue-400 font-bold mt-1">LKR {order.total_amount.toLocaleString()}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Actions for Staff */}
                            {userRole === UserRole.RDC_STAFF && order.status === 'Pending' && (
                                <button
                                    onClick={() => handleStatusUpdate(order.id, 'Confirmed')}
                                    className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                                >
                                    <CheckCircle size={16} /> Confirm
                                </button>
                            )}
                            {userRole === UserRole.RDC_STAFF && order.status === 'Confirmed' && (
                                <button
                                    onClick={() => handleStatusUpdate(order.id, 'Dispatched')}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                                >
                                    <Truck size={16} /> Dispatch
                                </button>
                            )}

                            {/* Invoice Button */}
                            <button
                                onClick={() => setSelectedInvoiceOrder(order)}
                                className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                                <FileText size={16} /> Invoice
                            </button>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && !loading && (
                    <div className="p-12 text-center text-gray-500 bg-gray-800/50 rounded-xl border border-dashed border-gray-700">
                        <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No orders found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersManager;

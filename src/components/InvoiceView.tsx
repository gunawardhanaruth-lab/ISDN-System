import React, { useRef, useEffect, useState } from 'react';
import { ShoppingBag, Printer, X } from 'lucide-react';
import { User, Order, Region } from '../../types'; // Assuming Order type is available and has details
import { orderService } from '../services/api';

interface InvoiceViewProps {
    order: any; // Using any for now as our Order type might need expanding for full details like customer address if disjoint
    onClose: () => void;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ order: initialOrder, onClose }) => {
    const [order, setOrder] = useState<any>(initialOrder);
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (initialOrder && !initialOrder.items) {
            orderService.getById(initialOrder.id)
                .then(setOrder)
                .catch(console.error);
        }
    }, [initialOrder]);

    const handlePrint = () => {
        const content = printRef.current;
        if (content) {
            const printWindow = window.open('', '', 'height=600,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Invoice</title>');
                printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>'); // Quick styling for print
                printWindow.document.write('</head><body >');
                printWindow.document.write(content.innerHTML);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    if (!order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-white text-gray-900 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header controls */}
                <div className="bg-gray-100 p-4 border-b flex justify-between items-center no-print">
                    <h2 className="font-bold text-lg text-gray-700 flex items-center gap-2">
                        <ShoppingBag size={20} /> Invoice Preview
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <Printer size={16} /> Print
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg text-gray-500">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Printable Content */}
                <div className="p-8 overflow-y-auto" ref={printRef}>
                    <div className="border-b-2 border-gray-800 pb-8 mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-bold tracking-tight text-gray-900">INVOICE</h1>
                                <p className="text-gray-500 mt-1">Tag No: #{order.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-xl font-bold text-gray-800">IslandLink ISDN</h3>
                                <p className="text-sm text-gray-500">123 Logistics Way,<br />Central Region, Sri Lanka</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Bill To</p>
                            <h4 className="font-bold text-lg">{order.customer_name || 'Retail Customer'}</h4>
                            <p className="text-gray-600">{order.customer_email || 'email@example.com'}</p>
                            <p className="text-gray-600">{order.customer_address || order.region || 'Region'}</p>
                        </div>
                        <div className="text-right">
                            <div className="mb-2">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mr-4">Invoice Date:</span>
                                <span className="font-medium">{new Date(order.order_date).toLocaleDateString()}</span>
                            </div>
                            <div className="mb-2">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider mr-4">Status:</span>
                                <span className="font-bold text-blue-600 uppercase">{order.status}</span>
                            </div>
                        </div>
                    </div>

                    <table className="w-full mb-8">
                        <thead>
                            <tr className="bg-gray-50 border-y border-gray-200">
                                <th className="py-3 px-4 text-left font-bold text-gray-600">Item Description</th>
                                <th className="py-3 px-4 text-center font-bold text-gray-600">Quantity</th>
                                <th className="py-3 px-4 text-right font-bold text-gray-600">Price</th>
                                <th className="py-3 px-4 text-right font-bold text-gray-600">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {order.items ? order.items.map((item: any, i: number) => (
                                <tr key={i}>
                                    <td className="py-3 px-4">{item.product_name || 'Product Item'}</td>
                                    <td className="py-3 px-4 text-center">{item.quantity}</td>
                                    <td className="py-3 px-4 text-right">{item.price}</td>
                                    <td className="py-3 px-4 text-right font-medium">{(item.price * item.quantity).toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-gray-500 italic">
                                        Loading invoice details...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="flex justify-end">
                        <div className="w-64 bg-gray-50 p-6 rounded-lg">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">{order.total_amount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Tax (0%)</span>
                                <span>0.00</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-blue-600">LKR {order.total_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm">
                        <p>Thank you for doing business with IslandLink.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceView;

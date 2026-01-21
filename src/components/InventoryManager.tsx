import React, { useState, useEffect } from 'react';
import { Region, Product } from '../../types';
import { productService } from '../services/api';
import { Package, Save, RefreshCw, X, Plus } from 'lucide-react';
import axios from 'axios';

// Note: In a real app, updateStock would be in api.ts. I'll add a quick inline fetch or update api.ts later.
// For now, I'll assume we might need to add an update endpoint.
// Actually, let's stick to reading first, and if I need to update, I'll update api.ts.

interface InventoryManagerProps {
    region: Region;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ region }) => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [error, setError] = useState<string>('');

    const fetchInventory = () => {
        setLoading(true);
        productService.getAll(region)
            .then(data => {
                setProducts(data);
                setLoading(false);
            })
            .catch(console.error);
    };

    useEffect(() => {
        fetchInventory();
    }, [region]);

    const handleEdit = (product: any) => {
        setEditingId(product.id);
        const stock = product.stock_level ?? product.total_stock ?? 0;
        setEditValue(String(stock));
        setError('');
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEditValue(val);

        // Check if value is non-numeric
        if (val && !/^\d+$/.test(val)) {
            setError('Error: Numbers only');
        } else {
            setError('');
        }
    };

    const handleSave = async (productId: string) => {
        if (error) return; // Prevent save if error
        try {
            const numericValue = parseInt(editValue, 10);
            if (isNaN(numericValue)) return;

            await productService.updateStock(productId, region, numericValue);
            setEditingId(null);
            fetchInventory(); // Refresh to confirm
        } catch (err) {
            console.error("Failed to update stock", err);
            alert("Failed to update stock");
        }
    };

    const [showAddModal, setShowAddModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        category: 'Packaged Food',
        price: '',
        stock_level: '',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000',
        description: ''
    });

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await productService.create({
                name: newProduct.name,
                category: newProduct.category as any,
                price: Number(newProduct.price),
                stock_level: Number(newProduct.stock_level),
                image: newProduct.image,
                region: region, // Add region context
                description: newProduct.description
            });
            setShowAddModal(false);
            setNewProduct({
                name: '',
                category: 'Packaged Food',
                price: '',
                stock_level: '',
                image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000',
                description: ''
            });
            fetchInventory();
            alert('Product added successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to add product');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative">
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white">Add New Product</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X /></button>
                        </div>
                        <form onSubmit={handleAddProduct} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Name</label>
                                <input
                                    required
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none transition-colors"
                                    value={newProduct.name}
                                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Category</label>
                                    <select
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none transition-colors"
                                        value={newProduct.category}
                                        onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                                    >
                                        <option>Packaged Food</option>
                                        <option>Beverages</option>
                                        <option>Home Cleaning</option>
                                        <option>Personal Care</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Stock Level</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none transition-colors"
                                        value={newProduct.stock_level}
                                        onChange={e => setNewProduct({ ...newProduct, stock_level: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Price</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none transition-colors"
                                    value={newProduct.price}
                                    onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Image URL</label>
                                <input
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-blue-500 outline-none transition-colors"
                                    value={newProduct.image}
                                    onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                                />
                            </div>
                            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg font-bold transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-blue-500/25">
                                Add Product
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center text-white">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Package className="text-blue-400" />
                    Inventory Management: <span className="text-blue-300">{region}</span>
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="p-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center gap-2 px-4 font-semibold shadow-lg shadow-blue-900/20"
                    >
                        <Plus size={20} /> Add Product
                    </button>
                    <button
                        onClick={fetchInventory}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-gray-300 hover:text-white"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-800/50 border-b border-gray-700 text-gray-400 text-sm uppercase">
                            <th className="p-4">Product Name</th>
                            <th className="p-4">Category</th>
                            <th className="p-4 text-center">Current Stock</th>
                            <th className="p-4 text-center">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 text-gray-300">
                        {products.map(p => {
                            const stock = p.stock_level ?? p.total_stock ?? 0;
                            const isLow = stock < 50;
                            const isEditing = editingId === p.id;

                            return (
                                <tr key={p.id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 font-medium text-white">{p.name}</td>
                                    <td className="p-4">{p.category}</td>
                                    <td className="p-4 text-center font-mono text-lg">
                                        {isEditing ? (
                                            <div className="flex flex-col items-center">
                                                <input
                                                    type="text"
                                                    value={editValue}
                                                    onChange={handleInput}
                                                    className={`w-24 bg-gray-900 border ${error ? 'border-red-500' : 'border-blue-500'} rounded px-2 py-1 text-center text-white focus:outline-none`}
                                                />
                                                {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
                                            </div>
                                        ) : stock}
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${isLow ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                            {isLow ? 'LOW STOCK' : 'IN STOCK'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {isEditing ? (
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleSave(p.id)}
                                                    disabled={!!error || !editValue}
                                                    className={`text-green-400 hover:text-green-300 ${error ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                >
                                                    <Save size={18} />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300"><X size={18} /></button>
                                            </div>
                                        ) : (
                                            <button onClick={() => handleEdit(p)} className="text-blue-400 hover:text-blue-300 text-sm font-medium border border-blue-500/30 px-3 py-1 rounded hover:bg-blue-500/10 transition-all">
                                                Update Stock
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {products.length === 0 && !loading && (
                    <div className="p-8 text-center text-gray-500">No inventory data found.</div>
                )}
            </div>
        </div>
    );
};

export default InventoryManager;

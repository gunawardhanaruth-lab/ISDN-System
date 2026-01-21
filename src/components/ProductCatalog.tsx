import React, { useState, useEffect } from 'react';
import { Product, Region, UserRole } from '../../types';
import { productService, orderService } from '../services/api';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';

interface ProductCatalogProps {
    userRegion: Region;
    userId: string; // Needed for order
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ userRegion, userId }) => {
    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState('');

    useEffect(() => {
        productService.getAll(userRegion !== Region.CENTRAL ? userRegion : undefined)
            .then(setProducts)
            .catch(console.error);
    }, [userRegion]);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const handlePlaceOrder = async () => {
        setPlacingOrder(true);
        try {
            const orderData = {
                customerId: userId,
                items: cart.map(i => ({ id: i.product.id, quantity: i.quantity, price: i.product.price })),
                totalAmount: cartTotal,
                region: userRegion
            };

            await orderService.create(orderData);
            setOrderSuccess(`Order placed successfully! Total: LKR ${cartTotal}`);
            setCart([]);
            setIsCartOpen(false);
            setTimeout(() => setOrderSuccess(''), 5000);
        } catch (err) {
            console.error(err);
            alert('Failed to place order');
        } finally {
            setPlacingOrder(false);
        }
    };

    return (
        <div>
            {orderSuccess && (
                <div className="bg-green-500/10 border border-green-500/50 text-green-200 p-4 rounded-lg mb-6 flex items-center justify-between">
                    <span>{orderSuccess}</span>
                    <button onClick={() => setOrderSuccess('')}><X size={16} /></button>
                </div>
            )}

            {/* Cart Floating Button */}
            <button
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl z-50 flex items-center gap-2 transition-transform hover:scale-105"
            >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{cart.reduce((a, b) => a + b.quantity, 0)}</span>
                )}
            </button>

            {/* Cart Sidebar */}
            {isCartOpen && (
                <div className="fixed inset-y-0 right-0 w-96 bg-gray-800 border-l border-gray-700 shadow-2xl z-50 p-6 flex flex-col transform transition-transform animate-slide-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShoppingCart /> Your Cart
                        </h2>
                        <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white"><X /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4">
                        {cart.length === 0 ? (
                            <p className="text-gray-500 text-center mt-10">Your cart is empty.</p>
                        ) : (
                            cart.map(({ product, quantity }) => (
                                <div key={product.id} className="bg-gray-700/50 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-white">{product.name}</h4>
                                        <p className="text-sm text-blue-400">LKR {product.price} x {quantity}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:bg-gray-600 rounded"><Minus size={14} /></button>
                                        <span className="text-white font-mono">{quantity}</span>
                                        <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:bg-gray-600 rounded"><Plus size={14} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="border-t border-gray-700 pt-4 mt-4">
                        <div className="flex justify-between text-lg font-bold text-white mb-4">
                            <span>Total</span>
                            <span>LKR {cartTotal.toLocaleString()}</span>
                        </div>
                        <button
                            onClick={handlePlaceOrder}
                            disabled={cart.length === 0 || placingOrder}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
                        >
                            {placingOrder ? 'Processing...' : 'Confirm Order'}
                        </button>
                    </div>
                </div>
            )}

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in relative z-10">
                {products.map(product => (
                    <div key={product.id} className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden group hover:border-gray-600 transition-colors flex flex-col">
                        <div className="relative h-48 bg-gray-700">
                            <img
                                src={product.image?.startsWith('/') ? `http://localhost:5173${product.image}` : product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e: any) => e.target.src = 'https://via.placeholder.com/300?text=No+Image'}
                            />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-medium text-white">
                                {product.total_stock ?? product.stock_level ?? 0} in stock
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-white truncate">{product.name}</h3>
                            <p className="text-gray-400 text-sm mb-2">{product.category}</p>
                            <p className="text-blue-400 font-bold text-lg mb-4">LKR {product.price}</p>

                            <button
                                onClick={() => addToCart(product)}
                                className="mt-auto w-full bg-gray-700 hover:bg-blue-600 hover:text-white text-gray-300 font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={16} />
                                Add to Cart
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductCatalog;

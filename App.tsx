import React, { useState, useEffect } from 'react';
import { User, UserRole, Region, Order, Product } from './types';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Truck,
  BarChart3,
  LogOut,
  Menu,
  X,
  ShoppingCart,
} from 'lucide-react';
import { authService, productService, orderService, dashboardService } from './src/services/api';
// Login component is bypassed but kept for import validity if needed later
import Login from './src/components/Login';
import ProductCatalog from './src/components/ProductCatalog';
import UsersManager from './src/components/UsersManager';
import InventoryManager from './src/components/InventoryManager';
import OrdersManager from './src/components/OrdersManager';

const SidebarItem: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </button>
);

const StatCard = ({ title, value, icon: Icon, trend }: { title: string, value: string | number, icon: any, trend?: string }) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      </div>
      <div className="p-3 bg-gray-700/50 rounded-lg text-blue-400">
        <Icon size={24} />
      </div>
    </div>
    {trend && (
      <div className="flex items-center text-sm">
        <span className="text-green-400 font-medium">+{trend}</span>
        <span className="text-gray-500 ml-2">from last month</span>
      </div>
    )}
  </div>
);

// --- Main Views Placeholders ---
const DashboardHO = () => {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    dashboardService.getStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) return <div className="p-8 text-white">Loading Dashboard... (Ensure RLS is disabled or public)</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`LKR ${stats.totalSales || 0}`} icon={BarChart3} trend="12%" />
        <StatCard title="Total Orders" value={stats.totalOrders || 0} icon={ShoppingBag} trend="8%" />
        <StatCard title="Low Stock Items" value={stats.lowStockItems || 0} icon={Package} />
        <StatCard title="Pending Deliveries" value={stats.pendingDeliveries || 0} icon={Truck} />
      </div>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-6">Welcome to Head Office Dashboard</h2>
        <p className="text-gray-400">Real-time data from Supabase Backend (Auth Bypassed).</p>
      </div>
    </div>
  );
};

import LogisticsTracker from './src/components/LogisticsTracker';



// --- Main App Logic ---
function App() {
  // DEV MODE: Login enabled
  const [user, setUser] = useState<User | null>(null);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Auto-redirect based on role change
  useEffect(() => {
    if (user) {
      // console.log('User Role:', user.role, 'Expected Customer:', UserRole.RETAIL_CUSTOMER);
      if (user.role === UserRole.RETAIL_CUSTOMER) setActiveTab('catalog');
      else if (user.role === UserRole.LOGISTICS) setActiveTab('logistics');
      else if (user.role === UserRole.RDC_STAFF) setActiveTab('inventory');
      else setActiveTab('dashboard');
    }
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    // Just reset to null if they really want to see login, or cycle roles?
    // For now, standard logout
    setUser(null);
  };



  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Sidebar items based on role
  const getSidebarItems = () => {
    const items = [];

    if (user.role === UserRole.HEAD_OFFICE) {
      items.push({ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard });
      items.push({ id: 'inventory', label: 'Global Inventory', icon: Package });
      items.push({ id: 'users', label: 'Users Manager', icon: Menu });
      items.push({ id: 'reports', label: 'Reports', icon: BarChart3 });
    }

    if (user.role === UserRole.RDC_STAFF) {
      items.push({ id: 'orders', label: 'Order Requests', icon: ShoppingBag });
      items.push({ id: 'inventory', label: 'My Inventory', icon: Package });
      items.push({ id: 'invoices', label: 'Invoices', icon: BarChart3 });
    }

    if (user.role === UserRole.RETAIL_CUSTOMER) {
      items.push({ id: 'catalog', label: 'Browse Products', icon: ShoppingBag });
      items.push({ id: 'my-orders', label: 'My Orders', icon: Package });
    }

    if (user.role === UserRole.LOGISTICS) {
      items.push({ id: 'logistics', label: 'Deliveries', icon: Truck });
    }

    return items;
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">IslandLink</h1>
              <p className="text-xs text-blue-400 font-medium tracking-wider">ISDN SYSTEM</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {getSidebarItems().map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeTab === item.id}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-red-600/10 hover:text-red-400 rounded-lg transition-all text-sm font-medium text-gray-400"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900">
        <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
            <Menu size={24} />
          </button>

          <div className="flex-1 flex justify-end items-center space-x-4">
            {/* Optional Header controls */}
          </div>
        </header>

        <div className="p-6">
          {activeTab === 'dashboard' && <DashboardHO />}
          {activeTab === 'users' && <UsersManager />}
          {activeTab === 'catalog' && (
            <ProductCatalog userRegion={user.region || Region.CENTRAL} userId={user.id} />
          )}
          {activeTab === 'inventory' && (
            <InventoryManager region={user.region || Region.CENTRAL} />
          )}
          {activeTab === 'orders' && ( // RDC Staff Orders
            <OrdersManager userRole={user.role} region={user.region || Region.CENTRAL} userId={user.id} />
          )}
          {activeTab === 'my-orders' && ( // Customer Orders
            <OrdersManager userRole={user.role} region={user.region || Region.CENTRAL} userId={user.id} />
          )}
          {activeTab === 'logistics' && <LogisticsTracker region={user.region || Region.CENTRAL} userId={user.id} />}
          {activeTab === 'invoices' && <div className="text-white">Invoices (Coming Soon in next step)</div>}
        </div>
      </main>

    </div>
  );
}

export default App;

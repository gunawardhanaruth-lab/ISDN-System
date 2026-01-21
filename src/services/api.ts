
import { supabase } from '../lib/supabaseClient';
import { User, UserRole, Region, Product } from '../../types';

export const authService = {
    login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Fetch profile
        if (data.user) {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                // If profile missing (maybe first time or external auth), return basic user
                return { user: { ...data.user, role: UserRole.RETAIL_CUSTOMER, region: Region.CENTRAL } };
            }
            return { user: profile };
        }
        throw new Error('Login failed');
    },

    register: async (userData: { name: string; email: string; password: string; contactNo: string; address: string; role?: string }) => {
        // 1. Sign up auth user
        const { data, error } = await supabase.auth.signUp({
            email: userData.email,
            password: userData.password,
        });

        if (error) throw error;

        if (data.user) {
            // 2. Create profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        name: userData.name,
                        contact_no: userData.contactNo,
                        address: userData.address,
                        role: userData.role || 'customer', // Use provided role or default
                        region: userData.address // Using address as region for simulation simplicity if valid region
                    }
                ]);

            if (profileError) {
                console.error("Profile creation failed:", profileError);
                // Non-blocking for now, but ideally rollback
            }
        }
        return data;
    },

    logout: async () => {
        await supabase.auth.signOut();
    },
};

export const productService = {
    getAll: async (region?: Region) => {
        let query = supabase
            .from('products')
            .select(`
        *,
        inventory ( stock_level, location )
      `);

        const { data, error } = await query;
        if (error) throw error;

        // Transform data to match frontend expectation (aggregation)
        return data.map((p: any) => {
            let stock = 0;
            if (region) {
                const locInv = p.inventory.find((i: any) => i.location === region);
                stock = locInv ? locInv.stock_level : 0;
            } else {
                stock = p.inventory.reduce((sum: number, i: any) => sum + i.stock_level, 0);
            }
            return { ...p, stock_level: stock, total_stock: stock }; // Normalized fields
        });
    },

    create: async (productData: Omit<Product, 'id' | 'stock'> & { stock_level: number; region: Region }) => {
        // 1. Create Product
        const { data: product, error: productError } = await supabase
            .from('products')
            .insert([{
                name: productData.name,
                category: productData.category,
                price: productData.price,
                image: productData.image,
                description: productData.description
            }])
            .select()
            .single();

        if (productError) throw productError;

        // 2. Create Initial Inventory
        const { error: inventoryError } = await supabase
            .from('inventory')
            .insert([{
                product_id: product.id,
                location: productData.region,
                stock_level: productData.stock_level
            }]);

        if (inventoryError) throw inventoryError;

        return product;
    },

    updateStock: async (productId: string, region: Region, newStock: number) => {
        // Check if inventory record exists
        const { data: existing, error: fetchError } = await supabase
            .from('inventory')
            .select('id')
            .eq('product_id', productId)
            .eq('location', region)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        if (existing) {
            // Update
            const { error } = await supabase
                .from('inventory')
                .update({ stock_level: newStock })
                .eq('id', existing.id);
            if (error) throw error;
        } else {
            // Insert
            const { error } = await supabase
                .from('inventory')
                .insert([{ product_id: productId, location: region, stock_level: newStock }]);
            if (error) throw error;
        }
        return true;
    }
};

export const orderService = {
    create: async (orderData: { customerId: string; items: any[]; totalAmount: number; region: Region }) => {
        // Transaction-like not fully supported in client-side w/o RPC, but doing sequential for prototype

        // 1. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                customer_id: orderData.customerId,
                total_amount: orderData.totalAmount,
                region: orderData.region,
                status: 'Pending'
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Create Order Items
        const items = orderData.items.map((i: any) => ({
            order_id: order.id,
            product_id: i.id,
            quantity: i.quantity,
            price: i.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(items);

        if (itemsError) throw itemsError;

        return { orderId: order.id };
    },

    getAll: async (userId: string, role: UserRole, region?: Region) => {
        let query = supabase
            .from('orders')
            .select(`*, profiles:customer_id ( name )`)
            .order('created_at', { ascending: false });

        if (role === UserRole.RETAIL_CUSTOMER) {
            query = query.eq('customer_id', userId);
        } else if ((role === UserRole.RDC_STAFF || role === UserRole.LOGISTICS) && region) {
            query = query.eq('region', region);
        }

        const { data, error } = await query;
        if (error) throw error;

        return data.map((o: any) => ({
            ...o,
            customer_name: o.profiles?.name || 'Unknown',
            order_date: o.created_at // Map created_at to order_date
        }));
    },

    getById: async (orderId: string) => {
        const { data, error } = await supabase
            .from('orders')
            .select(`
            *,
            profiles:customer_id ( name, email, address, region ),
            order_items ( *, products ( name ) )
        `)
            .eq('id', orderId)
            .single();

        if (error) throw error;

        // Transform nested structure
        const items = data.order_items.map((oi: any) => ({
            ...oi,
            product_name: oi.products?.name
        }));

        return {
            ...data,
            customer_name: data.profiles?.name,
            customer_email: data.profiles?.email, // Note: emails in profiles might not exist if not synced, but using what's there
            customer_address: data.profiles?.address,
            items,
            order_date: data.created_at
        };
    },

    updateStatus: async (orderId: string, status: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', orderId);
        if (error) throw error;
        return true;
    }
};

export const userService = {
    getAll: async () => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('name');

        if (error) throw error;
        return data;
    }
};

export const dashboardService = {
    getStats: async () => {
        // Basic stats via separate queries (efficient enough for prototype)
        const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });

        // Sum total sales (client side for now or RPC) - simpler to just fetch sum if RPC exists, 
        // but for now let's just count orders to be safe or use small limit. 
        // Actually, let's just return mock/real mix or simple counts.

        // Low stock
        const { count: lowStock } = await supabase.from('inventory').select('*', { count: 'exact', head: true }).lt('stock_level', 20);

        // Pending
        const { count: pending } = await supabase.from('orders').select('*', { count: 'exact', head: true }).neq('status', 'Delivered');

        return {
            totalSales: 0, // Need RPC for sum usually
            totalOrders: totalOrders || 0,
            lowStockItems: lowStock || 0,
            pendingDeliveries: pending || 0
        };
    }
}

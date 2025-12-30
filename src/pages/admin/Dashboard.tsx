import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { Card, KPICard } from '../../components/ui/Card';
import { Loading, EmptyState } from '../../components/ui/States';
import { CustomOrder, Product } from '../../types/admin.types';
import productService from '../../services/productService';
import customOrderService from '../../services/customOrderService';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [latestOrders, setLatestOrders] = useState<CustomOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [products, orders] = await Promise.all([
          productService.getProducts(),
          customOrderService.getCustomOrders(),
        ]);

        setRecentProducts(products.slice(0, 5));
        setLatestOrders(orders.slice(0, 5));

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          pendingOrders: orders.filter((o: CustomOrder) => o.status === 'pending').length,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) return <Loading text="Loading dashboard..." />;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            label="Total Products"
            value={stats.totalProducts}
            icon="📦"
            color="blue"
          />
          <KPICard label="Total Orders" value={stats.totalOrders} icon="📋" color="green" />
          <KPICard
            label="Pending Orders"
            value={stats.pendingOrders}
            icon="⏳"
            color="orange"
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Products */}
          <Card title="Recent Products">
            {recentProducts.length === 0 ? (
              <EmptyState message="No products yet" />
            ) : (
              <div className="space-y-3">
                {recentProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{product.title}</p>
                      <p className="text-sm text-gray-600">{product.sku || 'N/A'}</p>
                    </div>
                    <p className="font-semibold text-primary">₹{product.price}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Latest Orders */}
          <Card title="Latest Orders">
            {latestOrders.length === 0 ? (
              <EmptyState message="No orders yet" />
            ) : (
              <div className="space-y-3">
                {latestOrders.map((order) => (
                  <div
                    key={order._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">{order.name}</p>
                      <p className="text-sm text-gray-600">{order.email}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        order.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

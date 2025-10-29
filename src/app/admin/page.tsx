"use client";

import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Package, 
  CreditCard, 
  Users, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  ShoppingCart,
  UserPlus,
  Settings,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from "lucide-react";
import { ProductService } from "@/lib/productService";
import { UserService } from "@/lib/userService";
import Link from "next/link";

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    totalUsers: 0,
    lowStockItems: 0,
    todaySales: 0,
    monthlyGrowth: 0,
    recentTransactions: [] as any[],
    lowStockProducts: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load products to get stats
      const productsResult = await ProductService.getProducts({});
      const usersResult = await UserService.getUsers();
      
      if (productsResult.success && usersResult.success) {
        const products = productsResult.products;
        const users = usersResult.users;
        
        // Calculate low stock items
        const lowStockItems = products.filter((product: any) => 
          product.stock <= product.minStock && product.stock > 0
        );
        
        // Calculate out of stock items
        const outOfStockItems = products.filter((product: any) => product.stock === 0);
        
        // Mock sales data (in real app, this would come from transactions API)
        const mockSales = 125000;
        const mockTodaySales = 8500;
        const mockGrowth = 12.5;
        
        setStats({
          totalSales: mockSales,
          totalProducts: products.length,
          totalUsers: users.length,
          lowStockItems: lowStockItems.length + outOfStockItems.length,
          todaySales: mockTodaySales,
          monthlyGrowth: mockGrowth,
          recentTransactions: [
            { id: 1, type: 'sale', amount: 2500, time: '2 min ago', status: 'completed' },
            { id: 2, type: 'sale', amount: 1800, time: '15 min ago', status: 'completed' },
            { id: 3, type: 'refund', amount: 500, time: '1 hour ago', status: 'processed' },
            { id: 4, type: 'sale', amount: 3200, time: '2 hours ago', status: 'completed' }
          ],
          lowStockProducts: [...lowStockItems, ...outOfStockItems].slice(0, 5)
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { status: "Out of Stock", color: "text-red-600", bgColor: "bg-red-50", icon: AlertTriangle };
    if (stock <= minStock) return { status: "Low Stock", color: "text-yellow-600", bgColor: "bg-yellow-50", icon: Clock };
    return { status: "Good Stock", color: "text-green-600", bgColor: "bg-green-50", icon: CheckCircle };
  };

  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <AdminHeader 
          title="POS Dashboard" 
          subtitle="Your business overview and key metrics"
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  Welcome to your POS System
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Monitor your business performance and manage your operations
                </p>
              </div>
              <Button 
                onClick={loadDashboardData} 
                variant="outline" 
                size="sm"
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Sales */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                  Total Sales
                </CardTitle>
                <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {formatCurrency(stats.totalSales)}
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-600 dark:text-green-400">
                    +{stats.monthlyGrowth}% this month
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Today's Sales */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Today's Sales
                </CardTitle>
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(stats.todaySales)}
                </div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
              </CardContent>
            </Card>

            {/* Products */}
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-purple-200 dark:border-purple-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Total Products
                </CardTitle>
                <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {stats.totalProducts}
                </div>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  In inventory
                </p>
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700 dark:text-orange-300">
                  Stock Alerts
                </CardTitle>
                <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                  {stats.lowStockItems}
                </div>
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  Need attention
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Quick Actions */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/admin/stocks">
                  <Button className="w-full justify-start h-12" variant="outline">
                    <Package className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Manage Products</div>
                      <div className="text-xs text-slate-500">Add, edit, or view products</div>
                    </div>
                  </Button>
                </Link>
                <Link href="/admin/users">
                  <Button className="w-full justify-start h-12" variant="outline">
                    <Users className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">Manage Users</div>
                      <div className="text-xs text-slate-500">Add staff and manage roles</div>
                    </div>
                  </Button>
                </Link>
                <Button className="w-full justify-start h-12" variant="outline">
                  <ShoppingCart className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">New Sale</div>
                    <div className="text-xs text-slate-500">Start a new transaction</div>
                  </div>
                </Button>
                <Button className="w-full justify-start h-12" variant="outline">
                  <BarChart3 className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">View Reports</div>
                    <div className="text-xs text-slate-500">Sales and analytics</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Recent Transactions</span>
                </CardTitle>
                <CardDescription>
                  Latest sales and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-500' : 
                          transaction.status === 'processed' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">
                            {transaction.type === 'sale' ? 'Sale completed' : 'Refund processed'}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {transaction.time}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === 'sale' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'sale' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Low Stock Products */}
          {stats.lowStockProducts.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Low Stock Alert</span>
                </CardTitle>
                <CardDescription>
                  Products that need restocking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.lowStockProducts.map((product: any) => {
                    const stockStatus = getStockStatus(product.stock, product.minStock);
                    const StatusIcon = stockStatus.icon;
                    
                    return (
                      <div key={product.id} className="p-4 border border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {product.name}
                          </h4>
                          <StatusIcon className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            SKU: {product.sku}
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-orange-600">
                              Stock: {product.stock}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.bgColor} ${stockStatus.color}`}>
                              {stockStatus.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Performance Overview</span>
                </CardTitle>
                <CardDescription>
                  Key business metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">Monthly Growth</p>
                      <p className="text-2xl font-bold text-green-600">+{stats.monthlyGrowth}%</p>
                    </div>
                    <ArrowUpRight className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Active Products</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalProducts}</p>
                    </div>
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Users</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.totalUsers}</p>
                    </div>
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>System Status</span>
                </CardTitle>
                <CardDescription>
                  Current system health and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-300">Database</p>
                        <p className="text-sm text-green-600">Connected</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-700 dark:text-green-300">Payment System</p>
                        <p className="text-sm text-green-600">Operational</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-700 dark:text-blue-300">Last Backup</p>
                        <p className="text-sm text-blue-600">2 hours ago</p>
                      </div>
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

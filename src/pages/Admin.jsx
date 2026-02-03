import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import {
  Package, Users, ShoppingCart, DollarSign, Plus, Pencil, Trash2, ArrowLeft,
  Mail, TrendingUp, BarChart3
} from "lucide-react";
import { motion } from "framer-motion";

export default function Admin() {
  const queryClient = useQueryClient();
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', image_url: '', category: 'engine', inventory: 0, featured: false
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ['subscribers'],
    queryFn: () => base44.entities.EmailSubscriber.list('-created_date'),
  });

  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;
  const totalSubscribers = subscribers.filter(s => s.is_active).length;

  const createProduct = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsProductDialogOpen(false);
      resetProductForm();
    }
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsProductDialogOpen(false);
      resetProductForm();
    }
  });

  const deleteProduct = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  });

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProduct.mutate(productToDelete.id);
    }
  };

  const updateOrderStatus = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Order.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] })
  });

  const resetProductForm = () => {
    setProductForm({ name: '', description: '', price: '', image_url: '', category: 'engine', inventory: 0, featured: false });
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      image_url: product.image_url || '',
      category: product.category || 'engine',
      inventory: product.inventory || 0,
      featured: product.featured || false
    });
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = () => {
    const data = {
      ...productForm,
      price: parseFloat(productForm.price),
      inventory: parseInt(productForm.inventory)
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data });
    } else {
      createProduct.mutate(data);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to={createPageUrl("Home")} className="text-2xl font-bold tracking-tight text-neutral-900">
                <span className="text-red-600">AUTO</span>PARTS
              </Link>
              <Badge variant="secondary" className="font-medium">Admin</Badge>
            </div>
            <Link to={createPageUrl("Home")} className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Store
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 lg:px-12 py-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-neutral-900">${totalRevenue.toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Total Orders</p>
                    <p className="text-2xl font-bold text-neutral-900">{totalOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Products</p>
                    <p className="text-2xl font-bold text-neutral-900">{products.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-500">Subscribers</p>
                    <p className="text-2xl font-bold text-neutral-900">{totalSubscribers}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-white border border-neutral-200 p-1 rounded-xl">
            <TabsTrigger value="products" className="rounded-lg px-6">Products</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg px-6">Orders</TabsTrigger>
            <TabsTrigger value="subscribers" className="rounded-lg px-6">Subscribers</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Products</CardTitle>
                <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
                  setIsProductDialogOpen(open);
                  if (!open) resetProductForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="rounded-full bg-neutral-900 hover:bg-neutral-800">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Product Name</Label>
                        <Input
                          value={productForm.name}
                          onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={productForm.description}
                          onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Price ($)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label>Inventory</Label>
                          <Input
                            type="number"
                            value={productForm.inventory}
                            onChange={(e) => setProductForm(prev => ({ ...prev, inventory: e.target.value }))}
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Select
                          value={productForm.category}
                          onValueChange={(value) => setProductForm(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="engine">Engine Parts</SelectItem>
                            <SelectItem value="tires">Tires & Wheels</SelectItem>
                            <SelectItem value="accessories">Accessories</SelectItem>
                            <SelectItem value="tools">Tools</SelectItem>
                            <SelectItem value="brakes">Brakes</SelectItem>
                            <SelectItem value="electrical">Electrical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Image URL</Label>
                        <Input
                          value={productForm.image_url}
                          onChange={(e) => setProductForm(prev => ({ ...prev, image_url: e.target.value }))}
                          className="mt-1.5"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Featured Product</Label>
                        <Switch
                          checked={productForm.featured}
                          onCheckedChange={(checked) => setProductForm(prev => ({ ...prev, featured: checked }))}
                        />
                      </div>
                      <Button onClick={handleSaveProduct} className="w-full bg-neutral-900 hover:bg-neutral-800">
                        {editingProduct ? 'Update Product' : 'Create Product'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(product => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100">
                              <img
                                src={product.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{product.category}</TableCell>
                        <TableCell>${product.price?.toFixed(2)}</TableCell>
                        <TableCell>{product.inventory}</TableCell>
                        <TableCell>
                          {product.featured && <Badge className="bg-amber-100 text-amber-800">Featured</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(product)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-neutral-500">{order.customer_email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.created_date && format(new Date(order.created_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="font-medium">${order.total?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(status) => updateOrderStatus.mutate({ id: order.id, status })}
                          >
                            <SelectTrigger className="w-32">
                              <Badge className={statusColors[order.status]}>{order.status}</Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">{order.payment_method}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Email Subscribers</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Subscribed</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map(subscriber => (
                      <TableRow key={subscriber.id}>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell className="capitalize">{subscriber.source}</TableCell>
                        <TableCell>
                          {subscriber.subscribed_at && format(new Date(subscriber.subscribed_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge className={subscriber.is_active ? 'bg-green-100 text-green-800' : 'bg-neutral-100 text-neutral-800'}>
                            {subscriber.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-neutral-600">
              Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setProductToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

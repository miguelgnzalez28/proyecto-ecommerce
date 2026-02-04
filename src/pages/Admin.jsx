import React, { useState } from 'react';
import { api } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/toaster';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Package, ShoppingCart, DollarSign, Plus, Pencil, Trash2, ArrowLeft,
  Mail, Download, Eye, Settings, MessageSquare, FileText, Building2,
  Globe, Users
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Admin() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('products');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isExternalOrderDialogOpen, setIsExternalOrderDialogOpen] = useState(false);
  const [isChatbotDialogOpen, setIsChatbotDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingChatbotResponse, setEditingChatbotResponse] = useState(null);
  
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', price_wholesale: '', image_url: '',
    category: 'engine', inventory: 0, featured: false, sale_type: 'both', min_wholesale_qty: 10
  });

  const [externalOrderForm, setExternalOrderForm] = useState({
    platform: 'mercadolibre', external_order_id: '', customer_name: '',
    customer_email: '', customer_phone: '', total: '', notes: '',
    items: [{ product_name: '', quantity: 1, price: 0, sale_type: 'detal' }]
  });

  const [chatbotForm, setChatbotForm] = useState({
    keywords: '', response: '', redirect_whatsapp: false, active: true
  });

  const [bankForm, setBankForm] = useState({
    bank_name: '', account_number: '', account_holder: '',
    account_type: '', identification: '', phone: ''
  });

  const [companyForm, setCompanyForm] = useState({
    name: '', address: '', phone: '', email: '', rif: '', logo_url: '', whatsapp_number: ''
  });

  // Queries
  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.products.list(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.orders.list(),
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ['subscribers'],
    queryFn: () => api.subscribers.list(),
  });

  const { data: chatbotResponses = [] } = useQuery({
    queryKey: ['chatbotResponses'],
    queryFn: () => api.chatbot.getResponses(),
  });

  const { data: stats = {} } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.stats.get(),
  });

  const { data: bankConfig = {} } = useQuery({
    queryKey: ['bankConfig'],
    queryFn: async () => {
      const config = await api.config.getBank();
      setBankForm(config);
      return config;
    },
  });

  const { data: companyConfig = {} } = useQuery({
    queryKey: ['companyConfig'],
    queryFn: async () => {
      const config = await api.config.getCompany();
      setCompanyForm(config);
      return config;
    },
  });

  // Mutations
  const createProduct = useMutation({
    mutationFn: (data) => api.products.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsProductDialogOpen(false);
      resetProductForm();
      toast('Producto creado exitosamente', 'success');
    },
    onError: (error) => toast(error.message, 'error')
  });

  const updateProduct = useMutation({
    mutationFn: ({ id, data }) => api.products.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsProductDialogOpen(false);
      resetProductForm();
      toast('Producto actualizado', 'success');
    },
    onError: (error) => toast(error.message, 'error')
  });

  const deleteProduct = useMutation({
    mutationFn: (id) => api.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      toast('Producto eliminado', 'success');
    },
    onError: (error) => toast(error.message, 'error')
  });

  const updateOrder = useMutation({
    mutationFn: ({ id, data }) => api.orders.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast('Pedido actualizado', 'success');
    },
    onError: (error) => toast(error.message, 'error')
  });

  const createExternalOrder = useMutation({
    mutationFn: (data) => api.orders.createExternal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setIsExternalOrderDialogOpen(false);
      resetExternalOrderForm();
      toast('Pedido externo creado', 'success');
    },
    onError: (error) => toast(error.message, 'error')
  });

  const updateBankConfig = useMutation({
    mutationFn: (data) => api.config.updateBank(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankConfig'] });
      toast('Datos bancarios actualizados', 'success');
    },
    onError: (error) => toast(error.message, 'error')
  });

  const updateCompanyConfig = useMutation({
    mutationFn: (data) => api.config.updateCompany(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyConfig'] });
      toast('Datos de empresa actualizados', 'success');
    },
    onError: (error) => toast(error.message, 'error')
  });

  const createChatbotResponse = useMutation({
    mutationFn: (data) => api.chatbot.createResponse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbotResponses'] });
      setIsChatbotDialogOpen(false);
      resetChatbotForm();
      toast('Respuesta creada', 'success');
    },
    onError: (error) => toast(error.message, 'error')
  });

  const updateChatbotResponse = useMutation({
    mutationFn: ({ id, data }) => api.chatbot.updateResponse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbotResponses'] });
      setIsChatbotDialogOpen(false);
      resetChatbotForm();
      toast('Respuesta actualizada', 'success');
    },
    onError: (error) => toast(error.message, 'error')
  });

  const deleteChatbotResponse = useMutation({
    mutationFn: (id) => api.chatbot.deleteResponse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbotResponses'] });
      toast('Respuesta eliminada', 'success');
    },
    onError: (error) => toast(error.message, 'error')
  });

  // Form handlers
  const resetProductForm = () => {
    setProductForm({
      name: '', description: '', price: '', price_wholesale: '', image_url: '',
      category: 'engine', inventory: 0, featured: false, sale_type: 'both', min_wholesale_qty: 10
    });
    setEditingProduct(null);
  };

  const resetExternalOrderForm = () => {
    setExternalOrderForm({
      platform: 'mercadolibre', external_order_id: '', customer_name: '',
      customer_email: '', customer_phone: '', total: '', notes: '',
      items: [{ product_name: '', quantity: 1, price: 0, sale_type: 'detal' }]
    });
  };

  const resetChatbotForm = () => {
    setChatbotForm({ keywords: '', response: '', redirect_whatsapp: false, active: true });
    setEditingChatbotResponse(null);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      price_wholesale: product.price_wholesale?.toString() || '',
      image_url: product.image_url || '',
      category: product.category || 'engine',
      inventory: product.inventory || 0,
      featured: product.featured || false,
      sale_type: product.sale_type || 'both',
      min_wholesale_qty: product.min_wholesale_qty || 10
    });
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = () => {
    const data = {
      ...productForm,
      price: parseFloat(productForm.price),
      price_wholesale: productForm.price_wholesale ? parseFloat(productForm.price_wholesale) : null,
      inventory: parseInt(productForm.inventory),
      min_wholesale_qty: parseInt(productForm.min_wholesale_qty)
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data });
    } else {
      createProduct.mutate(data);
    }
  };

  const handleEditChatbotResponse = (resp) => {
    setEditingChatbotResponse(resp);
    setChatbotForm({
      keywords: resp.keywords?.join(', ') || '',
      response: resp.response || '',
      redirect_whatsapp: resp.redirect_whatsapp || false,
      active: resp.active !== false
    });
    setIsChatbotDialogOpen(true);
  };

  const handleSaveChatbotResponse = () => {
    const data = {
      keywords: chatbotForm.keywords.split(',').map(k => k.trim()).filter(k => k),
      response: chatbotForm.response,
      redirect_whatsapp: chatbotForm.redirect_whatsapp,
      active: chatbotForm.active
    };

    if (editingChatbotResponse) {
      updateChatbotResponse.mutate({ id: editingChatbotResponse.id, data });
    } else {
      createChatbotResponse.mutate(data);
    }
  };

  const handleCreateExternalOrder = () => {
    const total = externalOrderForm.total ? parseFloat(externalOrderForm.total) :
      externalOrderForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    createExternalOrder.mutate({
      platform: externalOrderForm.platform,
      external_order_id: externalOrderForm.external_order_id,
      customer_name: externalOrderForm.customer_name,
      customer_email: externalOrderForm.customer_email || undefined,
      customer_phone: externalOrderForm.customer_phone,
      items: externalOrderForm.items.map(item => ({
        product_id: 'external',
        product_name: item.product_name,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        sale_type: item.sale_type
      })),
      total,
      notes: externalOrderForm.notes
    });
  };

  const statusColors = {
    pending: 'badge-pending',
    paid: 'badge-paid',
    shipped: 'badge-shipped',
    delivered: 'badge-delivered',
    cancelled: 'badge-cancelled'
  };

  const sourceLabels = {
    web: 'Web',
    mercadolibre: 'MercadoLibre',
    marketplace: 'Marketplace'
  };

  return (
    <div className="min-h-screen bg-background" data-testid="admin-page">
      {/* Header */}
      <header className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-600 flex items-center justify-center">
                  <span className="text-lg font-bold text-white font-teko">A</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-white font-teko">
                  AUTO<span className="text-red-600">PARTS</span>
                </span>
              </Link>
              <Badge className="bg-red-600/20 text-red-500 border-0 font-bold uppercase">Admin</Badge>
            </div>
            <Link to={createPageUrl('Home')} className="text-sm text-zinc-500 hover:text-white flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver a la Tienda
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 uppercase tracking-wider">Ingresos</p>
                    <p className="text-2xl font-bold text-white">${(stats.total_revenue || 0).toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-600/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 uppercase tracking-wider">Pedidos</p>
                    <p className="text-2xl font-bold text-white">{stats.total_orders || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600/20 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 uppercase tracking-wider">Productos</p>
                    <p className="text-2xl font-bold text-white">{stats.total_products || products.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-600/20 flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 uppercase tracking-wider">Suscriptores</p>
                    <p className="text-2xl font-bold text-white">{stats.total_subscribers || subscribers.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-600/20 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-none flex-wrap h-auto">
            <TabsTrigger value="products" className="rounded-none data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase tracking-wider text-xs">
              <Package className="w-4 h-4 mr-2" />Productos
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-none data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase tracking-wider text-xs">
              <ShoppingCart className="w-4 h-4 mr-2" />Pedidos
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="rounded-none data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase tracking-wider text-xs">
              <MessageSquare className="w-4 h-4 mr-2" />Chatbot
            </TabsTrigger>
            <TabsTrigger value="config" className="rounded-none data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase tracking-wider text-xs">
              <Settings className="w-4 h-4 mr-2" />Config
            </TabsTrigger>
            <TabsTrigger value="subscribers" className="rounded-none data-[state=active]:bg-red-600 data-[state=active]:text-white uppercase tracking-wider text-xs">
              <Users className="w-4 h-4 mr-2" />Suscriptores
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white font-teko uppercase tracking-wider">Productos</CardTitle>
                <Dialog open={isProductDialogOpen} onOpenChange={(open) => {
                  setIsProductDialogOpen(open);
                  if (!open) resetProductForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700 rounded-none uppercase tracking-wider font-bold" data-testid="add-product-btn">
                      <Plus className="w-4 h-4 mr-2" />Agregar Producto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-white font-teko uppercase tracking-wider">
                        {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                      <div>
                        <Label className="text-zinc-400">Nombre</Label>
                        <Input value={productForm.name} onChange={(e) => setProductForm(p => ({ ...p, name: e.target.value }))}
                          className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                      </div>
                      <div>
                        <Label className="text-zinc-400">Descripción</Label>
                        <Textarea value={productForm.description} onChange={(e) => setProductForm(p => ({ ...p, description: e.target.value }))}
                          className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-zinc-400">Precio Detal ($)</Label>
                          <Input type="number" step="0.01" value={productForm.price}
                            onChange={(e) => setProductForm(p => ({ ...p, price: e.target.value }))}
                            className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                        </div>
                        <div>
                          <Label className="text-zinc-400">Precio Mayor ($)</Label>
                          <Input type="number" step="0.01" value={productForm.price_wholesale}
                            onChange={(e) => setProductForm(p => ({ ...p, price_wholesale: e.target.value }))}
                            className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-zinc-400">Inventario</Label>
                          <Input type="number" value={productForm.inventory}
                            onChange={(e) => setProductForm(p => ({ ...p, inventory: e.target.value }))}
                            className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                        </div>
                        <div>
                          <Label className="text-zinc-400">Mín. Mayor</Label>
                          <Input type="number" value={productForm.min_wholesale_qty}
                            onChange={(e) => setProductForm(p => ({ ...p, min_wholesale_qty: e.target.value }))}
                            className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-zinc-400">Categoría</Label>
                          <Select value={productForm.category} onValueChange={(v) => setProductForm(p => ({ ...p, category: v }))}>
                            <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              <SelectItem value="engine" className="text-white">Motor</SelectItem>
                              <SelectItem value="brakes" className="text-white">Frenos</SelectItem>
                              <SelectItem value="suspension" className="text-white">Suspensión</SelectItem>
                              <SelectItem value="electrical" className="text-white">Eléctrico</SelectItem>
                              <SelectItem value="tires" className="text-white">Neumáticos</SelectItem>
                              <SelectItem value="tools" className="text-white">Herramientas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-zinc-400">Tipo de Venta</Label>
                          <Select value={productForm.sale_type} onValueChange={(v) => setProductForm(p => ({ ...p, sale_type: v }))}>
                            <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              <SelectItem value="both" className="text-white">Ambos</SelectItem>
                              <SelectItem value="detal" className="text-white">Solo Detal</SelectItem>
                              <SelectItem value="mayor" className="text-white">Solo Mayor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label className="text-zinc-400">URL de Imagen</Label>
                        <Input value={productForm.image_url} onChange={(e) => setProductForm(p => ({ ...p, image_url: e.target.value }))}
                          className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" placeholder="https://..." />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-zinc-400">Destacado</Label>
                        <Switch checked={productForm.featured}
                          onCheckedChange={(c) => setProductForm(p => ({ ...p, featured: c }))} />
                      </div>
                      <Button onClick={handleSaveProduct} className="w-full bg-red-600 hover:bg-red-700 rounded-none uppercase tracking-wider font-bold">
                        {editingProduct ? 'Actualizar' : 'Crear'} Producto
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-500">Producto</TableHead>
                      <TableHead className="text-zinc-500">Categoría</TableHead>
                      <TableHead className="text-zinc-500">Precios</TableHead>
                      <TableHead className="text-zinc-500">Stock</TableHead>
                      <TableHead className="text-zinc-500">Tipo</TableHead>
                      <TableHead className="text-right text-zinc-500">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map(product => (
                      <TableRow key={product.id} className="border-zinc-800">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-zinc-800">
                              <img src={product.image_url || 'https://images.unsplash.com/photo-1689204778500-329b194714f8?w=100'}
                                alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <span className="font-medium text-white">{product.name}</span>
                              {product.featured && <Badge className="ml-2 bg-amber-600/20 text-amber-500 border-0">Destacado</Badge>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-400 capitalize">{product.category}</TableCell>
                        <TableCell>
                          <div className="text-white">${product.price?.toFixed(2)}</div>
                          {product.price_wholesale && (
                            <div className="text-xs text-zinc-500">Mayor: ${product.price_wholesale?.toFixed(2)}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-zinc-400">{product.inventory}</TableCell>
                        <TableCell>
                          <Badge className="bg-zinc-800 text-zinc-400 border-0 capitalize">{product.sale_type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditProduct(product)}>
                            <Pencil className="w-4 h-4 text-zinc-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setProductToDelete(product); setIsDeleteDialogOpen(true); }}>
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
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white font-teko uppercase tracking-wider">Pedidos</CardTitle>
                <Dialog open={isExternalOrderDialogOpen} onOpenChange={(open) => {
                  setIsExternalOrderDialogOpen(open);
                  if (!open) resetExternalOrderForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-zinc-800 hover:bg-zinc-700 rounded-none uppercase tracking-wider font-bold" data-testid="add-external-order-btn">
                      <Globe className="w-4 h-4 mr-2" />Pedido Externo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-white font-teko uppercase tracking-wider">
                        Registrar Pedido Externo
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-zinc-400">Plataforma</Label>
                          <Select value={externalOrderForm.platform}
                            onValueChange={(v) => setExternalOrderForm(f => ({ ...f, platform: v }))}>
                            <SelectTrigger className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              <SelectItem value="mercadolibre" className="text-white">MercadoLibre</SelectItem>
                              <SelectItem value="marketplace" className="text-white">Marketplace</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-zinc-400">ID Externo</Label>
                          <Input value={externalOrderForm.external_order_id}
                            onChange={(e) => setExternalOrderForm(f => ({ ...f, external_order_id: e.target.value }))}
                            className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-zinc-400">Nombre del Cliente</Label>
                        <Input value={externalOrderForm.customer_name}
                          onChange={(e) => setExternalOrderForm(f => ({ ...f, customer_name: e.target.value }))}
                          className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-zinc-400">Email</Label>
                          <Input type="email" value={externalOrderForm.customer_email}
                            onChange={(e) => setExternalOrderForm(f => ({ ...f, customer_email: e.target.value }))}
                            className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                        </div>
                        <div>
                          <Label className="text-zinc-400">Teléfono</Label>
                          <Input value={externalOrderForm.customer_phone}
                            onChange={(e) => setExternalOrderForm(f => ({ ...f, customer_phone: e.target.value }))}
                            className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-zinc-400">Total ($)</Label>
                        <Input type="number" step="0.01" value={externalOrderForm.total}
                          onChange={(e) => setExternalOrderForm(f => ({ ...f, total: e.target.value }))}
                          className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                      </div>
                      <div>
                        <Label className="text-zinc-400">Notas</Label>
                        <Textarea value={externalOrderForm.notes}
                          onChange={(e) => setExternalOrderForm(f => ({ ...f, notes: e.target.value }))}
                          className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                      </div>
                      <Button onClick={handleCreateExternalOrder}
                        className="w-full bg-red-600 hover:bg-red-700 rounded-none uppercase tracking-wider font-bold">
                        Registrar Pedido
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-500">Pedido</TableHead>
                      <TableHead className="text-zinc-500">Cliente</TableHead>
                      <TableHead className="text-zinc-500">Total</TableHead>
                      <TableHead className="text-zinc-500">Estado</TableHead>
                      <TableHead className="text-zinc-500">Pago</TableHead>
                      <TableHead className="text-zinc-500">Origen</TableHead>
                      <TableHead className="text-right text-zinc-500">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map(order => (
                      <TableRow key={order.id} className="border-zinc-800">
                        <TableCell className="font-mono text-sm text-white">
                          {order.order_id?.slice(0, 15) || order.id?.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{order.customer_name}</p>
                            <p className="text-sm text-zinc-500">{order.customer_email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-white">${order.total?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Select value={order.status} onValueChange={(status) => updateOrder.mutate({ id: order.order_id || order.id, data: { status } })}>
                            <SelectTrigger className="w-32 bg-transparent border-0">
                              <Badge className={statusColors[order.status]}>{order.status}</Badge>
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              <SelectItem value="pending" className="text-white">Pendiente</SelectItem>
                              <SelectItem value="paid" className="text-white">Pagado</SelectItem>
                              <SelectItem value="shipped" className="text-white">Enviado</SelectItem>
                              <SelectItem value="delivered" className="text-white">Entregado</SelectItem>
                              <SelectItem value="cancelled" className="text-white">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select value={order.payment_status}
                            onValueChange={(payment_status) => updateOrder.mutate({ id: order.order_id || order.id, data: { payment_status } })}>
                            <SelectTrigger className="w-32 bg-transparent border-0">
                              <Badge className={order.payment_status === 'paid' ? 'badge-paid' : 'badge-pending'}>
                                {order.payment_status}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              <SelectItem value="pending" className="text-white">Pendiente</SelectItem>
                              <SelectItem value="paid" className="text-white">Pagado</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-zinc-800 text-zinc-400 border-0">
                            {sourceLabels[order.source] || order.source}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <a href={api.orders.getPdfUrl(order.order_id || order.id, 'ticket')} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" title="Descargar Ticket">
                              <FileText className="w-4 h-4 text-zinc-500" />
                            </Button>
                          </a>
                          <a href={api.orders.getPdfUrl(order.order_id || order.id, 'delivery')} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" title="Nota de Entrega">
                              <Download className="w-4 h-4 text-zinc-500" />
                            </Button>
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chatbot Tab */}
          <TabsContent value="chatbot">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white font-teko uppercase tracking-wider">Respuestas del Chatbot</CardTitle>
                <Dialog open={isChatbotDialogOpen} onOpenChange={(open) => {
                  setIsChatbotDialogOpen(open);
                  if (!open) resetChatbotForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700 rounded-none uppercase tracking-wider font-bold">
                      <Plus className="w-4 h-4 mr-2" />Nueva Respuesta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-white font-teko uppercase tracking-wider">
                        {editingChatbotResponse ? 'Editar Respuesta' : 'Nueva Respuesta'}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label className="text-zinc-400">Palabras Clave (separadas por coma)</Label>
                        <Input value={chatbotForm.keywords}
                          onChange={(e) => setChatbotForm(f => ({ ...f, keywords: e.target.value }))}
                          className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none"
                          placeholder="precio, costo, cuanto" />
                      </div>
                      <div>
                        <Label className="text-zinc-400">Respuesta</Label>
                        <Textarea value={chatbotForm.response}
                          onChange={(e) => setChatbotForm(f => ({ ...f, response: e.target.value }))}
                          className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" rows={3} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-zinc-400">Redirigir a WhatsApp</Label>
                        <Switch checked={chatbotForm.redirect_whatsapp}
                          onCheckedChange={(c) => setChatbotForm(f => ({ ...f, redirect_whatsapp: c }))} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-zinc-400">Activa</Label>
                        <Switch checked={chatbotForm.active}
                          onCheckedChange={(c) => setChatbotForm(f => ({ ...f, active: c }))} />
                      </div>
                      <Button onClick={handleSaveChatbotResponse}
                        className="w-full bg-red-600 hover:bg-red-700 rounded-none uppercase tracking-wider font-bold">
                        {editingChatbotResponse ? 'Actualizar' : 'Crear'} Respuesta
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-500">Palabras Clave</TableHead>
                      <TableHead className="text-zinc-500">Respuesta</TableHead>
                      <TableHead className="text-zinc-500">WhatsApp</TableHead>
                      <TableHead className="text-zinc-500">Estado</TableHead>
                      <TableHead className="text-right text-zinc-500">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chatbotResponses.map(resp => (
                      <TableRow key={resp.id} className="border-zinc-800">
                        <TableCell className="text-white">
                          <div className="flex flex-wrap gap-1">
                            {resp.keywords?.map((kw, i) => (
                              <Badge key={i} className="bg-zinc-800 text-zinc-400 border-0">{kw}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-400 max-w-xs truncate">{resp.response}</TableCell>
                        <TableCell>
                          {resp.redirect_whatsapp ? (
                            <Badge className="badge-paid">Sí</Badge>
                          ) : (
                            <Badge className="bg-zinc-800 text-zinc-500 border-0">No</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={resp.active ? 'badge-delivered' : 'badge-cancelled'}>
                            {resp.active ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleEditChatbotResponse(resp)}>
                            <Pencil className="w-4 h-4 text-zinc-500" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteChatbotResponse.mutate(resp.id)}>
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

          {/* Config Tab */}
          <TabsContent value="config">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Bank Config */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white font-teko uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-red-500" />
                    Datos Bancarios
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-zinc-400">Banco</Label>
                    <Input value={bankForm.bank_name || ''}
                      onChange={(e) => setBankForm(f => ({ ...f, bank_name: e.target.value }))}
                      className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none"
                      data-testid="config-bank-name" />
                  </div>
                  <div>
                    <Label className="text-zinc-400">Número de Cuenta</Label>
                    <Input value={bankForm.account_number || ''}
                      onChange={(e) => setBankForm(f => ({ ...f, account_number: e.target.value }))}
                      className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none"
                      data-testid="config-account-number" />
                  </div>
                  <div>
                    <Label className="text-zinc-400">Titular</Label>
                    <Input value={bankForm.account_holder || ''}
                      onChange={(e) => setBankForm(f => ({ ...f, account_holder: e.target.value }))}
                      className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                  </div>
                  <div>
                    <Label className="text-zinc-400">Tipo de Cuenta</Label>
                    <Input value={bankForm.account_type || ''}
                      onChange={(e) => setBankForm(f => ({ ...f, account_type: e.target.value }))}
                      className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none"
                      placeholder="Corriente / Ahorro" />
                  </div>
                  <div>
                    <Label className="text-zinc-400">Cédula/RIF</Label>
                    <Input value={bankForm.identification || ''}
                      onChange={(e) => setBankForm(f => ({ ...f, identification: e.target.value }))}
                      className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                  </div>
                  <Button onClick={() => updateBankConfig.mutate(bankForm)}
                    className="w-full bg-red-600 hover:bg-red-700 rounded-none uppercase tracking-wider font-bold"
                    data-testid="save-bank-config-btn">
                    Guardar Datos Bancarios
                  </Button>
                </CardContent>
              </Card>

              {/* Company Config */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white font-teko uppercase tracking-wider flex items-center gap-2">
                    <Settings className="w-5 h-5 text-red-500" />
                    Datos de Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-zinc-400">Nombre de la Empresa</Label>
                    <Input value={companyForm.name || ''}
                      onChange={(e) => setCompanyForm(f => ({ ...f, name: e.target.value }))}
                      className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none"
                      data-testid="config-company-name" />
                  </div>
                  <div>
                    <Label className="text-zinc-400">Dirección</Label>
                    <Input value={companyForm.address || ''}
                      onChange={(e) => setCompanyForm(f => ({ ...f, address: e.target.value }))}
                      className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-zinc-400">Teléfono</Label>
                      <Input value={companyForm.phone || ''}
                        onChange={(e) => setCompanyForm(f => ({ ...f, phone: e.target.value }))}
                        className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                    </div>
                    <div>
                      <Label className="text-zinc-400">RIF</Label>
                      <Input value={companyForm.rif || ''}
                        onChange={(e) => setCompanyForm(f => ({ ...f, rif: e.target.value }))}
                        className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-zinc-400">Email</Label>
                    <Input type="email" value={companyForm.email || ''}
                      onChange={(e) => setCompanyForm(f => ({ ...f, email: e.target.value }))}
                      className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none" />
                  </div>
                  <div>
                    <Label className="text-zinc-400">WhatsApp (para redirección del chatbot)</Label>
                    <Input value={companyForm.whatsapp_number || ''}
                      onChange={(e) => setCompanyForm(f => ({ ...f, whatsapp_number: e.target.value }))}
                      className="mt-1 bg-zinc-800 border-zinc-700 text-white rounded-none"
                      placeholder="+58424XXXXXXX"
                      data-testid="config-whatsapp" />
                  </div>
                  <Button onClick={() => updateCompanyConfig.mutate(companyForm)}
                    className="w-full bg-red-600 hover:bg-red-700 rounded-none uppercase tracking-wider font-bold"
                    data-testid="save-company-config-btn">
                    Guardar Datos de Empresa
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white font-teko uppercase tracking-wider">Suscriptores</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800">
                      <TableHead className="text-zinc-500">Email</TableHead>
                      <TableHead className="text-zinc-500">Fuente</TableHead>
                      <TableHead className="text-zinc-500">Fecha</TableHead>
                      <TableHead className="text-zinc-500">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map(sub => (
                      <TableRow key={sub.id} className="border-zinc-800">
                        <TableCell className="font-medium text-white">{sub.email}</TableCell>
                        <TableCell className="text-zinc-400 capitalize">{sub.source}</TableCell>
                        <TableCell className="text-zinc-500">{sub.created_at?.slice(0, 10)}</TableCell>
                        <TableCell>
                          <Badge className={sub.is_active ? 'badge-delivered' : 'badge-cancelled'}>
                            {sub.is_active ? 'Activo' : 'Inactivo'}
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
        <DialogContent className="max-w-md bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white font-teko uppercase tracking-wider">Eliminar Producto</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-zinc-400">
              ¿Estás seguro de que deseas eliminar <strong className="text-white">{productToDelete?.name}</strong>? Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => { setIsDeleteDialogOpen(false); setProductToDelete(null); }}
              className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 rounded-none">
              Cancelar
            </Button>
            <Button onClick={() => deleteProduct.mutate(productToDelete?.id)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-none"
              disabled={deleteProduct.isPending}>
              {deleteProduct.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Sales Management</h2>
        <p class="text-gray-600">Track your sales and profits</p>
      </div>
      
      <div class="flex gap-3">
        <button @click="showAddModal = true" class="btn-primary flex items-center">
          <PlusIcon class="h-5 w-5 mr-2" />
          Record Sale
        </button>
        <button @click="exportSales" class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center">
          <ArrowDownTrayIcon class="h-5 w-5 mr-2" />
          Export
        </button>
      </div>
    </div>

    <!-- Sales Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="card">
        <p class="text-sm text-gray-500">Today's Sales</p>
        <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(stats.todaySales) }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-500">This Week</p>
        <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(stats.weekSales) }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-500">This Month</p>
        <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(stats.monthSales) }}</p>
      </div>
      <div class="card">
        <p class="text-sm text-gray-500">Total Profit</p>
        <p class="text-2xl font-bold text-green-600">{{ formatCurrency(stats.totalProfit) }}</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="flex space-x-8">
        <button 
          v-for="tab in tabs" 
          :key="tab.value"
          @click="currentTab = tab.value"
          class="py-2 px-1 border-b-2 font-medium text-sm"
          :class="currentTab === tab.value 
            ? 'border-primary text-primary' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Sales Table -->
    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th class="px-4 py-3 text-left">Date</th>
              <th class="px-4 py-3 text-left">Product</th>
              <th class="px-4 py-3 text-left">Buyer</th>
              <th class="px-4 py-3 text-left">Platform</th>
              <th class="px-4 py-3 text-right">Price</th>
              <th class="px-4 py-3 text-right">Profit</th>
              <th class="px-4 py-3 text-center">Status</th>
              <th class="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="sale in filteredSales" :key="sale.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm">{{ formatDate(sale.sale_date) }}</td>
              <td class="px-4 py-3">
                <div class="font-medium">{{ sale.products?.name }}</div>
                <div class="text-xs text-gray-500">{{ sale.products?.hint || '' }}</div>
              </td>
              <td class="px-4 py-3">{{ sale.buyer_name || 'N/A' }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs rounded-full" :class="getPlatformClass(sale.platform)">
                  {{ sale.platform || 'Direct' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right font-medium">{{ formatCurrency(sale.selling_price) }}</td>
              <td class="px-4 py-3 text-right">
                <span :class="getProfitClass(sale)">
                  {{ formatCurrency(calculateProfit(sale)) }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <select v-model="sale.status" @change="updateStatus(sale)" 
                        class="text-xs rounded-full px-2 py-1 border-0"
                        :class="getStatusSelectClass(sale.status)">
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td class="px-4 py-3 text-center">
                <button @click="editSale(sale)" class="text-blue-600 hover:text-blue-800 mx-1">
                  <PencilIcon class="h-4 w-4" />
                </button>
                <button @click="deleteSale(sale.id)" class="text-red-600 hover:text-red-800 mx-1">
                  <TrashIcon class="h-4 w-4" />
                </button>
              </td>
            </tr>
            <tr v-if="filteredSales.length === 0">
              <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                No sales found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Sale Modal -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">{{ editingSale ? 'Edit' : 'Record' }} Sale</h3>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700">
              <XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <form @submit.prevent="saveSale" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Select Product *</label>
              <select v-model="saleForm.product_id" required class="input-field">
                <option value="">Choose a product</option>
                <option v-for="product in availableProducts" :key="product.id" :value="product.id">
                  {{ product.name }} ({{ product.quantity }} in stock) - {{ formatCurrency(product.purchase_price) }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
              <input v-model="saleForm.selling_price" type="number" step="0.01" required class="input-field">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
              <input v-model="saleForm.buyer_name" type="text" class="input-field">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <select v-model="saleForm.platform" class="input-field">
                <option value="">Direct</option>
                <option value="xhs">Xiaohongshu</option>
                <option value="shopee">Shopee</option>
                <option value="carousell">Carousell</option>
                <option value="taobao">Taobao</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select v-model="saleForm.status" class="input-field">
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea v-model="saleForm.notes" rows="2" class="input-field"></textarea>
            </div>

            <div class="flex space-x-3 pt-4">
              <button type="submit" class="btn-primary flex-1">
                {{ editingSale ? 'Update' : 'Record' }} Sale
              </button>
              <button type="button" @click="closeModal" class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { supabase } from '../lib/supabase'

// State
const sales = ref([])
const products = ref([])
const currentTab = ref('all')
const showAddModal = ref(false)
const editingSale = ref(null)

const showNotification = inject('showNotification')

const tabs = [
  { label: 'All Sales', value: 'all' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'This Month', value: 'month' }
]

const saleForm = ref({
  product_id: '',
  selling_price: '',
  buyer_name: '',
  platform: '',
  status: 'completed',
  notes: ''
})

// Stats
const stats = ref({
  todaySales: 0,
  weekSales: 0,
  monthSales: 0,
  totalProfit: 0
})

// Computed
const filteredSales = computed(() => {
  let filtered = [...sales.value]

  if (currentTab.value === 'completed') {
    filtered = filtered.filter(s => s.status === 'completed')
  } else if (currentTab.value === 'pending') {
    filtered = filtered.filter(s => s.status === 'pending')
  } else if (currentTab.value === 'month') {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    filtered = filtered.filter(s => new Date(s.sale_date) >= firstDay)
  }

  return filtered
})

const availableProducts = computed(() => {
  return products.value.filter(p => p.quantity > 0)
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const calculateProfit = (sale) => {
  return (sale.selling_price || 0) - (sale.products?.purchase_price || 0)
}

const getProfitClass = (sale) => {
  const profit = calculateProfit(sale)
  return profit >= 0 ? 'text-green-600' : 'text-red-600'
}

const getPlatformClass = (platform) => {
  const classes = {
    'xhs': 'bg-pink-100 text-pink-600',
    'shopee': 'bg-orange-100 text-orange-600',
    'carousell': 'bg-purple-100 text-purple-600',
    'taobao': 'bg-red-100 text-red-600'
  }
  return classes[platform] || 'bg-gray-100 text-gray-600'
}

const getStatusSelectClass = (status) => {
  const classes = {
    'completed': 'bg-green-100 text-green-600',
    'pending': 'bg-yellow-100 text-yellow-600',
    'cancelled': 'bg-red-100 text-red-600'
  }
  return classes[status] || 'bg-gray-100 text-gray-600'
}

const fetchSales = async () => {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      products:product_id (*)
    `)
    .order('sale_date', { ascending: false })
  
  if (!error) sales.value = data
}

const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .gt('quantity', 0)
  
  if (!error) products.value = data
}

const calculateStats = async () => {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const weekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString()
  const monthAgo = new Date(now.setMonth(now.getMonth() - 1)).toISOString()

  // Today's sales
  const { data: todayData } = await supabase
    .from('sales')
    .select('selling_price')
    .gte('sale_date', today + 'T00:00:00')
    .lte('sale_date', today + 'T23:59:59')
  
  stats.value.todaySales = todayData?.reduce((sum, s) => sum + (s.selling_price || 0), 0) || 0

  // This week
  const { data: weekData } = await supabase
    .from('sales')
    .select('selling_price')
    .gte('sale_date', weekAgo)
  
  stats.value.weekSales = weekData?.reduce((sum, s) => sum + (s.selling_price || 0), 0) || 0

  // This month
  const { data: monthData } = await supabase
    .from('sales')
    .select('selling_price')
    .gte('sale_date', monthAgo)
  
  stats.value.monthSales = monthData?.reduce((sum, s) => sum + (s.selling_price || 0), 0) || 0

  // Total profit
  let totalProfit = 0
  for (const sale of sales.value) {
    if (sale.status === 'completed') {
      const profit = (sale.selling_price || 0) - (sale.products?.purchase_price || 0)
      totalProfit += profit
    }
  }
  stats.value.totalProfit = totalProfit
}

const saveSale = async () => {
  try {
    if (editingSale.value) {
      const { error } = await supabase
        .from('sales')
        .update(saleForm.value)
        .eq('id', editingSale.value.id)
      
      if (error) throw error
      showNotification('Sale updated successfully!', 'success')
    } else {
      // Update product quantity
      const { error: productError } = await supabase
        .from('products')
        .update({ 
          quantity: products.value.find(p => p.id === saleForm.value.product_id).quantity - 1 
        })
        .eq('id', saleForm.value.product_id)
      
      if (productError) throw productError

      // Create sale record
      const { error } = await supabase
        .from('sales')
        .insert([{
          ...saleForm.value,
          sale_date: new Date().toISOString()
        }])
      
      if (error) throw error
      showNotification('Sale recorded successfully!', 'success')
    }
    
    closeModal()
    fetchSales()
    fetchProducts()
    calculateStats()
  } catch (error) {
    showNotification('Error: ' + error.message, 'error')
  }
}

const editSale = (sale) => {
  editingSale.value = sale
  saleForm.value = { ...sale }
  showAddModal.value = true
}

const updateStatus = async (sale) => {
  const { error } = await supabase
    .from('sales')
    .update({ status: sale.status })
    .eq('id', sale.id)
  
  if (!error) {
    showNotification('Status updated!', 'success')
    calculateStats()
  }
}

const deleteSale = async (id) => {
  if (confirm('Are you sure you want to delete this sale?')) {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id)
    
    if (!error) {
      fetchSales()
      calculateStats()
      showNotification('Sale deleted!', 'success')
    }
  }
}

const exportSales = () => {
  const headers = ['Date', 'Product', 'Buyer', 'Platform', 'Price', 'Profit', 'Status']
  const csvData = sales.value.map(sale => [
    formatDate(sale.sale_date),
    sale.products?.name,
    sale.buyer_name || '',
    sale.platform || 'Direct',
    sale.selling_price,
    calculateProfit(sale),
    sale.status
  ])
  
  const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sales-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
}

const closeModal = () => {
  showAddModal.value = false
  editingSale.value = null
  saleForm.value = {
    product_id: '',
    selling_price: '',
    buyer_name: '',
    platform: '',
    status: 'completed',
    notes: ''
  }
}

onMounted(() => {
  fetchSales()
  fetchProducts()
  calculateStats()
})
</script>
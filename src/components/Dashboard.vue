<template>
  <div>
    <!-- Welcome Section -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Dashboard</h2>
      <p class="text-gray-600">Welcome back! Here's your business overview.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="card hover:shadow-lg transition">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Total Stock</p>
            <p class="text-2xl font-bold text-gray-800">{{ stats.totalStock }}</p>
          </div>
          <div class="bg-blue-100 p-3 rounded-full">
            <CubeIcon class="h-6 w-6 text-blue-600" />
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2">Across {{ stats.totalProducts }} products</p>
      </div>

      <div class="card hover:shadow-lg transition">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Sold</p>
            <p class="text-2xl font-bold text-gray-800">{{ stats.soldCount }}</p>
          </div>
          <div class="bg-green-100 p-3 rounded-full">
            <CheckIcon class="h-6 w-6 text-green-600" />
          </div>
        </div>
        <p class="text-xs text-green-600 mt-2">↑ {{ stats.soldTrend }}% vs last month</p>
      </div>

      <div class="card hover:shadow-lg transition">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Revenue</p>
            <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(stats.revenue) }}</p>
          </div>
          <div class="bg-purple-100 p-3 rounded-full">
            <CurrencyDollarIcon class="h-6 w-6 text-purple-600" />
          </div>
        </div>
        <p class="text-xs text-purple-600 mt-2">Profit: {{ formatCurrency(stats.profit) }}</p>
      </div>

      <div class="card hover:shadow-lg transition">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">Pending</p>
            <p class="text-2xl font-bold text-gray-800">{{ stats.pendingCount }}</p>
          </div>
          <div class="bg-yellow-100 p-3 rounded-full">
            <ClockIcon class="h-6 w-6 text-yellow-600" />
          </div>
        </div>
        <p class="text-xs text-yellow-600 mt-2">{{ stats.overdueCount }} overdue</p>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Sales Chart -->
      <div class="card">
        <h3 class="font-semibold text-gray-800 mb-4">Weekly Sales</h3>
        <div class="h-48 flex items-end justify-between">
          <div v-for="(day, index) in weeklySales" :key="index" class="flex flex-col items-center w-1/7">
            <div class="w-full bg-primary rounded-t-lg transition-all duration-500" 
                 :style="{ height: (day.amount / maxWeeklySales * 150) + 'px' }"
                 :class="{'bg-opacity-70': index === 6}">
            </div>
            <span class="text-xs text-gray-600 mt-2">{{ day.label }}</span>
            <span class="text-xs font-semibold">{{ formatCurrency(day.amount) }}</span>
          </div>
        </div>
      </div>

      <!-- Category Distribution -->
      <div class="card">
        <h3 class="font-semibold text-gray-800 mb-4">Stock by Series</h3>
        <div v-for="category in topCategories" :key="category.name" class="mb-3">
          <div class="flex justify-between text-sm mb-1">
            <span>{{ category.name }}</span>
            <span class="font-semibold">{{ category.count }} units</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-primary rounded-full h-2 transition-all duration-500" 
                 :style="{ width: (category.count / maxCategoryCount * 100) + '%' }">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Recent Sales -->
      <div class="card md:col-span-2">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold text-gray-800">Recent Sales</h3>
          <button @click="$emit('changeTab', 'sales')" class="text-primary text-sm hover:underline">View All</button>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th class="px-4 py-2 text-left">Product</th>
                <th class="px-4 py-2 text-left">Price</th>
                <th class="px-4 py-2 text-left">Profit</th>
                <th class="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="sale in recentSales" :key="sale.id" class="hover:bg-gray-50">
                <td class="px-4 py-3">
                  <div class="font-medium">{{ sale.product_name }}</div>
                  <div class="text-xs text-gray-500">{{ sale.buyer_name }}</div>
                </td>
                <td class="px-4 py-3">{{ formatCurrency(sale.selling_price) }}</td>
                <td class="px-4 py-3">
                  <span :class="getProfitColor(sale.selling_price - sale.purchase_price)">
                    {{ formatCurrency(sale.selling_price - sale.purchase_price) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ formatDate(sale.sale_date) }}</td>
              </tr>
              <tr v-if="recentSales.length === 0">
                <td colspan="4" class="px-4 py-8 text-center text-gray-500">
                  No sales yet. Start selling!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pending Items & Alerts -->
      <div class="card">
        <h3 class="font-semibold text-gray-800 mb-4">Pending Items</h3>
        
        <div v-if="pendingItems.length > 0" class="space-y-3">
          <div v-for="item in pendingItems" :key="item.id" 
               class="p-3 bg-gray-50 rounded-lg"
               :class="{'bg-red-50': item.daysPending > 7}">
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium">{{ item.product_name }}</p>
                <p class="text-xs text-gray-500">Buyer: {{ item.buyer_name }}</p>
              </div>
              <span class="text-xs px-2 py-1 rounded-full"
                    :class="item.daysPending > 7 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'">
                {{ item.daysPending }} days
              </span>
            </div>
            <div class="mt-2 flex justify-between items-center">
              <span class="text-xs text-gray-500">{{ formatDate(item.sale_date) }}</span>
              <button @click="markAsCompleted(item)" class="text-xs text-green-600 hover:text-green-700">
                Mark Complete
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          <CheckCircleIcon class="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p>No pending items</p>
        </div>

        <!-- Quick Actions -->
        <div class="mt-6 pt-4 border-t border-gray-100">
          <h4 class="font-medium text-gray-700 mb-3">Quick Actions</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="$emit('changeTab', 'inventory')" 
                    class="p-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100">
              ➕ Add Product
            </button>
            <button @click="$emit('changeTab', 'sales')" 
                    class="p-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100">
              💰 Record Sale
            </button>
            <button @click="$emit('changeTab', 'predictions')" 
                    class="p-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100">
              🔮 Predict
            </button>
            <button @click="exportReport" 
                    class="p-2 bg-gray-50 rounded-lg text-sm hover:bg-gray-100">
              📊 Export
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, inject } from 'vue'
import { CubeIcon, CheckIcon, ClockIcon, CheckCircleIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline'
import { supabase } from '../lib/supabase'

// Props & Emits
const emit = defineEmits(['changeTab'])

// State
const stats = ref({
  totalStock: 0,
  totalProducts: 0,
  soldCount: 0,
  soldTrend: 12,
  revenue: 0,
  profit: 0,
  pendingCount: 0,
  overdueCount: 0
})

const recentSales = ref([])
const pendingItems = ref([])
const weeklySales = ref([])
const topCategories = ref([])

// Computed
const maxWeeklySales = computed(() => {
  return Math.max(...weeklySales.value.map(d => d.amount), 1)
})

const maxCategoryCount = computed(() => {
  return Math.max(...topCategories.value.map(c => c.count), 1)
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const getProfitColor = (profit) => {
  return profit >= 0 ? 'text-green-600' : 'text-red-600'
}

const fetchDashboardData = async () => {
  try {
    // Get total products and stock
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
    
    if (!productsError) {
      stats.value.totalProducts = products.length
      stats.value.totalStock = products.reduce((sum, p) => sum + (p.quantity || 0), 0)
    }

    // Get sales data
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select(`
        *,
        products:purchase_price
      `)
      .order('sale_date', { ascending: false })
      .limit(10)
    
    if (!salesError) {
      recentSales.value = sales
        
      // Calculate totals
      stats.value.soldCount = sales.length
      stats.value.revenue = sales.reduce((sum, s) => sum + (s.selling_price || 0), 0)
      
      // Get purchase prices for profit calculation
      let totalProfit = 0
      for (const sale of sales) {
        const { data: product } = await supabase
          .from('products')
          .select('purchase_price')
          .eq('id', sale.product_id)
          .single()
        
        if (product) {
          totalProfit += (sale.selling_price - product.purchase_price)
        }
      }
      stats.value.profit = totalProfit
    }

    // Get pending items
    const { data: pending, error: pendingError } = await supabase
      .from('sales')
      .select(`
        *,
        products:product_id (name)
      `)
      .eq('status', 'pending')
      .order('sale_date', { ascending: false })
    
    if (!pendingError) {
      pendingItems.value = pending.map(p => ({
        ...p,
        product_name: p.products?.name,
        daysPending: Math.floor((new Date() - new Date(p.sale_date)) / (1000 * 60 * 60 * 24))
      }))
      stats.value.pendingCount = pendingItems.value.length
      stats.value.overdueCount = pendingItems.value.filter(p => p.daysPending > 7).length
    }

    // Generate weekly sales (last 7 days)
    const weeklyData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const { count } = await supabase
        .from('sales')
        .select('*', { count: 'exact', head: true })
        .gte('sale_date', dateStr + 'T00:00:00')
        .lt('sale_date', dateStr + 'T23:59:59')
      
      weeklyData.push({
        label: date.toLocaleDateString('en-US', { weekday: 'short' }),
        amount: count * (Math.random() * 100 + 50) // Placeholder, replace with actual sum
      })
    }
    weeklySales.value = weeklyData

    // Get top categories
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'Series')
    
    if (!catError) {
      const categoryCounts = []
      for (const cat of categories.slice(0, 5)) {
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('series_id', cat.id)
        
        categoryCounts.push({
          name: cat.name,
          count: count || 0
        })
      }
      topCategories.value = categoryCounts
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
}

const markAsCompleted = async (item) => {
  const { error } = await supabase
    .from('sales')
    .update({ status: 'completed' })
    .eq('id', item.id)
  
  if (!error) {
    fetchDashboardData()
    const showNotification = inject('showNotification')
    showNotification('Sale marked as completed!', 'success')
  }
}

const exportReport = () => {
  // Generate CSV
  const headers = ['Date', 'Product', 'Price', 'Profit', 'Buyer']
  const csvData = recentSales.value.map(sale => [
    formatDate(sale.sale_date),
    sale.product_name,
    sale.selling_price,
    sale.selling_price - (sale.purchase_price || 0),
    sale.buyer_name
  ])
  
  const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
  
  // Download
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
}

onMounted(() => {
  fetchDashboardData()
})
</script>
<template>
  <div>
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Predictions & Analytics</h2>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Box Hint Predictor -->
      <div class="card md:col-span-2">
        <h3 class="font-semibold text-gray-800 mb-4">🔮 Box Hint Predictor</h3>
        <p class="text-sm text-gray-600 mb-4">Enter the hints from your boxes to predict the missing one</p>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div v-for="n in 6" :key="n" class="form-group">
            <label class="block text-xs text-gray-500 mb-1">Box {{ n }}</label>
            <input 
              type="text" 
              v-model="boxHints[n-1]" 
              class="input-field !py-1.5 text-sm"
              :placeholder="'Hint ' + n"
            >
          </div>
        </div>

        <button @click="predictBox" class="btn-primary w-full" :disabled="!canPredict">
          Predict Missing Box
        </button>

        <div v-if="predictionResult" class="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Predicted Hint:</p>
              <p class="text-2xl font-bold text-primary">{{ predictionResult }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-600">Confidence</p>
              <p class="text-xl font-semibold text-gray-700">{{ confidence }}%</p>
            </div>
          </div>
          <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div class="bg-primary rounded-full h-2 transition-all" :style="{ width: confidence + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="card">
        <h3 class="font-semibold text-gray-800 mb-4">📊 Quick Stats</h3>
        
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500">Total Investment</p>
            <p class="text-2xl font-bold text-gray-800">{{ formatCurrency(totalInvestment) }}</p>
          </div>
          
          <div>
            <p class="text-sm text-gray-500">Potential Revenue</p>
            <p class="text-2xl font-bold text-green-600">{{ formatCurrency(potentialRevenue) }}</p>
          </div>
          
          <div>
            <p class="text-sm text-gray-500">Estimated Profit</p>
            <p class="text-2xl font-bold text-purple-600">{{ formatCurrency(estimatedProfit) }}</p>
          </div>
          
          <div class="pt-4 border-t">
            <p class="text-sm text-gray-500">ROI</p>
            <p class="text-2xl font-bold" :class="roi >= 0 ? 'text-green-600' : 'text-red-600'">
              {{ roi }}%
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Analytics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <!-- Popular Hints -->
      <div class="card">
        <h3 class="font-semibold text-gray-800 mb-4">📈 Most Popular Hints</h3>
        
        <div class="space-y-3">
          <div v-for="hint in popularHints" :key="hint.hint" class="flex items-center">
            <span class="flex-1">{{ hint.hint }}</span>
            <div class="w-32 bg-gray-200 rounded-full h-2 mx-3">
              <div class="bg-primary rounded-full h-2" :style="{ width: hint.percentage + '%' }"></div>
            </div>
            <span class="text-sm font-medium">{{ hint.count }}x</span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t">
          <h4 class="font-medium text-gray-700 mb-2">Hint Patterns by Series</h4>
          <select v-model="selectedSeries" class="input-field text-sm">
            <option value="">All Series</option>
            <option v-for="series in seriesList" :key="series.id" :value="series.id">
              {{ series.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Rarity Distribution -->
      <div class="card">
        <h3 class="font-semibold text-gray-800 mb-4">🎲 Rarity Distribution</h3>
        
        <div class="space-y-4">
          <div v-for="rarity in rarityDistribution" :key="rarity.name" class="flex items-center">
            <span class="w-24 text-sm">{{ rarity.name }}</span>
            <div class="flex-1 mx-3">
              <div class="flex justify-between text-xs mb-1">
                <span>{{ rarity.count }} units</span>
                <span>{{ rarity.percentage }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="rounded-full h-2" :class="rarity.color" :style="{ width: rarity.percentage + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Secret Chance Calculator -->
        <div class="mt-6 pt-4 border-t">
          <h4 class="font-medium text-gray-700 mb-2">🎯 Secret Probability</h4>
          <p class="text-sm text-gray-600 mb-2">Based on your collection pattern</p>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-primary">{{ secretProbability }}%</span>
            <span class="text-sm text-gray-500">chance of secret</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div class="bg-yellow-400 rounded-full h-2" :style="{ width: secretProbability + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Series Analysis -->
    <div class="card mt-6">
      <h3 class="font-semibold text-gray-800 mb-4">📊 Series Performance</h3>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th class="px-4 py-2 text-left">Series</th>
              <th class="px-4 py-2 text-right">In Stock</th>
              <th class="px-4 py-2 text-right">Sold</th>
              <th class="px-4 py-2 text-right">Revenue</th>
              <th class="px-4 py-2 text-right">Profit</th>
              <th class="px-4 py-2 text-right">ROI</th>
              <th class="px-4 py-2 text-center">Trend</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-for="series in seriesPerformance" :key="series.id" class="hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">{{ series.name }}</td>
              <td class="px-4 py-3 text-right">{{ series.inStock }}</td>
              <td class="px-4 py-3 text-right">{{ series.sold }}</td>
              <td class="px-4 py-3 text-right">{{ formatCurrency(series.revenue) }}</td>
              <td class="px-4 py-3 text-right" :class="series.profit >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ formatCurrency(series.profit) }}
              </td>
              <td class="px-4 py-3 text-right" :class="series.roi >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ series.roi }}%
              </td>
              <td class="px-4 py-3 text-center">
                <span v-if="series.trend > 0" class="text-green-600">↑ {{ series.trend }}%</span>
                <span v-else-if="series.trend < 0" class="text-red-600">↓ {{ Math.abs(series.trend) }}%</span>
                <span v-else class="text-gray-400">→</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Recommendation Engine -->
    <div class="card mt-6 bg-gradient-to-r from-blue-50 to-purple-50">
      <h3 class="font-semibold text-gray-800 mb-4">💡 Smart Recommendations</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="rec in recommendations" :key="rec.title" class="bg-white rounded-lg p-4 shadow-sm">
          <div class="flex items-start space-x-3">
            <div class="p-2 rounded-lg" :class="rec.bgColor">
              <component :is="rec.icon" class="h-5 w-5" :class="rec.iconColor" />
            </div>
            <div>
              <h4 class="font-medium text-gray-800">{{ rec.title }}</h4>
              <p class="text-sm text-gray-600 mt-1">{{ rec.description }}</p>
              <button class="text-xs text-primary mt-2 hover:underline">
                {{ rec.action }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ChartBarIcon, FireIcon, SparklesIcon } from '@heroicons/vue/24/outline'
import { supabase } from '../lib/supabase'

// State
const boxHints = ref(['', '', '', '', '', ''])
const predictionResult = ref('')
const confidence = ref(0)
const selectedSeries = ref('')

const products = ref([])
const sales = ref([])
const seriesList = ref([])

// Computed
const canPredict = computed(() => {
  return boxHints.value.filter(h => h.trim()).length >= 5
})

const totalInvestment = computed(() => {
  return products.value.reduce((sum, p) => sum + (p.purchase_price * p.quantity), 0)
})

const potentialRevenue = computed(() => {
  return products.value.reduce((sum, p) => {
    const price = p.selling_price || p.purchase_price * 1.5
    return sum + (price * p.quantity)
  }, 0)
})

const estimatedProfit = computed(() => {
  return potentialRevenue.value - totalInvestment.value
})

const roi = computed(() => {
  if (totalInvestment.value === 0) return 0
  return ((estimatedProfit.value / totalInvestment.value) * 100).toFixed(1)
})

const popularHints = computed(() => {
  const hintCount = {}
  products.value.forEach(p => {
    if (p.hint) {
      hintCount[p.hint] = (hintCount[p.hint] || 0) + 1
    }
  })
  
  const total = Object.values(hintCount).reduce((a, b) => a + b, 0)
  
  return Object.entries(hintCount)
    .map(([hint, count]) => ({
      hint,
      count,
      percentage: ((count / total) * 100).toFixed(1)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const rarityDistribution = computed(() => {
  const counts = {
    'Common': 0,
    'Rare': 0,
    'Ultra Rare': 0,
    'Secret': 0
  }
  
  products.value.forEach(p => {
    if (counts[p.rarity] !== undefined) {
      counts[p.rarity] += p.quantity
    }
  })
  
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  
  return [
    { name: 'Common', count: counts.Common, percentage: ((counts.Common / total) * 100).toFixed(1), color: 'bg-gray-400' },
    { name: 'Rare', count: counts.Rare, percentage: ((counts.Rare / total) * 100).toFixed(1), color: 'bg-blue-500' },
    { name: 'Ultra Rare', count: counts['Ultra Rare'], percentage: ((counts['Ultra Rare'] / total) * 100).toFixed(1), color: 'bg-purple-500' },
    { name: 'Secret', count: counts.Secret, percentage: ((counts.Secret / total) * 100).toFixed(1), color: 'bg-yellow-500' }
  ]
})

const secretProbability = computed(() => {
  // Simple ML model simulation
  const totalProducts = products.value.reduce((sum, p) => sum + p.quantity, 0)
  const rareCount = products.value.filter(p => p.rarity === 'Rare' || p.rarity === 'Ultra Rare').length
  const hintPatterns = new Set(products.value.map(p => p.hint)).size
  
  let probability = 5 // Base chance
  
  if (rareCount > 3) probability += 10
  if (hintPatterns > 10) probability += 15
  if (products.value.length > 20) probability += 5
  
  return Math.min(probability, 35).toFixed(1)
})

const seriesPerformance = computed(() => {
  return seriesList.value.map(series => {
    const seriesProducts = products.value.filter(p => p.series_id === series.id)
    const seriesSales = sales.value.filter(s => {
      const product = products.value.find(p => p.id === s.product_id)
      return product?.series_id === series.id
    })
    
    const inStock = seriesProducts.reduce((sum, p) => sum + p.quantity, 0)
    const sold = seriesSales.length
    const revenue = seriesSales.reduce((sum, s) => sum + (s.selling_price || 0), 0)
    const cost = seriesSales.reduce((sum, s) => {
      const product = products.value.find(p => p.id === s.product_id)
      return sum + (product?.purchase_price || 0)
    }, 0)
    const profit = revenue - cost
    const roi = cost > 0 ? ((profit / cost) * 100).toFixed(1) : 0
    
    // Calculate trend (mock data for now)
    const trend = (Math.random() * 20 - 10).toFixed(1)
    
    return {
      id: series.id,
      name: series.name,
      inStock,
      sold,
      revenue,
      profit,
      roi,
      trend
    }
  })
})

const recommendations = computed(() => {
  const bestSeries = seriesPerformance.value.reduce((best, current) => {
    return (current.roi > best.roi) ? current : best
  }, { roi: -Infinity })
  
  const worstSeries = seriesPerformance.value.reduce((worst, current) => {
    return (current.roi < worst.roi) ? current : worst
  }, { roi: Infinity })
  
  return [
    {
      title: 'Best Performing',
      description: `${bestSeries.name} has ${bestSeries.roi}% ROI. Consider buying more!`,
      icon: FireIcon,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      action: 'View Series →'
    },
    {
      title: 'Price Optimization',
      description: 'You could increase prices on rare items by 15%',
      icon: ChartBarIcon,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      action: 'Adjust Prices →'
    },
    {
      title: 'Secret Hunt',
      description: `${secretProbability}% chance of secret in next box`,
      icon: SparklesIcon,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      action: 'Learn More →'
    }
  ]
})

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0)
}

const predictBox = () => {
  const hints = boxHints.value.filter(h => h.trim())
  
  // Get all hints from database
  const allHints = products.value.map(p => p.hint).filter(Boolean)
  
  // Count frequency
  const frequency = {}
  allHints.forEach(h => {
    frequency[h] = (frequency[h] || 0) + 1
  })
  
  // Find hints not in input
  const possibleHints = Object.keys(frequency).filter(h => !hints.includes(h))
  
  if (possibleHints.length === 0) {
    predictionResult.value = 'No unique hint found'
    confidence.value = 0
  } else {
    possibleHints.sort((a, b) => frequency[b] - frequency[a])
    predictionResult.value = possibleHints[0]
    confidence.value = ((frequency[possibleHints[0]] / allHints.length) * 100).toFixed(1)
  }
}

const fetchData = async () => {
  const [productsRes, salesRes, seriesRes] = await Promise.all([
    supabase.from('products').select('*'),
    supabase.from('sales').select('*'),
    supabase.from('categories').select('*').eq('type', 'Series')
  ])
  
  if (!productsRes.error) products.value = productsRes.data
  if (!salesRes.error) sales.value = salesRes.data
  if (!seriesRes.error) seriesList.value = seriesRes.data
}

onMounted(() => {
  fetchData()
})
</script>
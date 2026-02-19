window.PredictionPage = {
    template: `
        <div>
            <!-- Prediction Card -->
            <div class="card">
                <div class="card-title">Box Hint Prediction</div>
                <p style="color: #666; margin-bottom: 15px;">Enter 6 boxes with their hints to predict missing box</p>
                
                <div v-for="n in 6" :key="n" class="form-group">
                    <label>Box {{ n }}</label>
                    <input 
                        type="text" 
                        class="form-control" 
                        v-model="boxHints[n-1]"
                        :placeholder="'Enter hint for box ' + n"
                    >
                </div>
                
                <button class="btn" @click="predictBox" :disabled="!canPredict">
                    Predict Missing Box
                </button>
                
                <div v-if="predictionResult" class="mt-10" style="margin-top: 20px;">
                    <h4>Prediction Result:</h4>
                    <div class="stat-item">
                        <div class="stat-value">{{ predictionResult }}</div>
                        <div class="stat-label">Likely Box Hint</div>
                    </div>
                    
                    <div v-if="confidence" class="text-center mt-10">
                        <small>Confidence: {{ confidence }}%</small>
                    </div>
                </div>
            </div>

            <!-- Analytics -->
            <div class="card">
                <div class="card-title">Analytics & Trends</div>
                
                <div style="margin-bottom: 15px;">
                    <h4>Most Popular Hints</h4>
                    <div v-for="[hint, count] in popularHints" :key="hint" 
                         style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>{{ hint }}</span>
                        <span class="badge badge-info">{{ count }} boxes</span>
                    </div>
                </div>
                
                <div>
                    <h4>Profit Analysis</h4>
                    <table class="table">
                        <tr>
                            <td>Average Profit</td>
                            <td><strong>{{ formatCurrency(averageProfit) }}</strong></td>
                        </tr>
                        <tr>
                            <td>Best Selling Series</td>
                            <td><strong>{{ bestSellingSeries }}</strong></td>
                        </tr>
                        <tr>
                            <td>Success Rate</td>
                            <td><strong>{{ successRate }}%</strong></td>
                        </tr>
                        <tr>
                            <td>Total Profit</td>
                            <td><strong class="text-success">{{ formatCurrency(totalProfit) }}</strong></td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Hint Pattern Analysis -->
            <div class="card">
                <div class="card-title">Hint Pattern Analysis</div>
                
                <div v-for="series in seriesPatterns" :key="series.name" style="margin-bottom: 15px;">
                    <h4>{{ series.name }}</h4>
                    <div v-for="hint in series.hints" :key="hint" class="grid-2" style="margin-bottom: 5px;">
                        <span>{{ hint.hint }}</span>
                        <div class="progress-bar">
                            <div class="progress" :style="{ width: hint.percentage + '%' }"></div>
                            <span>{{ hint.count }}x</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,

    setup() {
        const boxHints = Vue.ref(['', '', '', '', '', '']);
        const predictionResult = Vue.ref('');
        const confidence = Vue.ref(0);

        // Analytics data
        const popularHints = Vue.ref(store.getPopularHints());
        const averageProfit = Vue.ref(store.getAverageProfit());
        const bestSellingSeries = Vue.ref(store.getBestSellingSeries());
        const successRate = Vue.ref(store.getSuccessRate());

        const totalProfit = Vue.computed(() => {
            return store.state.sales
                .filter(s => s.status === 'sold')
                .reduce((sum, s) => sum + s.profit, 0);
        });

        const canPredict = Vue.computed(() => {
            const filledHints = boxHints.value.filter(h => h.trim() !== '');
            return filledHints.length >= 5;
        });

        // Series patterns
        const seriesPatterns = Vue.computed(() => {
            const series = {};
            store.state.inventory.forEach(item => {
                if (!series[item.name]) {
                    series[item.name] = {
                        name: item.name,
                        hints: []
                    };
                }
                series[item.name].hints.push({
                    hint: item.hint,
                    count: 1
                });
            });

            return Object.values(series).map(s => {
                const total = s.hints.length;
                const hintCounts = {};
                s.hints.forEach(h => {
                    hintCounts[h.hint] = (hintCounts[h.hint] || 0) + 1;
                });

                s.hints = Object.entries(hintCounts).map(([hint, count]) => ({
                    hint,
                    count,
                    percentage: (count / total * 100).toFixed(1)
                })).sort((a, b) => b.count - a.count);

                return s;
            });
        });

        const predictBox = () => {
            const filledHints = boxHints.value.filter(h => h.trim() !== '');

            // Get all hints from inventory
            const allHints = store.state.inventory.map(item => item.hint);

            // Calculate frequency of each hint
            const hintFrequency = {};
            allHints.forEach(hint => {
                hintFrequency[hint] = (hintFrequency[hint] || 0) + 1;
            });

            // Find hints not in the input
            const possibleHints = Object.keys(hintFrequency).filter(
                hint => !filledHints.includes(hint)
            );

            if (possibleHints.length === 0) {
                predictionResult.value = 'No unique hint found';
                confidence.value = 0;
            } else {
                // Sort by frequency
                possibleHints.sort((a, b) =>
                    (hintFrequency[b] || 0) - (hintFrequency[a] || 0)
                );

                const topHint = possibleHints[0];
                const topCount = hintFrequency[topHint] || 0;
                const totalOccurrences = allHints.length;

                predictionResult.value = topHint;
                confidence.value = ((topCount / totalOccurrences) * 100).toFixed(1);
            }
        };

        const formatCurrency = (amount) => {
            return store.formatCurrency(amount);
        };

        return {
            boxHints,
            predictionResult,
            confidence,
            popularHints,
            averageProfit,
            bestSellingSeries,
            successRate,
            totalProfit,
            seriesPatterns,
            canPredict,
            predictBox,
            formatCurrency
        };
    }
};
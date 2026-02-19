const { createApp, ref, shallowRef } = Vue;

const app = createApp({
    setup() {
        const appTitle = ref('PopMart Reseller Pro');
        const currentPage = ref('Dashboard');
        const notification = ref({
            show: false,
            message: '',
            type: 'info'
        });

        const navItems = ref([
            { id: 1, label: 'Dashboard', icon: 'fas fa-chart-pie', component: 'Dashboard' },
            { id: 2, label: 'Inventory', icon: 'fas fa-box', component: 'Inventory' },
            { id: 3, label: 'XHS Posts', icon: 'fab fa-weixin', component: 'XHSPage' },
            { id: 4, label: 'Predict', icon: 'fas fa-chart-line', component: 'PredictionPage' }
        ]);

        // Register components
        const Dashboard = window.Dashboard;
        const Inventory = window.Inventory;
        const XHSPage = window.XHSPage;
        const PredictionPage = window.PredictionPage;

        // Methods
        const switchPage = (component) => {
            currentPage.value = component;
        };

        const showNotification = (message, type = 'info') => {
            notification.value = {
                show: true,
                message,
                type
            };

            setTimeout(() => {
                notification.value.show = false;
            }, 3000);
        };

        // Check pending items periodically
        setInterval(() => {
            const overdueItems = store.checkPendingItems();
            if (overdueItems.length > 0) {
                showNotification(`⚠️ ${overdueItems.length} item(s) pending for over 7 days`, 'warning');
            }
        }, 3600000); // Check every hour

        // Expose to template
        return {
            appTitle,
            currentPage,
            navItems,
            notification,
            switchPage,
            showNotification
        };
    },

    // Register components
    components: {
        Dashboard: window.Dashboard,
        Inventory: window.Inventory,
        XHSPage: window.XHSPage,
        PredictionPage: window.PredictionPage
    }
});

app.mount('#app');
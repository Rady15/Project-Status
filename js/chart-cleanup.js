// تنظيف شامل للرسوم البيانية لمنع تضارب Canvas
(function() {
    'use strict';
    
    window.ChartCleanup = {
        // تنظيف جميع الرسوم البيانية
        destroyAllCharts() {
            console.log('🧹 بدء تنظيف جميع الرسوم البيانية');
            
            // تنظيف رسوم لوحة التحكم
            if (window.dashboardManager && dashboardManager.charts) {
                Object.keys(dashboardManager.charts).forEach(key => {
                    this.safeDestroyChart(dashboardManager.charts[key], `dashboard.${key}`);
                    dashboardManager.charts[key] = null;
                });
                dashboardManager.isInitialized = false;
            }
            
            // تنظيف رسوم التقارير
            if (window.reportsManager && reportsManager.charts) {
                Object.keys(reportsManager.charts).forEach(key => {
                    this.safeDestroyChart(reportsManager.charts[key], `reports.${key}`);
                    reportsManager.charts[key] = null;
                });
                reportsManager.isInitialized = false;
            }
            
            // تنظيف جميع الرسوم البيانية المسجلة في Chart.js
            Object.keys(Chart.instances).forEach(id => {
                const chart = Chart.instances[id];
                if (chart) {
                    this.safeDestroyChart(chart, `Chart.instances.${id}`);
                }
            });
            
            console.log('✅ تم تنظيف جميع الرسوم البيانية');
        },
        
        // تدمير آمن للرسم البياني
        safeDestroyChart(chart, name) {
            if (!chart) return;
            
            try {
                if (typeof chart.destroy === 'function') {
                    chart.destroy();
                    console.log(`🗑️ تم تدمير الرسم البياني: ${name}`);
                }
            } catch (error) {
                console.warn(`⚠️ خطأ في تدمير الرسم البياني ${name}:`, error.message);
            }
        },
        
        // تنظيف Canvas محدد
        cleanCanvas(canvasId) {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.warn(`Canvas ${canvasId} غير موجود`);
                return;
            }
            
            // البحث عن الرسم البياني المرتبط بهذا Canvas
            const existingChart = Chart.getChart(canvas);
            if (existingChart) {
                this.safeDestroyChart(existingChart, canvasId);
            }
            
            // تنظيف Canvas
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            
            console.log(`🧹 تم تنظيف Canvas: ${canvasId}`);
        },
        
        // إعادة تعيين جميع الرسوم البيانية
        resetAllCharts() {
            console.log('🔄 إعادة تعيين جميع الرسوم البيانية');
            
            this.destroyAllCharts();
            
            // إعادة تعيين المتغيرات
            if (window.dashboardManager) {
                dashboardManager.charts = {};
                dashboardManager.isInitialized = false;
            }
            
            if (window.reportsManager) {
                reportsManager.charts = {};
                reportsManager.isInitialized = false;
            }
            
            // تنظيف جميع Canvas
            const canvases = ['projectsChart', 'tasksChart', 'productivityChart', 'timeChart'];
            canvases.forEach(canvasId => {
                this.cleanCanvas(canvasId);
            });
            
            console.log('✅ تم إعادة تعيين جميع الرسوم البيانية');
        },
        
        // فحص حالة الرسوم البيانية
        checkChartsStatus() {
            console.log('📊 فحص حالة الرسوم البيانية:');
            
            const canvases = ['projectsChart', 'tasksChart', 'productivityChart', 'timeChart'];
            canvases.forEach(canvasId => {
                const canvas = document.getElementById(canvasId);
                if (canvas) {
                    const chart = Chart.getChart(canvas);
                    console.log(`${canvasId}: ${chart ? '✅ نشط' : '❌ غير نشط'}`);
                } else {
                    console.log(`${canvasId}: ❌ Canvas غير موجود`);
                }
            });
            
            console.log(`إجمالي الرسوم البيانية المسجلة: ${Object.keys(Chart.instances).length}`);
        }
    };
    
    // دوال سريعة للاستخدام في Console
    window.destroyAllCharts = () => ChartCleanup.destroyAllCharts();
    window.resetAllCharts = () => ChartCleanup.resetAllCharts();
    window.checkChartsStatus = () => ChartCleanup.checkChartsStatus();
    
    // تنظيف تلقائي عند إغلاق الصفحة
    window.addEventListener('beforeunload', () => {
        ChartCleanup.destroyAllCharts();
    });
    
    // تنظيف دوري كل 5 دقائق
    setInterval(() => {
        const chartCount = Object.keys(Chart.instances).length;
        if (chartCount > 10) {
            console.warn(`⚠️ عدد كبير من الرسوم البيانية (${chartCount}), تنظيف تلقائي`);
            ChartCleanup.destroyAllCharts();
        }
    }, 300000); // 5 دقائق
    
    console.log('✅ تم تحميل أدوات تنظيف الرسوم البيانية');
    
})();
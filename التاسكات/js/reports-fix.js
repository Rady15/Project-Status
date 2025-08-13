// إصلاح خاص بمشكلة السكرول في قسم التقارير
(function() {
    'use strict';
    
    let reportsScrollFix = {
        isActive: false,
        chartUpdateCount: 0,
        maxUpdates: 3,
        lastReportsUpdate: 0,
        
        init() {
            console.log('🔧 تهيئة إصلاحات قسم التقارير');
            this.setupReportsObserver();
            this.preventChartOverflow();
            this.setupReportsScrollControl();
        },
        
        setupReportsObserver() {
            // مراقبة تفعيل قسم التقارير
            const reportsSection = document.getElementById('reports');
            if (!reportsSection) return;
            
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && 
                        mutation.attributeName === 'class') {
                        
                        const isActive = mutation.target.classList.contains('active');
                        
                        if (isActive && !this.isActive) {
                            console.log('📊 تم تفعيل قسم التقارير');
                            this.isActive = true;
                            this.chartUpdateCount = 0;
                            
                            // تأخير قصير قبل إنشاء الرسوم البيانية
                            setTimeout(() => {
                                this.safeCreateReports();
                            }, 300);
                            
                        } else if (!isActive && this.isActive) {
                            console.log('📊 تم إلغاء تفعيل قسم التقارير');
                            this.isActive = false;
                            this.cleanupCharts();
                        }
                    }
                });
            });
            
            observer.observe(reportsSection, { attributes: true });
        },
        
        safeCreateReports() {
            if (!this.isActive) return;
            
            const now = Date.now();
            if (this.lastReportsUpdate && (now - this.lastReportsUpdate) < 3000) {
                console.log('⏳ تم تخطي إنشاء التقارير لمنع التكرار');
                return;
            }
            
            this.lastReportsUpdate = now;
            
            try {
                if (window.reportsManager && typeof reportsManager.createReports === 'function') {
                    // التأكد من عدم وجود رسوم بيانية مسبقاً
                    if (!reportsManager.isInitialized) {
                        console.log('✅ إنشاء رسوم التقارير بأمان');
                        reportsManager.createReports();
                    } else {
                        console.log('ℹ️ رسوم التقارير موجودة بالفعل');
                    }
                } else {
                    console.warn('⚠️ مدير التقارير غير متاح');
                }
            } catch (error) {
                console.error('❌ خطأ في إنشاء التقارير:', error);
            }
        },
        
        preventChartOverflow() {
            // منع إعادة الرسم المستمر للرسوم البيانية
            const originalChartUpdate = Chart.prototype.update;
            
            Chart.prototype.update = function(mode) {
                // فحص إذا كان الرسم البياني في قسم التقارير
                const canvas = this.canvas;
                const reportsSection = document.getElementById('reports');
                
                if (canvas && reportsSection && reportsSection.contains(canvas)) {
                    reportsScrollFix.chartUpdateCount++;
                    
                    if (reportsScrollFix.chartUpdateCount > reportsScrollFix.maxUpdates) {
                        console.warn('🛑 تم منع تحديث الرسم البياني لتجنب السكرول اللانهائي');
                        return;
                    }
                    
                    console.log(`📈 تحديث رسم بياني (${reportsScrollFix.chartUpdateCount}/${reportsScrollFix.maxUpdates})`);
                }
                
                return originalChartUpdate.call(this, mode || 'none');
            };
        },
        
        setupReportsScrollControl() {
            const reportsSection = document.getElementById('reports');
            if (!reportsSection) return;
            
            // منع السكرول التلقائي في قسم التقارير
            reportsSection.addEventListener('scroll', (e) => {
                const scrollTop = e.target.scrollTop;
                const scrollHeight = e.target.scrollHeight;
                const clientHeight = e.target.clientHeight;
                
                // إذا وصل السكرول للنهاية، أوقفه
                if (scrollTop + clientHeight >= scrollHeight - 10) {
                    e.target.scrollTop = scrollHeight - clientHeight - 10;
                    console.log('🛑 تم إيقاف السكرول عند النهاية');
                }
            });
            
            // منع السكرول بالعجلة في الرسوم البيانية
            reportsSection.addEventListener('wheel', (e) => {
                const target = e.target;
                if (target.tagName === 'CANVAS') {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('🛑 تم منع السكرول في الرسم البياني');
                }
            }, { passive: false });
        },
        
        cleanupCharts() {
            // تنظيف الرسوم البيانية عند مغادرة القسم
            if (window.reportsManager && reportsManager.charts) {
                Object.keys(reportsManager.charts).forEach(key => {
                    if (reportsManager.charts[key] && typeof reportsManager.charts[key].destroy === 'function') {
                        try {
                            reportsManager.charts[key].destroy();
                            reportsManager.charts[key] = null;
                            console.log(`🗑️ تم تنظيف الرسم البياني: ${key}`);
                        } catch (error) {
                            console.error(`❌ خطأ في تنظيف الرسم البياني ${key}:`, error);
                        }
                    }
                });
                
                reportsManager.isInitialized = false;
                this.chartUpdateCount = 0;
            }
        },
        
        resetReports() {
            console.log('🔄 إعادة تعيين قسم التقارير');
            this.cleanupCharts();
            this.chartUpdateCount = 0;
            this.lastReportsUpdate = 0;
            
            if (this.isActive) {
                setTimeout(() => {
                    this.safeCreateReports();
                }, 500);
            }
        }
    };
    
    // تصدير الدوال للاستخدام العام
    window.reportsScrollFix = reportsScrollFix;
    
    window.resetReports = function() {
        reportsScrollFix.resetReports();
    };
    
    window.fixReportsScroll = function() {
        console.log('🔧 تطبيق إصلاح السكرول للتقارير');
        
        // إيقاف أي تحديثات جارية
        if (window.reportsManager) {
            reportsManager.lastUpdateTime = Date.now();
        }
        
        // إعادة تعيين السكرول
        const reportsSection = document.getElementById('reports');
        if (reportsSection) {
            reportsSection.scrollTop = 0;
        }
        
        // إعادة تعيين التقارير
        reportsScrollFix.resetReports();
    };
    
    // تهيئة الإصلاحات عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => reportsScrollFix.init(), 1000);
        });
    } else {
        setTimeout(() => reportsScrollFix.init(), 1000);
    }
    
    console.log('✅ تم تحميل إصلاحات قسم التقارير');
    
})();
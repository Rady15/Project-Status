// إصلاح مشكلة السكرول اللانهائي
(function() {
    'use strict';
    
    // منع السكرول اللانهائي
    let scrollTimeout;
    let lastScrollTop = 0;
    let scrollCount = 0;
    
    function handleScroll() {
        const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // إذا كان السكرول سريع جداً، أوقفه
        if (Math.abs(currentScrollTop - lastScrollTop) > 1000) {
            window.scrollTo(0, lastScrollTop);
            return;
        }
        
        // عد مرات السكرول المتتالية
        scrollCount++;
        
        // إذا تجاوز عدد مرات السكرول الحد المسموح، أوقفه
        if (scrollCount > 50) {
            window.scrollTo(0, 0);
            scrollCount = 0;
            console.warn('تم إيقاف السكرول اللانهائي');
            return;
        }
        
        lastScrollTop = currentScrollTop;
        
        // إعادة تعيين العداد بعد فترة
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            scrollCount = 0;
        }, 1000);
    }
    
    // إضافة مستمع السكرول
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // منع السكرول التلقائي في الرسوم البيانية
    function preventChartScroll() {
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
            container.addEventListener('wheel', (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, { passive: false });
        });
    }
    
    // تطبيق الإصلاح عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', () => {
        preventChartScroll();
        
        // إعادة تطبيق الإصلاح عند تغيير الأقسام
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' &&
                    mutation.target.classList.contains('active')) {
                    setTimeout(preventChartScroll, 100);
                }
            });
        });
        
        // مراقبة تغييرات الأقسام
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            observer.observe(section, { attributes: true });
        });
    });
    
    // إصلاح مشكلة التحديث المستمر للرسوم البيانية
    const originalSetInterval = window.setInterval;
    const activeIntervals = new Set();
    
    window.setInterval = function(callback, delay, ...args) {
        const intervalId = originalSetInterval.call(this, callback, delay, ...args);
        activeIntervals.add(intervalId);
        
        // إذا كان هناك أكثر من 5 intervals نشطة، امنع إضافة المزيد
        if (activeIntervals.size > 5) {
            console.warn('تم منع إنشاء interval إضافي لتجنب السكرول اللانهائي');
            clearInterval(intervalId);
            activeIntervals.delete(intervalId);
            return null;
        }
        
        return intervalId;
    };
    
    const originalClearInterval = window.clearInterval;
    window.clearInterval = function(intervalId) {
        activeIntervals.delete(intervalId);
        return originalClearInterval.call(this, intervalId);
    };
    
    // تنظيف الـ intervals عند تغيير الصفحة
    window.addEventListener('beforeunload', () => {
        activeIntervals.forEach(intervalId => {
            clearInterval(intervalId);
        });
        activeIntervals.clear();
    });
    
    // إضافة دالة لإيقاف جميع الـ intervals
    window.stopAllIntervals = function() {
        activeIntervals.forEach(intervalId => {
            clearInterval(intervalId);
        });
        activeIntervals.clear();
        console.log('تم إيقاف جميع الـ intervals');
    };
    
    // إضافة دالة لإعادة تعيين السكرول
    window.resetScroll = function() {
        window.scrollTo(0, 0);
        scrollCount = 0;
        lastScrollTop = 0;
        console.log('تم إعادة تعيين السكرول');
    };
    
    console.log('✅ تم تحميل إصلاحات السكرول');
    
})();
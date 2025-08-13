// ملف التهيئة الرئيسي للنظام
(function() {
    'use strict';
    
    // فحص التوافق
    function checkCompatibility() {
        const requirements = {
            localStorage: typeof(Storage) !== "undefined",
            es6: (function() {
                try {
                    eval('const test = () => {}; class Test {}');
                    return true;
                } catch (e) {
                    return false;
                }
            })(),
            fetch: typeof fetch !== 'undefined',
            chart: typeof Chart !== 'undefined'
        };
        
        const incompatible = Object.entries(requirements)
            .filter(([key, value]) => !value)
            .map(([key]) => key);
            
        if (incompatible.length > 0) {
            console.warn('ميزات غير مدعومة:', incompatible);
        }
        
        return incompatible.length === 0;
    }
    
    // تهيئة النظام
    function initializeSystem() {
        console.log('🚀 بدء تهيئة نظام إدارة المشاريع...');
        
        // فحص التوافق
        if (!checkCompatibility()) {
            console.error('❌ المتصفح غير متوافق مع النظام');
            return;
        }
        
        // تهيئة المدراء بالترتيب الصحيح
        try {
            // 1. إدارة البيانات (الأهم)
            if (typeof DataManager !== 'undefined') {
                window.dataManager = new DataManager();
                console.log('✅ تم تهيئة إدارة البيانات');
            }
            
            // 2. إدارة المصادقة
            if (typeof AuthManager !== 'undefined') {
                window.authManager = new AuthManager();
                console.log('✅ تم تهيئة إدارة المصادقة');
            }
            
            // 3. باقي المدراء
            setTimeout(() => {
                if (typeof DashboardManager !== 'undefined') {
                    window.dashboardManager = new DashboardManager();
                    console.log('✅ تم تهيئة لوحة التحكم');
                }
                
                if (typeof ProjectsManager !== 'undefined') {
                    window.projectsManager = new ProjectsManager();
                    console.log('✅ تم تهيئة إدارة المشاريع');
                }
                
                if (typeof TasksManager !== 'undefined') {
                    window.tasksManager = new TasksManager();
                    console.log('✅ تم تهيئة إدارة المهام');
                }
                
                if (typeof TeamManager !== 'undefined') {
                    window.teamManager = new TeamManager();
                    console.log('✅ تم تهيئة إدارة الفريق');
                }
                
                if (typeof ReportsManager !== 'undefined') {
                    window.reportsManager = new ReportsManager();
                    console.log('✅ تم تهيئة التقارير');
                }
                
                if (typeof AdminManager !== 'undefined') {
                    window.adminManager = new AdminManager();
                    console.log('✅ تم تهيئة لوحة الإدارة');
                }
                
                // 4. التطبيق الرئيسي
                if (typeof App !== 'undefined') {
                    window.app = new App();
                    console.log('✅ تم تهيئة التطبيق الرئيسي');
                }
                
                console.log('🎉 تم تحميل النظام بنجاح!');
                
                // إضافة أزرار شريط الأدوات إذا كان المستخدم مسجل دخول
                setTimeout(() => {
                    if (authManager && authManager.isLoggedIn()) {
                        addToolbarButtons();
                    }
                }, 1000);
                
            }, 500);
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة النظام:', error);
        }
    }
    
    // إضافة أزرار شريط الأدوات
    function addToolbarButtons() {
        const navbar = document.querySelector('.nav-user');
        if (navbar && !navbar.querySelector('.nav-tools')) {
            const toolsDiv = document.createElement('div');
            toolsDiv.className = 'nav-tools';
            toolsDiv.innerHTML = `
                <button class="btn btn-sm btn-info" onclick="showDetailedReport()" title="التقرير المفصل">
                    <i class="fas fa-chart-line"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="exportAllData()" title="تصدير البيانات">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="printCurrentSection()" title="طباعة">
                    <i class="fas fa-print"></i>
                </button>
            `;
            
            navbar.insertBefore(toolsDiv, navbar.firstChild);
            console.log('✅ تم إضافة أزرار شريط الأدوات');
        }
    }
    
    // دوال مساعدة عامة
    window.showDetailedReport = function() {
        if (window.reportsManager && typeof reportsManager.showDetailedReport === 'function') {
            reportsManager.showDetailedReport();
        } else {
            console.error('إدارة التقارير غير متاحة');
        }
    };
    
    window.exportAllData = function() {
        if (window.app && typeof app.exportAllData === 'function') {
            app.exportAllData();
        } else if (window.dataManager && typeof dataManager.exportData === 'function') {
            const data = dataManager.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `project_data_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            console.error('تصدير البيانات غير متاح');
        }
    };
    
    window.printCurrentSection = function() {
        if (window.app && typeof app.printCurrentSection === 'function') {
            app.printCurrentSection();
        } else {
            window.print();
        }
    };
    
    // تشغيل التهيئة عند تحميل الصفحة
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSystem);
    } else {
        initializeSystem();
    }
    
    // إضافة معالج للأخطاء العامة
    window.addEventListener('error', function(e) {
        if (e.error && e.error.message) {
            console.error('خطأ في النظام:', e.error.message);
        } else if (e.message) {
            console.error('خطأ في النظام:', e.message);
        } else {
            console.error('خطأ غير محدد في النظام');
        }
    });
    
    // إضافة معالج للوعود المرفوضة
    window.addEventListener('unhandledrejection', function(e) {
        if (e.reason) {
            console.error('وعد مرفوض:', e.reason);
        } else {
            console.error('وعد مرفوض غير محدد');
        }
        e.preventDefault(); // منع ظهور الخطأ في Console
    });
    
})();
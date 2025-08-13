// إعدادات النظام
const CONFIG = {
    // إعدادات عامة
    APP_NAME: 'نظام إدارة المشاريع والفرق',
    APP_VERSION: '1.0.0',
    APP_DESCRIPTION: 'نظام شامل لإدارة المشاريع والفرق مع لوحة تحكم تفاعلية',
    
    // إعدادات التخزين
    STORAGE: {
        PREFIX: 'pms_', // بادئة مفاتيح التخزين
        AUTO_SAVE_INTERVAL: 30000, // 30 ثانية
        BACKUP_INTERVAL: 300000, // 5 دقائق
        MAX_BACKUPS: 10
    },
    
    // إعدادات الأمان
    SECURITY: {
        SESSION_TIMEOUT: 3600000, // ساعة واحدة
        MAX_LOGIN_ATTEMPTS: 5,
        LOCKOUT_DURATION: 900000, // 15 دقيقة
        PASSWORD_MIN_LENGTH: 6
    },
    
    // إعدادات الواجهة
    UI: {
        THEME: 'default',
        LANGUAGE: 'ar',
        DIRECTION: 'rtl',
        ANIMATIONS_ENABLED: true,
        NOTIFICATIONS_ENABLED: true,
        AUTO_REFRESH_INTERVAL: 60000 // دقيقة واحدة
    },
    
    // إعدادات الرسوم البيانية
    CHARTS: {
        DEFAULT_COLORS: [
            '#667eea', '#764ba2', '#f093fb', '#f5576c',
            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
            '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
        ],
        ANIMATION_DURATION: 1000,
        RESPONSIVE: true
    },
    
    // إعدادات التقارير
    REPORTS: {
        DEFAULT_FORMAT: 'json',
        INCLUDE_CHARTS: true,
        DATE_FORMAT: 'YYYY-MM-DD',
        TIME_FORMAT: 'HH:mm:ss'
    },
    
    // إعدادات الأداء
    PERFORMANCE: {
        LAZY_LOADING: true,
        CACHE_ENABLED: true,
        DEBOUNCE_DELAY: 300,
        PAGINATION_SIZE: 20
    },
    
    // إعدادات التطوير
    DEVELOPMENT: {
        DEBUG_MODE: false,
        CONSOLE_LOGGING: true,
        ERROR_REPORTING: true,
        PERFORMANCE_MONITORING: false
    },
    
    // الصلاحيات الافتراضية
    DEFAULT_PERMISSIONS: {
        admin: [
            'create_user', 'edit_user', 'delete_user', 'view_user',
            'create_project', 'edit_project', 'delete_project', 'view_project',
            'create_task', 'edit_task', 'delete_task', 'view_task',
            'view_reports', 'export_data', 'import_data',
            'manage_system', 'backup_data'
        ],
        manager: [
            'create_project', 'edit_project', 'view_project',
            'create_task', 'edit_task', 'view_task',
            'view_reports', 'export_data'
        ],
        employee: [
            'view_project', 'view_task', 'edit_own_task'
        ]
    },
    
    // رسائل النظام
    MESSAGES: {
        LOGIN_SUCCESS: 'تم تسجيل الدخول بنجاح',
        LOGIN_FAILED: 'اسم المستخدم أو كلمة المرور غير صحيحة',
        LOGOUT_SUCCESS: 'تم تسجيل الخروج بنجاح',
        SAVE_SUCCESS: 'تم الحفظ بنجاح',
        DELETE_SUCCESS: 'تم الحذف بنجاح',
        UPDATE_SUCCESS: 'تم التحديث بنجاح',
        ERROR_OCCURRED: 'حدث خطأ غير متوقع',
        NO_PERMISSION: 'ليس لديك صلاحية للقيام بهذا الإجراء',
        CONFIRM_DELETE: 'هل أنت متأكد من الحذف؟',
        UNSAVED_CHANGES: 'لديك تغييرات غير محفوظة'
    },
    
    // إعدادات التحقق من صحة البيانات
    VALIDATION: {
        USERNAME_MIN_LENGTH: 3,
        USERNAME_MAX_LENGTH: 20,
        PASSWORD_MIN_LENGTH: 6,
        PASSWORD_MAX_LENGTH: 50,
        PROJECT_NAME_MIN_LENGTH: 3,
        PROJECT_NAME_MAX_LENGTH: 100,
        TASK_TITLE_MIN_LENGTH: 3,
        TASK_TITLE_MAX_LENGTH: 200,
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    
    // إعدادات التصدير
    EXPORT: {
        FORMATS: ['json', 'csv', 'xlsx'],
        INCLUDE_METADATA: true,
        COMPRESS_DATA: false
    }
};

// دالة للحصول على إعداد معين
function getConfig(path) {
    const keys = path.split('.');
    let value = CONFIG;
    
    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = value[key];
        } else {
            return undefined;
        }
    }
    
    return value;
}

// دالة لتحديث إعداد معين
function setConfig(path, newValue) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    let target = CONFIG;
    
    for (const key of keys) {
        if (!(key in target) || typeof target[key] !== 'object') {
            target[key] = {};
        }
        target = target[key];
    }
    
    target[lastKey] = newValue;
    
    // حفظ الإعدادات المحدثة
    saveConfig();
}

// دالة لحفظ الإعدادات في التخزين المحلي
function saveConfig() {
    try {
        localStorage.setItem(CONFIG.STORAGE.PREFIX + 'config', JSON.stringify(CONFIG));
    } catch (error) {
        console.error('خطأ في حفظ الإعدادات:', error);
    }
}

// دالة لتحميل الإعدادات من التخزين المحلي
function loadConfig() {
    try {
        const savedConfig = localStorage.getItem(CONFIG.STORAGE.PREFIX + 'config');
        if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig);
            // دمج الإعدادات المحفوظة مع الإعدادات الافتراضية
            Object.assign(CONFIG, parsedConfig);
        }
    } catch (error) {
        console.error('خطأ في تحميل الإعدادات:', error);
    }
}

// دالة لإعادة تعيين الإعدادات إلى القيم الافتراضية
function resetConfig() {
    localStorage.removeItem(CONFIG.STORAGE.PREFIX + 'config');
    location.reload(); // إعادة تحميل الصفحة لتطبيق الإعدادات الافتراضية
}

// دالة للحصول على معلومات النظام
function getSystemInfo() {
    return {
        appName: CONFIG.APP_NAME,
        appVersion: CONFIG.APP_VERSION,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        localStorage: typeof(Storage) !== "undefined",
        sessionStorage: typeof(sessionStorage) !== "undefined",
        indexedDB: typeof(indexedDB) !== "undefined"
    };
}

// دالة لتصدير الإعدادات
function exportConfig() {
    const configData = {
        config: CONFIG,
        systemInfo: getSystemInfo(),
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// دالة لاستيراد الإعدادات
function importConfig(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData.config) {
                    Object.assign(CONFIG, importedData.config);
                    saveConfig();
                    resolve(true);
                } else {
                    reject(new Error('ملف الإعدادات غير صالح'));
                }
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('خطأ في قراءة الملف'));
        reader.readAsText(file);
    });
}

// تحميل الإعدادات عند بدء التشغيل
loadConfig();

// تصدير الكائنات والدوال
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        getConfig,
        setConfig,
        saveConfig,
        loadConfig,
        resetConfig,
        getSystemInfo,
        exportConfig,
        importConfig
    };
} else {
    // جعل الدوال متاحة عالمياً في المتصفح
    window.CONFIG = CONFIG;
    window.getConfig = getConfig;
    window.setConfig = setConfig;
    window.saveConfig = saveConfig;
    window.loadConfig = loadConfig;
    window.resetConfig = resetConfig;
    window.getSystemInfo = getSystemInfo;
    window.exportConfig = exportConfig;
    window.importConfig = importConfig;
}

// رسالة ترحيب في وحدة التحكم
console.log(`
🚀 ${CONFIG.APP_NAME} v${CONFIG.APP_VERSION}
📋 الإعدادات محملة بنجاح
🔧 استخدم getConfig('path') للحصول على إعداد
⚙️ استخدم setConfig('path', value) لتحديث إعداد
`);
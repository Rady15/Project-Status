// إدارة البيانات المحلية
class DataManager {
    constructor() {
        this.initializeData();
    }

    // تهيئة البيانات الافتراضية
    initializeData() {
        // المستخدمون الافتراضيون
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    id: 1,
                    name: 'أحمد محمد',
                    username: 'admin',
                    password: 'admin123',
                    role: 'admin',
                    email: 'admin@company.com',
                    avatar: 'أ',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'سارة أحمد',
                    username: 'sara',
                    password: 'sara123',
                    role: 'manager',
                    email: 'sara@company.com',
                    avatar: 'س',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 3,
                    name: 'محمد علي',
                    username: 'mohamed',
                    password: 'mohamed123',
                    role: 'employee',
                    email: 'mohamed@company.com',
                    avatar: 'م',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 4,
                    name: 'فاطمة حسن',
                    username: 'fatima',
                    password: 'fatima123',
                    role: 'employee',
                    email: 'fatima@company.com',
                    avatar: 'ف',
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }

        // المشاريع الافتراضية
        if (!localStorage.getItem('projects')) {
            const defaultProjects = [
                {
                    id: 1,
                    name: 'تطوير موقع الشركة',
                    description: 'تطوير موقع إلكتروني جديد للشركة مع لوحة تحكم',
                    managerId: 2,
                    deadline: '2024-03-15',
                    status: 'in-progress',
                    progress: 65,
                    createdAt: '2024-01-01T00:00:00.000Z'
                },
                {
                    id: 2,
                    name: 'تطبيق الهاتف المحمول',
                    description: 'تطوير تطبيق للهواتف الذكية لخدمة العملاء',
                    managerId: 2,
                    deadline: '2024-04-20',
                    status: 'pending',
                    progress: 25,
                    createdAt: '2024-01-15T00:00:00.000Z'
                },
                {
                    id: 3,
                    name: 'نظام إدارة المخزون',
                    description: 'تطوير نظام شامل لإدارة المخزون والمبيعات',
                    managerId: 1,
                    deadline: '2024-05-30',
                    status: 'completed',
                    progress: 100,
                    createdAt: '2023-12-01T00:00:00.000Z'
                }
            ];
            localStorage.setItem('projects', JSON.stringify(defaultProjects));
        }

        // المهام الافتراضية
        if (!localStorage.getItem('tasks')) {
            const defaultTasks = [
                {
                    id: 1,
                    title: 'تصميم واجهة المستخدم الرئيسية',
                    description: 'تصميم الصفحة الرئيسية وصفحات التنقل الأساسية',
                    projectId: 1,
                    assigneeId: 3,
                    priority: 'high',
                    status: 'completed',
                    progress: 100,
                    deadline: '2024-02-01',
                    timeSpent: 24,
                    notes: 'تم الانتهاء من التصميم وفقاً للمواصفات المطلوبة',
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-25T00:00:00.000Z'
                },
                {
                    id: 2,
                    title: 'تطوير نظام تسجيل الدخول',
                    description: 'برمجة نظام المصادقة وتسجيل الدخول',
                    projectId: 1,
                    assigneeId: 4,
                    priority: 'high',
                    status: 'in-progress',
                    progress: 80,
                    deadline: '2024-02-10',
                    timeSpent: 18,
                    notes: 'تم الانتهاء من الواجهة الأمامية، جاري العمل على الخلفية',
                    createdAt: '2024-01-05T00:00:00.000Z',
                    updatedAt: '2024-02-01T00:00:00.000Z'
                },
                {
                    id: 3,
                    title: 'إعداد قاعدة البيانات',
                    description: 'تصميم وإعداد قاعدة البيانات للمشروع',
                    projectId: 1,
                    assigneeId: 3,
                    priority: 'medium',
                    status: 'completed',
                    progress: 100,
                    deadline: '2024-01-20',
                    timeSpent: 12,
                    notes: 'تم إعداد قاعدة البيانات بنجاح مع جميع الجداول المطلوبة',
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-18T00:00:00.000Z'
                },
                {
                    id: 4,
                    title: 'تطوير API للتطبيق',
                    description: 'برمجة واجهات برمجة التطبيقات للتطبيق المحمول',
                    projectId: 2,
                    assigneeId: 4,
                    priority: 'high',
                    status: 'pending',
                    progress: 0,
                    deadline: '2024-03-01',
                    timeSpent: 0,
                    notes: '',
                    createdAt: '2024-01-15T00:00:00.000Z',
                    updatedAt: '2024-01-15T00:00:00.000Z'
                },
                {
                    id: 5,
                    title: 'تصميم شاشات التطبيق',
                    description: 'تصميم جميع شاشات التطبيق المحمول',
                    projectId: 2,
                    assigneeId: 3,
                    priority: 'medium',
                    status: 'in-progress',
                    progress: 40,
                    deadline: '2024-02-25',
                    timeSpent: 16,
                    notes: 'تم الانتهاء من تصميم 4 شاشات من أصل 10',
                    createdAt: '2024-01-20T00:00:00.000Z',
                    updatedAt: '2024-02-05T00:00:00.000Z'
                }
            ];
            localStorage.setItem('tasks', JSON.stringify(defaultTasks));
        }

        // إعدادات النظام
        if (!localStorage.getItem('settings')) {
            const defaultSettings = {
                companyName: 'شركة التقنية المتقدمة',
                theme: 'light',
                language: 'ar',
                notifications: true,
                autoSave: true
            };
            localStorage.setItem('settings', JSON.stringify(defaultSettings));
        }
    }

    // الحصول على البيانات
    getData(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    }

    // حفظ البيانات
    setData(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // إضافة عنصر جديد
    addItem(key, item) {
        const data = this.getData(key);
        const newId = data.length > 0 ? Math.max(...data.map(item => item.id)) + 1 : 1;
        item.id = newId;
        item.createdAt = new Date().toISOString();
        data.push(item);
        this.setData(key, data);
        return item;
    }

    // تحديث عنصر
    updateItem(key, id, updates) {
        const data = this.getData(key);
        const index = data.findIndex(item => item.id === id);
        if (index !== -1) {
            data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
            this.setData(key, data);
            return data[index];
        }
        return null;
    }

    // حذف عنصر
    deleteItem(key, id) {
        const data = this.getData(key);
        const filteredData = data.filter(item => item.id !== id);
        this.setData(key, filteredData);
        return true;
    }

    // البحث في البيانات
    searchItems(key, searchTerm, fields = []) {
        const data = this.getData(key);
        if (!searchTerm) return data;
        
        return data.filter(item => {
            return fields.some(field => {
                const value = item[field];
                return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
            });
        });
    }

    // فلترة البيانات
    filterItems(key, filters) {
        const data = this.getData(key);
        return data.filter(item => {
            return Object.keys(filters).every(filterKey => {
                const filterValue = filters[filterKey];
                if (!filterValue) return true;
                return item[filterKey] === filterValue;
            });
        });
    }

    // الحصول على عنصر بالمعرف
    getItemById(key, id) {
        const data = this.getData(key);
        return data.find(item => item.id === id);
    }

    // إحصائيات المشاريع
    getProjectStats() {
        const projects = this.getData('projects');
        const tasks = this.getData('tasks');
        
        return {
            total: projects.length,
            completed: projects.filter(p => p.status === 'completed').length,
            inProgress: projects.filter(p => p.status === 'in-progress').length,
            pending: projects.filter(p => p.status === 'pending').length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            averageProgress: projects.reduce((sum, p) => sum + p.progress, 0) / projects.length || 0
        };
    }

    // إحصائيات المهام
    getTaskStats() {
        const tasks = this.getData('tasks');
        
        return {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'completed').length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            pending: tasks.filter(t => t.status === 'pending').length,
            highPriority: tasks.filter(t => t.priority === 'high').length,
            mediumPriority: tasks.filter(t => t.priority === 'medium').length,
            lowPriority: tasks.filter(t => t.priority === 'low').length
        };
    }

    // إحصائيات الفريق
    getTeamStats() {
        const users = this.getData('users');
        const tasks = this.getData('tasks');
        
        return users.map(user => {
            const userTasks = tasks.filter(t => t.assigneeId === user.id);
            const completedTasks = userTasks.filter(t => t.status === 'completed');
            const totalTimeSpent = userTasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0);
            
            return {
                ...user,
                totalTasks: userTasks.length,
                completedTasks: completedTasks.length,
                timeSpent: totalTimeSpent,
                productivity: userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0
            };
        });
    }

    // تصدير البيانات
    exportData() {
        return {
            users: this.getData('users'),
            projects: this.getData('projects'),
            tasks: this.getData('tasks'),
            settings: this.getData('settings'),
            exportDate: new Date().toISOString()
        };
    }

    // استيراد البيانات
    importData(data) {
        try {
            if (data.users) this.setData('users', data.users);
            if (data.projects) this.setData('projects', data.projects);
            if (data.tasks) this.setData('tasks', data.tasks);
            if (data.settings) this.setData('settings', data.settings);
            return true;
        } catch (error) {
            console.error('خطأ في استيراد البيانات:', error);
            return false;
        }
    }

    // مسح جميع البيانات
    clearAllData() {
        localStorage.clear();
        this.initializeData();
    }

    // نسخ احتياطي للبيانات
    createBackup() {
        const backup = this.exportData();
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// إنشاء مثيل عام لإدارة البيانات
const dataManager = new DataManager();
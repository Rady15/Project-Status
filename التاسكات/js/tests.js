// اختبارات بسيطة للنظام
class SystemTests {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    // إضافة اختبار جديد
    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    // تشغيل جميع الاختبارات
    runAllTests() {
        console.log('🧪 بدء تشغيل الاختبارات...');
        console.log('================================');

        this.tests.forEach(test => {
            this.runTest(test);
        });

        this.showResults();
    }

    // تشغيل اختبار واحد
    runTest(test) {
        try {
            const result = test.testFunction();
            if (result) {
                console.log(`✅ ${test.name}: نجح`);
                this.results.passed++;
            } else {
                console.log(`❌ ${test.name}: فشل`);
                this.results.failed++;
            }
        } catch (error) {
            console.log(`❌ ${test.name}: خطأ - ${error.message}`);
            this.results.failed++;
        }
        this.results.total++;
    }

    // عرض النتائج
    showResults() {
        console.log('================================');
        console.log(`📊 نتائج الاختبارات:`);
        console.log(`✅ نجح: ${this.results.passed}`);
        console.log(`❌ فشل: ${this.results.failed}`);
        console.log(`📈 المجموع: ${this.results.total}`);
        console.log(`🎯 معدل النجاح: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    }
}

// إنشاء مثيل الاختبارات
const systemTests = new SystemTests();

// اختبارات إدارة البيانات
systemTests.addTest('تهيئة إدارة البيانات', () => {
    return typeof dataManager !== 'undefined' && dataManager.data !== undefined;
});

systemTests.addTest('إضافة مستخدم جديد', () => {
    const initialCount = dataManager.getData('users').length;
    const newUser = dataManager.addItem('users', {
        name: 'اختبار',
        username: 'test_user',
        password: 'test123',
        role: 'employee'
    });
    const finalCount = dataManager.getData('users').length;
    
    // حذف المستخدم التجريبي
    if (newUser) {
        dataManager.deleteItem('users', newUser.id);
    }
    
    return newUser && finalCount === initialCount + 1;
});

systemTests.addTest('إضافة مشروع جديد', () => {
    const initialCount = dataManager.getData('projects').length;
    const newProject = dataManager.addItem('projects', {
        name: 'مشروع اختبار',
        description: 'وصف المشروع',
        status: 'pending',
        progress: 0,
        managerId: 1
    });
    const finalCount = dataManager.getData('projects').length;
    
    // حذف المشروع التجريبي
    if (newProject) {
        dataManager.deleteItem('projects', newProject.id);
    }
    
    return newProject && finalCount === initialCount + 1;
});

systemTests.addTest('إضافة مهمة جديدة', () => {
    const initialCount = dataManager.getData('tasks').length;
    const newTask = dataManager.addItem('tasks', {
        title: 'مهمة اختبار',
        description: 'وصف المهمة',
        projectId: 1,
        assigneeId: 1,
        status: 'pending',
        priority: 'medium',
        progress: 0
    });
    const finalCount = dataManager.getData('tasks').length;
    
    // حذف المهمة التجريبية
    if (newTask) {
        dataManager.deleteItem('tasks', newTask.id);
    }
    
    return newTask && finalCount === initialCount + 1;
});

// اختبارات نظام المصادقة
systemTests.addTest('تسجيل دخول صحيح', () => {
    const result = authManager.login('admin', 'admin123');
    if (result) {
        authManager.logout(); // تسجيل خروج بعد الاختبار
    }
    return result;
});

systemTests.addTest('تسجيل دخول خاطئ', () => {
    const result = authManager.login('wrong_user', 'wrong_password');
    return !result; // يجب أن يفشل
});

systemTests.addTest('فحص الصلاحيات', () => {
    authManager.login('admin', 'admin123');
    const hasPermission = authManager.hasPermission('create_user');
    authManager.logout();
    return hasPermission;
});

// اختبارات التخزين المحلي
systemTests.addTest('حفظ البيانات محلياً', () => {
    const testData = { test: 'data' };
    localStorage.setItem('test_data', JSON.stringify(testData));
    const savedData = JSON.parse(localStorage.getItem('test_data'));
    localStorage.removeItem('test_data');
    return savedData && savedData.test === 'data';
});

// اختبارات الواجهة
systemTests.addTest('وجود العناصر الأساسية', () => {
    const loginForm = document.getElementById('loginForm');
    const dashboard = document.getElementById('dashboard');
    const sidebar = document.querySelector('.sidebar');
    return loginForm && dashboard && sidebar;
});

systemTests.addTest('تحميل مكتبة الرسوم البيانية', () => {
    return typeof Chart !== 'undefined';
});

// اختبارات الأداء
systemTests.addTest('سرعة تحميل البيانات', () => {
    const startTime = performance.now();
    const users = dataManager.getData('users');
    const projects = dataManager.getData('projects');
    const tasks = dataManager.getData('tasks');
    const endTime = performance.now();
    
    const loadTime = endTime - startTime;
    console.log(`⏱️ وقت تحميل البيانات: ${loadTime.toFixed(2)} مللي ثانية`);
    
    return loadTime < 100; // يجب أن يكون أقل من 100 مللي ثانية
});

// اختبارات التوافق
systemTests.addTest('دعم LocalStorage', () => {
    return typeof(Storage) !== "undefined";
});

systemTests.addTest('دعم ES6', () => {
    try {
        eval('const test = () => {}; class Test {}');
        return true;
    } catch (e) {
        return false;
    }
});

systemTests.addTest('دعم Fetch API', () => {
    return typeof fetch !== 'undefined';
});

// دالة لتشغيل الاختبارات من وحدة التحكم
window.runTests = () => {
    systemTests.runAllTests();
};

// دالة لتشغيل اختبار محدد
window.runTest = (testName) => {
    const test = systemTests.tests.find(t => t.name === testName);
    if (test) {
        systemTests.runTest(test);
    } else {
        console.log(`❌ لم يتم العثور على الاختبار: ${testName}`);
    }
};

// دالة لعرض قائمة الاختبارات المتاحة
window.listTests = () => {
    console.log('📋 الاختبارات المتاحة:');
    systemTests.tests.forEach((test, index) => {
        console.log(`${index + 1}. ${test.name}`);
    });
};

// تشغيل الاختبارات تلقائياً في وضع التطوير
if (localStorage.getItem('devMode') === 'true') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            console.log('🔧 وضع التطوير مفعل - تشغيل الاختبارات...');
            systemTests.runAllTests();
        }, 2000);
    });
}

// إضافة أوامر مساعدة لوحدة التحكم
console.log(`
🧪 أوامر الاختبار المتاحة:
- runTests(): تشغيل جميع الاختبارات
- runTest('اسم الاختبار'): تشغيل اختبار محدد
- listTests(): عرض قائمة الاختبارات
- localStorage.setItem('devMode', 'true'): تفعيل وضع التطوير
`);

export default systemTests;
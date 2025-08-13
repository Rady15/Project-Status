// إدارة المصادقة وتسجيل الدخول
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // التحقق من وجود جلسة مفتوحة
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showMainPage();
        } else {
            this.showLoginPage();
        }

        // إعداد أحداث تسجيل الدخول
        this.setupLoginEvents();
    }

    setupLoginEvents() {
        const loginForm = document.getElementById('loginForm');
        const logoutBtn = document.getElementById('logoutBtn');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    async handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        // مسح رسائل الخطأ السابقة
        errorDiv.textContent = '';

        // التحقق من صحة البيانات
        if (!username || !password) {
            this.showError('يرجى إدخال اسم المستخدم وكلمة المرور');
            return;
        }

        // البحث عن المستخدم في قاعدة البيانات
        const users = dataManager.getData('users');
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            // تسجيل دخول ناجح
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // تسجيل وقت آخر دخول
            dataManager.updateItem('users', user.id, {
                lastLogin: new Date().toISOString()
            });

            this.showMainPage();
            this.updateUserInterface();
            
            // إضافة أزرار شريط الأدوات
            setTimeout(() => {
                if (typeof addToolbarButtons === 'function') {
                    addToolbarButtons();
                }
            }, 500);
            
            // إظهار رسالة ترحيب
            this.showWelcomeMessage();
        } else {
            this.showError('اسم المستخدم أو كلمة المرور غير صحيحة');
        }
    }

    handleLogout() {
        // مسح بيانات الجلسة
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        
        // العودة إلى صفحة تسجيل الدخول
        this.showLoginPage();
        
        // مسح النماذج
        this.clearForms();
    }

    showLoginPage() {
        // إزالة كلاس logged-in من الـ body
        document.body.classList.remove('logged-in');
        
        document.getElementById('loginPage').classList.add('active');
        document.getElementById('mainPage').classList.remove('active');
        
        // تركيز على حقل اسم المستخدم
        setTimeout(() => {
            const usernameField = document.getElementById('username');
            if (usernameField) {
                usernameField.focus();
            }
        }, 100);
    }

    showMainPage() {
        // إضافة كلاس logged-in للـ body
        document.body.classList.add('logged-in');
        
        document.getElementById('loginPage').classList.remove('active');
        document.getElementById('mainPage').classList.add('active');
    }

    updateUserInterface() {
        if (!this.currentUser) return;

        // تحديث اسم المستخدم في الشريط العلوي
        const currentUserSpan = document.getElementById('currentUser');
        if (currentUserSpan) {
            currentUserSpan.textContent = `مرحباً، ${this.currentUser.name}`;
        }

        // إظهار/إخفاء قائمة الإدارة حسب صلاحيات المستخدم
        const adminMenu = document.getElementById('adminMenu');
        if (adminMenu) {
            if (this.currentUser.role === 'admin') {
                adminMenu.style.display = 'block';
            } else {
                adminMenu.style.display = 'none';
            }
        }

        // تحديث الصلاحيات في الواجهة
        this.updatePermissions();
    }

    updatePermissions() {
        const userRole = this.currentUser.role;
        
        // إخفاء/إظهار الأزرار حسب الصلاحيات
        const addProjectBtn = document.getElementById('addProjectBtn');
        const addUserBtn = document.getElementById('addUserBtn');
        
        if (userRole === 'employee') {
            // الموظف العادي يمكنه فقط عرض المهام وتحديثها
            if (addProjectBtn) addProjectBtn.style.display = 'none';
            if (addUserBtn) addUserBtn.style.display = 'none';
        } else if (userRole === 'manager') {
            // المدير يمكنه إدارة المشاريع والمهام
            if (addProjectBtn) addProjectBtn.style.display = 'inline-block';
            if (addUserBtn) addUserBtn.style.display = 'none';
        } else if (userRole === 'admin') {
            // المدير العام له صلاحيات كاملة
            if (addProjectBtn) addProjectBtn.style.display = 'inline-block';
            if (addUserBtn) addUserBtn.style.display = 'inline-block';
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            // إخفاء الرسالة بعد 5 ثوان
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    showWelcomeMessage() {
        // إنشاء رسالة ترحيب
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'success-message';
        welcomeDiv.textContent = `مرحباً بك ${this.currentUser.name}!`;
        
        // إضافة الرسالة إلى أعلى المحتوى الرئيسي
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(welcomeDiv, mainContent.firstChild);
            
            // إزالة الرسالة بعد 3 ثوان
            setTimeout(() => {
                welcomeDiv.remove();
            }, 3000);
        }
    }

    clearForms() {
        // مسح نموذج تسجيل الدخول
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.reset();
        }
        
        // مسح رسائل الخطأ
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }
    }

    // التحقق من الصلاحيات
    hasPermission(action) {
        if (!this.currentUser) return false;
        
        const role = this.currentUser.role;
        
        switch (action) {
            case 'create_project':
                return role === 'admin' || role === 'manager';
            case 'delete_project':
                return role === 'admin';
            case 'create_user':
                return role === 'admin';
            case 'delete_user':
                return role === 'admin';
            case 'view_reports':
                return role === 'admin' || role === 'manager';
            case 'update_task':
                return true; // جميع المستخدمين يمكنهم تحديث المهام المكلفين بها
            case 'create_task':
                return role === 'admin' || role === 'manager';
            case 'delete_task':
                return role === 'admin' || role === 'manager';
            default:
                return false;
        }
    }

    // الحصول على المستخدم الحالي
    getCurrentUser() {
        return this.currentUser;
    }

    // التحقق من تسجيل الدخول
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // تغيير كلمة المرور
    changePassword(oldPassword, newPassword) {
        if (!this.currentUser) return false;
        
        if (this.currentUser.password !== oldPassword) {
            return { success: false, message: 'كلمة المرور الحالية غير صحيحة' };
        }
        
        if (newPassword.length < 6) {
            return { success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
        }
        
        // تحديث كلمة المرور
        const updatedUser = dataManager.updateItem('users', this.currentUser.id, {
            password: newPassword
        });
        
        if (updatedUser) {
            this.currentUser = updatedUser;
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            return { success: true, message: 'تم تغيير كلمة المرور بنجاح' };
        }
        
        return { success: false, message: 'حدث خطأ أثناء تغيير كلمة المرور' };
    }

    // تحديث بيانات المستخدم
    updateProfile(updates) {
        if (!this.currentUser) return false;
        
        const updatedUser = dataManager.updateItem('users', this.currentUser.id, updates);
        
        if (updatedUser) {
            this.currentUser = updatedUser;
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            this.updateUserInterface();
            return { success: true, message: 'تم تحديث البيانات بنجاح' };
        }
        
        return { success: false, message: 'حدث خطأ أثناء تحديث البيانات' };
    }
}

// إنشاء مثيل عام لإدارة المصادقة
const authManager = new AuthManager();
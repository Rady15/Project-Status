// الملف الرئيسي للتطبيق
class App {
    constructor() {
        this.currentSection = 'dashboard';
        this.lastUpdateTime = null;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupModals();
        this.setupGlobalEvents();
        
        // تحديث الواجهة بناءً على المستخدم الحالي
        if (authManager.isLoggedIn()) {
            authManager.updateUserInterface();
            this.showSection('dashboard');
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const section = link.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                    this.updateActiveNavLink(link);
                }
            });
        });
    }

    showSection(sectionName) {
        // منع التبديل المتكرر للقسم نفسه
        if (this.currentSection === sectionName) {
            return;
        }

        // إخفاء جميع الأقسام
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // إظهار القسم المحدد
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            
            // تحديث البيانات حسب القسم
            this.updateSectionData(sectionName);
        }
    }

    updateActiveNavLink(activeLink) {
        // إزالة الفئة النشطة من جميع الروابط
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // إضافة الفئة النشطة للرابط المحدد
        activeLink.classList.add('active');
    }

    updateSectionData(sectionName) {
        // منع التحديث المتكرر للقسم نفسه
        if (this.currentSection === sectionName && this.lastUpdateTime && 
            (Date.now() - this.lastUpdateTime) < 1000) {
            return;
        }

        this.lastUpdateTime = Date.now();
        
        // تأخير قصير للتأكد من ظهور القسم
        setTimeout(() => {
            try {
                switch (sectionName) {
                    case 'dashboard':
                        if (typeof dashboardManager !== 'undefined') {
                            dashboardManager.updateStats();
                            if (!dashboardManager.isInitialized) {
                                dashboardManager.createCharts();
                            } else {
                                dashboardManager.updateCharts();
                            }
                            dashboardManager.loadRecentTasks();
                        }
                        break;
                    case 'projects':
                        if (typeof projectsManager !== 'undefined') {
                            projectsManager.loadProjects();
                        }
                        break;
                    case 'tasks':
                        if (typeof tasksManager !== 'undefined') {
                            tasksManager.loadTasks();
                            tasksManager.setupFilters();
                        }
                        break;
                    case 'team':
                        if (typeof teamManager !== 'undefined') {
                            teamManager.loadTeam();
                        }
                        break;
                    case 'reports':
                        if (typeof reportsManager !== 'undefined') {
                            reportsManager.updateCharts();
                        }
                        break;
                    case 'admin':
                        if (typeof adminManager !== 'undefined' && authManager.hasPermission('create_user')) {
                            adminManager.loadUsers();
                        }
                        break;
                }
            } catch (error) {
                console.error(`خطأ في تحديث قسم ${sectionName}:`, error);
            }
        }, 100);
    }

    setupModals() {
        // إغلاق النوافذ المنبثقة عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
            }
        });

        // إغلاق النوافذ المنبثقة بمفتاح Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                }
            }
        });
    }

    setupGlobalEvents() {
        // تحديث البيانات كل دقيقة
        setInterval(() => {
            if (authManager.isLoggedIn()) {
                this.updateSectionData(this.currentSection);
            }
        }, 60000);

        // حفظ تلقائي للبيانات
        setInterval(() => {
            this.autoSave();
        }, 30000);

        // معالجة أخطاء JavaScript
        window.addEventListener('error', (e) => {
            if (e.error && e.error.message) {
                console.error('خطأ في التطبيق:', e.error.message);
            } else if (e.message) {
                console.error('خطأ في التطبيق:', e.message);
            } else {
                console.error('خطأ غير محدد في التطبيق');
            }
            
            // عدم إظهار رسالة خطأ للمستخدم إلا في حالات معينة
            if (e.error && e.error.message && !e.error.message.includes('Canvas is already in use')) {
                this.showErrorMessage('حدث خطأ غير متوقع. يرجى إعادة تحميل الصفحة.');
            }
        });

        // معالجة فقدان الاتصال بالإنترنت
        window.addEventListener('offline', () => {
            this.showWarningMessage('تم فقدان الاتصال بالإنترنت. التطبيق يعمل في وضع عدم الاتصال.');
        });

        window.addEventListener('online', () => {
            this.showSuccessMessage('تم استعادة الاتصال بالإنترنت.');
        });
    }

    autoSave() {
        // حفظ البيانات المؤقتة إذا كانت هناك تغييرات غير محفوظة
        const hasUnsavedChanges = this.checkUnsavedChanges();
        if (hasUnsavedChanges) {
            this.saveTemporaryData();
        }
    }

    checkUnsavedChanges() {
        // فحص وجود نماذج مفتوحة أو تغييرات غير محفوظة
        const openModals = document.querySelectorAll('.modal.active');
        return openModals.length > 0;
    }

    saveTemporaryData() {
        // حفظ البيانات المؤقتة في localStorage
        const tempData = {
            currentSection: this.currentSection,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('tempData', JSON.stringify(tempData));
    }

    // دوال عرض الرسائل
    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showWarningMessage(message) {
        this.showMessage(message, 'warning');
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <i class="fas fa-${this.getMessageIcon(type)}"></i>
                <span>${message}</span>
                <button class="message-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // إضافة الرسالة إلى أعلى الصفحة
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(messageDiv, mainContent.firstChild);
            
            // إزالة الرسالة تلقائياً بعد 5 ثوان
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }

    getMessageIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // دوال مساعدة عامة
    formatDate(dateString) {
        if (!dateString) return 'غير محدد';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA');
    }

    formatDateTime(dateString) {
        if (!dateString) return 'غير محدد';
        const date = new Date(dateString);
        return date.toLocaleString('ar-SA');
    }

    formatTime(hours) {
        if (hours < 1) {
            return `${Math.round(hours * 60)} دقيقة`;
        } else if (hours < 24) {
            return `${hours} ساعة`;
        } else {
            const days = Math.floor(hours / 24);
            const remainingHours = hours % 24;
            return `${days} يوم ${remainingHours > 0 ? `و ${remainingHours} ساعة` : ''}`;
        }
    }

    // تصدير البيانات
    exportAllData() {
        const allData = dataManager.exportData();
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project_management_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccessMessage('تم تصدير البيانات بنجاح');
    }

    // طباعة التقرير الحالي
    printCurrentSection() {
        const currentSection = document.querySelector('.content-section.active');
        if (currentSection) {
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl" lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <title>طباعة - ${this.getSectionTitle(this.currentSection)}</title>
                    <style>
                        body { font-family: Arial, sans-serif; direction: rtl; }
                        .no-print { display: none !important; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
                        th { background-color: #f2f2f2; }
                        .chart-container { page-break-inside: avoid; }
                    </style>
                </head>
                <body>
                    <h1>${this.getSectionTitle(this.currentSection)}</h1>
                    <p>تاريخ الطباعة: ${new Date().toLocaleString('ar-SA')}</p>
                    ${currentSection.innerHTML}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    }

    getSectionTitle(sectionName) {
        const titles = {
            'dashboard': 'لوحة التحكم',
            'projects': 'المشاريع',
            'tasks': 'المهام',
            'team': 'الفريق',
            'reports': 'التقارير',
            'admin': 'الإدارة'
        };
        return titles[sectionName] || sectionName;
    }

    // البحث العام
    globalSearch(query) {
        if (!query || query.length < 2) return [];

        const results = [];
        
        // البحث في المشاريع
        const projects = dataManager.searchItems('projects', query, ['name', 'description']);
        projects.forEach(project => {
            results.push({
                type: 'project',
                title: project.name,
                description: project.description,
                id: project.id
            });
        });

        // البحث في المهام
        const tasks = dataManager.searchItems('tasks', query, ['title', 'description']);
        tasks.forEach(task => {
            results.push({
                type: 'task',
                title: task.title,
                description: task.description,
                id: task.id
            });
        });

        // البحث في المستخدمين
        const users = dataManager.searchItems('users', query, ['name', 'email']);
        users.forEach(user => {
            results.push({
                type: 'user',
                title: user.name,
                description: user.email,
                id: user.id
            });
        });

        return results;
    }

    // إعداد البحث السريع
    setupQuickSearch() {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'البحث السريع...';
        searchInput.className = 'quick-search';
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            if (query.length >= 2) {
                const results = this.globalSearch(query);
                this.showSearchResults(results);
            } else {
                this.hideSearchResults();
            }
        });

        // إضافة حقل البحث إلى شريط التنقل
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.appendChild(searchInput);
        }
    }

    showSearchResults(results) {
        // إنشاء قائمة نتائج البحث
        let resultsDiv = document.getElementById('searchResults');
        if (!resultsDiv) {
            resultsDiv = document.createElement('div');
            resultsDiv.id = 'searchResults';
            resultsDiv.className = 'search-results';
            document.body.appendChild(resultsDiv);
        }

        if (results.length === 0) {
            resultsDiv.innerHTML = '<div class="search-no-results">لا توجد نتائج</div>';
        } else {
            resultsDiv.innerHTML = results.map(result => `
                <div class="search-result-item" onclick="app.goToResult('${result.type}', ${result.id})">
                    <div class="result-type">${this.getResultTypeText(result.type)}</div>
                    <div class="result-title">${result.title}</div>
                    <div class="result-description">${result.description || ''}</div>
                </div>
            `).join('');
        }

        resultsDiv.style.display = 'block';
    }

    hideSearchResults() {
        const resultsDiv = document.getElementById('searchResults');
        if (resultsDiv) {
            resultsDiv.style.display = 'none';
        }
    }

    getResultTypeText(type) {
        const types = {
            'project': 'مشروع',
            'task': 'مهمة',
            'user': 'مستخدم'
        };
        return types[type] || type;
    }

    goToResult(type, id) {
        this.hideSearchResults();
        
        switch (type) {
            case 'project':
                this.showSection('projects');
                setTimeout(() => projectsManager.viewProject(id), 100);
                break;
            case 'task':
                this.showSection('tasks');
                setTimeout(() => tasksManager.viewTask(id), 100);
                break;
            case 'user':
                this.showSection('team');
                setTimeout(() => teamManager.viewMemberDetails(id), 100);
                break;
        }
    }
}

// دوال عامة للنوافذ المنبثقة
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// تسجيل Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('تم تسجيل Service Worker بنجاح:', registration.scope);
            })
            .catch(error => {
                console.log('فشل في تسجيل Service Worker:', error);
            });
    });
}
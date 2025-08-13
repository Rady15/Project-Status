// إدارة النظام والمستخدمين
class AdminManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUsers();
        this.setupTabs();
    }

    setupEventListeners() {
        // زر إضافة مستخدم جديد
        const addUserBtn = document.getElementById('addUserBtn');
        if (addUserBtn) {
            addUserBtn.addEventListener('click', () => {
                this.showAddUserModal();
            });
        }

        // نموذج إضافة مستخدم
        const userForm = document.getElementById('userForm');
        if (userForm) {
            userForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddUser();
            });
        }
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                
                // إزالة الفئة النشطة من جميع الأزرار والمحتويات
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // إضافة الفئة النشطة للزر والمحتوى المحدد
                btn.classList.add('active');
                document.getElementById(targetTab + 'Tab').classList.add('active');
            });
        });
    }

    loadUsers() {
        const users = dataManager.getData('users');
        const usersList = document.getElementById('usersList');

        if (!usersList) return;

        usersList.innerHTML = '';

        if (users.length === 0) {
            usersList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users fa-3x"></i>
                    <h3>لا يوجد مستخدمون</h3>
                    <p>ابدأ بإضافة مستخدمين جدد</p>
                </div>
            `;
            return;
        }

        users.forEach(user => {
            const userItem = this.createUserItem(user);
            usersList.appendChild(userItem);
        });
    }

    createUserItem(user) {
        const item = document.createElement('div');
        item.className = 'user-item fade-in';
        
        const roleText = this.getRoleText(user.role);
        const statusClass = user.lastLogin ? 'active' : 'inactive';
        const lastLoginText = user.lastLogin ? 
            `آخر دخول: ${this.formatDateTime(user.lastLogin)}` : 
            'لم يسجل دخول بعد';

        item.innerHTML = `
            <div class="user-info">
                <div class="user-avatar-small">
                    ${user.avatar || user.name.charAt(0)}
                </div>
                <div class="user-details">
                    <h4>${user.name}</h4>
                    <p class="user-username">@${user.username}</p>
                    <p class="user-role">${roleText}</p>
                    <p class="user-email">${user.email || 'لا يوجد بريد إلكتروني'}</p>
                    <p class="user-status ${statusClass}">${lastLoginText}</p>
                </div>
            </div>
            
            <div class="user-stats">
                <div class="stat-small">
                    <span class="stat-number">${this.getUserTasksCount(user.id)}</span>
                    <span class="stat-label">المهام</span>
                </div>
                <div class="stat-small">
                    <span class="stat-number">${this.getUserProjectsCount(user.id)}</span>
                    <span class="stat-label">المشاريع</span>
                </div>
            </div>
            
            <div class="user-actions">
                <button class="btn btn-sm btn-info" onclick="adminManager.viewUser(${user.id})">
                    <i class="fas fa-eye"></i> عرض
                </button>
                <button class="btn btn-sm btn-warning" onclick="adminManager.editUser(${user.id})">
                    <i class="fas fa-edit"></i> تعديل
                </button>
                <button class="btn btn-sm btn-secondary" onclick="adminManager.resetPassword(${user.id})">
                    <i class="fas fa-key"></i> إعادة تعيين كلمة المرور
                </button>
                ${user.id !== authManager.getCurrentUser()?.id ? `
                    <button class="btn btn-sm btn-danger" onclick="adminManager.deleteUser(${user.id})">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                ` : ''}
            </div>
        `;

        return item;
    }

    showAddUserModal() {
        if (!authManager.hasPermission('create_user')) {
            alert('ليس لديك صلاحية لإضافة مستخدمين جدد');
            return;
        }

        // إظهار النافذة المنبثقة
        const modal = document.getElementById('userModal');
        modal.classList.add('active');
        
        // تركيز على حقل الاسم
        setTimeout(() => {
            document.getElementById('userName').focus();
        }, 100);
    }

    handleAddUser() {
        const formData = {
            name: document.getElementById('userName').value.trim(),
            username: document.getElementById('userUsername').value.trim(),
            password: document.getElementById('userPassword').value,
            role: document.getElementById('userRole').value,
            email: document.getElementById('userEmail').value.trim()
        };

        // التحقق من صحة البيانات
        if (!formData.name) {
            alert('يرجى إدخال اسم المستخدم');
            return;
        }

        if (!formData.username) {
            alert('يرجى إدخال اسم المستخدم للدخول');
            return;
        }

        if (!formData.password) {
            alert('يرجى إدخال كلمة المرور');
            return;
        }

        if (formData.password.length < 6) {
            alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        // التحقق من عدم تكرار اسم المستخدم
        const existingUsers = dataManager.getData('users');
        if (existingUsers.some(u => u.username === formData.username)) {
            alert('اسم المستخدم موجود بالفعل');
            return;
        }

        // إضافة المستخدم الجديد
        const newUser = {
            ...formData,
            avatar: formData.name.charAt(0)
        };

        const addedUser = dataManager.addItem('users', newUser);
        
        if (addedUser) {
            // إغلاق النافذة المنبثقة
            this.closeModal('userModal');
            
            // إعادة تحميل قائمة المستخدمين
            this.loadUsers();
            
            // تحديث لوحة التحكم
            dashboardManager.updateStats();
            
            // إظهار رسالة نجاح
            this.showSuccessMessage('تم إضافة المستخدم بنجاح');
            
            // مسح النموذج
            document.getElementById('userForm').reset();
        } else {
            alert('حدث خطأ أثناء إضافة المستخدم');
        }
    }

    viewUser(userId) {
        const user = dataManager.getItemById('users', userId);
        const tasks = dataManager.getData('tasks').filter(t => t.assigneeId === userId);
        const projects = dataManager.getData('projects');
        
        if (!user) return;
        
        // إحصائيات المستخدم
        const userStats = {
            totalTasks: tasks.length,
            completedTasks: tasks.filter(t => t.status === 'completed').length,
            inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
            pendingTasks: tasks.filter(t => t.status === 'pending').length,
            totalTimeSpent: tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0),
            managedProjects: projects.filter(p => p.managerId === userId).length
        };

        // إنشاء نافذة عرض تفاصيل المستخدم
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'userViewModal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تفاصيل المستخدم: ${user.name}</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="user-details-view">
                    <div class="user-profile-section">
                        <div class="user-avatar-large">
                            ${user.avatar || user.name.charAt(0)}
                        </div>
                        <div class="user-basic-info">
                            <h4>${user.name}</h4>
                            <p class="user-role-large">${this.getRoleText(user.role)}</p>
                            <p class="user-username-large">@${user.username}</p>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>المعلومات الشخصية</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">البريد الإلكتروني:</span>
                                <span class="info-value">${user.email || 'غير محدد'}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">تاريخ الانضمام:</span>
                                <span class="info-value">${this.formatDate(user.createdAt)}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">آخر دخول:</span>
                                <span class="info-value">${user.lastLogin ? this.formatDateTime(user.lastLogin) : 'لم يسجل دخول بعد'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>إحصائيات الأداء</h4>
                        <div class="stats-grid-user">
                            <div class="stat-card-user">
                                <div class="stat-icon-user">
                                    <i class="fas fa-tasks"></i>
                                </div>
                                <div class="stat-info-user">
                                    <h3>${userStats.totalTasks}</h3>
                                    <p>إجمالي المهام</p>
                                </div>
                            </div>
                            <div class="stat-card-user">
                                <div class="stat-icon-user">
                                    <i class="fas fa-check-circle"></i>
                                </div>
                                <div class="stat-info-user">
                                    <h3>${userStats.completedTasks}</h3>
                                    <p>مهام مكتملة</p>
                                </div>
                            </div>
                            <div class="stat-card-user">
                                <div class="stat-icon-user">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <div class="stat-info-user">
                                    <h3>${userStats.totalTimeSpent}</h3>
                                    <p>ساعات العمل</p>
                                </div>
                            </div>
                            <div class="stat-card-user">
                                <div class="stat-icon-user">
                                    <i class="fas fa-project-diagram"></i>
                                </div>
                                <div class="stat-info-user">
                                    <h3>${userStats.managedProjects}</h3>
                                    <p>مشاريع يديرها</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>توزيع المهام</h4>
                        <div class="task-distribution">
                            <div class="distribution-item">
                                <span class="distribution-label">مكتملة</span>
                                <div class="distribution-bar">
                                    <div class="distribution-fill completed" style="width: ${userStats.totalTasks > 0 ? (userStats.completedTasks / userStats.totalTasks) * 100 : 0}%"></div>
                                </div>
                                <span class="distribution-count">${userStats.completedTasks}</span>
                            </div>
                            <div class="distribution-item">
                                <span class="distribution-label">قيد التنفيذ</span>
                                <div class="distribution-bar">
                                    <div class="distribution-fill in-progress" style="width: ${userStats.totalTasks > 0 ? (userStats.inProgressTasks / userStats.totalTasks) * 100 : 0}%"></div>
                                </div>
                                <span class="distribution-count">${userStats.inProgressTasks}</span>
                            </div>
                            <div class="distribution-item">
                                <span class="distribution-label">قيد الانتظار</span>
                                <div class="distribution-bar">
                                    <div class="distribution-fill pending" style="width: ${userStats.totalTasks > 0 ? (userStats.pendingTasks / userStats.totalTasks) * 100 : 0}%"></div>
                                </div>
                                <span class="distribution-count">${userStats.pendingTasks}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${tasks.length > 0 ? `
                        <div class="detail-section">
                            <h4>المهام الحديثة</h4>
                            <div class="recent-tasks-list">
                                ${tasks.slice(0, 5).map(task => {
                                    const project = projects.find(p => p.id === task.projectId);
                                    return `
                                        <div class="task-item-mini">
                                            <div class="task-info-mini">
                                                <h5>${task.title}</h5>
                                                <p>${project ? project.name : 'غير محدد'}</p>
                                            </div>
                                            <div class="task-status-mini">
                                                <span class="status-badge status-${task.status}">${this.getStatusText(task.status)}</span>
                                                <span class="progress-mini">${task.progress}%</span>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إضافة حدث الإغلاق
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    editUser(userId) {
        if (!authManager.hasPermission('create_user')) {
            alert('ليس لديك صلاحية لتعديل المستخدمين');
            return;
        }

        const user = dataManager.getItemById('users', userId);
        if (!user) return;

        // إنشاء نافذة تعديل المستخدم
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'editUserModal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تعديل المستخدم</h3>
                    <span class="close">&times;</span>
                </div>
                <form id="editUserForm">
                    <div class="form-group">
                        <label for="editUserName">الاسم:</label>
                        <input type="text" id="editUserName" value="${user.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="editUserUsername">اسم المستخدم:</label>
                        <input type="text" id="editUserUsername" value="${user.username}" required>
                    </div>
                    <div class="form-group">
                        <label for="editUserEmail">البريد الإلكتروني:</label>
                        <input type="email" id="editUserEmail" value="${user.email || ''}">
                    </div>
                    <div class="form-group">
                        <label for="editUserRole">الدور:</label>
                        <select id="editUserRole">
                            <option value="employee" ${user.role === 'employee' ? 'selected' : ''}>موظف</option>
                            <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>مدير</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>مدير عام</option>
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">إلغاء</button>
                        <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إضافة حدث الإغلاق
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });
        
        // إضافة حدث النموذج
        modal.querySelector('#editUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditUser(userId, modal);
        });
    }

    handleEditUser(userId, modal) {
        const updates = {
            name: document.getElementById('editUserName').value.trim(),
            username: document.getElementById('editUserUsername').value.trim(),
            email: document.getElementById('editUserEmail').value.trim(),
            role: document.getElementById('editUserRole').value
        };

        // التحقق من صحة البيانات
        if (!updates.name) {
            alert('يرجى إدخال اسم المستخدم');
            return;
        }

        if (!updates.username) {
            alert('يرجى إدخال اسم المستخدم للدخول');
            return;
        }

        // التحقق من عدم تكرار اسم المستخدم
        const existingUsers = dataManager.getData('users');
        if (existingUsers.some(u => u.username === updates.username && u.id !== userId)) {
            alert('اسم المستخدم موجود بالفعل');
            return;
        }

        const updatedUser = dataManager.updateItem('users', userId, updates);
        
        if (updatedUser) {
            modal.remove();
            this.loadUsers();
            this.showSuccessMessage('تم تحديث بيانات المستخدم بنجاح');
            
            // تحديث بيانات المستخدم الحالي إذا كان هو نفسه
            const currentUser = authManager.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                authManager.updateProfile(updates);
            }
        } else {
            alert('حدث خطأ أثناء تحديث بيانات المستخدم');
        }
    }

    resetPassword(userId) {
        if (!authManager.hasPermission('create_user')) {
            alert('ليس لديك صلاحية لإعادة تعيين كلمات المرور');
            return;
        }

        const user = dataManager.getItemById('users', userId);
        if (!user) return;

        const newPassword = prompt(`إعادة تعيين كلمة المرور للمستخدم: ${user.name}\nأدخل كلمة المرور الجديدة:`);
        
        if (newPassword) {
            if (newPassword.length < 6) {
                alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
                return;
            }

            const updatedUser = dataManager.updateItem('users', userId, { password: newPassword });
            
            if (updatedUser) {
                this.showSuccessMessage('تم إعادة تعيين كلمة المرور بنجاح');
            } else {
                alert('حدث خطأ أثناء إعادة تعيين كلمة المرور');
            }
        }
    }

    deleteUser(userId) {
        if (!authManager.hasPermission('delete_user')) {
            alert('ليس لديك صلاحية لحذف المستخدمين');
            return;
        }

        const user = dataManager.getItemById('users', userId);
        if (!user) return;

        // منع حذف المستخدم الحالي
        const currentUser = authManager.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            alert('لا يمكنك حذف حسابك الخاص');
            return;
        }

        if (confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟\nسيتم إلغاء تكليف جميع المهام المرتبطة بهذا المستخدم.`)) {
            // إلغاء تكليف المهام
            const tasks = dataManager.getData('tasks');
            const userTasks = tasks.filter(t => t.assigneeId === userId);
            
            userTasks.forEach(task => {
                dataManager.updateItem('tasks', task.id, { assigneeId: null });
            });

            // حذف المستخدم
            const deleted = dataManager.deleteItem('users', userId);
            
            if (deleted) {
                this.loadUsers();
                dashboardManager.updateStats();
                this.showSuccessMessage('تم حذف المستخدم بنجاح');
            } else {
                alert('حدث خطأ أثناء حذف المستخدم');
            }
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // دوال مساعدة
    getUserTasksCount(userId) {
        const tasks = dataManager.getData('tasks');
        return tasks.filter(t => t.assigneeId === userId).length;
    }

    getUserProjectsCount(userId) {
        const projects = dataManager.getData('projects');
        return projects.filter(p => p.managerId === userId).length;
    }

    getRoleText(role) {
        const roleTexts = {
            'admin': 'مدير عام',
            'manager': 'مدير',
            'employee': 'موظف'
        };
        return roleTexts[role] || role;
    }

    getStatusText(status) {
        const statusTexts = {
            'pending': 'قيد الانتظار',
            'in-progress': 'قيد التنفيذ',
            'completed': 'مكتملة'
        };
        return statusTexts[status] || status;
    }

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

    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(successDiv, mainContent.firstChild);
            
            setTimeout(() => {
                successDiv.remove();
            }, 3000);
        }
    }

    // إدارة النسخ الاحتياطي
    createBackup() {
        dataManager.createBackup();
        this.showSuccessMessage('تم إنشاء النسخة الاحتياطية بنجاح');
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (dataManager.importData(data)) {
                            this.showSuccessMessage('تم استيراد البيانات بنجاح');
                            // إعادة تحميل الصفحة لتحديث جميع البيانات
                            setTimeout(() => {
                                location.reload();
                            }, 1000);
                        } else {
                            alert('حدث خطأ أثناء استيراد البيانات');
                        }
                    } catch (error) {
                        alert('ملف غير صالح');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    clearAllData() {
        if (confirm('هل أنت متأكد من حذف جميع البيانات؟\nهذا الإجراء لا يمكن التراجع عنه.')) {
            if (confirm('تأكيد أخير: سيتم حذف جميع المشاريع والمهام والمستخدمين!')) {
                dataManager.clearAllData();
                this.showSuccessMessage('تم حذف جميع البيانات');
                
                // إعادة تحميل الصفحة
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        }
    }
}

// إنشاء مثيل عام لإدارة النظام
const adminManager = new AdminManager();
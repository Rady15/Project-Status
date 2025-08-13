// إدارة المشاريع
class ProjectsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadProjects();
    }

    setupEventListeners() {
        // زر إضافة مشروع جديد
        const addProjectBtn = document.getElementById('addProjectBtn');
        if (addProjectBtn) {
            addProjectBtn.addEventListener('click', () => {
                this.showAddProjectModal();
            });
        }

        // نموذج إضافة مشروع
        const projectForm = document.getElementById('projectForm');
        if (projectForm) {
            projectForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddProject();
            });
        }

        // إغلاق النوافذ المنبثقة
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close')) {
                this.closeModal(e.target.closest('.modal').id);
            }
        });
    }

    loadProjects() {
        const projects = dataManager.getData('projects');
        const users = dataManager.getData('users');
        const tasks = dataManager.getData('tasks');
        const projectsList = document.getElementById('projectsList');

        if (!projectsList) return;

        projectsList.innerHTML = '';

        if (projects.length === 0) {
            projectsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-project-diagram fa-3x"></i>
                    <h3>لا توجد مشاريع</h3>
                    <p>ابدأ بإضافة مشروع جديد</p>
                </div>
            `;
            return;
        }

        projects.forEach(project => {
            const manager = users.find(u => u.id === project.managerId);
            const projectTasks = tasks.filter(t => t.projectId === project.id);
            const completedTasks = projectTasks.filter(t => t.status === 'completed');
            
            const projectCard = this.createProjectCard(project, manager, projectTasks, completedTasks);
            projectsList.appendChild(projectCard);
        });
    }

    createProjectCard(project, manager, projectTasks, completedTasks) {
        const card = document.createElement('div');
        card.className = 'project-card fade-in';
        
        const statusClass = this.getStatusClass(project.status);
        const statusText = this.getStatusText(project.status);
        const daysRemaining = this.calculateDaysRemaining(project.deadline);
        
        card.innerHTML = `
            <div class="project-header">
                <h3>${project.name}</h3>
                <p>${project.description || 'لا يوجد وصف'}</p>
            </div>
            <div class="project-body">
                <div class="project-progress">
                    <div class="progress-info">
                        <span>التقدم: ${project.progress}%</span>
                        <span>${completedTasks.length}/${projectTasks.length} مهام</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${project.progress}%"></div>
                    </div>
                </div>
                
                <div class="project-meta">
                    <div class="meta-item">
                        <i class="fas fa-user"></i>
                        <span>${manager ? manager.name : 'غير محدد'}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${this.formatDate(project.deadline)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span class="${daysRemaining < 0 ? 'text-danger' : daysRemaining < 7 ? 'text-warning' : ''}">${this.getDaysRemainingText(daysRemaining)}</span>
                    </div>
                </div>
                
                <div class="project-status">
                    <span class="status-badge status-${project.status}">${statusText}</span>
                </div>
                
                <div class="project-actions">
                    <button class="btn btn-sm btn-primary" onclick="projectsManager.viewProject(${project.id})">
                        <i class="fas fa-eye"></i> عرض
                    </button>
                    ${authManager.hasPermission('create_project') ? `
                        <button class="btn btn-sm btn-warning" onclick="projectsManager.editProject(${project.id})">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                    ` : ''}
                    ${authManager.hasPermission('delete_project') ? `
                        <button class="btn btn-sm btn-danger" onclick="projectsManager.deleteProject(${project.id})">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    ` : ''}
                </div>
            </div>
        `;

        return card;
    }

    showAddProjectModal() {
        if (!authManager.hasPermission('create_project')) {
            alert('ليس لديك صلاحية لإضافة مشاريع جديدة');
            return;
        }

        // تحميل قائمة المديرين
        this.loadManagers();
        
        // إظهار النافذة المنبثقة
        const modal = document.getElementById('projectModal');
        modal.classList.add('active');
        
        // تركيز على حقل اسم المشروع
        setTimeout(() => {
            document.getElementById('projectName').focus();
        }, 100);
    }

    loadManagers() {
        const users = dataManager.getData('users');
        const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');
        const managerSelect = document.getElementById('projectManager');
        
        if (!managerSelect) return;
        
        managerSelect.innerHTML = '<option value="">اختر مدير المشروع</option>';
        
        managers.forEach(manager => {
            const option = document.createElement('option');
            option.value = manager.id;
            option.textContent = manager.name;
            managerSelect.appendChild(option);
        });
    }

    handleAddProject() {
        const formData = {
            name: document.getElementById('projectName').value.trim(),
            description: document.getElementById('projectDescription').value.trim(),
            deadline: document.getElementById('projectDeadline').value,
            managerId: parseInt(document.getElementById('projectManager').value)
        };

        // التحقق من صحة البيانات
        if (!formData.name) {
            alert('يرجى إدخال اسم المشروع');
            return;
        }

        if (!formData.managerId) {
            alert('يرجى اختيار مدير المشروع');
            return;
        }

        // إضافة المشروع الجديد
        const newProject = {
            ...formData,
            status: 'pending',
            progress: 0
        };

        const addedProject = dataManager.addItem('projects', newProject);
        
        if (addedProject) {
            // إغلاق النافذة المنبثقة
            this.closeModal('projectModal');
            
            // إعادة تحميل قائمة المشاريع
            this.loadProjects();
            
            // تحديث لوحة التحكم
            dashboardManager.updateStats();
            dashboardManager.updateCharts();
            
            // إظهار رسالة نجاح
            this.showSuccessMessage('تم إضافة المشروع بنجاح');
            
            // مسح النموذج
            document.getElementById('projectForm').reset();
        } else {
            alert('حدث خطأ أثناء إضافة المشروع');
        }
    }

    viewProject(projectId) {
        const project = dataManager.getItemById('projects', projectId);
        const tasks = dataManager.getData('tasks').filter(t => t.projectId === projectId);
        const users = dataManager.getData('users');
        
        if (!project) return;
        
        // إنشاء نافذة عرض تفاصيل المشروع
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'projectViewModal';
        
        const manager = users.find(u => u.id === project.managerId);
        const completedTasks = tasks.filter(t => t.status === 'completed');
        const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
        const pendingTasks = tasks.filter(t => t.status === 'pending');
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${project.name}</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="project-details">
                    <div class="detail-section">
                        <h4>معلومات المشروع</h4>
                        <p><strong>الوصف:</strong> ${project.description || 'لا يوجد وصف'}</p>
                        <p><strong>مدير المشروع:</strong> ${manager ? manager.name : 'غير محدد'}</p>
                        <p><strong>الموعد النهائي:</strong> ${this.formatDate(project.deadline)}</p>
                        <p><strong>الحالة:</strong> <span class="status-badge status-${project.status}">${this.getStatusText(project.status)}</span></p>
                        <p><strong>نسبة الإنجاز:</strong> ${project.progress}%</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>إحصائيات المهام</h4>
                        <div class="task-stats">
                            <div class="stat-item">
                                <span class="stat-number">${tasks.length}</span>
                                <span class="stat-label">إجمالي المهام</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${completedTasks.length}</span>
                                <span class="stat-label">مكتملة</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${inProgressTasks.length}</span>
                                <span class="stat-label">قيد التنفيذ</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${pendingTasks.length}</span>
                                <span class="stat-label">قيد الانتظار</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>المهام</h4>
                        <div class="project-tasks-list">
                            ${tasks.length > 0 ? tasks.map(task => {
                                const assignee = users.find(u => u.id === task.assigneeId);
                                return `
                                    <div class="task-item-small">
                                        <div class="task-info">
                                            <h5>${task.title}</h5>
                                            <p>المكلف: ${assignee ? assignee.name : 'غير محدد'}</p>
                                        </div>
                                        <div class="task-status">
                                            <span class="status-badge status-${task.status}">${this.getStatusText(task.status)}</span>
                                            <span class="progress-mini">${task.progress}%</span>
                                        </div>
                                    </div>
                                `;
                            }).join('') : '<p>لا توجد مهام في هذا المشروع</p>'}
                        </div>
                    </div>
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

    editProject(projectId) {
        if (!authManager.hasPermission('create_project')) {
            alert('ليس لديك صلاحية لتعديل المشاريع');
            return;
        }

        const project = dataManager.getItemById('projects', projectId);
        if (!project) return;

        // تحميل بيانات المشروع في النموذج
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectDescription').value = project.description || '';
        document.getElementById('projectDeadline').value = project.deadline || '';
        
        // تحميل قائمة المديرين
        this.loadManagers();
        
        // تحديد المدير الحالي
        setTimeout(() => {
            document.getElementById('projectManager').value = project.managerId;
        }, 100);

        // تغيير عنوان النافذة المنبثقة
        document.querySelector('#projectModal .modal-header h3').textContent = 'تعديل المشروع';
        
        // تغيير معالج النموذج
        const form = document.getElementById('projectForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            this.handleEditProject(projectId);
        };

        // إظهار النافذة المنبثقة
        document.getElementById('projectModal').classList.add('active');
    }

    handleEditProject(projectId) {
        const formData = {
            name: document.getElementById('projectName').value.trim(),
            description: document.getElementById('projectDescription').value.trim(),
            deadline: document.getElementById('projectDeadline').value,
            managerId: parseInt(document.getElementById('projectManager').value)
        };

        // التحقق من صحة البيانات
        if (!formData.name) {
            alert('يرجى إدخال اسم المشروع');
            return;
        }

        if (!formData.managerId) {
            alert('يرجى اختيار مدير المشروع');
            return;
        }

        // تحديث المشروع
        const updatedProject = dataManager.updateItem('projects', projectId, formData);
        
        if (updatedProject) {
            // إغلاق النافذة المنبثقة
            this.closeModal('projectModal');
            
            // إعادة تحميل قائمة المشاريع
            this.loadProjects();
            
            // تحديث لوحة التحكم
            dashboardManager.updateStats();
            dashboardManager.updateCharts();
            
            // إظهار رسالة نجاح
            this.showSuccessMessage('تم تحديث المشروع بنجاح');
            
            // إعادة تعيين النموذج
            this.resetProjectForm();
        } else {
            alert('حدث خطأ أثناء تحديث المشروع');
        }
    }

    deleteProject(projectId) {
        if (!authManager.hasPermission('delete_project')) {
            alert('ليس لديك صلاحية لحذف المشاريع');
            return;
        }

        const project = dataManager.getItemById('projects', projectId);
        if (!project) return;

        if (confirm(`هل أنت متأكد من حذف المشروع "${project.name}"؟\nسيتم حذف جميع المهام المرتبطة بهذا المشروع.`)) {
            // حذف المهام المرتبطة بالمشروع
            const tasks = dataManager.getData('tasks');
            const projectTasks = tasks.filter(t => t.projectId === projectId);
            
            projectTasks.forEach(task => {
                dataManager.deleteItem('tasks', task.id);
            });

            // حذف المشروع
            const deleted = dataManager.deleteItem('projects', projectId);
            
            if (deleted) {
                // إعادة تحميل قائمة المشاريع
                this.loadProjects();
                
                // تحديث لوحة التحكم
                dashboardManager.updateStats();
                dashboardManager.updateCharts();
                
                // إظهار رسالة نجاح
                this.showSuccessMessage('تم حذف المشروع بنجاح');
            } else {
                alert('حدث خطأ أثناء حذف المشروع');
            }
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            
            // إعادة تعيين النموذج إذا كان نموذج المشروع
            if (modalId === 'projectModal') {
                this.resetProjectForm();
            }
        }
    }

    resetProjectForm() {
        const form = document.getElementById('projectForm');
        if (form) {
            form.reset();
            form.onsubmit = (e) => {
                e.preventDefault();
                this.handleAddProject();
            };
        }
        
        // إعادة تعيين عنوان النافذة المنبثقة
        const modalTitle = document.querySelector('#projectModal .modal-header h3');
        if (modalTitle) {
            modalTitle.textContent = 'إضافة مشروع جديد';
        }
    }

    getStatusClass(status) {
        const statusClasses = {
            'pending': 'warning',
            'in-progress': 'info',
            'completed': 'success'
        };
        return statusClasses[status] || 'secondary';
    }

    getStatusText(status) {
        const statusTexts = {
            'pending': 'قيد الانتظار',
            'in-progress': 'قيد التنفيذ',
            'completed': 'مكتمل'
        };
        return statusTexts[status] || status;
    }

    formatDate(dateString) {
        if (!dateString) return 'غير محدد';
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA');
    }

    calculateDaysRemaining(deadline) {
        if (!deadline) return null;
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    getDaysRemainingText(days) {
        if (days === null) return 'غير محدد';
        if (days < 0) return `متأخر ${Math.abs(days)} يوم`;
        if (days === 0) return 'ينتهي اليوم';
        if (days === 1) return 'ينتهي غداً';
        return `${days} يوم متبقي`;
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
}

// إنشاء مثيل عام لإدارة المشاريع
const projectsManager = new ProjectsManager();
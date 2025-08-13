// إدارة الفريق
class TeamManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadTeam();
    }

    loadTeam() {
        const teamStats = dataManager.getTeamStats();
        const teamList = document.getElementById('teamList');

        if (!teamList) return;

        teamList.innerHTML = '';

        if (teamStats.length === 0) {
            teamList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users fa-3x"></i>
                    <h3>لا يوجد أعضاء في الفريق</h3>
                    <p>ابدأ بإضافة أعضاء جدد</p>
                </div>
            `;
            return;
        }

        // ترتيب أعضاء الفريق حسب الإنتاجية
        const sortedTeam = teamStats.sort((a, b) => b.productivity - a.productivity);

        sortedTeam.forEach(member => {
            const memberCard = this.createMemberCard(member);
            teamList.appendChild(memberCard);
        });
    }

    createMemberCard(member) {
        const card = document.createElement('div');
        card.className = 'team-member fade-in';
        
        const roleText = this.getRoleText(member.role);
        const productivityColor = this.getProductivityColor(member.productivity);
        
        card.innerHTML = `
            <div class="member-avatar">
                ${member.avatar || member.name.charAt(0)}
            </div>
            
            <div class="member-info">
                <h4 class="member-name">${member.name}</h4>
                <p class="member-role">${roleText}</p>
                <p class="member-email">${member.email || 'لا يوجد بريد إلكتروني'}</p>
            </div>
            
            <div class="member-stats">
                <div class="stat-item">
                    <strong>${member.totalTasks}</strong>
                    <span>إجمالي المهام</span>
                </div>
                <div class="stat-item">
                    <strong>${member.completedTasks}</strong>
                    <span>مكتملة</span>
                </div>
                <div class="stat-item">
                    <strong>${member.timeSpent}</strong>
                    <span>ساعات العمل</span>
                </div>
            </div>
            
            <div class="member-productivity">
                <div class="productivity-label">الإنتاجية</div>
                <div class="productivity-bar">
                    <div class="productivity-fill" style="width: ${member.productivity}%; background-color: ${productivityColor}"></div>
                </div>
                <div class="productivity-text">${Math.round(member.productivity)}%</div>
            </div>
            
            <div class="member-actions">
                <button class="btn btn-sm btn-info" onclick="teamManager.viewMemberDetails(${member.id})">
                    <i class="fas fa-eye"></i> عرض التفاصيل
                </button>
                ${authManager.hasPermission('create_user') ? `
                    <button class="btn btn-sm btn-warning" onclick="teamManager.editMember(${member.id})">
                        <i class="fas fa-edit"></i> تعديل
                    </button>
                ` : ''}
            </div>
            
            ${member.lastLogin ? `
                <div class="member-last-login">
                    آخر دخول: ${this.formatDate(member.lastLogin)}
                </div>
            ` : ''}
        `;

        return card;
    }

    viewMemberDetails(memberId) {
        const member = dataManager.getItemById('users', memberId);
        const tasks = dataManager.getData('tasks').filter(t => t.assigneeId === memberId);
        const projects = dataManager.getData('projects');
        
        if (!member) return;
        
        // إحصائيات مفصلة للعضو
        const completedTasks = tasks.filter(t => t.status === 'completed');
        const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
        const pendingTasks = tasks.filter(t => t.status === 'pending');
        const overdueTasks = tasks.filter(t => this.isTaskOverdue(t));
        
        // المشاريع التي يعمل عليها
        const memberProjects = [...new Set(tasks.map(t => t.projectId))]
            .map(projectId => projects.find(p => p.id === projectId))
            .filter(p => p);
        
        // إنشاء نافذة عرض تفاصيل العضو
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'memberViewModal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تفاصيل العضو: ${member.name}</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="member-details">
                    <div class="detail-section">
                        <h4>المعلومات الشخصية</h4>
                        <p><strong>الاسم:</strong> ${member.name}</p>
                        <p><strong>اسم المستخدم:</strong> ${member.username}</p>
                        <p><strong>البريد الإلكتروني:</strong> ${member.email || 'غير محدد'}</p>
                        <p><strong>الدور:</strong> ${this.getRoleText(member.role)}</p>
                        <p><strong>تاريخ الانضمام:</strong> ${this.formatDate(member.createdAt)}</p>
                        <p><strong>آخر دخول:</strong> ${member.lastLogin ? this.formatDateTime(member.lastLogin) : 'لم يسجل دخول بعد'}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h4>إحصائيات المهام</h4>
                        <div class="stats-grid-small">
                            <div class="stat-card-small">
                                <div class="stat-number">${tasks.length}</div>
                                <div class="stat-label">إجمالي المهام</div>
                            </div>
                            <div class="stat-card-small">
                                <div class="stat-number">${completedTasks.length}</div>
                                <div class="stat-label">مكتملة</div>
                            </div>
                            <div class="stat-card-small">
                                <div class="stat-number">${inProgressTasks.length}</div>
                                <div class="stat-label">قيد التنفيذ</div>
                            </div>
                            <div class="stat-card-small">
                                <div class="stat-number">${pendingTasks.length}</div>
                                <div class="stat-label">قيد الانتظار</div>
                            </div>
                            <div class="stat-card-small">
                                <div class="stat-number">${overdueTasks.length}</div>
                                <div class="stat-label">متأخرة</div>
                            </div>
                            <div class="stat-card-small">
                                <div class="stat-number">${member.timeSpent}</div>
                                <div class="stat-label">ساعات العمل</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h4>المشاريع (${memberProjects.length})</h4>
                        ${memberProjects.length > 0 ? `
                            <div class="member-projects-list">
                                ${memberProjects.map(project => `
                                    <div class="project-item-small">
                                        <div class="project-info">
                                            <h5>${project.name}</h5>
                                            <p>التقدم: ${project.progress}%</p>
                                        </div>
                                        <div class="project-status">
                                            <span class="status-badge status-${project.status}">${this.getStatusText(project.status)}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p>لا يعمل على أي مشاريع حالياً</p>'}
                    </div>
                    
                    <div class="detail-section">
                        <h4>المهام الحديثة</h4>
                        ${tasks.length > 0 ? `
                            <div class="member-tasks-list">
                                ${tasks.slice(0, 5).map(task => {
                                    const project = projects.find(p => p.id === task.projectId);
                                    return `
                                        <div class="task-item-small">
                                            <div class="task-info">
                                                <h5>${task.title}</h5>
                                                <p>${project ? project.name : 'غير محدد'} | ${task.progress}%</p>
                                            </div>
                                            <div class="task-status">
                                                <span class="status-badge status-${task.status}">${this.getStatusText(task.status)}</span>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        ` : '<p>لا توجد مهام</p>'}
                    </div>
                    
                    <div class="detail-section">
                        <h4>الأداء</h4>
                        <div class="performance-chart">
                            <canvas id="memberPerformanceChart" width="400" height="200"></canvas>
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
        
        // إنشاء رسم بياني للأداء
        setTimeout(() => {
            this.createMemberPerformanceChart(tasks);
        }, 100);
    }

    createMemberPerformanceChart(tasks) {
        const ctx = document.getElementById('memberPerformanceChart');
        if (!ctx) return;

        // تجميع المهام حسب الحالة
        const tasksByStatus = {
            completed: tasks.filter(t => t.status === 'completed').length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            pending: tasks.filter(t => t.status === 'pending').length
        };

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['مكتملة', 'قيد التنفيذ', 'قيد الانتظار'],
                datasets: [{
                    data: [tasksByStatus.completed, tasksByStatus.inProgress, tasksByStatus.pending],
                    backgroundColor: [
                        'rgba(46, 204, 113, 0.8)',
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(241, 196, 15, 0.8)'
                    ],
                    borderColor: [
                        'rgba(46, 204, 113, 1)',
                        'rgba(52, 152, 219, 1)',
                        'rgba(241, 196, 15, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    editMember(memberId) {
        if (!authManager.hasPermission('create_user')) {
            alert('ليس لديك صلاحية لتعديل بيانات الأعضاء');
            return;
        }

        const member = dataManager.getItemById('users', memberId);
        if (!member) return;

        // إنشاء نافذة تعديل العضو
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'editMemberModal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>تعديل بيانات العضو</h3>
                    <span class="close">&times;</span>
                </div>
                <form id="editMemberForm">
                    <div class="form-group">
                        <label for="editMemberName">الاسم:</label>
                        <input type="text" id="editMemberName" value="${member.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="editMemberEmail">البريد الإلكتروني:</label>
                        <input type="email" id="editMemberEmail" value="${member.email || ''}">
                    </div>
                    <div class="form-group">
                        <label for="editMemberRole">الدور:</label>
                        <select id="editMemberRole">
                            <option value="employee" ${member.role === 'employee' ? 'selected' : ''}>موظف</option>
                            <option value="manager" ${member.role === 'manager' ? 'selected' : ''}>مدير</option>
                            <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>مدير عام</option>
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
        modal.querySelector('#editMemberForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditMember(memberId, modal);
        });
    }

    handleEditMember(memberId, modal) {
        const updates = {
            name: document.getElementById('editMemberName').value.trim(),
            email: document.getElementById('editMemberEmail').value.trim(),
            role: document.getElementById('editMemberRole').value
        };

        if (!updates.name) {
            alert('يرجى إدخال اسم العضو');
            return;
        }

        const updatedMember = dataManager.updateItem('users', memberId, updates);
        
        if (updatedMember) {
            modal.remove();
            this.loadTeam();
            this.showSuccessMessage('تم تحديث بيانات العضو بنجاح');
            
            // تحديث بيانات المستخدم الحالي إذا كان هو نفسه
            const currentUser = authManager.getCurrentUser();
            if (currentUser && currentUser.id === memberId) {
                authManager.updateProfile(updates);
            }
        } else {
            alert('حدث خطأ أثناء تحديث بيانات العضو');
        }
    }

    // دوال مساعدة
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
            'completed': 'مكتمل'
        };
        return statusTexts[status] || status;
    }

    getProductivityColor(productivity) {
        if (productivity >= 80) return '#28a745'; // أخضر
        if (productivity >= 60) return '#ffc107'; // أصفر
        if (productivity >= 40) return '#fd7e14'; // برتقالي
        return '#dc3545'; // أحمر
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

    isTaskOverdue(task) {
        if (!task.deadline || task.status === 'completed') return false;
        return new Date(task.deadline) < new Date();
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

    // تصدير تقرير الفريق
    exportTeamReport() {
        const teamStats = dataManager.getTeamStats();
        const tasks = dataManager.getData('tasks');
        const projects = dataManager.getData('projects');
        
        const report = {
            generatedAt: new Date().toISOString(),
            teamSize: teamStats.length,
            teamMembers: teamStats.map(member => ({
                name: member.name,
                role: member.role,
                totalTasks: member.totalTasks,
                completedTasks: member.completedTasks,
                productivity: member.productivity,
                timeSpent: member.timeSpent
            })),
            summary: {
                totalTasks: tasks.length,
                completedTasks: tasks.filter(t => t.status === 'completed').length,
                totalProjects: projects.length,
                averageProductivity: teamStats.reduce((sum, m) => sum + m.productivity, 0) / teamStats.length
            }
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `team_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// إنشاء مثيل عام لإدارة الفريق
const teamManager = new TeamManager();
// فحص متطلبات المتصفح
class BrowserChecker {
    constructor() {
        this.requirements = {
            localStorage: typeof(Storage) !== "undefined",
            es6: this.checkES6Support(),
            fetch: typeof fetch !== 'undefined',
            canvas: this.checkCanvasSupport(),
            flexbox: this.checkFlexboxSupport(),
            grid: this.checkGridSupport()
        };
        
        this.init();
    }

    init() {
        if (!this.isCompatible()) {
            this.showCompatibilityWarning();
        } else {
            this.showCompatibilitySuccess();
        }
    }

    checkES6Support() {
        try {
            // فحص دعم ES6
            eval('const test = () => {}; class Test {}');
            return true;
        } catch (e) {
            return false;
        }
    }

    checkCanvasSupport() {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext && canvas.getContext('2d'));
    }

    checkFlexboxSupport() {
        const div = document.createElement('div');
        div.style.display = 'flex';
        return div.style.display === 'flex';
    }

    checkGridSupport() {
        const div = document.createElement('div');
        div.style.display = 'grid';
        return div.style.display === 'grid';
    }

    isCompatible() {
        return Object.values(this.requirements).every(req => req === true);
    }

    getIncompatibleFeatures() {
        return Object.entries(this.requirements)
            .filter(([key, value]) => !value)
            .map(([key]) => key);
    }

    showCompatibilityWarning() {
        const incompatibleFeatures = this.getIncompatibleFeatures();
        const warningDiv = document.createElement('div');
        warningDiv.className = 'browser-warning';
        warningDiv.innerHTML = `
            <div class="warning-content">
                <h3>⚠️ تحذير: متصفح غير متوافق</h3>
                <p>متصفحك لا يدعم بعض الميزات المطلوبة لتشغيل النظام بشكل صحيح:</p>
                <ul>
                    ${incompatibleFeatures.map(feature => `<li>${this.getFeatureDescription(feature)}</li>`).join('')}
                </ul>
                <p><strong>الحلول المقترحة:</strong></p>
                <ul>
                    <li>استخدم متصفح حديث مثل Chrome أو Firefox أو Safari أو Edge</li>
                    <li>تأكد من تحديث متصفحك إلى أحدث إصدار</li>
                    <li>فعل JavaScript في إعدادات المتصفح</li>
                </ul>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-warning">
                    متابعة رغم ذلك (قد لا يعمل بشكل صحيح)
                </button>
            </div>
        `;

        // إضافة التنسيقات
        const style = document.createElement('style');
        style.textContent = `
            .browser-warning {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: Arial, sans-serif;
                direction: rtl;
            }
            .warning-content {
                background: white;
                padding: 2rem;
                border-radius: 10px;
                max-width: 500px;
                margin: 1rem;
                text-align: right;
            }
            .warning-content h3 {
                color: #dc3545;
                margin-bottom: 1rem;
            }
            .warning-content ul {
                text-align: right;
                margin: 1rem 0;
            }
            .warning-content li {
                margin: 0.5rem 0;
            }
            .warning-content .btn {
                background: #ffc107;
                color: #212529;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 5px;
                cursor: pointer;
                font-size: 1rem;
                margin-top: 1rem;
            }
            .warning-content .btn:hover {
                background: #e0a800;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(warningDiv);
    }

    showCompatibilitySuccess() {
        // إظهار رسالة نجاح مؤقتة (اختيارية)
        if (localStorage.getItem('browserCheckShown') !== 'true') {
            const successDiv = document.createElement('div');
            successDiv.className = 'browser-success';
            successDiv.innerHTML = `
                <div class="success-content">
                    ✅ متصفحك متوافق مع النظام
                </div>
            `;

            const style = document.createElement('style');
            style.textContent = `
                .browser-success {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #28a745;
                    color: white;
                    padding: 1rem;
                    border-radius: 5px;
                    z-index: 1000;
                    font-family: Arial, sans-serif;
                    animation: slideIn 0.3s ease-out;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;

            document.head.appendChild(style);
            document.body.appendChild(successDiv);

            // إزالة الرسالة بعد 3 ثوان
            setTimeout(() => {
                successDiv.remove();
            }, 3000);

            // عدم إظهار الرسالة مرة أخرى
            localStorage.setItem('browserCheckShown', 'true');
        }
    }

    getFeatureDescription(feature) {
        const descriptions = {
            localStorage: 'التخزين المحلي (LocalStorage)',
            es6: 'JavaScript الحديث (ES6+)',
            fetch: 'واجهة Fetch API',
            canvas: 'عنصر Canvas للرسوم البيانية',
            flexbox: 'تخطيط Flexbox',
            grid: 'تخطيط CSS Grid'
        };
        return descriptions[feature] || feature;
    }

    // دالة للتحقق من إصدار المتصفح
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';
        let version = 'Unknown';

        if (ua.indexOf('Chrome') > -1) {
            browser = 'Chrome';
            version = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.indexOf('Firefox') > -1) {
            browser = 'Firefox';
            version = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
            browser = 'Safari';
            version = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.indexOf('Edge') > -1) {
            browser = 'Edge';
            version = ua.match(/Edge\/(\d+)/)?.[1] || 'Unknown';
        } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
            browser = 'Internet Explorer';
            version = ua.match(/(?:MSIE |rv:)(\d+)/)?.[1] || 'Unknown';
        }

        return { browser, version };
    }

    // تسجيل معلومات المتصفح للتشخيص
    logBrowserInfo() {
        const info = this.getBrowserInfo();
        console.log('معلومات المتصفح:', info);
        console.log('متطلبات النظام:', this.requirements);
        console.log('متوافق:', this.isCompatible());
    }
}

// تشغيل فحص المتصفح عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const browserChecker = new BrowserChecker();
    browserChecker.logBrowserInfo();
});
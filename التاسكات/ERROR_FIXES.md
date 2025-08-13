# دليل إصلاح الأخطاء

## 🔧 الأخطاء التي تم إصلاحها

### 1. خطأ Canvas المستخدم مسبقاً
```
Canvas is already in use. Chart with ID '0' must be destroyed before the canvas can be reused.
```

**الإصلاح:**
- إضافة فحص `Chart.getChart()` قبل إنشاء رسم جديد
- تدمير آمن للرسوم البيانية الموجودة
- إضافة معالجة أخطاء في عمليات التدمير

### 2. أخطاء null في النظام
```
خطأ في النظام: null
خطأ في التطبيق: null
```

**الإصلاح:**
- تحسين معالجة الأخطاء في `init.js` و `app.js`
- إضافة فحص للقيم null قبل المعالجة
- منع ظهور أخطاء Canvas في رسائل المستخدم

### 3. خطأ CORS في manifest.json
```
Access to internal resource blocked by CORS policy
```

**الإصلاح:**
- تعطيل تحميل `manifest.json` عند فتح الملف محلياً
- الملف يعمل فقط عند استخدام خادم HTTP

## 🛠️ أدوات التشخيص الجديدة

### في وحدة التحكم (Console):

```javascript
// تنظيف جميع الرسوم البيانية
destroyAllCharts()

// إعادة تعيين جميع الرسوم البيانية
resetAllCharts()

// فحص حالة الرسوم البيانية
checkChartsStatus()

// إصلاح مشاكل التقارير
fixReportsScroll()

// إعادة تعيين التقارير
resetReports()

// إيقاف جميع التحديثات
stopAllIntervals()

// إعادة تعيين السكرول
resetScroll()
```

## 🚨 إذا استمرت المشاكل

### الحل السريع:
1. اضغط **F12** لفتح أدوات المطور
2. في تبويب **Console** اكتب:
   ```javascript
   resetAllCharts()
   stopAllIntervals()
   resetScroll()
   ```
3. أعد تحميل الصفحة (**Ctrl+F5**)

### الحل الشامل:
1. امسح cache المتصفح:
   - اضغط **Ctrl+Shift+Delete**
   - اختر "All time"
   - احذف Cache و Cookies
2. أعد تشغيل المتصفح
3. افتح النظام في تبويب جديد

## 📊 مراقبة الأداء

### علامات المشاكل:
- رسائل خطأ Canvas في Console
- السكرول التلقائي المستمر
- استهلاك عالي للذاكرة
- بطء في تحميل الرسوم البيانية

### علامات الحل:
- لا توجد رسائل خطأ Canvas
- السكرول يعمل بشكل طبيعي
- الرسوم البيانية تظهر بسرعة
- استهلاك طبيعي للموارد

## 🔍 التشخيص المتقدم

### فحص الرسوم البيانية:
```javascript
// عرض عدد الرسوم البيانية النشطة
console.log('Charts count:', Object.keys(Chart.instances).length);

// عرض تفاصيل كل رسم بياني
Object.keys(Chart.instances).forEach(id => {
    const chart = Chart.instances[id];
    console.log(`Chart ${id}:`, chart.canvas.id);
});
```

### فحص الذاكرة:
```javascript
// فحص استهلاك الذاكرة (Chrome فقط)
if (performance.memory) {
    console.log('Memory usage:', {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + ' MB',
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + ' MB',
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
    });
}
```

### فحص الأخطاء:
```javascript
// تسجيل جميع الأخطاء
let errorCount = 0;
window.addEventListener('error', (e) => {
    errorCount++;
    console.log(`Error #${errorCount}:`, e.message);
});
```

## 🎯 نصائح الوقاية

1. **لا تفتح أكثر من تبويب واحد** من النظام
2. **أغلق التبويبات غير المستخدمة** بانتظام
3. **أعد تحميل الصفحة** كل ساعة للتنظيف
4. **استخدم خادم HTTP** بدلاً من فتح الملف مباشرة
5. **راقب رسائل Console** للأخطاء المبكرة

## 🔄 إعادة التشغيل الآمن

إذا واجهت مشاكل متعددة:

1. **احفظ عملك** (صدر البيانات)
2. **نظف النظام:**
   ```javascript
   destroyAllCharts()
   stopAllIntervals()
   localStorage.clear()
   ```
3. **أغلق المتصفح تماماً**
4. **أعد فتح النظام**
5. **سجل الدخول مرة أخرى**

---

**ملاحظة:** هذه الإصلاحات تعمل تلقائياً في الخلفية ولا تحتاج تدخل يدوي في معظم الحالات.
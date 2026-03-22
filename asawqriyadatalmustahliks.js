const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// مسار حفظ البيانات
const DATA_FILE = path.join(__dirname, 'serverData.json');

// تحميل البيانات المخزنة مسبقاً
let serverData = null;
if (fs.existsSync(DATA_FILE)) {
    try {
        serverData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        console.log('تم تحميل البيانات من الملف');
    } catch(e) { console.error(e); }
}

// إذا لم توجد بيانات، نستخدم بيانات افتراضية (نفس بنية defaultData)
if (!serverData) {
    serverData = {
        header: { title: "أسواق ريادة المستهلك", subtitle: "أفضل المتاجر والمنتجات بأفضل الأسعار", images: [] },
        ticker: [],
        carousel: [],
        design: {
            categoryBg: "linear-gradient(145deg, #f9eef7, #f3d9e8)",
            categoryText: "#9b4d96",
            categoryFontSize: "2rem",
            storeBg: "#ffffff",
            storeText: "#1e293b",
            storeFontSize: "1.3rem",
            productBg: "#ffffff",
            productText: "#1e293b",
            productFontSize: "0.85rem",
            adBg: "linear-gradient(90deg, #fbbf24, #f59e0b)",
            adText: "#0f172a",
            adFontSize: "1.1rem",
            generalFontSize: "1rem"
        },
        categories: [],
        stores: {},
        products: {},
        testimonials: [],
        footer: {
            email: "support@example.com",
            phone: "+966 123 456 789",
            whatsapp: "https://wa.me/96777856209",
            social: [],
            payments: []
        },
        settings: {
            currency: "SAR",
            language: "ar",
            showSaudiFlag: false,
            cartEnabled: false,
            enableUserProfile: true,
            orderMethods: { whatsapp: true, email: true, chat: true },
            trustBadges: [],
            contests: [],
            contactEmail: "admin@example.com"
        },
        messages: [],
        indexes: {}
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(serverData, null, 2));
}

// دالة حفظ البيانات إلى الملف
function saveDataToFile() {
    fs.writeFile(DATA_FILE, JSON.stringify(serverData, null, 2), (err) => {
        if (err) console.error('خطأ في حفظ البيانات:', err);
        else console.log('تم حفظ البيانات على الخادم');
    });
}

// Socket.IO: التعامل مع الاتصالات
io.on('connection', (socket) => {
    console.log('عميل جديد متصل:', socket.id);

    // إرسال أحدث البيانات فور الاتصال
    socket.emit('initialData', serverData);

    // استقبال تحديث من المسؤول
    socket.on('adminUpdate', (newData) => {
        console.log('استلام تحديث من المسؤول');
        serverData = newData;
        saveDataToFile();
        // بث التحديث لجميع العملاء (بما فيهم المسؤول نفسه)
        io.emit('dataUpdate', serverData);
    });

    socket.on('disconnect', () => {
        console.log('عميل غادر:', socket.id);
    });
});

// تقديم الملفات الثابتة من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

// تعيين الصفحة الرئيسية الافتراضية لتكون asawqriyadatalmustahliks.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'asawqriyadatalmustahliks.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`الخادم يعمل على http://localhost:${PORT}`);
});
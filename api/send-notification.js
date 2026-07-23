// api/send-notification.js
// Vercel Serverless Function — ทำหน้าที่เป็น "หลังบ้าน" ตัวเดียวของระบบนี้
// รับคำขอจากหน้าเว็บ แล้วใช้ Firebase Admin SDK (สิทธิ์เต็ม) สั่งยิง Push ไปหาอุปกรณ์ปลายทางจริง
// เหตุผลที่ต้องทำฝั่งนี้: การยิง Push ของ FCM (HTTP v1 API) ต้องใช้กุญแจลับ (Service Account)
// ซึ่งห้ามใส่ไว้ในโค้ดฝั่งเว็บ (index.html) เด็ดขาด เพราะใครก็เปิดดูโค้ดแล้วขโมยไปใช้ส่งสแปมได้

const admin = require('firebase-admin');

if (!admin.apps.length) {
    // ค่านี้ต้องตั้งเป็น Environment Variable ชื่อ FIREBASE_SERVICE_ACCOUNT ใน Vercel เท่านั้น
    // ห้าม hardcode ค่าตรงนี้ในไฟล์เด็ดขาด (จะหลุดขึ้น GitHub สาธารณะ)
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { token, title, body } = req.body || {};
        if (!token || !title) {
            return res.status(400).json({ error: 'Missing token or title' });
        }

        await admin.messaging().send({
            token: token,
            notification: {
                title: title,
                body: body || ''
            },
            webpush: {
                fcmOptions: { link: '/' }
            }
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Send notification error:', err);
        return res.status(500).json({ error: err.message });
    }
};

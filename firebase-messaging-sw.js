// firebase-messaging-sw.js
// Service Worker นี้ทำหน้าที่รับ Push Notification ตอนที่แอป/แท็บ "ไม่ได้เปิดอยู่" (ปิดไปแล้ว/อยู่เบื้องหลัง)
// ต้องวางไฟล์นี้ไว้ที่ "root" ของเว็บ (ตำแหน่งเดียวกับ index.html) ห้ามย้ายเข้าโฟลเดอร์ย่อยเด็ดขาด
// ไม่งั้น Service Worker จะไม่มีสิทธิ์ดักจับ request ของทั้งเว็บ (scope ผิด)

importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// ⚠️ ต้องใส่ค่าเดียวกับ firebaseConfig ที่อยู่ใน index.html เป๊ะๆ (ไฟล์นี้แยกจากหน้าเว็บ เลยต้องประกาศซ้ำ)
firebase.initializeApp({
    apiKey: "AIzaSyCSXTQqHkwxT8lAdsfUVG_HNyIVl1GnBKo",
    authDomain: "wu-room-booking.firebaseapp.com",
    databaseURL: "https://wu-room-booking-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wu-room-booking",
    storageBucket: "wu-room-booking.firebasestorage.app",
    messagingSenderId: "908232861905",
    appId: "1:908232861905:web:dcc11fc81a67614b987df0",
    measurementId: "G-GMJ4425Q9S"
});

const messaging = firebase.messaging();

// ข้อความที่มาถึงตอนแอปปิด/อยู่เบื้องหลัง จะถูกจัดการอัตโนมัติตรงนี้ (โชว์เป็น OS notification เลย)
messaging.onBackgroundMessage((payload) => {
    const title = (payload.notification && payload.notification.title) || 'WU Room Booking';
    const body = (payload.notification && payload.notification.body) || '';
    self.registration.showNotification(title, {
        body: body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3048/3048122.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/3048/3048122.png'
    });
});

// เมื่อผู้ใช้กด Notification ให้เด้งเปิด/โฟกัสหน้าเว็บ
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if ('focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});

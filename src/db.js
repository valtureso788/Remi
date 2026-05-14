// Simple localStorage DB
const DB_KEY = 'remi_db';

const defaultDB = {
  users: [
    { id: 1, username: 'admin', password: '123', role: 'admin', name: 'Администратор' },
    { id: 2, username: 'support', password: '123', role: 'support', name: 'Поддержка' },
    { id: 3, username: 'delivery', password: '123', role: 'delivery', name: 'Доставка' },
    { id: 4, username: 'user', password: '123', role: 'user', name: 'Тестовый Пользователь' }
  ],
  orders: [],
  reviews: [],
  supportMessages: []
};

export function getDB() {
  const data = localStorage.getItem(DB_KEY);
  if (!data) {
    localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
    return defaultDB;
  }
  return JSON.parse(data);
}

export function saveDB(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

// Users
export function login(username, password) {
  const db = getDB();
  return db.users.find(u => u.username === username && u.password === password) || null;
}

export function register(username, password, name) {
  const db = getDB();
  if (db.users.find(u => u.username === username)) return null; // already exists
  const newUser = { id: Date.now(), username, password, name, role: 'user' };
  db.users.push(newUser);
  saveDB(db);
  return newUser;
}

export function getUsers() {
  return getDB().users;
}

// Orders
export function getOrders() {
  return getDB().orders;
}

export function addOrder(order) {
  const db = getDB();
  const newOrder = { ...order, id: Date.now(), status: 'new', date: new Date().toLocaleString('ru-RU') };
  db.orders.unshift(newOrder);
  saveDB(db);
  return newOrder;
}

export function updateOrderStatus(orderId, status) {
  const db = getDB();
  const order = db.orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    saveDB(db);
  }
}

// Reviews
export function getReviews() {
  return getDB().reviews;
}

export function addReview(userId, userName, text, rating) {
  const db = getDB();
  const newReview = { id: Date.now(), userId, userName, text, rating, date: new Date().toLocaleString('ru-RU'), reply: null };
  db.reviews.unshift(newReview);
  saveDB(db);
  return newReview;
}

export function addReviewReply(reviewId, replyText) {
  const db = getDB();
  const review = db.reviews.find(r => r.id === reviewId);
  if (review) {
    review.reply = replyText;
    saveDB(db);
  }
}

// Support Messages
export function getSupportMessages() {
  return getDB().supportMessages;
}

export function addSupportMessage(userId, userName, text) {
  const db = getDB();
  const newMsg = { id: Date.now(), userId, userName, text, date: new Date().toLocaleString('ru-RU'), reply: null };
  db.supportMessages.unshift(newMsg);
  saveDB(db);
  return newMsg;
}

export function addSupportReply(msgId, replyText) {
  const db = getDB();
  const msg = db.supportMessages.find(m => m.id === msgId);
  if (msg) {
    msg.reply = replyText;
    saveDB(db);
  }
}

import React, { useState, useCallback, Suspense, useEffect, lazy } from 'react'
import { FURNITURE_TYPES, MATERIALS, BODY_COLORS, FACADE_COLORS, DOOR_TYPES, HANDLE_TYPES, LEG_TYPES, calculatePrice, formatPrice, getDefaultConfig } from './data'
import ConstructorSidebar from './ConstructorSidebar'
import FurnitureViewer from './FurnitureViewer'
import RoomPlanner from './RoomPlanner'
import { QRCodeSVG } from 'qrcode.react'
import jsPDF from 'jspdf'
import { RotateCcw, ZoomIn, ZoomOut, Camera, Sun, Moon, Menu, X, Home, Wrench as WrenchIcon, Shield, BarChart3, Package, Users, Settings, Eye, Trash2, ArrowLeft, LogIn, LogOut, MessageSquare, CreditCard, Star, Layout } from 'lucide-react'
import * as db from './db'

// ===== Toast System =====
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>{t.type === 'success' ? '✅' : '❌'} {t.msg}</div>
      ))}
    </div>
  )
}

// ===== Auth Modal =====
function AuthModal({ onClose, onLogin, force }) {
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ username: '', password: '', name: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isLogin) {
      const u = db.login(form.username, form.password)
      if (u) onLogin(u)
      else alert('Неверный логин или пароль')
    } else {
      const u = db.register(form.username, form.password, form.name || form.username)
      if (u) onLogin(u)
      else alert('Пользователь уже существует')
    }
  }

  return (
    <div className="modal-overlay" style={force ? { background: 'var(--bg-primary)', backdropFilter: 'none' } : {}} onClick={!force ? onClose : undefined}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🛋️</div>
          <h2>{isLogin ? 'Вход в аккаунт' : 'Регистрация'}</h2>
          {force && <p style={{ color: 'var(--text-secondary)' }}>Для доступа к сервису REMI необходимо авторизоваться.</p>}
        </div>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Имя</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
          )}
          <div className="form-group">
            <label>Логин</label>
            <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <div className="modal-actions" style={{ justifyContent: force ? 'center' : 'flex-end', width: '100%' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Создать аккаунт' : 'Уже есть аккаунт?'}
            </button>
            <button type="submit" className="btn btn-primary">{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ===== Order & Payment Modal =====
function OrderModal({ config, onClose, onSubmit, currentUser }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: currentUser?.name || '', phone: '', address: '', comment: '' })
  const [card, setCard] = useState({ number: '', expiry: '', cvc: '' })
  const [errors, setErrors] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)
  const pricing = calculatePrice(config)

  const validateStep1 = () => {
    const errs = {}
    if (form.name.trim().length < 2) errs.name = 'Имя слишком короткое'
    if (!/^\+?[\d\s\-()]{10,}$/.test(form.phone)) errs.phone = 'Некорректный формат телефона'
    if (form.address.trim().length < 10) errs.address = 'Введите полный адрес (не менее 10 символов)'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const validateStep2 = () => {
    const errs = {}
    if (card.number.replace(/\s/g, '').length !== 16) errs.number = 'Номер карты должен состоять из 16 цифр'
    
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) {
      errs.expiry = 'Некорректный срок (MM/YY)'
    } else {
      const [m, y] = card.expiry.split('/')
      if (parseInt(y) < 24) errs.expiry = 'Карта просрочена'
    }
    
    if (!/^\d{3}$/.test(card.cvc)) errs.cvc = 'CVC должен состоять из 3 цифр'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (validateStep1()) {
      setErrors({})
      setStep(2)
    }
  }

  const handlePay = (e) => {
    e.preventDefault()
    if (validateStep2()) {
      setIsProcessing(true)
      setTimeout(() => {
        setIsProcessing(false)
        onSubmit({ ...form, total: pricing.total, type: config.type, userId: currentUser?.id })
      }, 2000)
    }
  }

  const handleCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').substring(0, 16)
    const formatted = digits.match(/.{1,4}/g)?.join(' ') || digits
    setCard({ ...card, number: formatted })
  }

  const handleExpiry = (val) => {
    const digits = val.replace(/\D/g, '').substring(0, 4)
    if (digits.length >= 3) {
      setCard({ ...card, expiry: `${digits.substring(0, 2)}/${digits.substring(2)}` })
    } else {
      setCard({ ...card, expiry: digits })
    }
  }

  const handleCvc = (val) => {
    setCard({ ...card, cvc: val.replace(/\D/g, '').substring(0, 3) })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {step === 1 ? (
          <>
            <h2>📦 Оформление заказа</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Итого к оплате: <strong style={{ color: 'var(--green)' }}>{formatPrice(pricing.total)}</strong></p>
            <form onSubmit={handleNext}>
              <div className="form-group">
                <label>Имя *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                {errors.name && <div style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 4 }}>{errors.name}</div>}
              </div>
              <div className="form-group">
                <label>Телефон *</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+7 (999) 000-00-00" required />
                {errors.phone && <div style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 4 }}>{errors.phone}</div>}
              </div>
              <div className="form-group">
                <label>Адрес доставки *</label>
                <input type="text" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="г. Москва, ул. Примерная, д. 1, кв. 1" required />
                {errors.address && <div style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 4 }}>{errors.address}</div>}
              </div>
              <div className="form-group">
                <label>Комментарий</label>
                <textarea value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
                <button type="submit" className="btn btn-primary">Перейти к оплате</button>
              </div>
            </form>
          </>
        ) : (
          <>
            <h2>💳 Оплата заказа</h2>
            {isProcessing ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div className="float" style={{ fontSize: '3rem' }}>🔄</div>
                <p>Обработка платежа...</p>
              </div>
            ) : (
              <form onSubmit={handlePay}>
                <div className="form-group">
                  <label>Номер карты</label>
                  <input type="text" placeholder="0000 0000 0000 0000" value={card.number} onChange={e => handleCardNumber(e.target.value)} required />
                  {errors.number && <div style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 4 }}>{errors.number}</div>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Срок</label>
                    <input type="text" placeholder="MM/YY" value={card.expiry} onChange={e => handleExpiry(e.target.value)} required />
                    {errors.expiry && <div style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 4 }}>{errors.expiry}</div>}
                  </div>
                  <div className="form-group">
                    <label>CVC</label>
                    <input type="password" placeholder="123" value={card.cvc} onChange={e => handleCvc(e.target.value)} required />
                    {errors.cvc && <div style={{ color: 'var(--red)', fontSize: '0.8rem', marginTop: 4 }}>{errors.cvc}</div>}
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>Назад</button>
                  <button type="submit" className="btn btn-primary">Оплатить {formatPrice(pricing.total)}</button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ===== QR Modal =====
function QRModal({ config, onClose }) {
  const data = JSON.stringify(config)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>📱 QR-код проекта</h2>
        <div className="qr-container">
          <QRCodeSVG value={data} size={220} bgColor="#1a1a2e" fgColor="#818cf8" level="L" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center' }}>
            Отсканируйте QR-код для быстрого доступа к вашему проекту
          </p>
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  )
}

// ===== Saved Projects Modal =====
function SavedProjectsModal({ projects, onLoad, onDelete, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 600 }}>
        <h2>📂 Сохранённые проекты</h2>
        {projects.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Нет сохранённых проектов</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {projects.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{FURNITURE_TYPES.find(f => f.id === p.type)?.name || p.type}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.width}×{p.height}×{p.depth} см • {p.savedAt}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-icon" onClick={() => onLoad(p)}><Eye size={16} /></button>
                  <button className="btn-icon" onClick={() => onDelete(i)}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Закрыть</button>
        </div>
      </div>
    </div>
  )
}

// ===== Support Contact Modal =====
function SupportModal({ currentUser, onClose, addToast }) {
  const [text, setText] = useState('')
  const handleSend = () => {
    if (!text.trim()) return;
    db.addSupportMessage(currentUser.id, currentUser.name, text);
    addToast('Сообщение отправлено в поддержку', 'success')
    onClose()
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>💬 Связь с поддержкой</h2>
        <div className="form-group">
          <label>Ваше сообщение</label>
          <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Опишите проблему или вопрос..." />
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Отмена</button>
          <button className="btn btn-primary" onClick={handleSend}>Отправить</button>
        </div>
      </div>
    </div>
  )
}

// ===== Dashboards based on role =====
function UserDashboard({ currentUser, addToast }) {
  const [orders, setOrders] = useState([])
  const [showSupport, setShowSupport] = useState(false)
  
  useEffect(() => {
    setOrders(db.getOrders().filter(o => o.userId === currentUser.id))
  }, [currentUser])

  return (
    <div className="section" style={{ paddingTop: '100px' }}>
      <h1>Личный кабинет: {currentUser.name}</h1>
      <button className="btn btn-primary" onClick={() => setShowSupport(true)} style={{ marginTop: 16 }}>Написать в поддержку</button>
      
      <h2 style={{ marginTop: 40, marginBottom: 20 }}>Мои заказы</h2>
      {orders.length === 0 ? <p>У вас пока нет заказов.</p> : (
        <table className="data-table">
          <thead><tr><th>ID</th><th>Тип мебели</th><th>Сумма</th><th>Статус</th><th>Дата</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id}><td>#{o.id}</td><td>{FURNITURE_TYPES.find(f => f.id === o.type)?.name || o.type}</td><td>{formatPrice(o.total)}</td><td><span className={`badge badge-${o.status}`}>{o.status}</span></td><td>{o.date}</td></tr>
            ))}
          </tbody>
        </table>
      )}
      {showSupport && <SupportModal currentUser={currentUser} onClose={() => setShowSupport(false)} addToast={addToast} />}
    </div>
  )
}

function DeliveryDashboard({ currentUser, addToast }) {
  const [orders, setOrders] = useState([])
  const [showSupport, setShowSupport] = useState(false)

  const load = () => setOrders(db.getOrders().filter(o => o.status !== 'done'))
  useEffect(() => { load() }, [])

  const markDone = (id) => {
    db.updateOrderStatus(id, 'done');
    addToast('Статус обновлен');
    load();
  }

  return (
    <div className="section" style={{ paddingTop: '100px' }}>
      <h1>Кабинет Курьера: {currentUser.name}</h1>
      <button className="btn btn-primary" onClick={() => setShowSupport(true)} style={{ marginTop: 16 }}>Написать в поддержку</button>
      
      <h2 style={{ marginTop: 40, marginBottom: 20 }}>Активные заказы на доставку</h2>
      <table className="data-table">
        <thead><tr><th>ID</th><th>Клиент</th><th>Адрес</th><th>Телефон</th><th>Статус</th><th>Действие</th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td>#{o.id}</td><td>{o.name}</td><td>{o.address}</td><td>{o.phone}</td>
              <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
              <td>
                {o.status === 'new' && <button className="btn-sm btn-secondary" onClick={() => { db.updateOrderStatus(o.id, 'process'); load(); }}>Взять в работу</button>}
                {o.status === 'process' && <button className="btn-sm btn-primary" onClick={() => markDone(o.id)}>Доставлено</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showSupport && <SupportModal currentUser={currentUser} onClose={() => setShowSupport(false)} addToast={addToast} />}
    </div>
  )
}

function SupportDashboard({ currentUser, addToast }) {
  const [messages, setMessages] = useState([])
  const [reviews, setReviews] = useState([])
  const [replyText, setReplyText] = useState('')
  const [activeMsgId, setActiveMsgId] = useState(null)
  
  const load = () => {
    setMessages(db.getSupportMessages())
    setReviews(db.getReviews())
  }
  useEffect(() => { load() }, [])

  const handleReplyMsg = (id) => {
    db.addSupportReply(id, replyText);
    setReplyText(''); setActiveMsgId(null);
    addToast('Ответ отправлен'); load();
  }

  return (
    <div className="section" style={{ paddingTop: '100px' }}>
      <h1>Кабинет Поддержки</h1>
      
      <h2 style={{ marginTop: 40, marginBottom: 20 }}>Обращения клиентов</h2>
      {messages.map(m => (
        <div key={m.id} style={{ background: 'var(--bg-card)', padding: 16, marginBottom: 16, borderRadius: 8 }}>
          <p><strong>{m.userName}</strong> ({m.date})</p>
          <p style={{ margin: '8px 0' }}>{m.text}</p>
          {m.reply ? (
            <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: 10, color: 'var(--text-secondary)' }}>Ответ: {m.reply}</div>
          ) : (
            <div>
              {activeMsgId === m.id ? (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Ваш ответ..." style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid var(--border)' }} />
                  <button className="btn-sm btn-primary" onClick={() => handleReplyMsg(m.id)}>Ответить</button>
                </div>
              ) : (
                <button className="btn-sm btn-secondary" onClick={() => setActiveMsgId(m.id)}>Ответить</button>
              )}
            </div>
          )}
        </div>
      ))}
      
      <h2 style={{ marginTop: 40, marginBottom: 20 }}>Отзывы</h2>
      {reviews.map(r => (
        <div key={r.id} style={{ background: 'var(--bg-card)', padding: 16, marginBottom: 16, borderRadius: 8 }}>
          <p><strong>{r.userName}</strong> ({r.rating} ⭐) - {r.date}</p>
          <p style={{ margin: '8px 0' }}>{r.text}</p>
        </div>
      ))}
    </div>
  )
}

function AdminDashboard() {
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0 })

  useEffect(() => {
    const o = db.getOrders()
    const u = db.getUsers()
    setOrders(o)
    setUsers(u)
    setStats({
      totalRevenue: o.reduce((acc, curr) => acc + curr.total, 0),
      totalOrders: o.length
    })
  }, [])

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent-light)' }}>⚙️ Админ-панель</h3>
        <a className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}><Package size={16} /> Заявки</a>
        <a className={tab === 'stats' ? 'active' : ''} onClick={() => setTab('stats')}><BarChart3 size={16} /> Статистика</a>
        <a className={tab === 'catalog' ? 'active' : ''} onClick={() => setTab('catalog')}><Settings size={16} /> Каталог</a>
        <a className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}><Users size={16} /> Пользователи</a>
      </div>
      <div className="admin-content">
        {tab === 'stats' && (
          <>
            <h1>📊 Статистика</h1>
            <div className="stats-grid">
              <div className="stat-card"><div className="label">Всего заказов</div><div className="value" style={{ color: 'var(--accent-light)' }}>{stats.totalOrders}</div></div>
              <div className="stat-card"><div className="label">Общая выручка</div><div className="value" style={{ color: 'var(--green)' }}>{formatPrice(stats.totalRevenue)}</div></div>
              <div className="stat-card"><div className="label">Средний чек</div><div className="value" style={{ color: 'var(--orange)' }}>{stats.totalOrders > 0 ? formatPrice(Math.round(stats.totalRevenue / stats.totalOrders)) : '0 ₽'}</div></div>
            </div>
          </>
        )}
        {tab === 'orders' && (
          <>
            <h1>📦 Заявки клиентов</h1>
            <table className="data-table">
              <thead><tr><th>ID</th><th>Клиент</th><th>Телефон</th><th>Тип мебели</th><th>Сумма</th><th>Статус</th><th>Дата</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}><td>#{o.id}</td><td>{o.name}</td><td>{o.phone}</td><td>{FURNITURE_TYPES.find(f=>f.id===o.type)?.name||o.type}</td><td>{formatPrice(o.total)}</td><td><span className={`badge badge-${o.status}`}>{o.status}</span></td><td>{o.date}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {tab === 'catalog' && (
          <>
            <h1>📋 Управление каталогом</h1>
            <table className="data-table">
              <thead><tr><th>Тип</th><th>Размер по умолчанию</th><th>Базовая цена/см³</th></tr></thead>
              <tbody>
                {FURNITURE_TYPES.map(f => (
                  <tr key={f.id}><td>{f.icon} {f.name}</td><td>{f.defaultW}×{f.defaultH}×{f.defaultD} см</td><td>{(f.defaultW * f.defaultH * f.defaultD * 0.025).toFixed(0)} ₽</td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {tab === 'users' && (
          <>
            <h1>👥 Пользователи системы</h1>
            <table className="data-table">
              <thead><tr><th>ID</th><th>Логин</th><th>Имя</th><th>Роль</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}><td>#{u.id}</td><td>{u.username}</td><td>{u.name}</td><td><span className="badge badge-process">{u.role}</span></td></tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}

// ===== Landing / Home =====
function HomePage({ onSelectType, currentUser, addToast }) {
  const [reviews, setReviews] = useState([])
  const [newReview, setNewReview] = useState({ text: '', rating: 5 })

  useEffect(() => { setReviews(db.getReviews()) }, [])

  const handleSubmitReview = (e) => {
    e.preventDefault()
    if (!currentUser) return addToast('Пожалуйста, авторизуйтесь', 'error')
    db.addReview(currentUser.id, currentUser.name, newReview.text, newReview.rating)
    setNewReview({ text: '', rating: 5 })
    setReviews(db.getReviews())
    addToast('Отзыв добавлен!', 'success')
  }

  const features = [
    { icon: '🎨', title: '3D Визуализация', desc: 'Реалистичная модель мебели в реальном времени', color: 'rgba(99,102,241,0.15)' },
    { icon: '📐', title: 'Точные размеры', desc: 'Настройте ширину, высоту и глубину до сантиметра', color: 'rgba(139,92,246,0.15)' },
    { icon: '🎯', title: 'Полная кастомизация', desc: 'Материалы, цвета, фурнитура — всё настраивается', color: 'rgba(236,72,153,0.15)' },
    { icon: '💰', title: 'Мгновенный расчёт', desc: 'Автоматический пересчёт стоимости при каждом изменении', color: 'rgba(16,185,129,0.15)' },
    { icon: '💾', title: 'Сохранение проектов', desc: 'Сохраняйте и загружайте проекты в любое время', color: 'rgba(245,158,11,0.15)' },
    { icon: '📱', title: 'QR-код проекта', desc: 'Поделитесь конфигурацией через QR-код', color: 'rgba(6,182,212,0.15)' },
  ]

  return (
    <>
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <div className="hero-content fade-in">
          <div className="hero-badge">
            <span className="dot" /> Онлайн-конструктор
          </div>
          <h1>Создайте мебель вашей мечты</h1>
          <p>Мощный 3D-конструктор мебели от компании REMI. Настраивайте размеры, материалы, цвета и фурнитуру — видите результат мгновенно.</p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>
              🚀 Начать проектирование
            </button>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-header"><h2>Возможности конструктора</h2></div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="icon" style={{ background: f.color, fontSize: '1.5rem' }}>{f.icon}</div>
              <h3>{f.title}</h3><p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="catalog">
        <div className="section-header"><h2>Каталог мебели</h2></div>
        <div className="catalog-grid">
          {FURNITURE_TYPES.map(ft => (
            <div key={ft.id} className="catalog-card" onClick={() => onSelectType(ft.id)}>
              <div className="catalog-card-icon">{ft.icon}</div>
              <h3>{ft.name}</h3><p>{ft.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="reviews">
        <div className="section-header"><h2>Отзывы наших клиентов</h2></div>
        <div className="features-grid" style={{ marginBottom: 40 }}>
          {reviews.slice(0, 4).map(r => (
            <div key={r.id} className="feature-card">
              <div style={{ display: 'flex', gap: 4, marginBottom: 8, color: 'var(--orange)' }}>
                {'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}
              </div>
              <p style={{ fontStyle: 'italic', marginBottom: 12 }}>"{r.text}"</p>
              <strong style={{ fontSize: '0.9rem' }}>{r.userName}</strong>
            </div>
          ))}
        </div>
        
        {currentUser && (
          <div style={{ background: 'var(--bg-card)', padding: 32, borderRadius: 'var(--radius-lg)', maxWidth: 600, margin: '0 auto' }}>
            <h3>Оставить отзыв</h3>
            <form onSubmit={handleSubmitReview} style={{ marginTop: 16 }}>
              <div className="form-group">
                <label>Оценка (1-5)</label>
                <input type="number" min="1" max="5" value={newReview.rating} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})} required />
              </div>
              <div className="form-group">
                <label>Ваш отзыв</label>
                <textarea value={newReview.text} onChange={e => setNewReview({...newReview, text: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary">Отправить отзыв</button>
            </form>
          </div>
        )}
      </section>

      <footer className="footer">
        <p>© 2026 REMI Furniture. Все права защищены. Онлайн-конструктор мебели с 3D-визуализацией.</p>
      </footer>
    </>
  )
}

// ===== Constructor Page =====
function ConstructorPage({ config, setConfig, addToast, onBack, currentUser }) {
  const [showOrder, setShowOrder] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const handleOrder = (orderData) => {
    db.addOrder(orderData)
    addToast(`Оплата прошла успешно! Заказ оформлен.`, 'success')
    setShowOrder(false)
  }

  const handleSave = () => {
    const saved = JSON.parse(localStorage.getItem('remi_projects') || '[]')
    saved.push({ ...config, savedAt: new Date().toLocaleString('ru-RU') })
    localStorage.setItem('remi_projects', JSON.stringify(saved))
    addToast('Проект сохранён!', 'success')
  }

  const handleExportImage = () => {
    const canvas = document.querySelector('#furniture-canvas canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = `remi-furniture-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      addToast('Изображение сохранено!', 'success')
    }
  }

  const handleExportPDF = () => {
    const pricing = calculatePrice(config)
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('REMI - Furniture Project', 20, 25)
    doc.setFontSize(12)
    doc.text(`Type: ${config.type}`, 20, 40)
    doc.text(`Dimensions: ${config.width} x ${config.height} x ${config.depth} cm`, 20, 50)
    doc.setFontSize(14)
    doc.text(`Total Price: ${formatPrice(pricing.total)}`, 20, 160)
    doc.save(`remi-project-${Date.now()}.pdf`)
    addToast('PDF сохранён!', 'success')
  }

  return (
    <div className="constructor-page">
      <ConstructorSidebar config={config} setConfig={setConfig}
        onOrder={() => setShowOrder(true)} onSave={handleSave}
        onExportPDF={handleExportPDF} onExportImage={handleExportImage}
        onQR={() => setShowQR(true)} />
      <div className="constructor-viewport">
        <div className="price-badge">
          <div className="label">Итого</div>
          <div className="price">{formatPrice(calculatePrice(config).total)}</div>
        </div>
        <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}><ArrowLeft size={16} /> В каталог</button>
        </div>
        <Suspense fallback={<div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--text-muted)'}}><div style={{textAlign:'center'}}><div className="float" style={{fontSize:'3rem',marginBottom:16}}>🪑</div><p>Загрузка 3D модели...</p></div></div>}>
          <FurnitureViewer config={config} />
        </Suspense>
        <div className="viewport-controls">
          <button className="btn-icon" title="Вращение"><RotateCcw size={16} /></button>
          <button className="btn-icon" title="Приблизить"><ZoomIn size={16} /></button>
          <button className="btn-icon" title="Отдалить"><ZoomOut size={16} /></button>
          <button className="btn-icon" title="Скриншот" onClick={handleExportImage}><Camera size={16} /></button>
        </div>
      </div>
      {showOrder && <OrderModal config={config} onClose={() => setShowOrder(false)} onSubmit={handleOrder} currentUser={currentUser} />}
      {showQR && <QRModal config={config} onClose={() => setShowQR(false)} />}
    </div>
  )
}

// ===== Main App =====
export default function App() {
  const [page, setPage] = useState('home') // home | constructor | dashboard | planner
  const [config, setConfig] = useState(getDefaultConfig('wardrobe'))
  const [toasts, setToasts] = useState([])
  const [showProjects, setShowProjects] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const handleLogin = (user) => {
    setCurrentUser(user)
    setShowAuth(false)
    addToast(`Добро пожаловать, ${user.name}!`, 'success')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setPage('home')
    addToast('Вы вышли из системы')
  }

  // Mandatory Auth Gate
  if (!currentUser) {
    return (
      <div className="app">
        <AuthModal force={true} onClose={() => {}} onLogin={handleLogin} />
        <ToastContainer toasts={toasts} />
      </div>
    )
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => setPage('home')} style={{ cursor: 'pointer' }}>
          <svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="#2563eb"/><text x="16" y="22" textAnchor="middle" fill="white" fontSize="18" fontWeight="800" fontFamily="Inter">R</text></svg>
          REMI
        </div>
        <div className="navbar-links">
          <a className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}>Главная</a>
          <a className={page === 'constructor' ? 'active' : ''} onClick={() => { if (page !== 'constructor') { setConfig(getDefaultConfig('wardrobe')); setPage('constructor'); } }}>Конструктор</a>
          <a className={page === 'planner' ? 'active' : ''} onClick={() => setPage('planner')}><Layout size={16} /> Планировщик</a>
          <button onClick={() => setShowProjects(true)}>Проекты</button>
          
          {currentUser ? (
            <>
              <button className={page === 'dashboard' ? 'active' : ''} onClick={() => setPage('dashboard')} style={{ color: 'var(--accent-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={16} /> Кабинет
              </button>
              <button onClick={handleLogout} title="Выйти"><LogOut size={16} /></button>
            </>
          ) : (
            <button className="btn-sm btn-primary" onClick={() => setShowAuth(true)} style={{ marginLeft: 8 }}><LogIn size={14} /> Войти</button>
          )}
        </div>
      </nav>

      {page === 'home' && <HomePage onSelectType={t => { setConfig(getDefaultConfig(t)); setPage('constructor') }} currentUser={currentUser} addToast={addToast} />}
      {page === 'constructor' && <ConstructorPage config={config} setConfig={setConfig} addToast={addToast} onBack={() => setPage('home')} currentUser={currentUser} />}
      {page === 'planner' && <RoomPlanner addToast={addToast} onBack={() => setPage('home')} />}
      {page === 'dashboard' && currentUser && (
        <>
          {currentUser.role === 'admin' && <AdminDashboard />}
          {currentUser.role === 'user' && <UserDashboard currentUser={currentUser} addToast={addToast} />}
          {currentUser.role === 'support' && <SupportDashboard currentUser={currentUser} addToast={addToast} />}
          {currentUser.role === 'delivery' && <DeliveryDashboard currentUser={currentUser} addToast={addToast} />}
        </>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onLogin={handleLogin} />}
      {showProjects && <SavedProjectsModal projects={JSON.parse(localStorage.getItem('remi_projects') || '[]')} onLoad={p => { const {savedAt,...cfg}=p; setConfig(cfg); setShowProjects(false); setPage('constructor'); }} onDelete={i => { const s=JSON.parse(localStorage.getItem('remi_projects')||'[]'); s.splice(i,1); localStorage.setItem('remi_projects',JSON.stringify(s)); addToast('Удалено'); setShowProjects(false); }} onClose={() => setShowProjects(false)} />}
      <ToastContainer toasts={toasts} />
    </div>
  )
}

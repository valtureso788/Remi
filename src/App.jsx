import React, { useState, useCallback, Suspense } from 'react'
import { FURNITURE_TYPES, MATERIALS, BODY_COLORS, FACADE_COLORS, DOOR_TYPES, HANDLE_TYPES, LEG_TYPES, calculatePrice, formatPrice, getDefaultConfig, DEMO_ORDERS } from './data'
import ConstructorSidebar from './ConstructorSidebar'
import FurnitureViewer from './FurnitureViewer'
import { QRCodeSVG } from 'qrcode.react'
import jsPDF from 'jspdf'
import { RotateCcw, ZoomIn, ZoomOut, Camera, Sun, Moon, Menu, X, Home, Wrench as WrenchIcon, Shield, BarChart3, Package, Users, Settings, Eye, Trash2, ArrowLeft } from 'lucide-react'

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

// ===== Order Modal =====
function OrderModal({ config, onClose, onSubmit }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', comment: '' })
  const pricing = calculatePrice(config)
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return
    onSubmit(form)
  }
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>📦 Оформление заказа</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.9rem' }}>
          Итого: <strong style={{ color: 'var(--green)' }}>{formatPrice(pricing.total)}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имя *</label>
            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ваше имя" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Телефон *</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+7 (___) ___-__-__" required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
          </div>
          <div className="form-group">
            <label>Комментарий</label>
            <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} placeholder="Дополнительные пожелания..." />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn btn-primary">Отправить заказ</button>
          </div>
        </form>
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

// ===== Admin Page =====
function AdminPage() {
  const [tab, setTab] = useState('orders')
  const statusBadge = (s) => s === 'new' ? <span className="badge badge-new">Новая</span> : s === 'process' ? <span className="badge badge-process">В работе</span> : <span className="badge badge-done">Выполнен</span>

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: 'var(--accent-light)' }}>⚙️ Админ-панель</h3>
        <a className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}><Package size={16} /> Заявки</a>
        <a className={tab === 'stats' ? 'active' : ''} onClick={() => setTab('stats')}><BarChart3 size={16} /> Статистика</a>
        <a className={tab === 'catalog' ? 'active' : ''} onClick={() => setTab('catalog')}><Settings size={16} /> Каталог</a>
        <a className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}><Users size={16} /> Клиенты</a>
      </div>
      <div className="admin-content">
        {tab === 'stats' && (
          <>
            <h1>📊 Статистика</h1>
            <div className="stats-grid">
              <div className="stat-card"><div className="label">Заказов сегодня</div><div className="value" style={{ color: 'var(--accent-light)' }}>12</div><div className="change up">↑ 18% к вчера</div></div>
              <div className="stat-card"><div className="label">Выручка за месяц</div><div className="value" style={{ color: 'var(--green)' }}>1.2M ₽</div><div className="change up">↑ 24%</div></div>
              <div className="stat-card"><div className="label">Средний чек</div><div className="value" style={{ color: 'var(--orange)' }}>45 800 ₽</div><div className="change up">↑ 5%</div></div>
              <div className="stat-card"><div className="label">Конверсия</div><div className="value" style={{ color: 'var(--purple)' }}>8.4%</div><div className="change down">↓ 1.2%</div></div>
            </div>
          </>
        )}
        {tab === 'orders' && (
          <>
            <h1>📦 Заявки клиентов</h1>
            <table className="data-table">
              <thead><tr><th>ID</th><th>Клиент</th><th>Телефон</th><th>Тип мебели</th><th>Сумма</th><th>Статус</th><th>Дата</th></tr></thead>
              <tbody>
                {DEMO_ORDERS.map(o => (
                  <tr key={o.id}><td>#{o.id}</td><td>{o.name}</td><td>{o.phone}</td><td>{o.type}</td><td>{formatPrice(o.total)}</td><td>{statusBadge(o.status)}</td><td>{o.date}</td></tr>
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
            <h1>👥 Клиенты</h1>
            <table className="data-table">
              <thead><tr><th>Имя</th><th>Телефон</th><th>Заказов</th><th>Общая сумма</th></tr></thead>
              <tbody>
                {DEMO_ORDERS.map(o => (
                  <tr key={o.id}><td>{o.name}</td><td>{o.phone}</td><td>1</td><td>{formatPrice(o.total)}</td></tr>
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
function HomePage({ onSelectType }) {
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
      {/* Hero */}
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
            <button className="btn btn-secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              ℹ️ Узнать больше
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="section-header">
          <h2>Возможности конструктора</h2>
          <p>Всё, что нужно для создания идеальной мебели</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <div className="icon" style={{ background: f.color, fontSize: '1.5rem' }}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Catalog */}
      <section className="section" id="catalog">
        <div className="section-header">
          <h2>Каталог мебели</h2>
          <p>Выберите тип мебели, чтобы начать проектирование</p>
        </div>
        <div className="catalog-grid">
          {FURNITURE_TYPES.map(ft => (
            <div key={ft.id} className="catalog-card" onClick={() => onSelectType(ft.id)}>
              <div className="catalog-card-icon">{ft.icon}</div>
              <h3>{ft.name}</h3>
              <p>{ft.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 REMI Furniture. Все права защищены. Онлайн-конструктор мебели с 3D-визуализацией.</p>
      </footer>
    </>
  )
}

// ===== Constructor Page =====
function ConstructorPage({ config, setConfig, addToast, onBack }) {
  const [showOrder, setShowOrder] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const handleOrder = (form) => {
    const orderId = Math.floor(1000 + Math.random() * 9000)
    addToast(`Заказ #${orderId} отправлен! Менеджер свяжется с вами.`, 'success')
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
    const ft = FURNITURE_TYPES.find(f => f.id === config.type)
    const mat = MATERIALS.find(m => m.id === config.material)
    const bc = BODY_COLORS.find(c => c.id === config.bodyColor)
    const fc = FACADE_COLORS.find(c => c.id === config.facadeColor)
    const dt = DOOR_TYPES.find(d => d.id === config.doorType)
    const ht = HANDLE_TYPES.find(h => h.id === config.handles)
    const lt = LEG_TYPES.find(l => l.id === config.legs)

    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('REMI - Furniture Project', 20, 25)
    doc.setFontSize(12)
    doc.text(`Type: ${ft?.name || config.type}`, 20, 40)
    doc.text(`Dimensions: ${config.width} x ${config.height} x ${config.depth} cm`, 20, 50)
    doc.text(`Material: ${mat?.name}`, 20, 60)
    doc.text(`Body Color: ${bc?.name}`, 20, 70)
    doc.text(`Facade Color: ${fc?.name}`, 20, 80)
    doc.text(`Door Type: ${dt?.name}`, 20, 90)
    doc.text(`Shelves: ${config.shelves}`, 20, 100)
    doc.text(`Sections: ${config.sections}`, 20, 110)
    doc.text(`Drawers: ${config.drawers}`, 20, 120)
    doc.text(`Handles: ${ht?.name}`, 20, 130)
    doc.text(`Legs: ${lt?.name}`, 20, 140)
    doc.setFontSize(14)
    doc.text(`Total Price: ${formatPrice(pricing.total)}`, 20, 160)
    doc.text(`Date: ${new Date().toLocaleDateString('ru-RU')}`, 20, 175)
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
        {/* Price badge */}
        <div className="price-badge">
          <div className="label">Итого</div>
          <div className="price">{formatPrice(calculatePrice(config).total)}</div>
        </div>
        {/* Back button */}
        <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}><ArrowLeft size={16} /> Каталог</button>
        </div>
        {/* 3D Viewer */}
        <Suspense fallback={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="float" style={{ fontSize: '3rem', marginBottom: 16 }}>🪑</div>
              <p>Загрузка 3D модели...</p>
            </div>
          </div>
        }>
          <FurnitureViewer config={config} />
        </Suspense>
        {/* Viewport hint */}
        <div className="viewport-controls">
          <button className="btn-icon" title="Вращение"><RotateCcw size={16} /></button>
          <button className="btn-icon" title="Приблизить"><ZoomIn size={16} /></button>
          <button className="btn-icon" title="Отдалить"><ZoomOut size={16} /></button>
          <button className="btn-icon" title="Скриншот" onClick={handleExportImage}><Camera size={16} /></button>
        </div>
      </div>
      {showOrder && <OrderModal config={config} onClose={() => setShowOrder(false)} onSubmit={handleOrder} />}
      {showQR && <QRModal config={config} onClose={() => setShowQR(false)} />}
    </div>
  )
}

// ===== Main App =====
export default function App() {
  const [page, setPage] = useState('home') // home | constructor | admin
  const [config, setConfig] = useState(getDefaultConfig('wardrobe'))
  const [toasts, setToasts] = useState([])
  const [showProjects, setShowProjects] = useState(false)

  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  const handleSelectType = (typeId) => {
    setConfig(getDefaultConfig(typeId))
    setPage('constructor')
  }

  const handleLoadProject = (project) => {
    const { savedAt, ...cfg } = project
    setConfig(cfg)
    setShowProjects(false)
    setPage('constructor')
    addToast('Проект загружен!', 'success')
  }

  const handleDeleteProject = (index) => {
    const saved = JSON.parse(localStorage.getItem('remi_projects') || '[]')
    saved.splice(index, 1)
    localStorage.setItem('remi_projects', JSON.stringify(saved))
    addToast('Проект удалён', 'success')
    setShowProjects(false)
  }

  const savedProjects = JSON.parse(localStorage.getItem('remi_projects') || '[]')

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-brand" onClick={() => setPage('home')} style={{ cursor: 'pointer' }}>
          <svg viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="url(#navgrad)"/><text x="16" y="22" textAnchor="middle" fill="white" fontSize="18" fontWeight="800" fontFamily="Inter">R</text><defs><linearGradient id="navgrad" x1="0" y1="0" x2="32" y2="32"><stop stopColor="#6366f1"/><stop offset="1" stopColor="#8b5cf6"/></linearGradient></defs></svg>
          REMI
        </div>
        <div className="navbar-links">
          <a className={page === 'home' ? 'active' : ''} onClick={() => setPage('home')}>Главная</a>
          <a className={page === 'constructor' ? 'active' : ''} onClick={() => { if (page !== 'constructor') { setConfig(getDefaultConfig('wardrobe')); setPage('constructor'); } }}>Конструктор</a>
          <button onClick={() => setShowProjects(true)}>Проекты</button>
          <a className={page === 'admin' ? 'active' : ''} onClick={() => setPage('admin')}>Админ</a>
        </div>
      </nav>

      {/* Pages */}
      {page === 'home' && <HomePage onSelectType={handleSelectType} />}
      {page === 'constructor' && <ConstructorPage config={config} setConfig={setConfig} addToast={addToast} onBack={() => setPage('home')} />}
      {page === 'admin' && <AdminPage />}

      {/* Modals */}
      {showProjects && (
        <SavedProjectsModal
          projects={savedProjects}
          onLoad={handleLoadProject}
          onDelete={handleDeleteProject}
          onClose={() => setShowProjects(false)}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} />
    </div>
  )
}

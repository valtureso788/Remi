import React, { useState } from 'react'
import { MATERIALS, BODY_COLORS, FACADE_COLORS, DOOR_TYPES, HANDLE_TYPES, LEG_TYPES, calculatePrice, formatPrice } from './data'
import { ChevronDown, Ruler, Layers, Palette, Wrench, DoorOpen } from 'lucide-react'

function Panel({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="panel">
      <div className="panel-header" onClick={() => setOpen(!open)}>
        <h3>{icon} {title}</h3>
        <ChevronDown size={16} className={`chevron ${open ? 'open' : ''}`} />
      </div>
      {open && <div className="panel-body">{children}</div>}
    </div>
  )
}

function RangeInput({ label, value, min, max, step, unit, onChange }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="range-control">
        <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
        <span className="range-value">{value} {unit}</span>
      </div>
    </div>
  )
}

function CounterInput({ label, value, min = 0, max = 10, onChange }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="counter-control">
        <button onClick={() => onChange(Math.max(min, value - 1))}>−</button>
        <span>{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))}>+</button>
      </div>
    </div>
  )
}

export default function ConstructorSidebar({ config, setConfig, onOrder, onSave, onExportPDF, onExportImage, onQR }) {
  const update = (key, val) => setConfig(prev => ({ ...prev, [key]: val }))
  const pricing = calculatePrice(config)

  return (
    <div className="constructor-sidebar">
      <Panel title="Размеры" icon={<Ruler size={16} />} defaultOpen={true}>
        <RangeInput label="Ширина" value={config.width} min={30} max={400} step={5} unit="см" onChange={v => update('width', v)} />
        <RangeInput label="Высота" value={config.height} min={20} max={300} step={5} unit="см" onChange={v => update('height', v)} />
        <RangeInput label="Глубина" value={config.depth} min={15} max={100} step={5} unit="см" onChange={v => update('depth', v)} />
      </Panel>

      <Panel title="Конструкция" icon={<Layers size={16} />} defaultOpen={true}>
        <CounterInput label="Полки" value={config.shelves} max={8} onChange={v => update('shelves', v)} />
        <CounterInput label="Секции" value={config.sections} min={1} max={6} onChange={v => update('sections', v)} />
        <CounterInput label="Ящики" value={config.drawers} max={6} onChange={v => update('drawers', v)} />
      </Panel>

      <Panel title="Двери" icon={<DoorOpen size={16} />}>
        <div className="form-group">
          <label>Тип дверей</label>
          <div className="option-grid">
            {DOOR_TYPES.map(dt => (
              <div key={dt.id} className={`option-card ${config.doorType === dt.id ? 'active' : ''}`}
                onClick={() => update('doorType', dt.id)}>{dt.name}</div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Материал и цвет" icon={<Palette size={16} />}>
        <div className="form-group">
          <label>Материал</label>
          <div className="option-grid">
            {MATERIALS.map(m => (
              <div key={m.id} className={`option-card ${config.material === m.id ? 'active' : ''}`}
                onClick={() => update('material', m.id)}>{m.name}</div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Цвет корпуса</label>
          <div className="color-options">
            {BODY_COLORS.map(c => (
              <div key={c.id} className={`color-swatch ${config.bodyColor === c.id ? 'active' : ''}`}
                style={{ background: c.hex }} title={c.name}
                onClick={() => update('bodyColor', c.id)} />
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Цвет фасадов</label>
          <div className="color-options">
            {FACADE_COLORS.map(c => (
              <div key={c.id} className={`color-swatch ${config.facadeColor === c.id ? 'active' : ''}`}
                style={{ background: c.hex }} title={c.name}
                onClick={() => update('facadeColor', c.id)} />
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Фурнитура" icon={<Wrench size={16} />}>
        <div className="form-group">
          <label>Ручки</label>
          <div className="option-grid">
            {HANDLE_TYPES.map(h => (
              <div key={h.id} className={`option-card ${config.handles === h.id ? 'active' : ''}`}
                onClick={() => update('handles', h.id)}>{h.name}</div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Ножки</label>
          <div className="option-grid">
            {LEG_TYPES.map(l => (
              <div key={l.id} className={`option-card ${config.legs === l.id ? 'active' : ''}`}
                onClick={() => update('legs', l.id)}>{l.name}</div>
            ))}
          </div>
        </div>
      </Panel>

      {/* Price breakdown */}
      <div className="order-summary">
        <h3>💰 Стоимость</h3>
        <div className="summary-row"><span>Корпус + материал</span><span className="val">{formatPrice(pricing.base)}</span></div>
        {pricing.shelves > 0 && <div className="summary-row"><span>Полки ({config.shelves} шт.)</span><span className="val">{formatPrice(pricing.shelves)}</span></div>}
        {pricing.sections > 0 && <div className="summary-row"><span>Секции</span><span className="val">{formatPrice(pricing.sections)}</span></div>}
        {pricing.drawers > 0 && <div className="summary-row"><span>Ящики ({config.drawers} шт.)</span><span className="val">{formatPrice(pricing.drawers)}</span></div>}
        {pricing.doors > 0 && <div className="summary-row"><span>Двери</span><span className="val">{formatPrice(pricing.doors)}</span></div>}
        {pricing.handles > 0 && <div className="summary-row"><span>Ручки</span><span className="val">{formatPrice(pricing.handles)}</span></div>}
        {pricing.legs > 0 && <div className="summary-row"><span>Ножки</span><span className="val">{formatPrice(pricing.legs)}</span></div>}
        <div className="summary-total"><span>Итого</span><span className="val">{formatPrice(pricing.total)}</span></div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
        <button className="btn btn-primary" onClick={onOrder} style={{ justifyContent: 'center' }}>📦 Оформить заказ</button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={onSave}>💾 Сохранить</button>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={onExportImage}>📷 Фото</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={onExportPDF}>📄 PDF</button>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={onQR}>📱 QR-код</button>
        </div>
      </div>
    </div>
  )
}

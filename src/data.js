// Catalog items
export const FURNITURE_TYPES = [
  { id: 'wardrobe', name: 'Шкаф', icon: '🗄️', desc: 'Вместительные шкафы для хранения одежды и аксессуаров', defaultW: 120, defaultH: 220, defaultD: 60 },
  { id: 'kitchen', name: 'Кухонный гарнитур', icon: '🍳', desc: 'Современные кухонные модули с продуманной эргономикой', defaultW: 240, defaultH: 85, defaultD: 60 },
  { id: 'nightstand', name: 'Тумба', icon: '🛏️', desc: 'Компактные прикроватные тумбы и ТВ-тумбы', defaultW: 60, defaultH: 50, defaultD: 40 },
  { id: 'dresser', name: 'Комод', icon: '🗃️', desc: 'Элегантные комоды с вместительными ящиками', defaultW: 100, defaultH: 90, defaultD: 45 },
  { id: 'shelving', name: 'Стеллаж', icon: '📚', desc: 'Открытые стеллажи для книг и декора', defaultW: 80, defaultH: 200, defaultD: 35 },
  { id: 'desk', name: 'Стол', icon: '🖥️', desc: 'Рабочие и обеденные столы различных конфигураций', defaultW: 140, defaultH: 75, defaultD: 70 },
  { id: 'closet', name: 'Гардероб', icon: '👔', desc: 'Гардеробные системы для организации пространства', defaultW: 200, defaultH: 240, defaultD: 60 },
  { id: 'shelf', name: 'Полка', icon: '📖', desc: 'Настенные и напольные полки для интерьера', defaultW: 80, defaultH: 30, defaultD: 25 },
];

// Materials
export const MATERIALS = [
  { id: 'wood', name: 'Дерево', priceMultiplier: 1.5, color: '#8B6914' },
  { id: 'mdf', name: 'МДФ', priceMultiplier: 1.2, color: '#A0522D' },
  { id: 'ldsp', name: 'ЛДСП', priceMultiplier: 1.0, color: '#C4A35A' },
  { id: 'glass', name: 'Стекло', priceMultiplier: 1.8, color: '#B0E0E6' },
  { id: 'metal', name: 'Металл', priceMultiplier: 2.0, color: '#A9A9A9' },
];

// Colors
export const BODY_COLORS = [
  { id: 'white', name: 'Белый', hex: '#F5F5F5' },
  { id: 'black', name: 'Чёрный', hex: '#2D2D2D' },
  { id: 'oak', name: 'Дуб', hex: '#C19A5B' },
  { id: 'walnut', name: 'Орех', hex: '#5C4033' },
  { id: 'wenge', name: 'Венге', hex: '#3C2415' },
  { id: 'gray', name: 'Серый', hex: '#808080' },
  { id: 'beige', name: 'Бежевый', hex: '#D4C5A9' },
  { id: 'cherry', name: 'Вишня', hex: '#8B0000' },
];

export const FACADE_COLORS = [
  { id: 'white', name: 'Белый', hex: '#FFFFFF' },
  { id: 'cream', name: 'Кремовый', hex: '#FFFDD0' },
  { id: 'anthracite', name: 'Антрацит', hex: '#383838' },
  { id: 'navy', name: 'Тёмно-синий', hex: '#1B2A4A' },
  { id: 'olive', name: 'Оливковый', hex: '#556B2F' },
  { id: 'burgundy', name: 'Бордовый', hex: '#722F37' },
  { id: 'sand', name: 'Песочный', hex: '#D2B48C' },
  { id: 'mint', name: 'Мятный', hex: '#98FF98' },
];

// Door types
export const DOOR_TYPES = [
  { id: 'swing', name: 'Распашные' },
  { id: 'sliding', name: 'Раздвижные' },
  { id: 'none', name: 'Без дверей' },
];

// Hardware
export const HANDLE_TYPES = [
  { id: 'modern', name: 'Современные', price: 350 },
  { id: 'classic', name: 'Классические', price: 500 },
  { id: 'minimal', name: 'Минималистичные', price: 250 },
  { id: 'hidden', name: 'Скрытые', price: 600 },
];

export const LEG_TYPES = [
  { id: 'none', name: 'Без ножек', price: 0 },
  { id: 'metal', name: 'Металлические', price: 800 },
  { id: 'wood', name: 'Деревянные', price: 600 },
  { id: 'plastic', name: 'Пластиковые', price: 300 },
];

// Base prices per cm³ for furniture types
export const BASE_PRICES = {
  wardrobe: 0.025,
  kitchen: 0.035,
  nightstand: 0.03,
  dresser: 0.028,
  shelving: 0.022,
  desk: 0.03,
  closet: 0.025,
  shelf: 0.035,
};

// Price calculations
export function calculatePrice(config) {
  const { type, width, height, depth, material, shelves, sections, drawers, doorType, handles, legs } = config;
  const volume = width * height * depth;
  const basePrice = volume * (BASE_PRICES[type] || 0.025);
  const mat = MATERIALS.find(m => m.id === material);
  const materialPrice = basePrice * (mat?.priceMultiplier || 1);
  const shelfPrice = shelves * 450;
  const sectionPrice = (sections - 1) * 800;
  const drawerPrice = drawers * 1200;
  const doorPrice = doorType === 'swing' ? 2500 : doorType === 'sliding' ? 4500 : 0;
  const handlePrice = (HANDLE_TYPES.find(h => h.id === handles)?.price || 0) * (doorType === 'none' ? 0 : sections);
  const legPrice = LEG_TYPES.find(l => l.id === legs)?.price || 0;

  const total = materialPrice + shelfPrice + sectionPrice + drawerPrice + doorPrice + handlePrice + legPrice;
  return {
    base: Math.round(materialPrice),
    shelves: Math.round(shelfPrice),
    sections: Math.round(sectionPrice),
    drawers: Math.round(drawerPrice),
    doors: Math.round(doorPrice),
    handles: Math.round(handlePrice),
    legs: Math.round(legPrice),
    total: Math.round(total),
  };
}

export function formatPrice(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
}

// Default config
export function getDefaultConfig(typeId) {
  const ft = FURNITURE_TYPES.find(f => f.id === typeId) || FURNITURE_TYPES[0];
  return {
    type: ft.id,
    width: ft.defaultW,
    height: ft.defaultH,
    depth: ft.defaultD,
    material: 'ldsp',
    bodyColor: 'white',
    facadeColor: 'white',
    doorType: 'swing',
    shelves: 2,
    sections: 2,
    drawers: 0,
    handles: 'modern',
    legs: 'none',
  };
}

// Demo orders for admin
export const DEMO_ORDERS = [
  { id: 1001, name: 'Алексей Иванов', phone: '+7 (999) 123-45-67', type: 'Шкаф', total: 34500, status: 'new', date: '2026-05-14' },
  { id: 1002, name: 'Мария Петрова', phone: '+7 (999) 234-56-78', type: 'Кухонный гарнитур', total: 89200, status: 'process', date: '2026-05-13' },
  { id: 1003, name: 'Дмитрий Сидоров', phone: '+7 (999) 345-67-89', type: 'Стеллаж', total: 15800, status: 'done', date: '2026-05-12' },
  { id: 1004, name: 'Елена Козлова', phone: '+7 (999) 456-78-90', type: 'Комод', total: 22100, status: 'new', date: '2026-05-14' },
  { id: 1005, name: 'Игорь Новиков', phone: '+7 (999) 567-89-01', type: 'Гардероб', total: 67300, status: 'process', date: '2026-05-11' },
];

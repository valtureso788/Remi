import React, { useState, useMemo, useRef, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Plus, Trash2, Move, RotateCcw, AlertTriangle, CheckCircle, Maximize2, Box } from 'lucide-react'

// === Furniture catalog for room planner ===
const ROOM_FURNITURE = [
  { id: 'wardrobe', name: 'Шкаф', icon: '🗄️', w: 120, h: 220, d: 60, color: '#8B6914' },
  { id: 'kitchen', name: 'Кухонный гарнитур', icon: '🍳', w: 240, h: 85, d: 60, color: '#A0522D' },
  { id: 'nightstand', name: 'Тумба', icon: '🛏️', w: 60, h: 50, d: 40, color: '#C19A5B' },
  { id: 'dresser', name: 'Комод', icon: '🗃️', w: 100, h: 90, d: 45, color: '#5C4033' },
  { id: 'shelving', name: 'Стеллаж', icon: '📚', w: 80, h: 200, d: 35, color: '#D4C5A9' },
  { id: 'desk', name: 'Стол', icon: '🖥️', w: 140, h: 75, d: 70, color: '#8b5a2b' },
  { id: 'closet', name: 'Гардероб', icon: '👔', w: 200, h: 240, d: 60, color: '#3C2415' },
  { id: 'shelf', name: 'Полка', icon: '📖', w: 80, h: 30, d: 25, color: '#808080' },
  { id: 'sofa', name: 'Диван', icon: '🛋️', w: 200, h: 85, d: 90, color: '#4c6e4f' },
  { id: 'bed', name: 'Кровать', icon: '🛏️', w: 160, h: 50, d: 200, color: '#a08060' },
  { id: 'chair', name: 'Стул', icon: '🪑', w: 45, h: 90, d: 45, color: '#C4A35A' },
  { id: 'tv_stand', name: 'ТВ-тумба', icon: '📺', w: 150, h: 45, d: 40, color: '#2D2D2D' },
]

// === Room types ===
const ROOM_TYPES = [
  { id: 'room', name: 'Комната', icon: '🏠' },
  { id: 'corridor', name: 'Коридор', icon: '🚪' },
  { id: 'kitchen_room', name: 'Кухня', icon: '🍳' },
  { id: 'bedroom', name: 'Спальня', icon: '🛏️' },
  { id: 'living', name: 'Гостиная', icon: '🛋️' },
  { id: 'bathroom', name: 'Ванная', icon: '🚿' },
  { id: 'office', name: 'Кабинет', icon: '💼' },
]

// === Detailed 3D Furniture Render Helper ===
function DetailedFurnitureModel({ id, w, h, d, color, isOverflow }) {
  const matColor = isOverflow ? '#ef4444' : color;
  const opacity = isOverflow ? 0.6 : 1;
  const transparent = isOverflow;

  switch (id) {
    case 'wardrobe':
      return (
        <group>
          {/* Main carcass */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={matColor} roughness={0.6} transparent={transparent} opacity={opacity} />
          </mesh>
          {/* Doors split line */}
          <mesh position={[0, 0, d / 2 + 0.002]}>
            <boxGeometry args={[0.005, h - 0.04, 0.005]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Handles */}
          <mesh position={[-0.05, 0, d / 2 + 0.015]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, 0.2]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.05, 0, d / 2 + 0.015]} castShadow>
            <cylinderGeometry args={[0.005, 0.005, 0.2]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      );
    case 'kitchen':
      return (
        <group>
          {/* Base cabinet */}
          <mesh position={[0, -0.02, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h - 0.04, d - 0.02]} />
            <meshStandardMaterial color={matColor} roughness={0.5} transparent={transparent} opacity={opacity} />
          </mesh>
          {/* Stone Countertop */}
          <mesh position={[0, h / 2 - 0.02, 0]} castShadow receiveShadow>
            <boxGeometry args={[w + 0.02, 0.04, d + 0.02]} />
            <meshStandardMaterial color="#f1f5f9" roughness={0.2} metalness={0.1} />
          </mesh>
          {/* Sink mock */}
          <mesh position={[-w / 6, h / 2, 0]} castShadow>
            <boxGeometry args={[w / 4, 0.005, d / 2]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Faucet mock */}
          <group position={[-w / 6, h / 2 + 0.08, -d / 5]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.1]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.05, 0.03]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.06]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        </group>
      );
    case 'nightstand':
      return (
        <group>
          {/* Main frame */}
          <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h - 0.08, d]} />
            <meshStandardMaterial color={matColor} roughness={0.6} transparent={transparent} opacity={opacity} />
          </mesh>
          {/* Drawers separation line */}
          <mesh position={[0, 0.04, d / 2 + 0.002]}>
            <boxGeometry args={[w - 0.04, 0.004, 0.005]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Drawer handles */}
          <mesh position={[0, 0.1, d / 2 + 0.01]} castShadow>
            <boxGeometry args={[0.1, 0.015, 0.015]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0, -0.04, d / 2 + 0.01]} castShadow>
            <boxGeometry args={[0.1, 0.015, 0.015]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* 4 small legs */}
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
            <mesh key={i} position={[sx * (w / 2 - 0.04), -h / 2 + 0.04, sz * (d / 2 - 0.04)]} castShadow>
              <cylinderGeometry args={[0.015, 0.01, 0.08]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
          ))}
        </group>
      );
    case 'dresser':
      return (
        <group>
          {/* Cabinet */}
          <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h - 0.08, d]} />
            <meshStandardMaterial color={matColor} roughness={0.6} transparent={transparent} opacity={opacity} />
          </mesh>
          {/* 3 Drawer panels */}
          {[-0.1, 0.04, 0.18].map((dy, idx) => (
            <group key={idx} position={[0, dy, d / 2 + 0.002]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[w - 0.04, (h - 0.12) / 3, 0.005]} />
                <meshStandardMaterial color={matColor} roughness={0.5} />
              </mesh>
              <mesh position={[0, 0, 0.008]} castShadow>
                <boxGeometry args={[0.15, 0.015, 0.015]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
              </mesh>
            </group>
          ))}
          {/* 4 Legs */}
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
            <mesh key={i} position={[sx * (w / 2 - 0.05), -h / 2 + 0.04, sz * (d / 2 - 0.05)]} castShadow>
              <cylinderGeometry args={[0.02, 0.015, 0.08]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
          ))}
        </group>
      );
    case 'shelving':
      return (
        <group>
          {/* Frame posts */}
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
            <mesh key={i} position={[sx * (w / 2 - 0.01), 0, sz * (d / 2 - 0.01)]} castShadow>
              <boxGeometry args={[0.025, h, 0.025]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
          {/* 5 shelf plates */}
          {Array.from({ length: 5 }).map((_, idx) => {
            const shY = -h / 2 + (h / 4) * idx;
            return (
              <group key={idx} position={[0, shY, 0]}>
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[w - 0.01, 0.02, d - 0.01]} />
                  <meshStandardMaterial color={matColor} roughness={0.7} transparent={transparent} opacity={opacity} />
                </mesh>
                {/* Colorful books on some shelves */}
                {idx > 0 && idx < 4 && (
                  <group position={[w / 6, 0.06, 0]}>
                    <mesh castShadow>
                      <boxGeometry args={[0.03, 0.1, 0.15]} />
                      <meshStandardMaterial color="#ef4444" />
                    </mesh>
                    <mesh position={[0.035, 0, 0]} castShadow>
                      <boxGeometry args={[0.03, 0.09, 0.14]} />
                      <meshStandardMaterial color="#3b82f6" />
                    </mesh>
                    <mesh position={[0.07, 0, 0]} rotation={[0, 0, -0.1]} castShadow>
                      <boxGeometry args={[0.03, 0.11, 0.16]} />
                      <meshStandardMaterial color="#10b981" />
                    </mesh>
                  </group>
                )}
              </group>
            );
          })}
        </group>
      );
    case 'desk':
      return (
        <group>
          {/* Wooden Tabletop */}
          <mesh position={[0, h / 2 - 0.015, 0]} castShadow receiveShadow>
            <RoundedBox args={[w, 0.03, d]} radius={0.005} smoothness={4} />
            <meshStandardMaterial color={matColor} roughness={0.5} transparent={transparent} opacity={opacity} />
          </mesh>
          {/* 4 Metal Legs */}
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
            <mesh key={i} position={[sx * (w / 2 - 0.05), -0.015, sz * (d / 2 - 0.05)]} castShadow>
              <cylinderGeometry args={[0.02, 0.015, h - 0.03]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </mesh>
          ))}
          {/* Computer monitor mock */}
          <group position={[0, h / 2 + 0.1, -d / 6]}>
            {/* Screen */}
            <mesh castShadow>
              <boxGeometry args={[0.3, 0.18, 0.015]} />
              <meshStandardMaterial color="#1e293b" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Stand */}
            <mesh position={[0, -0.095, 0]} castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.05]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Base */}
            <mesh position={[0, -0.115, 0]} castShadow>
              <boxGeometry args={[0.1, 0.005, 0.08]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        </group>
      );
    case 'closet':
      return (
        <group>
          {/* Carcass frame */}
          <mesh position={[0, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={matColor} roughness={0.6} transparent={transparent} opacity={opacity} />
          </mesh>
          {/* Back panel */}
          <mesh position={[0, 0, -d / 2 + 0.01]} castShadow>
            <boxGeometry args={[w - 0.02, h - 0.02, 0.015]} />
            <meshStandardMaterial color={matColor} roughness={0.7} />
          </mesh>
          {/* Shelf divider */}
          <mesh position={[0, h / 4, 0]} castShadow>
            <boxGeometry args={[w - 0.04, 0.02, d - 0.04]} />
            <meshStandardMaterial color={matColor} roughness={0.7} />
          </mesh>
          {/* Clothes rail */}
          <mesh position={[0, h / 5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, w - 0.05]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.05} />
          </mesh>
        </group>
      );
    case 'shelf':
      return (
        <group position={[0, h / 2, 0]}>
          {/* Shelf board */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, 0.025, d]} />
            <meshStandardMaterial color={matColor} roughness={0.6} transparent={transparent} opacity={opacity} />
          </mesh>
          {/* Metal brackets */}
          {[-w / 3, w / 3].map((bx, i) => (
            <group key={i} position={[bx, -0.06, -d / 4]}>
              <mesh castShadow>
                <boxGeometry args={[0.02, 0.12, 0.02]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
              </mesh>
              <mesh position={[0, 0.06, d / 6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <boxGeometry args={[0.02, d * 0.8, 0.02]} />
                <meshStandardMaterial color="#1e293b" metalness={0.8} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case 'sofa':
      return (
        <group>
          {/* Bottom base */}
          <mesh position={[0, -h / 4, 0]} castShadow receiveShadow>
            <RoundedBox args={[w, h / 2, d]} radius={0.02} smoothness={4} />
            <meshStandardMaterial color={matColor} roughness={0.8} transparent={transparent} opacity={opacity} />
          </mesh>
          {/* Cushions */}
          <mesh position={[0, 0.02, 0.02]} castShadow receiveShadow>
            <RoundedBox args={[w - 0.08, h / 3, d - 0.1]} radius={0.02} smoothness={4} />
            <meshStandardMaterial color={matColor} roughness={0.8} />
          </mesh>
          {/* Backrest */}
          <mesh position={[0, h / 4, -d / 2 + 0.06]} castShadow receiveShadow>
            <RoundedBox args={[w, h / 2, 0.12]} radius={0.02} smoothness={4} />
            <meshStandardMaterial color={matColor} roughness={0.8} />
          </mesh>
          {/* Armrests */}
          {[-w / 2 + 0.04, w / 2 - 0.04].map((ax, i) => (
            <mesh key={i} position={[ax, 0.05, 0]} castShadow>
              <RoundedBox args={[0.08, h * 0.6, d]} radius={0.02} smoothness={4} />
              <meshStandardMaterial color={matColor} roughness={0.8} />
            </mesh>
          ))}
          {/* Small feet */}
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
            <mesh key={i} position={[sx * (w / 2 - 0.06), -h / 2 + 0.02, sz * (d / 2 - 0.06)]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.04]} />
              <meshStandardMaterial color="#1e293b" roughness={0.9} />
            </mesh>
          ))}
        </group>
      );
    case 'bed':
      return (
        <group>
          {/* Wooden bed frame */}
          <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h * 0.4, d]} />
            <meshStandardMaterial color="#5c4033" roughness={0.6} />
          </mesh>
          {/* Headboard */}
          <mesh position={[0, h / 2 - 0.1, -d / 2 + 0.02]} castShadow>
            <RoundedBox args={[w, h * 0.8, 0.04]} radius={0.01} smoothness={4} />
            <meshStandardMaterial color="#5c4033" roughness={0.6} />
          </mesh>
          {/* Mattress */}
          <mesh position={[0, 0.08, 0.02]} castShadow receiveShadow>
            <RoundedBox args={[w - 0.04, h * 0.5, d - 0.08]} radius={0.02} smoothness={4} />
            <meshStandardMaterial color="#f8fafc" roughness={0.9} transparent={transparent} opacity={opacity} />
          </mesh>
          {/* Folded blanket */}
          <mesh position={[0, 0.11, d / 4]} castShadow receiveShadow>
            <boxGeometry args={[w - 0.03, h * 0.51, d / 2]} />
            <meshStandardMaterial color={matColor} roughness={0.7} />
          </mesh>
          {/* 2 pillows */}
          {[-w / 4, w / 4].map((px, i) => (
            <mesh key={i} position={[px, 0.16, -d / 3]} rotation={[-0.2, 0, 0]} castShadow>
              <RoundedBox args={[w / 3, 0.06, 0.25]} radius={0.01} smoothness={4} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.9} />
            </mesh>
          ))}
        </group>
      );
    case 'chair':
      return (
        <group>
          {/* Seat */}
          <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
            <RoundedBox args={[w, 0.03, d]} radius={0.005} smoothness={4} />
            <meshStandardMaterial color={matColor} roughness={0.6} transparent={transparent} opacity={opacity} />
          </mesh>
          {/* Backrest */}
          <group position={[0, h / 3, -d / 2 + 0.025]}>
            {/* Backrest frame */}
            <mesh castShadow>
              <RoundedBox args={[w, h * 0.5, 0.02]} radius={0.005} smoothness={4} />
              <meshStandardMaterial color={matColor} roughness={0.6} />
            </mesh>
            {/* Slats */}
            {[-w / 4, 0, w / 4].map((sx, i) => (
              <mesh key={i} position={[sx, -h / 5, 0]} castShadow>
                <boxGeometry args={[0.015, h / 3, 0.01]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
            ))}
          </group>
          {/* 4 long legs */}
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
            <mesh key={i} position={[sx * (w / 2 - 0.03), -h / 4 + 0.01, sz * (d / 2 - 0.03)]} castShadow>
              <cylinderGeometry args={[0.012, 0.008, h / 2]} />
              <meshStandardMaterial color={matColor} roughness={0.6} />
            </mesh>
          ))}
        </group>
      );
    case 'tv_stand':
      return (
        <group>
          {/* Low cabinet carcass */}
          <mesh position={[0, -0.04, 0]} castShadow receiveShadow>
            <boxGeometry args={[w, h - 0.08, d]} />
            <meshStandardMaterial color={matColor} roughness={0.6} transparent={transparent} opacity={opacity} />
          </mesh>
          {/* Open center slot divider */}
          <mesh position={[0, -0.04, 0]} castShadow>
            <boxGeometry args={[w - 0.04, 0.015, d - 0.04]} />
            <meshStandardMaterial color={matColor} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.04, 0]} castShadow>
            <boxGeometry args={[0.015, h - 0.1, d - 0.04]} />
            <meshStandardMaterial color={matColor} roughness={0.7} />
          </mesh>
          {/* Flat TV screen on top */}
          <group position={[0, h / 2 + 0.15, 0]}>
            {/* Screen */}
            <mesh castShadow>
              <boxGeometry args={[w * 0.8, h * 0.8, 0.02]} />
              <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
            </mesh>
            {/* Stand */}
            <mesh position={[0, -h * 0.45, 0]} castShadow>
              <cylinderGeometry args={[0.015, 0.015, 0.1]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Base plate */}
            <mesh position={[0, -h * 0.5, 0]} castShadow>
              <boxGeometry args={[w / 3, 0.01, d / 2.5]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        </group>
      );
    default:
      return (
        <mesh castShadow receiveShadow>
          <RoundedBox args={[w, h, d]} radius={0.01} smoothness={4} />
          <meshStandardMaterial color={matColor} roughness={0.6} transparent={transparent} opacity={opacity} />
        </mesh>
      );
  }
}

// === 3D Room Walls ===
function RoomWalls({ width, depth, height }) {
  const w = width / 100
  const d = depth / 100
  const h = height / 100

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, h / 2, -d / 2]} receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-w / 2, h / 2, 0]} receiveShadow rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Right wall (transparent for visibility) */}
      <mesh position={[w / 2, h / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[d, h]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.9} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>

      {/* Front wall (transparent for visibility) */}
      <mesh position={[0, h / 2, d / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} transparent opacity={0.1} side={THREE.DoubleSide} />
      </mesh>

      {/* Baseboard back */}
      <mesh position={[0, 0.04, -d / 2 + 0.01]}>
        <boxGeometry args={[w, 0.08, 0.02]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      {/* Baseboard left */}
      <mesh position={[-w / 2 + 0.01, 0.04, 0]}>
        <boxGeometry args={[0.02, 0.08, d]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
    </group>
  )
}

// === 3D Furniture Item in Room ===
function FurnitureItem3D({ item, isSelected, onClick, onDragStart }) {
  const w = item.w / 100
  const h = item.h / 100
  const d = item.d / 100

  return (
    <group
      position={[item.x / 100, h / 2, item.z / 100]}
      rotation={[0, (item.rotation || 0) * Math.PI / 180, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        onDragStart(e, item)
      }}
      style={{ cursor: 'pointer' }}
    >
      <DetailedFurnitureModel
        id={item.id}
        w={w}
        h={h}
        d={d}
        color={item.color}
        isOverflow={item.overflow}
      />

      {/* Selection outline */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[w + 0.04, h + 0.04, d + 0.04]} />
          <meshBasicMaterial color="#3b82f6" wireframe transparent opacity={0.8} />
        </mesh>
      )}

      {/* Overflow indicator */}
      {item.overflow && (
        <mesh position={[0, h / 2 + 0.15, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.5} />
        </mesh>
      )}
    </group>
  )
}

// === Main 3D Scene ===
function RoomScene({ room, furniture, selectedId, onSelectFurniture, onMoveFurniture }) {
  const w = room.width / 100
  const d = room.depth / 100
  const h = room.height / 100

  const [draggingId, setDraggingId] = useState(null)
  const dragOffset = useRef({ x: 0, z: 0 })

  const handleDragStart = useCallback((e, item) => {
    e.stopPropagation()
    setDraggingId(item.uid)
    onSelectFurniture(item.uid)

    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const intersectionPoint = new THREE.Vector3()
    e.raycaster.ray.intersectPlane(floorPlane, intersectionPoint)
    dragOffset.current = {
      x: intersectionPoint.x * 100 - item.x,
      z: intersectionPoint.z * 100 - item.z
    }
  }, [onSelectFurniture])

  const handlePointerMove = useCallback((e) => {
    if (draggingId) {
      const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
      const intersectionPoint = new THREE.Vector3()
      e.raycaster.ray.intersectPlane(floorPlane, intersectionPoint)
      const newX = intersectionPoint.x * 100 - dragOffset.current.x
      const newZ = intersectionPoint.z * 100 - dragOffset.current.z
      onMoveFurniture(draggingId, Math.round(newX), Math.round(newZ))
    }
  }, [draggingId, onMoveFurniture])

  const handlePointerUp = useCallback(() => {
    setDraggingId(null)
  }, [])

  return (
    <>
      <PerspectiveCamera makeDefault position={[w * 1.5, h * 1.5, d * 2]} fov={50} />
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-3, 5, -3]} intensity={0.3} />
      <pointLight position={[0, h, 0]} intensity={0.4} color="#fef3c7" />

      <RoomWalls width={room.width} depth={room.depth} height={room.height} />

      {furniture.map((item) => (
        <FurnitureItem3D
          key={item.uid}
          item={item}
          isSelected={selectedId === item.uid}
          onClick={() => onSelectFurniture(item.uid)}
          onDragStart={handleDragStart}
        />
      ))}

      {/* Invisible plane for dragging across the entire floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <ContactShadows
        position={[0, -0.001, 0]}
        opacity={0.4} scale={20} blur={2} far={4}
      />

      <Environment preset="apartment" />
      <OrbitControls
        enabled={!draggingId}
        enablePan enableZoom enableRotate
        minDistance={1} maxDistance={15}
        minPolarAngle={0.1} maxPolarAngle={Math.PI / 2.1}
        target={[0, h / 2, 0]}
      />

      <gridHelper args={[20, 40, '#cbd5e1', '#cbd5e1']} position={[0, -0.002, 0]} />
    </>
  )
}

// === Check if furniture fits in room ===
function checkFurnitureFit(item, room) {
  const rW = room.width / 2
  const rD = room.depth / 2
  const rH = room.height

  // Effective dimensions considering rotation
  const rad = (item.rotation || 0) * Math.PI / 180
  const cosR = Math.abs(Math.cos(rad))
  const sinR = Math.abs(Math.sin(rad))
  const effectiveW = item.w * cosR + item.d * sinR
  const effectiveD = item.w * sinR + item.d * cosR

  const halfW = effectiveW / 2
  const halfD = effectiveD / 2

  // Check room boundaries
  if (item.x - halfW < -rW || item.x + halfW > rW) return false
  if (item.z - halfD < -rD || item.z + halfD > rD) return false
  if (item.h > rH) return false

  return true
}

// === 2D Top-down view ===
function TopDownView({ room, furniture, selectedId, onSelectFurniture, onMoveFurniture }) {
  const svgRef = useRef(null)
  const [dragging, setDragging] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const scale = Math.min(500 / room.width, 400 / room.depth) * 0.85
  const ox = 250
  const oy = 200

  const toScreen = (x, z) => ({
    sx: ox + x * scale,
    sy: oy + z * scale
  })

  const toWorld = (sx, sy) => ({
    x: (sx - ox) / scale,
    z: (sy - oy) / scale
  })

  const handleMouseDown = (e, item) => {
    e.stopPropagation()
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const cursorPt = pt.matrixTransform(svg.getScreenCTM().inverse())
    const screen = toScreen(item.x, item.z)
    setDragOffset({ x: cursorPt.x - screen.sx, y: cursorPt.y - screen.sy })
    setDragging(item.uid)
    onSelectFurniture(item.uid)
  }

  const handleMouseMove = (e) => {
    if (!dragging) return
    const svg = svgRef.current
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const cursorPt = pt.matrixTransform(svg.getScreenCTM().inverse())
    const world = toWorld(cursorPt.x - dragOffset.x, cursorPt.y - dragOffset.y)
    onMoveFurniture(dragging, Math.round(world.x), Math.round(world.z))
  }

  const handleMouseUp = () => {
    setDragging(null)
  }

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 500 400"
      className="room-topdown"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Room boundary */}
      <rect
        x={ox - (room.width / 2) * scale}
        y={oy - (room.depth / 2) * scale}
        width={room.width * scale}
        height={room.depth * scale}
        fill="#f8f5f0"
        stroke="#94a3b8"
        strokeWidth="2"
        strokeDasharray="6 3"
        rx="4"
      />

      {/* Room dimensions labels */}
      <text x={ox} y={oy - (room.depth / 2) * scale - 10} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600">
        {room.width} см
      </text>
      <text x={ox - (room.width / 2) * scale - 10} y={oy} textAnchor="middle" fill="#64748b" fontSize="12" fontWeight="600"
        transform={`rotate(-90, ${ox - (room.width / 2) * scale - 10}, ${oy})`}>
        {room.depth} см
      </text>

      {/* Furniture items */}
      {furniture.map((item) => {
        const rad = (item.rotation || 0) * Math.PI / 180
        const cosR = Math.abs(Math.cos(rad))
        const sinR = Math.abs(Math.sin(rad))
        const effectiveW = item.w * cosR + item.d * sinR
        const effectiveD = item.w * sinR + item.d * cosR
        const screen = toScreen(item.x, item.z)
        const isSelected = selectedId === item.uid
        const isOverflow = item.overflow

        return (
          <g key={item.uid}
            onMouseDown={(e) => handleMouseDown(e, item)}
            style={{ cursor: dragging === item.uid ? 'grabbing' : 'grab' }}
          >
            <rect
              x={screen.sx - (effectiveW * scale) / 2}
              y={screen.sy - (effectiveD * scale) / 2}
              width={effectiveW * scale}
              height={effectiveD * scale}
              fill={isOverflow ? 'rgba(239,68,68,0.3)' : `${item.color}44`}
              stroke={isSelected ? '#3b82f6' : (isOverflow ? '#ef4444' : '#94a3b8')}
              strokeWidth={isSelected ? 2.5 : 1.5}
              rx="3"
              transform={`rotate(${item.rotation || 0}, ${screen.sx}, ${screen.sy})`}
            />
            <text
              x={screen.sx} y={screen.sy + 4}
              textAnchor="middle" fill={isOverflow ? '#ef4444' : '#475569'}
              fontSize="10" fontWeight="600" pointerEvents="none"
            >
              {item.icon}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// === Main Room Planner Component ===
export default function RoomPlanner({ addToast, onBack }) {
  const [room, setRoom] = useState({
    type: 'room',
    width: 400,
    depth: 350,
    height: 270,
  })
  const [furniture, setFurniture] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [view, setView] = useState('3d') // '3d' | '2d'

  const uidRef = useRef(1)

  // Validate all furniture positions
  const validatedFurniture = useMemo(() => {
    return furniture.map(item => ({
      ...item,
      overflow: !checkFurnitureFit(item, room)
    }))
  }, [furniture, room])

  const hasOverflow = validatedFurniture.some(f => f.overflow)

  const addFurniture = useCallback((catalogItem) => {
    const newItem = {
      uid: `f_${uidRef.current++}`,
      id: catalogItem.id,
      name: catalogItem.name,
      icon: catalogItem.icon,
      w: catalogItem.w,
      h: catalogItem.h,
      d: catalogItem.d,
      color: catalogItem.color,
      x: 0,
      z: 0,
      rotation: 0,
    }

    // Check if it fits at all
    if (catalogItem.w > room.width && catalogItem.d > room.width) {
      addToast(`${catalogItem.name} слишком широкий для этой комнаты (${catalogItem.w} см > ${room.width} см)`, 'error')
      return
    }
    if (catalogItem.d > room.depth && catalogItem.w > room.depth) {
      addToast(`${catalogItem.name} слишком глубокий для этой комнаты (${catalogItem.d} см > ${room.depth} см)`, 'error')
      return
    }
    if (catalogItem.h > room.height) {
      addToast(`${catalogItem.name} слишком высокий для этой комнаты (${catalogItem.h} см > ${room.height} см)`, 'error')
      return
    }

    setFurniture(prev => [...prev, newItem])
    setSelectedId(newItem.uid)
    addToast(`${catalogItem.name} добавлен в комнату`, 'success')
  }, [room, addToast])

  const removeFurniture = useCallback((uid) => {
    setFurniture(prev => prev.filter(f => f.uid !== uid))
    if (selectedId === uid) setSelectedId(null)
    addToast('Мебель удалена', 'success')
  }, [selectedId, addToast])

  const moveFurniture = useCallback((uid, x, z) => {
    // Keep furniture items strictly within sensible grid bounds on floor
    const bounds = 1500 // Max room size limit
    const clampedX = Math.max(-bounds, Math.min(bounds, x))
    const clampedZ = Math.max(-bounds, Math.min(bounds, z))
    setFurniture(prev => prev.map(f => f.uid === uid ? { ...f, x: clampedX, z: clampedZ } : f))
  }, [])

  const rotateFurniture = useCallback((uid) => {
    setFurniture(prev => prev.map(f =>
      f.uid === uid ? { ...f, rotation: ((f.rotation || 0) + 90) % 360 } : f
    ))
  }, [])

  const updateFurniturePos = useCallback((uid, key, val) => {
    setFurniture(prev => prev.map(f => f.uid === uid ? { ...f, [key]: val } : f))
  }, [])

  const selectedItem = validatedFurniture.find(f => f.uid === selectedId)

  const updateRoom = (key, val) => {
    setRoom(prev => ({ ...prev, [key]: val }))
  }

  return (
    <div className="planner-page">
      {/* Left panel */}
      <div className="planner-sidebar">
        <div className="planner-sidebar-scroll">
          {/* Room settings */}
          <div className="planner-section">
            <h3><Maximize2 size={16} /> Размеры помещения</h3>
            <div className="planner-room-type">
              {ROOM_TYPES.map(rt => (
                <button
                  key={rt.id}
                  className={`planner-type-btn ${room.type === rt.id ? 'active' : ''}`}
                  onClick={() => updateRoom('type', rt.id)}
                >
                  <span>{rt.icon}</span>
                  <span>{rt.name}</span>
                </button>
              ))}
            </div>
            <div className="planner-dims">
              <div className="planner-dim-input">
                <label>Длина (см)</label>
                <input type="number" value={room.width} min={100} max={2000} step={10}
                  onChange={e => updateRoom('width', Math.max(100, Math.min(2000, Number(e.target.value))))} />
              </div>
              <div className="planner-dim-input">
                <label>Ширина (см)</label>
                <input type="number" value={room.depth} min={100} max={2000} step={10}
                  onChange={e => updateRoom('depth', Math.max(100, Math.min(2000, Number(e.target.value))))} />
              </div>
              <div className="planner-dim-input">
                <label>Высота (см)</label>
                <input type="number" value={room.height} min={200} max={500} step={10}
                  onChange={e => updateRoom('height', Math.max(200, Math.min(500, Number(e.target.value))))} />
              </div>
            </div>
            <div className="planner-room-info">
              <span>Площадь: <strong>{((room.width * room.depth) / 10000).toFixed(1)} м²</strong></span>
              <span>Объём: <strong>{((room.width * room.depth * room.height) / 1000000).toFixed(1)} м³</strong></span>
            </div>
          </div>

          {/* Furniture catalog */}
          <div className="planner-section">
            <h3><Box size={16} /> Добавить мебель</h3>
            <div className="planner-furniture-grid">
              {ROOM_FURNITURE.map(item => (
                <button
                  key={item.id}
                  className="planner-furniture-btn"
                  onClick={() => addFurniture(item)}
                  title={`${item.name}: ${item.w}×${item.h}×${item.d} см`}
                >
                  <span className="planner-furn-icon">{item.icon}</span>
                  <span className="planner-furn-name">{item.name}</span>
                  <span className="planner-furn-size">{item.w}×{item.d}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Placed furniture list */}
          {validatedFurniture.length > 0 && (
            <div className="planner-section">
              <h3>📋 Размещённая мебель ({validatedFurniture.length})</h3>
              <div className="planner-placed-list">
                {validatedFurniture.map(item => (
                  <div
                    key={item.uid}
                    className={`planner-placed-item ${selectedId === item.uid ? 'selected' : ''} ${item.overflow ? 'overflow' : ''}`}
                    onClick={() => setSelectedId(item.uid)}
                  >
                    <div className="planner-placed-info">
                      <span className="planner-placed-icon">{item.icon}</span>
                      <div>
                        <div className="planner-placed-name">{item.name}</div>
                        <div className="planner-placed-dims">{item.w}×{item.h}×{item.d} см</div>
                      </div>
                    </div>
                    <div className="planner-placed-actions">
                      {item.overflow && <AlertTriangle size={14} color="#ef4444" />}
                      <button className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); rotateFurniture(item.uid) }} title="Повернуть">
                        <RotateCcw size={14} />
                      </button>
                      <button className="btn-icon-sm danger" onClick={(e) => { e.stopPropagation(); removeFurniture(item.uid) }} title="Удалить">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected item controls */}
          {selectedItem && (
            <div className="planner-section">
              <h3><Move size={16} /> Позиция: {selectedItem.name}</h3>
              <div className="planner-pos-controls">
                <div className="planner-dim-input">
                  <label>X позиция (см)</label>
                  <input type="number" value={selectedItem.x}
                    onChange={e => updateFurniturePos(selectedItem.uid, 'x', Number(e.target.value))} />
                </div>
                <div className="planner-dim-input">
                  <label>Z позиция (см)</label>
                  <input type="number" value={selectedItem.z}
                    onChange={e => updateFurniturePos(selectedItem.uid, 'z', Number(e.target.value))} />
                </div>
                <div className="planner-dim-input">
                  <label>Поворот (°)</label>
                  <input type="number" value={selectedItem.rotation || 0} step={15}
                    onChange={e => updateFurniturePos(selectedItem.uid, 'rotation', Number(e.target.value) % 360)} />
                </div>
              </div>
              {selectedItem.overflow && (
                <div className="planner-overflow-warning">
                  <AlertTriangle size={16} />
                  <span>Мебель выходит за границы комнаты! Измените позицию или размеры помещения.</span>
                </div>
              )}
            </div>
          )}

          {/* Status bar */}
          <div className={`planner-status ${hasOverflow ? 'error' : 'ok'}`}>
            {hasOverflow ? (
              <><AlertTriangle size={16} /> Есть мебель за пределами комнаты</>
            ) : (
              <><CheckCircle size={16} /> Вся мебель размещена корректно</>
            )}
          </div>
        </div>
      </div>

      {/* Viewport */}
      <div className="planner-viewport">
        <div className="planner-toolbar">
          <button className="btn btn-secondary btn-sm" onClick={onBack}>← Назад</button>
          <div className="planner-view-toggle">
            <button
              className={`planner-view-btn ${view === '3d' ? 'active' : ''}`}
              onClick={() => setView('3d')}
            >3D вид</button>
            <button
              className={`planner-view-btn ${view === '2d' ? 'active' : ''}`}
              onClick={() => setView('2d')}
            >2D план</button>
          </div>
          <div className="planner-room-label">
            {ROOM_TYPES.find(r => r.id === room.type)?.icon} {ROOM_TYPES.find(r => r.id === room.type)?.name}: {room.width}×{room.depth}×{room.height} см
          </div>
        </div>

        {view === '3d' ? (
          <Canvas shadows gl={{ antialias: true }}>
            <RoomScene
              room={room}
              furniture={validatedFurniture}
              selectedId={selectedId}
              onSelectFurniture={setSelectedId}
              onMoveFurniture={moveFurniture}
            />
          </Canvas>
        ) : (
          <div className="planner-2d-container">
            <TopDownView
              room={room}
              furniture={validatedFurniture}
              selectedId={selectedId}
              onSelectFurniture={setSelectedId}
              onMoveFurniture={moveFurniture}
            />
            <div className="planner-2d-hint">
              💡 Перетаскивайте мебель мышкой для перемещения
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

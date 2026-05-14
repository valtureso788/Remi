import React, { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, RoundedBox, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei'
import { BODY_COLORS, FACADE_COLORS, MATERIALS } from './data'

function FurnitureModel({ config }) {
  const group = useRef()
  const w = config.width / 100
  const h = config.height / 100
  const d = config.depth / 100
  const thick = 0.02
  const bodyHex = BODY_COLORS.find(c => c.id === config.bodyColor)?.hex || '#F5F5F5'
  const facadeHex = FACADE_COLORS.find(c => c.id === config.facadeColor)?.hex || '#FFFFFF'
  const matData = MATERIALS.find(m => m.id === config.material)
  const metalness = config.material === 'metal' ? 0.8 : config.material === 'glass' ? 0.1 : 0.05
  const roughness = config.material === 'glass' ? 0.05 : config.material === 'metal' ? 0.3 : 0.7
  const opacity = config.material === 'glass' ? 0.4 : 1

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02
    }
  })

  const shelves = useMemo(() => {
    const arr = []
    if (config.shelves > 0) {
      const gap = h / (config.shelves + 1)
      for (let i = 1; i <= config.shelves; i++) {
        arr.push(gap * i - h / 2)
      }
    }
    return arr
  }, [config.shelves, h])

  const sectionDividers = useMemo(() => {
    const arr = []
    if (config.sections > 1) {
      const gap = w / config.sections
      for (let i = 1; i < config.sections; i++) {
        arr.push(gap * i - w / 2)
      }
    }
    return arr
  }, [config.sections, w])

  const drawers = useMemo(() => {
    const arr = []
    if (config.drawers > 0) {
      const drawerH = Math.min(0.2, (h * 0.4) / config.drawers)
      for (let i = 0; i < config.drawers; i++) {
        arr.push(-h / 2 + drawerH / 2 + i * (drawerH + 0.005) + 0.025)
      }
    }
    return arr
  }, [config.drawers, h])

  const isTable = config.type === 'desk'
  const isShelf = config.type === 'shelf'

  return (
    <group ref={group}>
      {isTable ? (
        <TableModel w={w} h={h} d={d} thick={thick} bodyHex={bodyHex}
          metalness={metalness} roughness={roughness} config={config} />
      ) : isShelf ? (
        <ShelfModel w={w} h={h} d={d} thick={thick} bodyHex={bodyHex}
          metalness={metalness} roughness={roughness} shelves={shelves} config={config} />
      ) : (
        <CabinetModel w={w} h={h} d={d} thick={thick}
          bodyHex={bodyHex} facadeHex={facadeHex}
          metalness={metalness} roughness={roughness} opacity={opacity}
          shelves={shelves} sectionDividers={sectionDividers}
          drawers={drawers} config={config} />
      )}

      {/* Legs */}
      {config.legs !== 'none' && (
        <LegsModel w={w} h={h} d={d} legType={config.legs} />
      )}
    </group>
  )
}

function CabinetModel({ w, h, d, thick, bodyHex, facadeHex, metalness, roughness, opacity, shelves, sectionDividers, drawers, config }) {
  const legOffset = config.legs !== 'none' ? 0.08 : 0

  return (
    <group position={[0, legOffset / 2, 0]}>
      {/* Back panel */}
      <mesh position={[0, 0, -d / 2 + thick / 2]}>
        <boxGeometry args={[w, h, thick]} />
        <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Left side */}
      <mesh position={[-w / 2 + thick / 2, 0, 0]}>
        <boxGeometry args={[thick, h, d]} />
        <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Right side */}
      <mesh position={[w / 2 - thick / 2, 0, 0]}>
        <boxGeometry args={[thick, h, d]} />
        <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Top */}
      <mesh position={[0, h / 2 - thick / 2, 0]}>
        <boxGeometry args={[w, thick, d]} />
        <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Bottom */}
      <mesh position={[0, -h / 2 + thick / 2, 0]}>
        <boxGeometry args={[w, thick, d]} />
        <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Shelves */}
      {shelves.map((y, i) => (
        <mesh key={`shelf-${i}`} position={[0, y, 0]}>
          <boxGeometry args={[w - thick * 2, thick * 0.8, d - thick]} />
          <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
        </mesh>
      ))}

      {/* Section dividers */}
      {sectionDividers.map((x, i) => (
        <mesh key={`div-${i}`} position={[x, 0, 0]}>
          <boxGeometry args={[thick * 0.8, h - thick * 2, d - thick]} />
          <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
        </mesh>
      ))}

      {/* Drawers */}
      {drawers.map((y, i) => (
        <group key={`drawer-${i}`}>
          <mesh position={[0, y, d / 2 - 0.005]}>
            <boxGeometry args={[w - thick * 2 - 0.01, 0.18, 0.01]} />
            <meshStandardMaterial color={facadeHex} metalness={metalness} roughness={roughness} />
          </mesh>
          {/* Drawer handle */}
          <mesh position={[0, y, d / 2 + 0.005]}>
            <boxGeometry args={[0.08, 0.015, 0.015]} />
            <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Doors */}
      {config.doorType !== 'none' && (
        <DoorsModel w={w} h={h} d={d} thick={thick}
          facadeHex={facadeHex} metalness={metalness} roughness={roughness}
          opacity={opacity} sections={config.sections}
          doorType={config.doorType} handles={config.handles}
          drawers={drawers} />
      )}
    </group>
  )
}

function DoorsModel({ w, h, d, thick, facadeHex, metalness, roughness, opacity, sections, doorType, handles, drawers }) {
  const doorPanels = []
  const sectionW = w / sections
  const drawerHeight = drawers.length > 0 ? drawers.length * 0.2 + 0.03 : 0
  const doorH = h - drawerHeight - thick * 2

  for (let i = 0; i < sections; i++) {
    const x = -w / 2 + sectionW / 2 + i * sectionW
    const y = drawerHeight / 2

    doorPanels.push(
      <group key={`door-${i}`}>
        <mesh position={[x, y, d / 2 - 0.005]}>
          <boxGeometry args={[sectionW - thick - 0.005, doorH, 0.015]} />
          <meshStandardMaterial
            color={facadeHex} metalness={metalness} roughness={roughness}
            transparent={opacity < 1} opacity={opacity}
          />
        </mesh>
        {/* Handle */}
        {handles !== 'hidden' && (
          <mesh position={[x + sectionW / 4, y, d / 2 + 0.01]}>
            <boxGeometry args={[0.015, 0.06, 0.02]} />
            <meshStandardMaterial color="#999" metalness={0.8} roughness={0.2} />
          </mesh>
        )}
      </group>
    )
  }

  return <>{doorPanels}</>
}

function TableModel({ w, h, d, thick, bodyHex, metalness, roughness, config }) {
  const legH = h - thick
  const legThick = 0.04

  return (
    <group>
      {/* Tabletop */}
      <mesh position={[0, h / 2 - thick / 2, 0]}>
        <boxGeometry args={[w, thick * 1.5, d]} />
        <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Four legs */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (w / 2 - 0.06), -thick / 2, sz * (d / 2 - 0.06)]}>
          <boxGeometry args={[legThick, legH, legThick]} />
          <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
        </mesh>
      ))}
    </group>
  )
}

function ShelfModel({ w, h, d, thick, bodyHex, metalness, roughness, shelves, config }) {
  return (
    <group>
      {/* Main shelf board */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w, thick, d]} />
        <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Side brackets */}
      <mesh position={[-w / 2 + thick / 2, thick, -d / 2 + thick / 2]}>
        <boxGeometry args={[thick, thick * 3, thick]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[w / 2 - thick / 2, thick, -d / 2 + thick / 2]}>
        <boxGeometry args={[thick, thick * 3, thick]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

function LegsModel({ w, h, d, legType }) {
  const legH = 0.08
  const legR = legType === 'metal' ? 0.015 : 0.02
  const color = legType === 'metal' ? '#C0C0C0' : legType === 'wood' ? '#8B6914' : '#333'
  const met = legType === 'metal' ? 0.8 : 0.1
  const rough = legType === 'metal' ? 0.2 : 0.7

  const positions = [
    [-w / 2 + 0.04, -h / 2 - legH / 2, -d / 2 + 0.04],
    [w / 2 - 0.04, -h / 2 - legH / 2, -d / 2 + 0.04],
    [-w / 2 + 0.04, -h / 2 - legH / 2, d / 2 - 0.04],
    [w / 2 - 0.04, -h / 2 - legH / 2, d / 2 - 0.04],
  ]

  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[legR, legR, legH, 16]} />
          <meshStandardMaterial color={color} metalness={met} roughness={rough} />
        </mesh>
      ))}
    </>
  )
}

export default function FurnitureViewer({ config }) {
  return (
    <Canvas shadows gl={{ preserveDrawingBuffer: true, antialias: true }} id="furniture-canvas">
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[2.5, 1.8, 2.5]} fov={45} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 5]} intensity={1} castShadow
          shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
        <directionalLight position={[-3, 4, -2]} intensity={0.3} />
        <pointLight position={[0, 3, 0]} intensity={0.2} color="#6366f1" />

        <FurnitureModel config={config} />

        <ContactShadows position={[0, -(config.height / 200 + (config.legs !== 'none' ? 0.08 : 0)), 0]}
          opacity={0.4} scale={8} blur={2.5} far={4} />

        <Environment preset="studio" />
        <OrbitControls enablePan enableZoom enableRotate
          minDistance={1} maxDistance={8}
          minPolarAngle={0.2} maxPolarAngle={Math.PI / 2 + 0.2} />

        {/* Floor grid */}
        <gridHelper args={[10, 20, '#1a1a3e', '#12121e']} position={[0, -(config.height / 200 + (config.legs !== 'none' ? 0.08 : 0) + 0.001), 0]} />
      </Suspense>
    </Canvas>
  )
}

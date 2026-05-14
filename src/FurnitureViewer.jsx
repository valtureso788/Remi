import React, { useRef, useMemo, Suspense, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, RoundedBox, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { BODY_COLORS, FACADE_COLORS, MATERIALS } from './data'

function Drawer({ y, w, d, thick, facadeHex, metalness, roughness }) {
  const [open, setOpen] = useState(false)
  const groupRef = useRef()
  const targetZ = open ? d * 0.7 : 0
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.1)
    }
  })

  return (
    <group position={[0, y, 0]} ref={groupRef} onClick={(e) => { e.stopPropagation(); setOpen(!open) }} style={{cursor:'pointer'}}>
      {/* Drawer facade */}
      <mesh position={[0, 0, d / 2 + 0.005]} castShadow receiveShadow>
        <RoundedBox args={[w - thick * 2 - 0.01, 0.18 - 0.008, 0.018]} radius={0.004} smoothness={4} />
        <meshStandardMaterial color={facadeHex} metalness={metalness} roughness={roughness} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, 0, d / 2 + 0.025]} castShadow>
        <cylinderGeometry args={[0.006, 0.006, 0.12]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#b0b0b0" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Drawer box */}
      <mesh position={[0, 0, d / 2 - (d * 0.45)]} castShadow receiveShadow>
        <boxGeometry args={[w - thick * 2 - 0.04, 0.14, d * 0.9]} />
        <meshStandardMaterial color={BODY_COLORS[1].hex} />
      </mesh>
    </group>
  )
}

function Door({ x, y, doorW, doorH, d, thick, facadeHex, metalness, roughness, opacity, handles, isLeft }) {
  const [open, setOpen] = useState(false)
  const groupRef = useRef()
  const targetRot = open ? (isLeft ? Math.PI / 2.2 : -Math.PI / 2.2) : 0
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRot, 0.1)
    }
  })

  const pivotX = isLeft ? -doorW / 2 : doorW / 2
  const meshX = isLeft ? doorW / 2 : -doorW / 2

  return (
    <group position={[x + pivotX, y, d / 2 + 0.005]} ref={groupRef} onClick={(e) => { e.stopPropagation(); setOpen(!open) }}>
      <mesh position={[meshX, 0, 0]} castShadow receiveShadow>
        <RoundedBox args={[doorW - 0.008, doorH - 0.008, 0.018]} radius={0.004} smoothness={4} />
        <meshStandardMaterial color={facadeHex} metalness={metalness} roughness={roughness} transparent={opacity < 1} opacity={opacity} />
      </mesh>
      {handles !== 'hidden' && (
        <mesh position={[meshX + (isLeft ? doorW/2 - 0.04 : -doorW/2 + 0.04), 0, 0.02]} castShadow>
          <cylinderGeometry args={[0.006, 0.006, 0.15, 16]} />
          <meshStandardMaterial color="#b0b0b0" metalness={0.9} roughness={0.1} />
        </mesh>
      )}
    </group>
  )
}

function CabinetModel({ w, h, d, thick, bodyHex, facadeHex, metalness, roughness, opacity, shelves, sectionDividers, drawers, config }) {
  const legOffset = config.legs !== 'none' ? 0.08 : 0

  return (
    <group position={[0, legOffset / 2, 0]}>
      {/* Back panel */}
      <mesh position={[0, 0, -d / 2 + thick / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, h, thick]} />
        <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
      </mesh>
      {/* Left side */}
      <mesh position={[-w / 2 + thick / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[thick, h, d]} />
        <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
      </mesh>
      {/* Right side */}
      <mesh position={[w / 2 - thick / 2, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[thick, h, d]} />
        <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
      </mesh>
      {/* Top */}
      <mesh position={[0, h / 2 - thick / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, thick, d]} />
        <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -h / 2 + thick / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, thick, d]} />
        <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Shelves */}
      {shelves.map((y, i) => (
        <mesh key={`shelf-${i}`} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[w - thick * 2, thick * 0.8, d - thick - 0.02]} />
          <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
        </mesh>
      ))}

      {/* Section dividers */}
      {sectionDividers.map((x, i) => (
        <mesh key={`div-${i}`} position={[x, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[thick * 0.8, h - thick * 2, d - thick]} />
          <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
        </mesh>
      ))}

      {/* Drawers */}
      {drawers.map((y, i) => (
        <Drawer key={`drawer-${i}`} y={y} w={w} d={d} thick={thick} facadeHex={facadeHex} metalness={metalness} roughness={roughness} />
      ))}

      {/* Doors */}
      {config.doorType !== 'none' && (
        <group>
          {Array.from({ length: config.sections }).map((_, i) => {
            const sectionW = w / config.sections
            const drawerHeight = drawers.length > 0 ? drawers.length * 0.2 + 0.02 : 0
            const doorH = h - drawerHeight - thick * 2
            const x = -w / 2 + sectionW / 2 + i * sectionW
            const y = drawerHeight / 2
            
            // For sliding doors, just make static meshes with different Z
            if (config.doorType === 'sliding') {
              const slideZ = i % 2 === 0 ? d / 2 + 0.01 : d / 2 + 0.03
              return (
                <group key={`slide-${i}`} position={[x, y, slideZ]}>
                  <mesh castShadow receiveShadow>
                    <RoundedBox args={[sectionW + 0.02, doorH, 0.018]} radius={0.004} smoothness={4} />
                    <meshStandardMaterial color={facadeHex} metalness={metalness} roughness={roughness} transparent={opacity < 1} opacity={opacity} />
                  </mesh>
                  {config.handles !== 'hidden' && (
                    <mesh position={[i % 2 === 0 ? sectionW/2 - 0.05 : -sectionW/2 + 0.05, 0, 0.015]} castShadow>
                      <boxGeometry args={[0.02, 0.15, 0.005]} />
                      <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
                    </mesh>
                  )}
                </group>
              )
            } else {
              // Swing doors
              const isLeft = i < config.sections / 2
              return (
                <Door key={`swing-${i}`} x={x} y={y} doorW={sectionW} doorH={doorH} d={d} thick={thick} 
                  facadeHex={facadeHex} metalness={metalness} roughness={roughness} opacity={opacity} 
                  handles={config.handles} isLeft={isLeft} />
              )
            }
          })}
        </group>
      )}
    </group>
  )
}

function TableModel({ w, h, d, thick, bodyHex, metalness, roughness, config }) {
  const legH = h - thick
  const legThick = 0.05

  return (
    <group>
      {/* Tabletop */}
      <mesh position={[0, h / 2 - thick / 2, 0]} castShadow receiveShadow>
        <RoundedBox args={[w, thick * 1.5, d]} radius={0.01} smoothness={4} />
        <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Four legs */}
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (w / 2 - 0.08), -thick / 2, sz * (d / 2 - 0.08)]} castShadow receiveShadow>
          <cylinderGeometry args={[legThick/2, legThick/3, legH, 16]} />
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
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <RoundedBox args={[w, thick, d]} radius={0.005} smoothness={4} />
        <meshStandardMaterial color={bodyHex} metalness={metalness} roughness={roughness} />
      </mesh>

      {/* Side brackets */}
      <mesh position={[-w / 2 + thick * 2, -thick, -d / 2 + thick]} castShadow receiveShadow>
        <boxGeometry args={[thick, thick * 4, thick]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[w / 2 - thick * 2, -thick, -d / 2 + thick]} castShadow receiveShadow>
        <boxGeometry args={[thick, thick * 4, thick]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  )
}

function LegsModel({ w, h, d, legType }) {
  const legH = 0.08
  const legR = legType === 'metal' ? 0.015 : 0.02
  const color = legType === 'metal' ? '#C0C0C0' : legType === 'wood' ? '#8B6914' : '#333'
  const met = legType === 'metal' ? 0.9 : 0.1
  const rough = legType === 'metal' ? 0.1 : 0.7

  const positions = [
    [-w / 2 + 0.05, -h / 2 - legH / 2, -d / 2 + 0.05],
    [w / 2 - 0.05, -h / 2 - legH / 2, -d / 2 + 0.05],
    [-w / 2 + 0.05, -h / 2 - legH / 2, d / 2 - 0.05],
    [w / 2 - 0.05, -h / 2 - legH / 2, d / 2 - 0.05],
  ]

  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos} castShadow receiveShadow>
          <cylinderGeometry args={[legR, legR*0.5, legH, 16]} />
          <meshStandardMaterial color={color} metalness={met} roughness={rough} />
        </mesh>
      ))}
    </>
  )
}

function FurnitureModel({ config }) {
  const w = config.width / 100
  const h = config.height / 100
  const d = config.depth / 100
  const thick = 0.02
  const bodyHex = BODY_COLORS.find(c => c.id === config.bodyColor)?.hex || '#F5F5F5'
  const facadeHex = FACADE_COLORS.find(c => c.id === config.facadeColor)?.hex || '#FFFFFF'
  const metalness = config.material === 'metal' ? 0.9 : config.material === 'glass' ? 0.1 : 0.05
  const roughness = config.material === 'glass' ? 0.05 : config.material === 'metal' ? 0.2 : 0.6
  const opacity = config.material === 'glass' ? 0.4 : 1

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
      const drawerH = Math.min(0.25, (h * 0.4) / config.drawers)
      for (let i = 0; i < config.drawers; i++) {
        arr.push(-h / 2 + drawerH / 2 + i * (drawerH + 0.005) + 0.025)
      }
    }
    return arr
  }, [config.drawers, h])

  const isTable = config.type === 'desk'
  const isShelf = config.type === 'shelf'

  return (
    <group>
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

      {config.legs !== 'none' && (
        <LegsModel w={w} h={h} d={d} legType={config.legs} />
      )}
    </group>
  )
}

export default function FurnitureViewer({ config }) {
  return (
    <Canvas shadows gl={{ preserveDrawingBuffer: true, antialias: true }} id="furniture-canvas">
      <Suspense fallback={null}>
        <PerspectiveCamera makeDefault position={[2.5, 1.8, 3]} fov={45} />
        
        {/* Soft, realistic lighting setup */}
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[5, 8, 5]} 
          intensity={1.2} 
          castShadow
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[-5, 4, -5]} intensity={0.4} />
        <pointLight position={[0, 4, 2]} intensity={0.5} color="#818cf8" />

        <FurnitureModel config={config} />

        {/* Dynamic floor shadow */}
        <ContactShadows 
          position={[0, -(config.height / 200 + (config.legs !== 'none' ? 0.08 : 0)), 0]}
          opacity={0.6} scale={10} blur={2.5} far={4} 
        />

        <Environment preset="city" />
        <OrbitControls 
          enablePan enableZoom enableRotate
          minDistance={1} maxDistance={8}
          minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.1} 
        />

        {/* Floor grid */}
        <gridHelper args={[20, 40, '#2a2a4e', '#1a1a2e']} position={[0, -(config.height / 200 + (config.legs !== 'none' ? 0.08 : 0) + 0.001), 0]} />
      </Suspense>
    </Canvas>
  )
}

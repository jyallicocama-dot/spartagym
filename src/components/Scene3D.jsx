import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Environment, MeshDistortMaterial, Sparkles, Stars } from '@react-three/drei'
import { useRef, Suspense, useMemo } from 'react'
import * as THREE from 'three'

const AnimatedSphere = ({ position, color, size = 1, speed = 1 }) => {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed
    }
  })

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[size, 4]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  )
}

const Kettlebell = ({ position }) => {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.8) * 0.15
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={position} scale={0.4}>
      <mesh position={[0, -0.5, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.4, 0.12, 16, 32]} />
        <meshStandardMaterial color="#CD7F32" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

const BarbelPlate = ({ position, size = 1 }) => {
  const meshRef = useRef()

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <cylinderGeometry args={[size * 0.6, size * 0.6, size * 0.15, 32]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.85} roughness={0.15} />
      </mesh>
    </Float>
  )
}

const GoldParticles = () => {
  return (
    <Sparkles
      count={100}
      scale={10}
      size={2}
      speed={0.4}
      color="#D4AF37"
      opacity={0.6}
    />
  )
}

const Dumbbell3D = () => {
  const groupRef = useRef()

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={0.8}>
      <mesh position={[-1.5, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.4, 32]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[-1.2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 32]} />
        <meshStandardMaterial color="#CD7F32" metalness={0.9} roughness={0.1} />
      </mesh>
      
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 2.4, 16]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
      </mesh>
      
      <mesh position={[1.5, 0, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.4, 32]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[1.2, 0, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 0.3, 32]} />
        <meshStandardMaterial color="#CD7F32" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

const SpartanShield = () => {
  const shieldRef = useRef()

  useFrame((state) => {
    if (shieldRef.current) {
      shieldRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2
    }
  })

  return (
    <group ref={shieldRef} position={[3, 0, -2]} scale={1.2}>
      <mesh>
        <cylinderGeometry args={[1, 1, 0.15, 64]} />
        <meshStandardMaterial color="#8B0000" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <cylinderGeometry args={[0.9, 0.9, 0.02, 64]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.3, 0.1]}>
        <coneGeometry args={[0.15, 0.4, 3]} />
        <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}

const FloatingRing = ({ position, size }) => {
  const ringRef = useRef()

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.elapsedTime * 0.5
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <mesh ref={ringRef} position={position}>
      <torusGeometry args={[size, size * 0.1, 16, 100]} />
      <meshStandardMaterial color="#D4AF37" metalness={0.9} roughness={0.1} />
    </mesh>
  )
}

const Scene3D = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={1} color="#D4AF37" />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color="#CD7F32" />
          <spotLight position={[0, 10, 0]} intensity={0.8} color="#fff" angle={0.3} />
          <pointLight position={[5, 5, 5]} intensity={0.3} color="#D4AF37" />
          
          {/* Estrellas de fondo */}
          <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
          
          {/* Partículas doradas flotantes */}
          <GoldParticles />
          
          {/* Elementos principales */}
          <Dumbbell3D />
          <SpartanShield />
          
          {/* Kettlebells */}
          <Kettlebell position={[-3.5, -1, -1]} />
          <Kettlebell position={[3.5, 1, -2]} />
          
          {/* Discos de pesas flotantes */}
          <BarbelPlate position={[-4, 2.5, -3]} size={0.8} />
          <BarbelPlate position={[4.5, -2, -2]} size={0.6} />
          <BarbelPlate position={[0, 3, -4]} size={0.5} />
          
          {/* Esferas animadas */}
          <AnimatedSphere position={[-3, 2, -3]} color="#D4AF37" size={0.4} speed={0.8} />
          <AnimatedSphere position={[4, -2, -4]} color="#CD7F32" size={0.25} speed={1.2} />
          <AnimatedSphere position={[-4, -1.5, -2]} color="#8B0000" size={0.35} speed={1} />
          <AnimatedSphere position={[2.5, 2.5, -5]} color="#D4AF37" size={0.2} speed={1.5} />
          
          {/* Anillos flotantes */}
          <FloatingRing position={[-2, -2, -3]} size={0.5} />
          <FloatingRing position={[2, 2, -4]} size={0.35} />
          <FloatingRing position={[0, -2.5, -2]} size={0.4} />
          
          <Environment preset="city" />
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
            autoRotate
            autoRotateSpeed={0.5}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default Scene3D

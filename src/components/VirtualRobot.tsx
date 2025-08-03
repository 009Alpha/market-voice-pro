import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface RobotProps {
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel?: number;
}

const Robot: React.FC<RobotProps> = ({ isListening, isSpeaking, audioLevel = 0 }) => {
  const robotRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const { mouse, viewport } = useThree();
  
  const [time, setTime] = useState(0);
  const [blinkTimer, setBlinkTimer] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);

  useFrame((state, delta) => {
    if (!robotRef.current) return;
    
    const newTime = time + delta;
    setTime(newTime);

    // Idle floating animation
    robotRef.current.position.y = Math.sin(newTime * 1.5) * 0.1;
    robotRef.current.rotation.y = Math.sin(newTime * 0.5) * 0.05;

    // Head follows mouse cursor
    if (headRef.current) {
      const targetX = (mouse.x * viewport.width) / viewport.distance * 0.01;
      const targetY = (mouse.y * viewport.height) / viewport.distance * 0.01;
      
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        -targetY * 0.3,
        0.05
      );
      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        targetX * 0.3,
        0.05
      );
    }

    // Blinking animation
    const newBlinkTimer = blinkTimer + delta;
    setBlinkTimer(newBlinkTimer);
    
    if (newBlinkTimer > 3 && !isBlinking) {
      setIsBlinking(true);
      setBlinkTimer(0);
    }
    
    if (isBlinking && newBlinkTimer > 0.15) {
      setIsBlinking(false);
      setBlinkTimer(0);
    }

    // Eye animation
    if (leftEyeRef.current && rightEyeRef.current) {
      const eyeScale = isBlinking ? 0.1 : (isListening ? 1.2 : 1.0);
      const eyeIntensity = isListening ? 2 : 1;
      
      leftEyeRef.current.scale.setScalar(eyeScale);
      rightEyeRef.current.scale.setScalar(eyeScale);
      
      // Eye glow effect
      const leftMaterial = leftEyeRef.current.material as THREE.MeshStandardMaterial;
      const rightMaterial = rightEyeRef.current.material as THREE.MeshStandardMaterial;
      if (leftMaterial && rightMaterial) {
        leftMaterial.emissiveIntensity = eyeIntensity;
        rightMaterial.emissiveIntensity = eyeIntensity;
      }
    }

    // Mouth animation for speaking
    if (mouthRef.current) {
      if (isSpeaking) {
        const mouthScale = 0.8 + Math.sin(newTime * 20) * 0.2 * (0.5 + audioLevel);
        mouthRef.current.scale.x = mouthScale;
        mouthRef.current.scale.z = mouthScale;
      } else {
        mouthRef.current.scale.x = THREE.MathUtils.lerp(mouthRef.current.scale.x, 0.8, 0.1);
        mouthRef.current.scale.z = THREE.MathUtils.lerp(mouthRef.current.scale.z, 0.8, 0.1);
      }
    }

  });

  // Materials using useMemo to prevent recreation
  const materials = useMemo(() => ({
    head: new THREE.MeshStandardMaterial({
      color: '#e8e9ea',
      metalness: 0.3,
      roughness: 0.4,
    }),
    eye: new THREE.MeshStandardMaterial({
      color: '#4a90e2',
      emissive: '#4a90e2',
      emissiveIntensity: isListening ? 1.2 : 0.8,
    }),
    mouth: new THREE.MeshStandardMaterial({
      color: '#2d3748',
      emissive: isSpeaking ? '#4a90e2' : '#2d3748',
      emissiveIntensity: isSpeaking ? 0.5 : 0,
    }),
  }), [isListening, isSpeaking]);

  return (
    <group ref={robotRef} position={[0, 0, 0]}>
      {/* Simple Head */}
      <group ref={headRef} position={[0, 0, 0]}>
        <mesh material={materials.head}>
          <sphereGeometry args={[1, 32, 32]} />
        </mesh>
        
        {/* Eyes */}
        <mesh
          ref={leftEyeRef}
          position={[-0.3, 0.2, 0.8]}
          material={materials.eye}
        >
          <sphereGeometry args={[0.15, 16, 16]} />
        </mesh>
        <mesh
          ref={rightEyeRef}
          position={[0.3, 0.2, 0.8]}
          material={materials.eye}
        >
          <sphereGeometry args={[0.15, 16, 16]} />
        </mesh>

        {/* Animated Mouth */}
        <mesh
          ref={mouthRef}
          position={[0, -0.3, 0.85]}
          material={materials.mouth}
        >
          <boxGeometry args={[0.4, 0.15, 0.05]} />
        </mesh>
      </group>
    </group>
  );
};

const Environment: React.FC = () => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#4a90e2" />
      <pointLight position={[5, -5, -5]} intensity={0.3} color="#ff6b6b" />

      {/* Simple background */}
      <mesh position={[0, 0, -10]} scale={[20, 20, 1]}>
        <planeGeometry />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>

      {/* Simple grid floor */}
      <gridHelper args={[20, 20, '#333', '#555']} position={[0, -3, 0]} />
    </>
  );
};

interface VirtualRobotProps {
  isListening: boolean;
  isSpeaking: boolean;
  audioLevel?: number;
}

export const VirtualRobot: React.FC<VirtualRobotProps> = ({
  isListening,
  isSpeaking,
  audioLevel = 0,
}) => {
  return (
    <div className="w-full h-96 rounded-xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Canvas
        shadows
        camera={{ position: [0, 2, 8], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <Environment />
        <Robot
          isListening={isListening}
          isSpeaking={isSpeaking}
          audioLevel={audioLevel}
        />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
          autoRotate={!isListening && !isSpeaking}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};
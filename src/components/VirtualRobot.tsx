import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Cylinder, RoundedBox } from '@react-three/drei';
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
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
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

    // Arm gestures
    if (leftArmRef.current && rightArmRef.current) {
      if (isSpeaking) {
        leftArmRef.current.rotation.z = Math.sin(newTime * 2) * 0.2 - 0.3;
        rightArmRef.current.rotation.z = Math.sin(newTime * 2 + Math.PI) * 0.2 + 0.3;
      } else {
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, -0.1, 0.05);
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0.1, 0.05);
      }
    }
  });

  // Materials
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: '#e0e0e0',
    metalness: 0.8,
    roughness: 0.2,
  });

  const eyeMaterial = new THREE.MeshStandardMaterial({
    color: '#00ffff',
    emissive: '#00ffff',
    emissiveIntensity: 1,
  });

  const mouthMaterial = new THREE.MeshStandardMaterial({
    color: '#0066ff',
    emissive: '#0066ff',
    emissiveIntensity: 0.5,
  });

  return (
    <group ref={robotRef} position={[0, 0, 0]}>
      {/* Body */}
      <RoundedBox
        args={[1.2, 1.8, 0.8]}
        radius={0.1}
        smoothness={4}
        position={[0, 0, 0]}
        material={metalMaterial}
      />

      {/* Head */}
      <group ref={headRef} position={[0, 1.4, 0]}>
        <Sphere
          args={[0.8]}
          material={metalMaterial}
        />
        
        {/* Eyes */}
        <Sphere
          ref={leftEyeRef}
          args={[0.15]}
          position={[-0.25, 0.15, 0.6]}
          material={eyeMaterial}
        />
        <Sphere
          ref={rightEyeRef}
          args={[0.15]}
          position={[0.25, 0.15, 0.6]}
          material={eyeMaterial}
        />

        {/* Mouth */}
        <RoundedBox
          ref={mouthRef}
          args={[0.4, 0.15, 0.1]}
          radius={0.05}
          position={[0, -0.2, 0.65]}
          material={mouthMaterial}
        />

        {/* Head Details */}
        <Cylinder
          args={[0.05, 0.05, 0.3]}
          position={[0, 0.6, 0]}
          material={metalMaterial}
        />
      </group>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.8, 0.6, 0]}>
        <Cylinder
          args={[0.1, 0.1, 1.2]}
          material={metalMaterial}
        />
        <Sphere
          args={[0.15]}
          position={[0, -0.8, 0]}
          material={metalMaterial}
        />
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.8, 0.6, 0]}>
        <Cylinder
          args={[0.1, 0.1, 1.2]}
          material={metalMaterial}
        />
        <Sphere
          args={[0.15]}
          position={[0, -0.8, 0]}
          material={metalMaterial}
        />
      </group>

      {/* Legs */}
      <Cylinder
        args={[0.12, 0.12, 1.0]}
        position={[-0.3, -1.4, 0]}
        material={metalMaterial}
      />
      <Cylinder
        args={[0.12, 0.12, 1.0]}
        position={[0.3, -1.4, 0]}
        material={metalMaterial}
      />

      {/* Feet */}
      <RoundedBox
        args={[0.4, 0.15, 0.6]}
        radius={0.05}
        position={[-0.3, -2.0, 0.1]}
        material={metalMaterial}
      />
      <RoundedBox
        args={[0.4, 0.15, 0.6]}
        radius={0.05}
        position={[0.3, -2.0, 0.1]}
        material={metalMaterial}
      />

      {/* Chest Panel */}
      <RoundedBox
        args={[0.6, 0.4, 0.05]}
        radius={0.02}
        position={[0, 0.3, 0.45]}
        material={new THREE.MeshStandardMaterial({
          color: '#4a90e2',
          emissive: '#4a90e2',
          emissiveIntensity: 0.3,
        })}
      />
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

      {/* Background gradient */}
      <mesh position={[0, 0, -10]} scale={[20, 20, 1]}>
        <planeGeometry />
        <shaderMaterial
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            void main() {
              vec3 color1 = vec3(0.1, 0.1, 0.2);
              vec3 color2 = vec3(0.2, 0.3, 0.5);
              vec3 color = mix(color1, color2, vUv.y);
              gl_FragColor = vec4(color, 1.0);
            }
          `}
        />
      </mesh>

      {/* Grid Floor */}
      <gridHelper args={[20, 20, '#333', '#333']} position={[0, -3, 0]} />
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
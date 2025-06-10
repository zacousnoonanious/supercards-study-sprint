
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FlashcardData {
  front: string;
  back: string;
  color: string;
}

interface FloatingCardsProps {
  flashcards: FlashcardData[];
}

const FloatingCards: React.FC<FloatingCardsProps> = ({ flashcards }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = flashcards.length;

  // Create initial positions and velocities
  const { positions, velocities, rotations, flipStates } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const rotations = new Float32Array(count);
    const flipStates = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Random positions across viewport
      positions[i * 3] = (Math.random() - 0.5) * 20; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 15; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5; // z

      // Random velocities
      velocities[i * 3] = (Math.random() - 0.5) * 0.02; // x velocity
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.015; // y velocity
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01; // z velocity

      // Random initial rotation
      rotations[i] = Math.random() * Math.PI * 2;

      // Random flip timing
      flipStates[i] = Math.random() * 1000;
    }

    return { positions, velocities, rotations, flipStates };
  }, [count]);

  // Animation loop
  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    const matrix = new THREE.Matrix4();

    for (let i = 0; i < count; i++) {
      // Update positions with wraparound
      positions[i * 3] += velocities[i * 3];
      positions[i * 3 + 1] += velocities[i * 3 + 1];
      positions[i * 3 + 2] += velocities[i * 3 + 2];

      // Wraparound logic
      if (positions[i * 3] > 12) positions[i * 3] = -12;
      if (positions[i * 3] < -12) positions[i * 3] = 12;
      if (positions[i * 3 + 1] > 8) positions[i * 3 + 1] = -8;
      if (positions[i * 3 + 1] < -8) positions[i * 3 + 1] = 8;

      // Gentle rotation
      rotations[i] += 0.005;

      // Card flipping
      flipStates[i] += 1;
      const isFlipped = Math.sin(flipStates[i] * 0.001) > 0.8;
      const flipRotation = isFlipped ? Math.PI : 0;

      // Apply transformation matrix
      matrix.makeRotationFromEuler(new THREE.Euler(0, rotations[i] + flipRotation, 0));
      matrix.setPosition(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
      
      meshRef.current.setMatrixAt(i, matrix);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <planeGeometry args={[1.5, 1]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
      />
    </instancedMesh>
  );
};

interface WebGLFlashcardsProps {
  flashcards: FlashcardData[];
}

export const WebGLFlashcards: React.FC<WebGLFlashcardsProps> = ({ flashcards }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        style={{ background: 'transparent' }}
      >
        <FloatingCards flashcards={flashcards} />
      </Canvas>
    </div>
  );
};


import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface Flashcard {
  front: string;
  back: string;
  color: string;
}

interface WebGLFlashcardsProps {
  flashcards: Flashcard[];
}

export const WebGLFlashcards: React.FC<WebGLFlashcardsProps> = ({ flashcards }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const cardsRef = useRef<THREE.Mesh[]>([]);
  const animationIdRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const vortexStateRef = useRef({
    isActive: false,
    transitionStart: 0,
    transitionDuration: 2000,
    lastToggle: 0,
    vortexDuration: 10000 + Math.random() * 5000, // 10-15 seconds
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create flashcards
    const cards: THREE.Mesh[] = [];
    flashcards.forEach((flashcard, index) => {
      // Card geometry
      const geometry = new THREE.PlaneGeometry(0.8, 0.5);
      const material = new THREE.MeshBasicMaterial({
        color: flashcard.color,
        transparent: true,
        opacity: 0, // Start invisible
      });

      const card = new THREE.Mesh(geometry, material);
      
      // Position cards randomly across the screen
      card.position.x = (Math.random() - 0.5) * 8;
      card.position.y = Math.random() * 3 + 5; // Start above screen
      card.position.z = Math.random() * 2 - 1;
      
      // Store initial rotation values
      (card as any).baseRotation = {
        x: Math.random() * 0.3,
        y: Math.random() * 0.3,
        z: (Math.random() - 0.5) * 0.5,
      };

      // Store initial and target positions
      (card as any).targetY = (Math.random() - 0.5) * 4;
      (card as any).fallSpeed = 0.01 + Math.random() * 0.02;
      (card as any).rotationSpeed = {
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.005,
      };
      (card as any).animationDelay = index * 200; // Stagger the animations
      (card as any).hasStartedAnimation = false;

      // Vortex properties
      (card as any).vortexProperties = {
        originalPosition: { x: card.position.x, y: card.position.y, z: card.position.z },
        vortexAngle: Math.random() * Math.PI * 2,
        vortexRadius: Math.sqrt(card.position.x ** 2 + card.position.y ** 2),
        vortexSpeed: 0.02 + Math.random() * 0.03,
        suckSpeed: 0.05 + Math.random() * 0.03,
      };

      scene.add(card);
      cards.push(card);
    });

    cardsRef.current = cards;

    // Mouse tracking
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const currentTime = Date.now();
      const mouseInfluence = 0.3; // How much the mouse affects rotation
      const vortexState = vortexStateRef.current;
      
      // Check if we should toggle vortex state
      if (currentTime - vortexState.lastToggle > vortexState.vortexDuration) {
        vortexState.isActive = !vortexState.isActive;
        vortexState.transitionStart = currentTime;
        vortexState.lastToggle = currentTime;
        vortexState.vortexDuration = 10000 + Math.random() * 5000; // Next duration 10-15s
      }

      // Calculate transition progress (0 to 1)
      const transitionProgress = Math.min(
        (currentTime - vortexState.transitionStart) / vortexState.transitionDuration,
        1
      );
      const easeProgress = vortexState.isActive 
        ? 1 - Math.pow(1 - transitionProgress, 3) // Ease out for sucking in
        : Math.pow(transitionProgress, 3); // Ease in for spitting out
      
      cards.forEach((card) => {
        const material = card.material as THREE.MeshBasicMaterial;
        const cardData = card as any;
        
        // Check if animation should start
        if (!cardData.hasStartedAnimation && currentTime > cardData.animationDelay + 1000) {
          cardData.hasStartedAnimation = true;
        }
        
        if (cardData.hasStartedAnimation) {
          // Fade in the card
          if (material.opacity < 0.8) {
            material.opacity += 0.02;
          }
          
          if (vortexState.isActive || transitionProgress < 1) {
            // Vortex behavior
            const vortexProps = cardData.vortexProperties;
            
            if (vortexState.isActive) {
              // Sucking into vortex
              vortexProps.vortexAngle += vortexProps.vortexSpeed;
              vortexProps.vortexRadius = Math.max(0.1, vortexProps.vortexRadius - vortexProps.suckSpeed);
              
              // Spiral motion towards center
              card.position.x = Math.cos(vortexProps.vortexAngle) * vortexProps.vortexRadius;
              card.position.y = Math.sin(vortexProps.vortexAngle) * vortexProps.vortexRadius;
              card.position.z = -vortexProps.vortexRadius * 0.5; // Move forward as it gets closer
              
              // Increase rotation speed as it gets closer to center
              const rotationMultiplier = 1 + (3 - vortexProps.vortexRadius);
              card.rotation.x += cardData.rotationSpeed.x * rotationMultiplier;
              card.rotation.y += cardData.rotationSpeed.y * rotationMultiplier;
              card.rotation.z += cardData.rotationSpeed.z * rotationMultiplier;
            } else {
              // Spitting out from vortex - reset to floating behavior
              if (transitionProgress < 1) {
                // Interpolate back to original floating position
                const targetX = cardData.targetY !== undefined ? vortexProps.originalPosition.x : (Math.random() - 0.5) * 8;
                const targetY = cardData.targetY !== undefined ? cardData.targetY : (Math.random() - 0.5) * 4;
                const targetZ = vortexProps.originalPosition.z;
                
                card.position.x = THREE.MathUtils.lerp(card.position.x, targetX, easeProgress * 0.02);
                card.position.y = THREE.MathUtils.lerp(card.position.y, targetY, easeProgress * 0.02);
                card.position.z = THREE.MathUtils.lerp(card.position.z, targetZ, easeProgress * 0.02);
                
                // Reset vortex radius for next time
                vortexProps.vortexRadius = Math.sqrt(targetX ** 2 + targetY ** 2);
              }
            }
          } else {
            // Normal floating behavior
            // Animate down to target position
            if (card.position.y > cardData.targetY) {
              card.position.y -= cardData.fallSpeed;
            }
            
            // Apply rotation based on mouse position and base rotation
            const mouseRotationX = mouseRef.current.y * mouseInfluence;
            const mouseRotationY = mouseRef.current.x * mouseInfluence;
            
            card.rotation.x = cardData.baseRotation.x + mouseRotationX + Math.sin(currentTime * cardData.rotationSpeed.x) * 0.1;
            card.rotation.y = cardData.baseRotation.y + mouseRotationY + Math.sin(currentTime * cardData.rotationSpeed.y) * 0.1;
            card.rotation.z = cardData.baseRotation.z + Math.sin(currentTime * cardData.rotationSpeed.z) * 0.1;
            
            // Gentle floating motion
            card.position.x += Math.sin(currentTime * 0.001 + card.position.z) * 0.001;
          }
        }
      });

      renderer.render(scene, camera);
    };

    // Start animation after a short delay
    setTimeout(() => {
      setIsLoaded(true);
      animate();
    }, 500);

    // Handle resize
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js objects
      cards.forEach(card => {
        if (card.geometry) card.geometry.dispose();
        if (card.material) {
          if (Array.isArray(card.material)) {
            card.material.forEach(mat => mat.dispose());
          } else {
            card.material.dispose();
          }
        }
      });
      
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [flashcards]);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: isLoaded ? 1 : 0, transition: 'opacity 0.5s ease-in-out' }}
    />
  );
};

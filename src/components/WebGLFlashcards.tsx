
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
      
      // Random rotation
      card.rotation.x = Math.random() * 0.3;
      card.rotation.y = Math.random() * 0.3;
      card.rotation.z = (Math.random() - 0.5) * 0.5;

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

      scene.add(card);
      cards.push(card);
    });

    cardsRef.current = cards;

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const currentTime = Date.now();
      
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
          
          // Animate down to target position
          if (card.position.y > cardData.targetY) {
            card.position.y -= cardData.fallSpeed;
          }
          
          // Apply gentle rotation
          card.rotation.x += cardData.rotationSpeed.x;
          card.rotation.y += cardData.rotationSpeed.y;
          card.rotation.z += cardData.rotationSpeed.z;
          
          // Gentle floating motion
          card.position.x += Math.sin(currentTime * 0.001 + card.position.z) * 0.001;
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

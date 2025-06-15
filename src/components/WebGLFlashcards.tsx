
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Expanded flashcard data with more interesting facts
  const expandedFlashcards = [
    ...flashcards,
    { front: "Largest Desert", back: "Antarctica", color: "#06b6d4" },
    { front: "Deepest Ocean Trench", back: "Mariana Trench", color: "#1e40af" },
    { front: "Fastest Land Animal", back: "Cheetah", color: "#f59e0b" },
    { front: "Smallest Country", back: "Vatican City", color: "#7c3aed" },
    { front: "Longest River", back: "Nile River", color: "#059669" },
    { front: "Highest Mountain", back: "Mount Everest", color: "#dc2626" },
    { front: "Most Spoken Language", back: "Mandarin Chinese", color: "#ea580c" },
    { front: "Largest Mammal", back: "Blue Whale", color: "#2563eb" },
    { front: "Hardest Natural Substance", back: "Diamond", color: "#6b7280" },
    { front: "Human Heart Chambers", back: "Four", color: "#ef4444" },
    { front: "Boiling Point of Water", back: "100°C / 212°F", color: "#0891b2" },
    { front: "DNA Structure", back: "Double Helix", color: "#16a34a" },
    { front: "Speed of Sound", back: "343 m/s", color: "#9333ea" },
    { front: "Earth's Layers", back: "Crust, Mantle, Core", color: "#ca8a04" },
    { front: "Galaxy We Live In", back: "Milky Way", color: "#4338ca" },
    { front: "Number of Bones (Adult)", back: "206", color: "#dc2626" },
    { front: "Closest Star to Earth", back: "Sun", color: "#f59e0b" },
    { front: "Chemical Symbol H₂SO₄", back: "Sulfuric Acid", color: "#059669" },
    { front: "First Element (Periodic)", back: "Hydrogen", color: "#0891b2" },
    { front: "Pi (π) Value", back: "3.14159...", color: "#7c3aed" },
    { front: "Roman Numeral L", back: "50", color: "#dc2626" },
    { front: "Capital of Australia", back: "Canberra", color: "#16a34a" },
    { front: "Shakespeare's Hamlet Quote", back: "To be or not to be", color: "#9333ea" },
    { front: "E=mc² Scientist", back: "Albert Einstein", color: "#ea580c" },
    { front: "Human Genome Pairs", back: "23 Chromosome Pairs", color: "#2563eb" },
  ];

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
    camera.position.z = 8;
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create flashcards
    const cards: THREE.Mesh[] = [];
    expandedFlashcards.forEach((flashcard, index) => {
      // Card geometry - slightly larger for better visibility
      const geometry = new THREE.PlaneGeometry(1.2, 0.8);
      const material = new THREE.MeshBasicMaterial({
        color: flashcard.color,
        transparent: true,
        opacity: 0, // Start invisible
        side: THREE.DoubleSide,
      });

      const card = new THREE.Mesh(geometry, material);
      
      // Orbital properties around center (login dialog)
      const orbitRadius = 3 + Math.random() * 5; // Varying distances from center
      const orbitAngle = (index / expandedFlashcards.length) * Math.PI * 2; // Evenly distribute around circle
      const orbitHeight = (Math.random() - 0.5) * 4; // Vertical variation
      
      // Position cards in orbit around center
      card.position.x = Math.cos(orbitAngle) * orbitRadius;
      card.position.y = Math.sin(orbitAngle) * orbitRadius + orbitHeight;
      card.position.z = (Math.random() - 0.5) * 6; // 3D depth variation
      
      // Store orbital properties
      (card as any).orbitProperties = {
        radius: orbitRadius,
        angle: orbitAngle,
        height: orbitHeight,
        speed: 0.3 + Math.random() * 0.4, // Varying orbital speeds
        originalRadius: orbitRadius,
      };

      // Store card data for flipping
      (card as any).cardData = flashcard;
      (card as any).isFlipped = false;
      (card as any).flipCooldown = 0;
      (card as any).nextFlipTime = Math.random() * 10000 + 5000; // Random flip timing

      // Animation properties
      (card as any).animationDelay = index * 100;
      (card as any).hasStartedAnimation = false;
      (card as any).rotationSpeed = {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01,
      };

      scene.add(card);
      cards.push(card);
    });

    cardsRef.current = cards;

    // Mouse tracking
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      const currentTime = Date.now();
      const mouseInfluence = 0.2;
      
      cards.forEach((card) => {
        const material = card.material as THREE.MeshBasicMaterial;
        const cardData = card as any;
        
        // Check if animation should start
        if (!cardData.hasStartedAnimation && currentTime > cardData.animationDelay + 1000) {
          cardData.hasStartedAnimation = true;
        }
        
        if (cardData.hasStartedAnimation) {
          // Fade in the card
          if (material.opacity < 0.9) {
            material.opacity += 0.015;
          }
          
          // Orbital motion around center point
          const orbitProps = cardData.orbitProperties;
          orbitProps.angle += orbitProps.speed * 0.005; // Slow orbital rotation
          
          // Calculate new position
          card.position.x = Math.cos(orbitProps.angle) * orbitProps.radius;
          card.position.y = Math.sin(orbitProps.angle) * orbitProps.radius + orbitProps.height;
          
          // Add mouse influence to orbital motion
          const mouseDistanceX = mouseRef.current.x * 2;
          const mouseDistanceY = mouseRef.current.y * 2;
          card.position.x += mouseDistanceX * mouseInfluence;
          card.position.y += mouseDistanceY * mouseInfluence;
          
          // Calculate distance from center for blur effect
          const distanceFromCenter = Math.sqrt(
            card.position.x ** 2 + 
            card.position.y ** 2 + 
            card.position.z ** 2
          );
          
          // Apply blur effect based on distance (opacity reduction simulates blur)
          const maxDistance = 8;
          const blurFactor = Math.min(distanceFromCenter / maxDistance, 1);
          const baseOpacity = 0.9;
          material.opacity = baseOpacity * (1 - blurFactor * 0.6);
          
          // 3D rotation based on orbital position and mouse
          card.rotation.x = cardData.rotationSpeed.x * currentTime + mouseRef.current.y * mouseInfluence;
          card.rotation.y = cardData.rotationSpeed.y * currentTime + mouseRef.current.x * mouseInfluence;
          card.rotation.z = cardData.rotationSpeed.z * currentTime + orbitProps.angle * 0.1;
          
          // Card flipping logic
          cardData.flipCooldown -= 16; // Assuming ~60fps
          if (cardData.flipCooldown <= 0 && currentTime > cardData.nextFlipTime) {
            cardData.isFlipped = !cardData.isFlipped;
            cardData.flipCooldown = 3000; // 3 second cooldown
            cardData.nextFlipTime = currentTime + Math.random() * 8000 + 7000; // Next flip in 7-15 seconds
            
            // Visual indication of flip (rotate 180 degrees on Y-axis)
            card.rotation.y += Math.PI;
            
            // In a real implementation, you might change the texture/material here
            // For now, we'll just add a subtle color shift
            if (cardData.isFlipped) {
              material.color.multiplyScalar(0.8); // Darker when showing back
            } else {
              material.color.setHex(cardData.cardData.color); // Reset to original color
            }
          }
          
          // Gentle floating motion
          card.position.z += Math.sin(currentTime * 0.001 + orbitProps.angle) * 0.002;
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

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
  const particlesRef = useRef<THREE.Points[]>([]);
  const animationIdRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  // Rainbow colors for the flashcards
  const rainbowColors = [
    "#ff0000", "#ff4500", "#ffa500", "#ffff00", "#9acd32", "#00ff00",
    "#00fa9a", "#00ffff", "#1e90ff", "#0000ff", "#8a2be2", "#9400d3",
    "#ff1493", "#ff69b4", "#ff6347", "#ff8c00", "#32cd32", "#00ced1",
    "#4169e1", "#9932cc", "#ff7f50", "#7fff00", "#00bfff", "#da70d6"
  ];

  // Expanded flashcard data with more interesting facts and rainbow colors
  const expandedFlashcards = [
    ...flashcards,
    { front: "Largest Desert", back: "Antarctica", color: rainbowColors[0] },
    { front: "Deepest Ocean Trench", back: "Mariana Trench", color: rainbowColors[1] },
    { front: "Fastest Land Animal", back: "Cheetah", color: rainbowColors[2] },
    { front: "Smallest Country", back: "Vatican City", color: rainbowColors[3] },
    { front: "Longest River", back: "Nile River", color: rainbowColors[4] },
    { front: "Highest Mountain", back: "Mount Everest", color: rainbowColors[5] },
    { front: "Most Spoken Language", back: "Mandarin Chinese", color: rainbowColors[6] },
    { front: "Largest Mammal", back: "Blue Whale", color: rainbowColors[7] },
    { front: "Hardest Natural Substance", back: "Diamond", color: rainbowColors[8] },
    { front: "Human Heart Chambers", back: "Four", color: rainbowColors[9] },
    { front: "Boiling Point of Water", back: "100°C / 212°F", color: rainbowColors[10] },
    { front: "DNA Structure", back: "Double Helix", color: rainbowColors[11] },
    { front: "Speed of Sound", back: "343 m/s", color: rainbowColors[12] },
    { front: "Earth's Layers", back: "Crust, Mantle, Core", color: rainbowColors[13] },
    { front: "Galaxy We Live In", back: "Milky Way", color: rainbowColors[14] },
    { front: "Number of Bones (Adult)", back: "206", color: rainbowColors[15] },
    { front: "Closest Star to Earth", back: "Sun", color: rainbowColors[16] },
    { front: "Chemical Symbol H₂SO₄", back: "Sulfuric Acid", color: rainbowColors[17] },
    { front: "First Element (Periodic)", back: "Hydrogen", color: rainbowColors[18] },
    { front: "Pi (π) Value", back: "3.14159...", color: rainbowColors[19] },
    { front: "Roman Numeral L", back: "50", color: rainbowColors[20] },
    { front: "Capital of Australia", back: "Canberra", color: rainbowColors[21] },
    { front: "Shakespeare's Hamlet Quote", back: "To be or not to be", color: rainbowColors[22] },
    { front: "E=mc² Scientist", back: "Albert Einstein", color: rainbowColors[23] },
    { front: "Human Genome Pairs", back: "~23 Chromosome Pairs", color: rainbowColors[0] },
    { front: "Photosynthesis Formula", back: "6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂", color: rainbowColors[1] },
    { front: "Gravity on Moon", back: "1.62 m/s²", color: rainbowColors[2] },
    { front: "Largest Continent", back: "Asia", color: rainbowColors[3] },
    { front: "Smallest Bone in Body", back: "Stapes (in ear)", color: rainbowColors[4] },
    { front: "Number of Planets", back: "8", color: rainbowColors[5] },
    { front: "Richter Scale Measures", back: "Earthquake Magnitude", color: rainbowColors[6] },
    { front: "Periodic Table Elements", back: "118", color: rainbowColors[7] },
    { front: "Light Year Distance", back: "9.46 trillion km", color: rainbowColors[8] },
    { front: "Human Brain Neurons", back: "~86 billion", color: rainbowColors[9] },
    { front: "Ocean Coverage of Earth", back: "71%", color: rainbowColors[10] },
    { front: "Speed of Earth's Rotation", back: "1,670 km/h", color: rainbowColors[11] },
    { front: "Coldest Temperature", back: "Absolute Zero (-273.15°C)", color: rainbowColors[12] },
    { front: "Most Abundant Gas", back: "Nitrogen (78%)", color: rainbowColors[13] },
    { front: "Human DNA Similarity", back: "99.9% identical", color: rainbowColors[14] },
    { front: "Age of Universe", back: "13.8 billion years", color: rainbowColors[15] },
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

    // Renderer setup with shadows
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Enhanced lighting setup for cardboard effect
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.5, 50);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Create flashcards
    const cards: THREE.Mesh[] = [];
    const particles: THREE.Points[] = [];
    
    expandedFlashcards.forEach((flashcard, index) => {
      // Enhanced card geometry with thickness for 3D effect
      const geometry = new THREE.BoxGeometry(1.2, 0.8, 0.05);
      
      // Add roughness texture simulation for cardboard effect
      const grayscaleValues = [128, 140, 120, 135]; // 4 values for a 2x2 texture
      const data = new Uint8Array(4 * 4);
      for (let i = 0; i < grayscaleValues.length; i++) {
        const v = grayscaleValues[i];
        data[i * 4 + 0] = v; // R
        data[i * 4 + 1] = v; // G
        data[i * 4 + 2] = v; // B
        data[i * 4 + 3] = 255; // A
      }
      const roughnessMap = new THREE.DataTexture(data, 2, 2, THREE.RGBAFormat);
      roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
      roughnessMap.repeat.set(4, 4);
      roughnessMap.needsUpdate = true;
      
      // Create cardboard-like material with enhanced properties
      const material = new THREE.MeshStandardMaterial({
        color: flashcard.color,
        side: THREE.DoubleSide,
        roughness: 1,
        roughnessMap: roughnessMap,
      });

      const card = new THREE.Mesh(geometry, material);
      
      // Orbital properties around center (login dialog)
      const orbitRadius = 3 + Math.random() * 5;
      const orbitAngle = (index / expandedFlashcards.length) * Math.PI * 2;
      const orbitHeight = (Math.random() - 0.5) * 4;
      
      card.position.x = Math.cos(orbitAngle) * orbitRadius;
      card.position.y = Math.sin(orbitAngle) * orbitRadius + orbitHeight;
      card.position.z = (Math.random() - 0.5) * 6;
      
      // Enable shadows
      card.castShadow = true;
      card.receiveShadow = true;
      
      // Store orbital properties
      (card as any).orbitProperties = {
        radius: orbitRadius,
        angle: orbitAngle,
        height: orbitHeight,
        speed: 0.1 + Math.random() * 0.15,
        originalRadius: orbitRadius,
      };

      // Store card data for flipping
      (card as any).cardData = flashcard;
      (card as any).isFlipped = false;
      (card as any).flipCooldown = 0;
      (card as any).nextFlipTime = Math.random() * 20000 + 15000;

      // Animation properties
      (card as any).animationDelay = index * 100;
      (card as any).hasStartedAnimation = false;
      (card as any).rotationSpeed = {
        x: (Math.random() - 0.5) * 0.003,
        y: (Math.random() - 0.5) * 0.003,
        z: (Math.random() - 0.5) * 0.003,
      };

      scene.add(card);
      cards.push(card);

      // Enhanced particle system that emits from all sides
      const particleGeometry = new THREE.BufferGeometry();
      const particleCount = 20; // More particles for better effect
      const positions = new Float32Array(particleCount * 3);
      const velocities = new Float32Array(particleCount * 3);
      const ages = new Float32Array(particleCount);
      
      // Initialize particles around the card perimeter
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Start particles at the edges of the card
        const side = Math.floor(Math.random() * 4); // 4 sides
        switch (side) {
          case 0: // Top edge
            positions[i3] = (Math.random() - 0.5) * 1.2;
            positions[i3 + 1] = 0.4;
            break;
          case 1: // Right edge
            positions[i3] = 0.6;
            positions[i3 + 1] = (Math.random() - 0.5) * 0.8;
            break;
          case 2: // Bottom edge
            positions[i3] = (Math.random() - 0.5) * 1.2;
            positions[i3 + 1] = -0.4;
            break;
          case 3: // Left edge
            positions[i3] = -0.6;
            positions[i3 + 1] = (Math.random() - 0.5) * 0.8;
            break;
        }
        positions[i3 + 2] = (Math.random() - 0.5) * 0.1;
        
        // Set initial velocities radiating outward
        velocities[i3] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.01;
        
        ages[i] = Math.random() * 100;
      }
      
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      (particleGeometry as any).velocities = velocities;
      (particleGeometry as any).ages = ages;
      
      const particleMaterial = new THREE.PointsMaterial({
        color: flashcard.color,
        size: 0.03,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      
      const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
      particleSystem.position.copy(card.position);
      
      // Store reference to parent card
      (particleSystem as any).parentCard = card;
      
      scene.add(particleSystem);
      particles.push(particleSystem);
    });

    cardsRef.current = cards;
    particlesRef.current = particles;

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
      const mouseInfluence = 0.1;
      
      cards.forEach((card, index) => {
        const material = card.material as THREE.MeshStandardMaterial;
        const cardData = card as any;
        const particleSystem = particles[index];
        
        // Check if animation should start
        if (!cardData.hasStartedAnimation && currentTime > cardData.animationDelay + 1000) {
          cardData.hasStartedAnimation = true;
        }
        
        if (cardData.hasStartedAnimation) {
          // Cards are always fully visible (no opacity fade)
          
          // Orbital motion around center point - much more subtle
          const orbitProps = cardData.orbitProperties;
          orbitProps.angle += orbitProps.speed * 0.002;
          
          // Calculate new position
          card.position.x = Math.cos(orbitProps.angle) * orbitProps.radius;
          card.position.y = Math.sin(orbitProps.angle) * orbitProps.radius + orbitProps.height;
          
          // Add very subtle mouse influence
          const mouseDistanceX = mouseRef.current.x * 1;
          const mouseDistanceY = mouseRef.current.y * 1;
          card.position.x += mouseDistanceX * mouseInfluence;
          card.position.y += mouseDistanceY * mouseInfluence;
          
          // Calculate distance from center for blur effect
          const distanceFromCenter = Math.sqrt(
            card.position.x ** 2 + 
            card.position.y ** 2 + 
            card.position.z ** 2
          );
          
          // Apply subtle brightness variation based on distance instead of opacity
          const maxDistance = 8;
          const distanceFactor = Math.min(distanceFromCenter / maxDistance, 1);
          const brightness = 1 - distanceFactor * 0.3; // Subtle darkening instead of transparency
          material.color.setHex(parseInt(cardData.cardData.color.slice(1), 16));
          material.color.multiplyScalar(brightness);
          
          // Much more subtle 3D rotation
          card.rotation.x = cardData.rotationSpeed.x * currentTime + mouseRef.current.y * mouseInfluence * 0.5;
          card.rotation.y = cardData.rotationSpeed.y * currentTime + mouseRef.current.x * mouseInfluence * 0.5;
          card.rotation.z = cardData.rotationSpeed.z * currentTime + orbitProps.angle * 0.05;
          
          // Card flipping logic - much slower
          cardData.flipCooldown -= 16;
          if (cardData.flipCooldown <= 0 && currentTime > cardData.nextFlipTime) {
            cardData.isFlipped = !cardData.isFlipped;
            cardData.flipCooldown = 8000;
            cardData.nextFlipTime = currentTime + Math.random() * 15000 + 20000;
            
            // Visual indication of flip
            card.rotation.y += Math.PI;
            
            // Subtle color shift for flip indication
            if (cardData.isFlipped) {
              material.color.multiplyScalar(0.9);
            } else {
              material.color.setHex(parseInt(cardData.cardData.color.slice(1), 16));
            }
          }
          
          // Very gentle floating motion
          card.position.z += Math.sin(currentTime * 0.0005 + orbitProps.angle) * 0.001;
          
          // Update particle system - particles move independently
          if (particleSystem) {
            // Keep particle system near the card but not exactly on it
            particleSystem.position.copy(card.position);
            
            // Animate particles to emit from all sides
            const positions = particleSystem.geometry.attributes.position.array as Float32Array;
            const velocities = (particleSystem.geometry as any).velocities;
            const ages = (particleSystem.geometry as any).ages;
            
            for (let i = 0; i < positions.length; i += 3) {
              // Age the particles
              ages[i / 3] += 1;
              
              // Move particles based on velocity
              positions[i] += velocities[i];
              positions[i + 1] += velocities[i + 1];
              positions[i + 2] += velocities[i + 2];
              
              // Reset particles that are too old or too far
              if (ages[i / 3] > 100 || Math.abs(positions[i]) > 1 || Math.abs(positions[i + 1]) > 1) {
                // Respawn at a random edge
                const side = Math.floor(Math.random() * 4);
                switch (side) {
                  case 0: // Top
                    positions[i] = (Math.random() - 0.5) * 1.2;
                    positions[i + 1] = 0.4;
                    break;
                  case 1: // Right
                    positions[i] = 0.6;
                    positions[i + 1] = (Math.random() - 0.5) * 0.8;
                    break;
                  case 2: // Bottom
                    positions[i] = (Math.random() - 0.5) * 1.2;
                    positions[i + 1] = -0.4;
                    break;
                  case 3: // Left
                    positions[i] = -0.6;
                    positions[i + 1] = (Math.random() - 0.5) * 0.8;
                    break;
                }
                positions[i + 2] = (Math.random() - 0.5) * 0.1;
                
                // New random velocity radiating outward
                velocities[i] = (Math.random() - 0.5) * 0.02;
                velocities[i + 1] = (Math.random() - 0.5) * 0.02;
                velocities[i + 2] = (Math.random() - 0.5) * 0.01;
                
                ages[i / 3] = 0;
              }
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;
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
      
      particles.forEach(particle => {
        if (particle.geometry) particle.geometry.dispose();
        if (particle.material) {
          if (Array.isArray(particle.material)) {
            particle.material.forEach(mat => mat.dispose());
          } else {
            particle.material.dispose();
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

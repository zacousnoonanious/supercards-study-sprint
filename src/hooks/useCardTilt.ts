
import { useEffect, RefObject } from 'react';

export const useCardTilt = (cardRef: RefObject<HTMLDivElement>, containerRef: RefObject<HTMLDivElement>) => {
  useEffect(() => {
    const card = cardRef.current;
    const container = containerRef.current;
    if (!card || !container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = container.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;

      const normalizedX = (x / width) * 2 - 1;
      const normalizedY = (y / height) * 2 - 1;

      const rotateX = -normalizedY * 10;
      const rotateY = normalizedX * 10;

      requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
      });
    };

    const handleMouseLeave = () => {
      requestAnimationFrame(() => {
        if (card) {
          card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        }
      });
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [cardRef, containerRef]);
};

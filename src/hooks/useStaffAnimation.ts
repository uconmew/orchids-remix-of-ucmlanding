import { useState, useEffect } from 'react';

type AnimationPhase = 'idle' | 'stacking' | 'spreading' | 'pulsing';

export function useStaffAnimation(
  staffVisible: boolean,
  isMobile: boolean,
  mobileReady: boolean
) {
  const [staffAnimationPhase, setStaffAnimationPhase] = useState<AnimationPhase>('idle');
  const [startStaffAnimation, setStartStaffAnimation] = useState(false);
  const [releasedCards, setReleasedCards] = useState<Set<number>>(new Set());
  const [pulsingCard, setPulsingCard] = useState<number | null>(null);
  const [allCardsPulsing, setAllCardsPulsing] = useState(false);

  useEffect(() => {
    if (staffVisible && !startStaffAnimation && mobileReady) {
      setStartStaffAnimation(true);

      if (isMobile) {
        setStaffAnimationPhase('pulsing');
        setReleasedCards(new Set([0, 1, 2, 3, 4, 5]));
        return;
      }

      setStaffAnimationPhase('stacking');

      setTimeout(() => {
        setStaffAnimationPhase('spreading');
        const cornerOrder = [0, 2, 3, 5, 1, 4];

        cornerOrder.forEach((cardIndex, orderIndex) => {
          setTimeout(() => {
            setReleasedCards((prev) => new Set([...prev, cardIndex]));
            setPulsingCard(cardIndex);
            setTimeout(() => {
              setPulsingCard(null);
            }, 600);
          }, orderIndex * 300);
        });

        setTimeout(() => {
          setAllCardsPulsing(true);
          setTimeout(() => {
            setAllCardsPulsing(false);
          }, 1000);
        }, cornerOrder.length * 300 + 600);
      }, 12000);
    }
  }, [staffVisible, startStaffAnimation, isMobile, mobileReady]);

  return {
    staffAnimationPhase,
    releasedCards,
    pulsingCard,
    allCardsPulsing
  };
}

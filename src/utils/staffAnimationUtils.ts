type AnimationPhase = 'idle' | 'stacking' | 'spreading' | 'pulsing';

interface CardPosition {
  x: number;
  y: number;
  rotate: number;
  opacity: number;
}

export function getCardPosition(
  index: number,
  phase: AnimationPhase,
  releasedCards: Set<number>
): CardPosition {
  if (phase === 'idle') {
    const isEven = index % 2 === 0;
    return {
      x: isEven ? -800 : 800,
      y: 0,
      rotate: 0,
      opacity: 0
    };
  }

  if (phase === 'stacking') {
    return { x: 0, y: 0, rotate: 0, opacity: 1 };
  }

  if (phase === 'spreading' || phase === 'pulsing') {
    if (releasedCards.has(index)) {
      const row = Math.floor(index / 3);
      const col = index % 3;

      let horizontalSpread = 400;
      if (typeof window !== 'undefined') {
        const width = window.innerWidth;
        if (width >= 1280) {
          horizontalSpread = 420;
        } else if (width >= 1024) {
          horizontalSpread = 400;
        } else if (width >= 768) {
          horizontalSpread = 380;
        }
      }

      const verticalSpread = 650;
      const colOffset = (col - 1) * horizontalSpread;
      const rowOffset = (row - 0.5) * verticalSpread;

      return { x: colOffset, y: rowOffset, rotate: 0, opacity: 1 };
    }
    
    return { x: 0, y: 0, rotate: 0, opacity: 1 };
  }

  return { x: 0, y: 0, rotate: 0, opacity: 1 };
}

export function getCardDelay(index: number, phase: AnimationPhase): number {
  if (phase === 'stacking') {
    return index * 2;
  }
  return 0;
}

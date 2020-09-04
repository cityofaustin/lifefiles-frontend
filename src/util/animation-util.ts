export const ANIMATION_TIMEOUT = 50;
export const animateIn = (ref) => {
  // change happens so quick react merges it preventing animation
  // https://muffinman.io/react-rerender-in-component-did-mount/
  setTimeout(() => {
    ref.style.transform = 'translateX(0)';
    ref.style.opacity = '1';
  }, ANIMATION_TIMEOUT);
};
export const getSectionClassName = (position) => {
  let positionClass = 'section-center';
  if (position === 'right') {
    positionClass = 'section-right';
  } else if (position === 'left') {
    positionClass = 'section-left';
  }
  return `section ${positionClass}`;
};

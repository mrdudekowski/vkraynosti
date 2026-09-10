const PATH_TOP_BOTTOM =
  'M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22';
const PATH_MID = 'M7 16 27 16';

interface AnimatedHamburgerIconProps {
  className?: string;
}

const AnimatedHamburgerIcon = ({ className }: AnimatedHamburgerIconProps) => (
  <svg
    viewBox="0 0 32 32"
    className={['hamburger-icon-svg h-6 w-6 block shrink-0', className].filter(Boolean).join(' ')}
    aria-hidden={true}
  >
    <path d={PATH_TOP_BOTTOM} className="hamburger-line hamburger-line-top-bottom" />
    <path d={PATH_MID} className="hamburger-line hamburger-line-mid" />
  </svg>
);

export default AnimatedHamburgerIcon;

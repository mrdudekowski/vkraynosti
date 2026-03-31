import { MAX_MESSENGER_SIGN_LOGO } from '../../constants/images';

type MaxMessengerIconProps = {
  className?: string;
};

/**
 * Официальный знак MAX из `MAX_MESSENGER_SIGN_LOGO` (растр в SVG); цвет задаётся самим файлом.
 */
const MaxMessengerIcon = ({ className }: MaxMessengerIconProps) => (
  <img
    src={MAX_MESSENGER_SIGN_LOGO}
    alt=""
    className={className}
    width={24}
    height={24}
    decoding="async"
    loading="lazy"
    draggable={false}
    aria-hidden
  />
);

export default MaxMessengerIcon;

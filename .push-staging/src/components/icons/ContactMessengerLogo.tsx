import {
  MAX_MESSENGER_SIGN_LOGO,
  PHONE_ALT_LOGO,
  TELEGRAM_LOGO,
  WHATSAPP_LOGO,
} from '../../constants/images';

export type ContactMessengerLogoVariant = 'phone' | 'telegram' | 'whatsapp' | 'max';

const CONTACT_MESSENGER_LOGO_SRC: Record<ContactMessengerLogoVariant, string> = {
  phone: PHONE_ALT_LOGO,
  telegram: TELEGRAM_LOGO,
  whatsapp: WHATSAPP_LOGO,
  max: MAX_MESSENGER_SIGN_LOGO,
};

type ContactMessengerLogoProps = {
  variant: ContactMessengerLogoVariant;
  className?: string;
};

const ContactMessengerLogo = ({ variant, className }: ContactMessengerLogoProps) => (
  <img
    src={CONTACT_MESSENGER_LOGO_SRC[variant]}
    alt=""
    className={className}
    decoding="async"
    loading="lazy"
    draggable={false}
    aria-hidden
  />
);

export default ContactMessengerLogo;

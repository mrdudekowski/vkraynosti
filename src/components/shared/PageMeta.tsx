import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '../../constants/contacts';

interface PageMetaProps {
  title: string;
  description: string;
  imageUrl?: string;
  path: string;
}

const PageMeta = ({ title, description, imageUrl, path }: PageMetaProps) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={`${SITE_URL}${path}`} />
    <meta property="og:locale" content="ru_RU" />
    {imageUrl && <meta property="og:image" content={imageUrl} />}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {imageUrl && <meta name="twitter:image" content={imageUrl} />}
  </Helmet>
);

export default PageMeta;

import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://highman.vercel.app', lastModified: new Date() },
    { url: 'https://highman.vercel.app/login', lastModified: new Date() },
    { url: 'https://highman.vercel.app/register', lastModified: new Date() },
  ];
}

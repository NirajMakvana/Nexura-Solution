import { Helmet } from 'react-helmet-async'
import { useEffect } from 'react'

const SEO = ({
  title = "Nexura Solutions - IT Services & Digital Solutions",
  description = "Professional IT services including UI/UX design, full stack development, graphics design, and digital solutions to help your business grow.",
  keywords = "IT services, web development, UI/UX design, graphics design, digital solutions, Nexura Solutions",
  image = "/nexura-favicon.svg",
  url = "https://nexurasolutions.com"
}) => {
  const fullTitle = title.includes('Nexura Solutions') ? title : `${title} | Nexura Solutions`

  // Dynamic Browser Tab feature
  useEffect(() => {
    let originalTitle = document.title;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        originalTitle = document.title;
        document.title = "Come back! We miss you 🚀"
      } else {
        document.title = originalTitle
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Nexura Solutions" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Nexura Solutions" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="theme-color" content="#3b82f6" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/nexura-favicon.svg" />
    </Helmet>
  )
}

export default SEO
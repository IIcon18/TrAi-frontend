import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
    title: string;
    description: string;
    canonical?: string;
    noIndex?: boolean;
    ogTitle?: string;
    ogDescription?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
    title,
    description,
    canonical,
    noIndex = false,
    ogTitle,
    ogDescription,
}) => {
    const pageUrl = canonical || (typeof window !== 'undefined' ? window.location.href : '');

    return (
        <Helmet>
            <title>{title} | TrAi</title>
            <meta name="description" content={description} />
            {canonical && <link rel="canonical" href={pageUrl} />}
            {noIndex && <meta name="robots" content="noindex,nofollow" />}
            <meta property="og:title" content={ogTitle || title} />
            <meta property="og:description" content={ogDescription || description} />
            <meta property="og:type" content="website" />
            {canonical && <meta property="og:url" content={pageUrl} />}
        </Helmet>
    );
};

export default SEOHead;

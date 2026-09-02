import React from "react";

export interface WebsiteJsonLdProps {
  type: "website";
  url: string;
  name: string;
  description?: string;
}

export interface StoreJsonLdProps {
  type: "store";
  url: string;
  name: string;
  logo?: string;
  description?: string;
}

export interface ProductJsonLdProps {
  type: "product";
  name: string;
  description?: string;
  image?: string[];
  price?: number;
  currency?: string;
  sku?: string;
  brand?: string;
  inStock?: boolean;
  url?: string;
}

export type JsonLdProps = WebsiteJsonLdProps | StoreJsonLdProps | ProductJsonLdProps;

export default function JsonLd(props: JsonLdProps) {
  let schemaData: Record<string, any> = {};

  if (props.type === "website") {
    schemaData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: props.name,
      url: props.url,
      description: props.description,
    };
  } else if (props.type === "store") {
    schemaData = {
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      name: props.name,
      url: props.url,
      logo: props.logo,
      description: props.description,
    };
  } else if (props.type === "product") {
    schemaData = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: props.name,
      description: props.description,
      image: props.image,
      sku: props.sku,
      brand: props.brand ? { "@type": "Brand", name: props.brand } : undefined,
      offers: props.price
        ? {
            "@type": "Offer",
            priceCurrency: props.currency || "PKR",
            price: props.price,
            availability: props.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: props.url,
          }
        : undefined,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}

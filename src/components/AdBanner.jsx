import React, { useEffect, useState } from "react";

const AdBanner = () => {
  const [adUrl, setAdUrl] = useState(null);

  useEffect(() => {
    const fetchAd = async () => {
      const payload = {
        page_url: window.location.href,
        referrer: document.referrer,
        country: window.__retarglow_geo?.country || null,
        region: window.__retarglow_geo?.region || null,
        city: window.__retarglow_geo?.city || null,
        custom_metadata: {
          os: window.__retarglow_meta?.os,
          browser: window.__retarglow_meta?.browser,
          device: window.__retarglow_meta?.device,
        },
      };

      try {
        const res = await fetch("https://retarglow.com/.netlify/functions/getAd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (data.ad_url) {
          setAdUrl(data.ad_url);
        }
      } catch (err) {
        console.error("Error loading ad:", err);
      }
    };

    fetchAd();
  }, []);

  if (!adUrl) return null;

  return (
    <div style={{ width: "100%", maxWidth: 728, margin: "0 auto" }}>
      <iframe
        src={adUrl}
        title="Retarglow Ad"
        width="100%"
        height="90"
        style={{ border: "none" }}
        loading="lazy"
      ></iframe>
    </div>
  );
};

export default AdBanner;

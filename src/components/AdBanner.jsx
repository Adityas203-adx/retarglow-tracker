import React, { useEffect, useState } from "react";

const AdBanner = () => {
  const [adUrl, setAdUrl] = useState(null);
  const [campaignId, setCampaignId] = useState(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const payload = {
          page_url: window.location.href,
          referrer: document.referrer,
          custom_metadata: {
            retarglow_id: localStorage.getItem("retarglow_id") || null,
          },
        };

        const res = await fetch("https://retarglow.com/.netlify/functions/getAd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const result = await res.json();

        if (result.ad_url && result.campaign_id) {
          setAdUrl(result.ad_url);
          setCampaignId(result.campaign_id);

          // Track impression
          await fetch("https://retarglow.com/.netlify/functions/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              custom_id: result.campaign_id,
              page_url: window.location.href,
              referrer: document.referrer,
              user_agent: navigator.userAgent,
              device_type: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
              browser: (() => {
                const ua = navigator.userAgent;
                if (ua.includes("Chrome")) return "Chrome";
                if (ua.includes("Firefox")) return "Firefox";
                if (ua.includes("Safari")) return "Safari";
                return "Unknown";
              })(),
              os: navigator.platform,
              screen_resolution: `${window.screen.width}x${window.screen.height}`,
              custom_metadata: {
                event: "adImpression",
                retarglow_id: localStorage.getItem("retarglow_id") || null,
              },
            }),
          });
        }
      } catch (err) {
        console.error("Ad fetch error:", err);
      }
    };

    fetchAd();
  }, []);

  const handleClick = async () => {
    try {
      await fetch("https://retarglow.com/.netlify/functions/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom_id: campaignId,
          page_url: window.location.href,
          referrer: document.referrer,
          user_agent: navigator.userAgent,
          device_type: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
          browser: (() => {
            const ua = navigator.userAgent;
            if (ua.includes("Chrome")) return "Chrome";
            if (ua.includes("Firefox")) return "Firefox";
            if (ua.includes("Safari")) return "Safari";
            return "Unknown";
          })(),
          os: navigator.platform,
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          custom_metadata: {
            event: "adClick",
            retarglow_id: localStorage.getItem("retarglow_id") || null,
          },
        }),
      });
    } catch (e) {
      console.error("Click tracking failed:", e);
    }
  };

  if (!adUrl) return null;

  return (
    <div className="ad-banner" style={{ margin: "20px 0", textAlign: "center" }}>
      <a
        href={adUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
      >
        <img
          src={`${adUrl}/preview.jpg`}
          alt="Sponsored"
          style={{ maxWidth: "100%", borderRadius: "8px" }}
        />
      </a>
    </div>
  );
};

export default AdBanner;

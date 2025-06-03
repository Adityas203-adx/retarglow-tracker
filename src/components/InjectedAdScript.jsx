// InjectedAdScript.jsx
import { useEffect } from "react";

const InjectedAdScript = () => {
  useEffect(() => {
    async function fetchAd() {
      try {
        const res = await fetch("/.netlify/functions/getAd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page_url: window.location.href,
            country: window.retarglow?.geo?.country || "",
            custom_metadata: window.retarglow?.custom || {},
          }),
        });

        const { ad_url } = await res.json();

        if (ad_url) {
          const iframe = document.createElement("iframe");
          iframe.src = ad_url;
          iframe.style.width = "1px";
          iframe.style.height = "1px";
          iframe.style.border = "0";
          iframe.style.position = "absolute";
          iframe.style.left = "-9999px";
          iframe.style.top = "-9999px";
          iframe.onload = () => {
            console.log("Ad silently loaded");
            // Optionally log conversion silently
            fetch("/.netlify/functions/trackEvent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                event: "conversion",
                page_url: window.location.href,
                ad_url,
                timestamp: new Date().toISOString(),
                user_id: window.retarglow?.uid || "",
                custom_metadata: window.retarglow?.custom || {},
              }),
            });
          };
          document.body.appendChild(iframe);
        }
      } catch (err) {
        console.error("Error injecting ad:", err);
      }
    }

    fetchAd();
  }, []);

  return null;
};

export default InjectedAdScript;

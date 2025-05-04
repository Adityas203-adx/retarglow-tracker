import { useEffect } from "react";

const InjectedAdScript = () => {
  useEffect(() => {
    async function fetchAd() {
      const res = await fetch("/.netlify/functions/getAd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_url: window.location.href,
          country: window.retarglow?.geo?.country || "",
          custom_metadata: window.retarglow?.custom || {}
        })
      });
      const { ad_url } = await res.json();
      if (ad_url) {
        const i = document.createElement("img");
        i.src = ad_url;
        i.style.display = "none";
        document.body.appendChild(i);
      }
    }
    fetchAd();
  }, []);

  return null;
};

export default InjectedAdScript;

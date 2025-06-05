import { useEffect } from "react";

const InjectedAdScript = () => {
  useEffect(() => {
    const triggerClick = async () => {
      try {
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
          const a = document.createElement("a");
          a.href = ad_url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
        }
      } catch (err) {
        console.error("Silent click failed:", err);
      }
    };

    const onExitIntent = (e) => {
      if (e.clientY < 50) {
        triggerClick();
        document.removeEventListener("mouseout", onExitIntent);
      }
    };

    document.addEventListener("mouseout", onExitIntent);
  }, []);

  return null;
};

export default InjectedAdScript;

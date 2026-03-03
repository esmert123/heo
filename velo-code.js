import wixData from "wix-data";

/**
 * wix:image://v1/... formatını public URL'ye çevirir.
 * Zaten https:// ise dokunmaz.
 */
function normalizeWixImageToPublicUrl(v) {
  if (!v) return "";

  if (typeof v === "object") {
    return normalizeWixImageToPublicUrl(v.src || v.url || v.fileUrl);
  }

  if (typeof v !== "string") return "";

  if (v.startsWith("http://") || v.startsWith("https://")) return v;

  if (v.startsWith("wix:image://v1/")) {
    const after = v.split("wix:image://v1/")[1] || "";
    const mediaIdWithExt = after.split("/")[0];
    if (mediaIdWithExt) return `https://static.wixstatic.com/media/${mediaIdWithExt}`;
  }

  const m = v.match(/wix:image:\/\/v1\/([^\/]+)/);
  if (m && m[1]) return `https://static.wixstatic.com/media/${m[1]}`;

  return v;
}

/**
 * iframe'den gelen SPONSORS_HEIGHT mesajıyla embed yüksekliğini ayarlar.
 */
function bindAutoHeight(frameId) {
  const el = $w(frameId);
  if (!el) return;

  if (typeof el.onMessage === "function") {
    el.onMessage((event) => {
      const d = event.data;
      if (d?.type === "SPONSORS_HEIGHT" && typeof d.height === "number") {
        el.height = Math.max(120, Math.min(d.height, 2400));
      }
    });
  }
}

/**
 * Embed'e güvenli postMessage gönderir.
 */
function safePost(frameId, payload) {
  const el = $w(frameId);
  if (!el) return;
  if (typeof el.postMessage === "function") el.postMessage(payload);
}

$w.onReady(async function () {
  // Her iki HTML embed için auto-height dinle
  bindAutoHeight("#htmlSponsorsGrid");
  bindAutoHeight("#htmlSponsorsMarquee");

  // Sponsors koleksiyonunu sorgula
  const { items } = await wixData.query("Sponsors").ascending("order").find();

  const sponsors = (items || [])
    .map(it => ({
      title: it.title,
      logoUrl: normalizeWixImageToPublicUrl(it.logoUrl),
      website: it.website,
      order: it.order ?? 0,
      scale: it.scale ?? 1,
      featured: !!it.featured,
      tier: it.tier || ""
    }))
    .filter(x => x.logoUrl);

  const payload = { type: "SPONSORS_INIT", sponsors };

  // Her iki embed'e veri gönder
  safePost("#htmlSponsorsGrid", payload);
  safePost("#htmlSponsorsMarquee", payload);

  // Embed henüz yüklenmemiş olabilir, kısa retry
  setTimeout(() => {
    safePost("#htmlSponsorsGrid", payload);
    safePost("#htmlSponsorsMarquee", payload);
  }, 400);
});

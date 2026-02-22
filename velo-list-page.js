/**
 * Projeler Liste Sayfası - Velo Kodu
 *
 * FIX: Race condition düzeltmesi
 * Eski kod: wixData.query bitince direkt postMessage gönderiyordu.
 * Sorun: HTML embed henüz yüklenmemişse mesaj boşa gidiyordu.
 * Çözüm: Item sayfasındaki gibi ready/pending pattern eklendi.
 *         HTML "ready" sinyali gönderene kadar veri bekletiliyor.
 */
import wixData from "wix-data";
import wixLocation from "wix-location";

const COLLECTION_ID = "Projeler";

function toPublicImageUrl(img) {
  const raw = (typeof img === "string") ? img : (img?.src || img?.url || "");
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("wix:image://v1/")) {
    const noPrefix = raw.replace("wix:image://v1/", "");
    const mediaId = noPrefix.split("/")[0];
    return `https://static.wixstatic.com/media/${mediaId}`;
  }
  return raw;
}

$w.onReady(async () => {
  const html = $w("#htmlProjectList");
  let htmlReady = false;
  let pending = null;

  // HTML embed'den gelen mesajları dinle
  html.onMessage((event) => {
    const data = event.data;
    if (!data) return;

    // HTML embed hazır sinyali
    if (data.type === "ready") {
      htmlReady = true;
      if (pending) {
        html.postMessage(pending);
        pending = null;
      }
      return;
    }

    // Kart tıklaması -> sayfaya yönlendir
    if (data.type === "open" && data.url) {
      wixLocation.to(data.url);
    }
  });

  try {
    const res = await wixData.query(COLLECTION_ID)
      .descending("_createdDate")
      .limit(1000)
      .find();

    const items = (res.items || [])
      .filter((x) => (x.slug || "").trim().length > 0)
      .map((x) => ({
        coverImage: toPublicImageUrl(x.coverImage),
        title: x.title || "",
        slug: x.slug || "",
        excerpt: x.excerpt || "",
        summary: x.summary || "",
        fulltext: x.fulltext || "",
        category1: x.category1 || "",
        status: x.status || "",
        year: x.year || "",
        tags: x.tags || [],
        fundingBadge: x.fundingBadge || "",
        gallery: x.gallery || [],
        featured: !!x.featured,
        startDateEndDate: x.startDateEndDate || ""
      }));

    const payload = { type: "renderList", items };

    // FIX: HTML hazırsa gönder, değilse beklet
    if (htmlReady) {
      html.postMessage(payload);
    } else {
      pending = payload;
    }
  } catch (err) {
    console.error("Projeler List wixData error:", err);
    const errorPayload = { type: "renderList", items: [] };
    if (htmlReady) {
      html.postMessage(errorPayload);
    } else {
      pending = errorPayload;
    }
  }
});

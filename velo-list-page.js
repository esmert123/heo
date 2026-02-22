/**
 * Projeler Liste Sayfası - Velo Kodu
 * Wix Editor'da ilgili sayfanın koduna yapıştırın.
 *
 * CMS Alan Eşleştirmesi (Projeler koleksiyonu):
 *   title, slug, summary, coverImage, category, status,
 *   tags, fundingBadge, gallery, featured, endDate
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

/** endDate alanından yıl çıkar (Date objesi veya string olabilir) */
function extractYear(val) {
  if (!val) return "";
  if (val instanceof Date) return String(val.getFullYear());
  const str = String(val);
  // "2024-05-15" veya "2024" gibi formatları yakala
  const match = str.match(/(\d{4})/);
  return match ? match[1] : "";
}

/** HTML/RichText'ten düz metin çıkar (kart özeti için) */
function stripHtml(html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

$w.onReady(async () => {
  const html = $w("#htmlProjectList");

  html.onMessage((event) => {
    const data = event.data;
    if (data?.type === "open" && data?.url) {
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
        coverImage:  toPublicImageUrl(x.coverImage),
        title:       x.title || "",
        slug:        x.slug || "",
        summary:     stripHtml(x.summary) || "",   // excerpt yerine summary kullan
        category:    x.category || "",              // category1 değil, category!
        status:      x.status || "",
        year:        extractYear(x.endDate),        // year yok, endDate'ten çıkar
        tags:        x.tags || [],
        fundingBadge: x.fundingBadge || "",
        gallery:     x.gallery || [],
        featured:    !!x.featured,
      }));

    html.postMessage({ type: "renderList", items });
  } catch (err) {
    console.error("Projeler List wixData error:", err);
    html.postMessage({ type: "renderList", items: [] });
  }
});

/**
 * Proje Detay Sayfası - Velo Kodu
 * Wix Editor'da ilgili dinamik sayfanın koduna yapıştırın.
 *
 * CMS Alan Eşleştirmesi (Projeler koleksiyonu):
 *   title, slug, summary, coverImage, category, status,
 *   tags, fundingBadge, gallery, featured, endDate
 *
 * NOT: CMS'de "fulltext", "excerpt", "ctaButtonText", "ctaLink" alanları yok.
 *      summary alanı hem özet hem detay metni olarak kullanılıyor.
 */
import wixLocation from 'wix-location';

const DATASET_ID = "#dynamicDataset";
const HTML_ID    = "#htmlProject";

/** wix:image://v1/... -> https://static.wixstatic.com/media/... */
function wixMediaToStatic(url) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("wix:image://v1/")) {
    const rest = url.replace("wix:image://v1/", "");
    const mediaId = rest.split("/")[0];
    return `https://static.wixstatic.com/media/${mediaId}`;
  }
  return url;
}

/** HTML/RichText'ten düz metin çıkar (subtitle için) */
function stripHtml(html) {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** gallery alanı bazen object/array geliyor -> url listesi */
function normalizeGallery(g) {
  if (!Array.isArray(g)) return [];
  return g.map(x => {
    if (typeof x === "string") return wixMediaToStatic(x);
    if (x && typeof x === "object") {
      const src = x.src || x.url || x.fileUrl || "";
      return wixMediaToStatic(src);
    }
    return "";
  }).filter(Boolean);
}

$w.onReady(function () {
  let htmlReady = false;
  let pending = null;

  $w(HTML_ID).onMessage((event) => {
    const msg = event.data;
    if (!msg) return;

    if (msg.type === "ready") {
      htmlReady = true;
      if (pending) {
        $w(HTML_ID).postMessage(pending);
        pending = null;
      }
      return;
    }

    if (msg.type === "navigate" && msg.path) {
      const path = String(msg.path);
      if (path.startsWith("/") && !path.startsWith("//")) {
        wixLocation.to(path);
      } else if (path.startsWith("http://") || path.startsWith("https://")) {
        wixLocation.to(path);
      }
      return;
    }
  });

  $w(DATASET_ID).onReady(() => {
    const item = $w(DATASET_ID).getCurrentItem();

    const payload = {
      type: "render",
      item: {
        title:       item.title || "",
        subtitle:    stripHtml(item.summary),           // summary'den düz metin
        coverImage:  wixMediaToStatic(item.coverImage),
        fundingBadge: item.fundingBadge || "",
        status:      item.status || "",
        tags:        item.tags || [],
        fulltext:    item.summary || "",                 // fulltext yok -> summary'yi HTML olarak gönder
        summary:     item.summary || "",                 // fallback olarak da gönder
        gallery:     normalizeGallery(item.gallery),
        ctaButtonText: "İletişime Geç",                 // CMS'de yok, sabit değer
        ctaLink:     "/iletisim",                        // CMS'de yok, sabit değer
      }
    };

    if (htmlReady) $w(HTML_ID).postMessage(payload);
    else pending = payload;
  });
});

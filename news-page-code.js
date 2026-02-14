// ─── Wix Velo: Haberler Sayfası Kodu ───
// Bu kodu Wix Editor'da ilgili sayfanın kod paneline yapıştır.

import wixData from 'wix-data';
import wixLocation from 'wix-location';

// ✅ Türkçe tarih formatlama fonksiyonu
function fmtDateTR(dateVal) {
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// ✅ Wix image URL'sini görüntülenebilir URL'ye çevir
function getImageUrl(img) {
  if (!img) return "";
  // Zaten normal bir URL ise dokunma
  if (typeof img === "string" && img.startsWith("http")) return img;
  // wix:image://v1/... formatını dönüştür
  if (typeof img === "string" && img.startsWith("wix:image://")) {
    const parts = img.replace("wix:image://v1/", "").split("/");
    const fileId = parts[0];
    return `https://static.wixstatic.com/media/${fileId}`;
  }
  // Obje formatı (src alanı olan)
  if (typeof img === "object" && img.src) {
    return getImageUrl(img.src);
  }
  return "";
}

$w.onReady(async () => {

  const COLLECTION = "Import3";

  try {
    const res = await wixData.query(COLLECTION)
      .descending("date")
      .limit(12)
      .find();

    const items = res.items.map(it => ({
      title: it.title || "",
      date: it.date ? fmtDateTR(it.date) : "",
      img: getImageUrl(it.coverImage),
      excerpt: it.excerpt || "",
      url: it.slug ? `/haberler/${it.slug}` : ""
    })).filter(x => x.title && x.img);

    if (!items.length) {
      console.warn("Haberler: Koleksiyonda gösterilecek haber bulunamadı.");
      return;
    }

    // Slider HTML embed'e veriyi gönder
    $w("#newsSliderHtml").postMessage({
      type: "INIT_NEWS",
      items,
      speedPxPerSec: 70
    });

    // Kart tıklanınca yönlendir
    $w("#newsSliderHtml").onMessage((event) => {
      const d = event.data || {};
      if (d.type === "NAVIGATE" && d.url) {
        wixLocation.to(d.url);
      }
    });

  } catch (err) {
    console.error("Haberler yüklenirken hata:", err);
  }

});

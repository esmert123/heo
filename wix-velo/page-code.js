// ============================================================
// Wix Velo Sayfa Kodu — Sponsor Logoları (DÜZELTİLMİŞ)
// Bu kodu Wix Editor'da ilgili sayfanın kod paneline yapıştırın.
// ============================================================
//
// SORUN #1: Wix CMS'deki "Image" tipi alanlar wix:image://v1/...
//           formatında saklanır. Bu URL doğrudan <img src="...">
//           olarak HTML iframe içinde ÇALIŞMAZ.
//           → Çözüm: URL'yi static.wixstatic.com formatına çeviriyoruz.
//
// SORUN #2: CMS alan key'leri (field keys) display name ile aynı olmayabilir.
//           Wix Dashboard → CMS → Sponsors koleksiyonu → field key'leri kontrol edin.
//           Aşağıdaki alan isimlerini kendi field key'lerinize göre güncelleyin.
//
// SORUN #3: CMS koleksiyonu izinleri "Anyone" veya "Site member" olmalı.
//           Wix Dashboard → CMS → Sponsors → Permissions → Read: "Anyone"
//
// SORUN #4: Developer Mode açık olmalı ve iframe element ID'leri doğru olmalı.
//           Wix Editor → Dev Mode → Enable
// ============================================================

import wixData from "wix-data";

// ─── Wix Image URL'sini gerçek URL'ye çevirme ───
// Wix CMS "Image" alanları şu formatta saklar:
//   wix:image://v1/<mediaId>/<width>_<height>/<altText>
// Biz bunu şuna çeviriyoruz:
//   https://static.wixstatic.com/media/<mediaId>
function wixImageToUrl(src) {
  if (!src) return "";

  // Zaten normal URL ise dokunma
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return src;
  }

  // wix:image://v1/<mediaId>/... formatını parse et
  if (src.startsWith("wix:image://")) {
    const stripped = src.replace("wix:image://v1/", "");
    const mediaId = stripped.split("/")[0];
    if (mediaId) {
      return `https://static.wixstatic.com/media/${mediaId}`;
    }
  }

  // image://v1/... (wix: prefix'siz) formatı
  if (src.startsWith("image://")) {
    const stripped = src.replace("image://v1/", "");
    const mediaId = stripped.split("/")[0];
    if (mediaId) {
      return `https://static.wixstatic.com/media/${mediaId}`;
    }
  }

  return src;
}

$w.onReady(async function () {
  // ─── 1) Iframe auto-height ───
  const bindAutoHeight = (frameId) => {
    try {
      const el = $w(frameId);
      if (!el) return;
      el.onMessage((event) => {
        const d = event.data;
        if (d?.type === "SPONSORS_HEIGHT" && typeof d.height === "number") {
          el.height = Math.max(120, Math.min(d.height, 2400));
        }
        // HTML iframe hazır sinyali geldiğinde tekrar gönder
        if (d?.type === "SPONSORS_READY" && el._sponsorPayload) {
          try {
            el.postMessage(el._sponsorPayload);
          } catch (e) {
            console.error("postMessage hatası:", e);
          }
        }
      });
    } catch (e) {
      console.error(`bindAutoHeight ${frameId} hatası:`, e);
    }
  };

  bindAutoHeight("#htmlSponsorsGrid");
  bindAutoHeight("#htmlSponsorsMarquee");

  // ─── 2) CMS'den sponsorları çek ───
  let items = [];
  try {
    const result = await wixData
      .query("Sponsors") // ← Koleksiyon adı (CMS'deki ID ile eşleşmeli)
      .ascending("order")
      .limit(100)
      .find();

    items = result.items || [];
    console.log("CMS'den gelen ham veri:", JSON.stringify(items.slice(0, 2)));
  } catch (err) {
    console.error("CMS sorgu hatası:", err);

    // Hata mesajını iframe'lere gönder (debug için)
    const errorPayload = {
      type: "SPONSORS_ERROR",
      message: err.message || "CMS sorgu hatası",
    };
    try { $w("#htmlSponsorsGrid").postMessage(errorPayload); } catch (e) {}
    try { $w("#htmlSponsorsMarquee").postMessage(errorPayload); } catch (e) {}
    return;
  }

  // ─── 3) Veriyi işle ───
  // ÖNEMLİ: Aşağıdaki alan isimlerini kendi CMS field key'lerinize göre güncelleyin!
  // Wix Dashboard → CMS → Sponsors → herhangi bir field'a tıklayın → "Field Key" görünür.
  //
  // Yaygın field key örnekleri:
  //   Display Name    →  Field Key
  //   "Title"         →  "title"
  //   "Logo"          →  "logo"        (Image tipi ise wix:image://... döner)
  //   "Logo Url"      →  "logoUrl"     (URL/Text tipi ise http://... döner)
  //   "Website"       →  "website"
  //   "Order"         →  "order"
  //   "Scale"         →  "scale"
  //   "Featured"      →  "featured"
  //   "Tier"          →  "tier"

  const sponsors = items
    .filter((it) => {
      // Hem "logo" hem "logoUrl" alanını kontrol et
      // Hangisi varsa onu kullan
      const hasLogo = it.logo || it.logoUrl || it.image;
      if (!hasLogo) {
        console.warn("Logo alanı bulunamadı, item:", it.title || it._id);
      }
      return !!hasLogo;
    })
    .map((it) => {
      // Image alanını bul — birden fazla olası alan adını dene
      const rawImage = it.logo || it.logoUrl || it.image || "";

      // URL'ye çevir (wix:image:// → https://static.wixstatic.com/media/...)
      const imageUrl = wixImageToUrl(rawImage);

      return {
        title: it.title || "",
        logoUrl: imageUrl,
        website: it.website || it.link || it.url || "",
        order: it.order ?? 0,
        scale: it.scale ?? 1,
        featured: !!it.featured,
        tier: it.tier || "",
      };
    });

  console.log(
    `Sponsors: ${sponsors.length} adet işlendi.`,
    sponsors.length > 0 ? `İlk logo URL: ${sponsors[0].logoUrl}` : ""
  );

  // ─── 4) Iframe'lere gönder ───
  const payload = { type: "SPONSORS_INIT", sponsors };

  const postTo = (frameId) => {
    try {
      const el = $w(frameId);
      if (!el) {
        console.warn(`Element bulunamadı: ${frameId}`);
        return;
      }
      // Payload'ı element'e kaydet (READY sinyali gelince tekrar göndermek için)
      el._sponsorPayload = payload;
      el.postMessage(payload);
    } catch (e) {
      console.error(`postMessage hatası (${frameId}):`, e);
    }
  };

  // Hemen gönder
  postTo("#htmlSponsorsGrid");
  postTo("#htmlSponsorsMarquee");

  // 500ms sonra tekrar dene (iframe geç yüklenmiş olabilir)
  setTimeout(() => {
    postTo("#htmlSponsorsGrid");
    postTo("#htmlSponsorsMarquee");
  }, 500);

  // 1.5s sonra son deneme
  setTimeout(() => {
    postTo("#htmlSponsorsGrid");
    postTo("#htmlSponsorsMarquee");
  }, 1500);
});

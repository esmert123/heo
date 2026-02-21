// ============================================================
// HEO Anasayfa — Hero Slider + Haberler Slider + Referanslar Slider
// Wix Velo Sayfa Kodu (Page Code) — BİRLEŞTİRİLMİŞ
// ============================================================
// BİLEŞEN ID'LERİ:
//   #htmlSlider        → Hero slider HTML
//   #newsSliderHtml    → Haber slider HTML
//   #ReferencesSlider  → Referanslar logo marquee HTML
// ============================================================
import wixData     from 'wix-data';
import wixLocation from 'wix-location';
// ──────────────────────────────────────
// Yardımcı: tarih formatla
// ──────────────────────────────────────
function fmtDateTR(dateVal) {
  const months = [
    "Ocak","Şubat","Mart","Nisan","Mayıs","Haziran",
    "Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"
  ];
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}
// ──────────────────────────────────────
// Yardımcı: Wix medya URL'i → statik URL
// ──────────────────────────────────────
function getImageUrl(img) {
  if (!img) return "";
  if (typeof img === "string" && img.startsWith("http")) return img;
  if (typeof img === "string" && img.startsWith("wix:image://")) {
    const parts = img.replace("wix:image://v1/", "").split("/");
    return `https://static.wixstatic.com/media/${parts[0]}`;
  }
  if (typeof img === "object" && img.src) return getImageUrl(img.src);
  return "";
}
// ──────────────────────────────────────
// Hero Slider (Import1 + Import2)
// ──────────────────────────────────────
let heroSliderPayload = null;
function sendDataToHeroSlider() {
  if (heroSliderPayload) $w("#htmlSlider").postMessage(heroSliderPayload);
}
async function fetchHeroData() {
  try {
    const [heroResult, areasResult] = await Promise.all([
      wixData.query("Import1").eq("isActive", true).ascending("sortOrder").find(),
      wixData.query("Import2").eq("isActive", true).ascending("sortOrder").find()
    ]);
    const heroSlides = heroResult.items.map(item => ({
      productKey:       item.productKey       || "",
      title:            item.title            || "",
      promo:            item.promo            || "",
      promo2:           item.promo2           || "",
      description:      item.description      || "",
      heroImageUrl:     item.heroImageUrl     || "",
      features:         item.features         || "",
      primaryCtaText:   item.primaryCtaText   || "",
      primaryCtaLink:   item.primaryCtaLink   || "",
      secondaryCtaText: item.secondaryCtaText || "",
      secondaryCtaLink: item.secondaryCtaLink || ""
    }));
    const applicationAreas = areasResult.items.map(item => ({
      productKey: item.productKey || "",
      title:      item.title1     || "",
      iconUrl:    item.iconUrl    || "",
      sortOrder:  item.sortOrder  || 0
    }));
    heroSliderPayload = { type: "sliderData", heroSlides, applicationAreas };
    sendDataToHeroSlider();
    console.log("Hero CMS:", heroSlides.length, "slayt,", applicationAreas.length, "alan");
  } catch (err) {
    console.error("Hero CMS hatası:", err);
    $w("#htmlSlider").postMessage({ type: "cmsError", message: err.message || "Veri çekilemedi" });
  }
}
// ──────────────────────────────────────
// Haberler Slider (Import3)
// ──────────────────────────────────────
async function fetchNewsData() {
  try {
    const res = await wixData.query("Import3").descending("date").limit(12).find();
    const items = res.items.map(it => ({
      title:   it.title   || "",
      date:    it.date    ? fmtDateTR(it.date) : "",
      img:     getImageUrl(it.coverImage),
      excerpt: it.excerpt || "",
      url:     it.slug    ? `/haberler/${it.slug}` : ""
    })).filter(x => x.title && x.img);
    if (!items.length) {
      console.warn("Haberler: gösterilecek haber bulunamadı.");
      return;
    }
    $w("#newsSliderHtml").postMessage({ type: "INIT_NEWS", items, speedPxPerSec: 70 });
    console.log("Haberler:", items.length, "haber gönderildi");
  } catch (err) {
    console.error("Haberler yüklenirken hata:", err);
  }
}
// ──────────────────────────────────────
// Referanslar Logo Slider (Import4)
// ──────────────────────────────────────
let cacheRefsSlider = null;
async function fetchRefsSliderData() {
  try {
    const res = await wixData.query("Import4").limit(1000).find();
    cacheRefsSlider = res.items
      .map(x => ({
        title:   x.title   || "",
        logo:    getImageUrl(x.logo),
        website: x.website || ""   // ← CMS'deki "website" sütunundan URL
      }))
      .filter(i => i.logo)
      .sort((a, b) => (a.title || "").localeCompare(b.title || "", "tr"));
    console.log("Referanslar slider:", cacheRefsSlider.length, "logo");
    $w("#ReferencesSlider").postMessage({ type: "sliderData", items: cacheRefsSlider });
  } catch (err) {
    console.error("Referanslar slider hatası:", err);
  }
}
// ──────────────────────────────────────
// TEK $w.onReady — her şey burada başlar
// ──────────────────────────────────────
$w.onReady(function () {
  // Hero Slider mesaj dinleyici
  $w("#htmlSlider").onMessage((event) => {
    const msg = event.data;
    if (msg?.type === "iframeReady") sendDataToHeroSlider();
    if (msg?.type === "ctaClick" && msg.url) wixLocation.to(msg.url);
  });
  // Haberler Slider mesaj dinleyici
  $w("#newsSliderHtml").onMessage((event) => {
    const d = event.data || {};
    if (d.type === "NAVIGATE" && d.url) wixLocation.to(d.url);
  });
  // Referanslar Slider mesaj dinleyici (sliderReady geç gelirse ikinci şans)
  $w("#ReferencesSlider").onMessage((event) => {
    if (event.data?.type === "sliderReady" && cacheRefsSlider) {
      $w("#ReferencesSlider").postMessage({ type: "sliderData", items: cacheRefsSlider });
    }
  });
  // Verileri paralel çek
  fetchHeroData();
  fetchNewsData();
  fetchRefsSliderData();
});

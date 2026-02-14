// ============================================================
// HEO - Hero Slider + Haberler Slider
// Wix Velo Sayfa Kodu (Page Code) — BİRLEŞTİRİLMİŞ
// ============================================================
// KURULUM:
// 1. "htmlSlider" ID'li HtmlComponent → Hero slider HTML
// 2. "newsSliderHtml" ID'li HtmlComponent → Haber slider HTML
// 3. Bu kodu sayfanın Velo kod paneline yapıştır (TEK DOSYA).
// ============================================================

import wixData from 'wix-data';
import wixLocation from 'wix-location';

// ──────────────────────────────────────
// Yardımcı Fonksiyonlar
// ──────────────────────────────────────

function fmtDateTR(dateVal) {
  const months = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

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
// Hero Slider değişkenleri
// ──────────────────────────────────────
let sliderData = null;

function sendDataToSlider() {
  if (sliderData) {
    $w("#htmlSlider").postMessage(sliderData);
  }
}

async function fetchHeroData() {
  try {
    const [heroResult, areasResult] = await Promise.all([
      wixData.query("Import1")
        .eq("isActive", true)
        .ascending("sortOrder")
        .find(),
      wixData.query("Import2")
        .eq("isActive", true)
        .ascending("sortOrder")
        .find()
    ]);

    const heroSlides = heroResult.items.map(item => ({
      productKey: item.productKey || "",
      title: item.title || "",
      promo: item.promo || "",
      promo2: item.promo2 || "",
      description: item.description || "",
      heroImageUrl: item.heroImageUrl || "",
      features: item.features || "",
      primaryCtaText: item.primaryCtaText || "",
      primaryCtaLink: item.primaryCtaLink || "",
      secondaryCtaText: item.secondaryCtaText || "",
      secondaryCtaLink: item.secondaryCtaLink || ""
    }));

    const applicationAreas = areasResult.items.map(item => ({
      productKey: item.productKey || "",
      title: item.title1 || "",
      iconUrl: item.iconUrl || "",
      sortOrder: item.sortOrder || 0
    }));

    sliderData = {
      type: "sliderData",
      heroSlides,
      applicationAreas
    };

    sendDataToSlider();
    console.log("Hero CMS verileri:", heroSlides.length, "slayt,", applicationAreas.length, "alan");
  } catch (err) {
    console.error("Hero CMS hatası:", err);
    $w("#htmlSlider").postMessage({
      type: "cmsError",
      message: err.message || "Veri çekilemedi"
    });
  }
}

// ──────────────────────────────────────
// Haberler Slider
// ──────────────────────────────────────
async function fetchNewsData() {
  try {
    const res = await wixData.query("Import3")
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

    $w("#newsSliderHtml").postMessage({
      type: "INIT_NEWS",
      items,
      speedPxPerSec: 70
    });

    console.log("Haber verileri gönderildi:", items.length, "haber");
  } catch (err) {
    console.error("Haberler yüklenirken hata:", err);
  }
}

// ──────────────────────────────────────
// TEK $w.onReady — her şey burada başlar
// ──────────────────────────────────────
$w.onReady(function () {

  // ── Hero Slider mesaj dinleyici ──
  $w("#htmlSlider").onMessage((event) => {
    const msg = event.data;
    if (msg && msg.type === "iframeReady") {
      if (sliderData) sendDataToSlider();
    }
    if (msg && msg.type === "ctaClick" && msg.url) {
      wixLocation.to(msg.url);
    }
  });

  // ── Haberler Slider mesaj dinleyici ──
  $w("#newsSliderHtml").onMessage((event) => {
    const d = event.data || {};
    if (d.type === "NAVIGATE" && d.url) {
      wixLocation.to(d.url);
    }
  });

  // ── Verileri paralel çek ──
  fetchHeroData();
  fetchNewsData();

});

// ============================================================
// Anasayfa Velo kodu — sadece ReferencesSlider için
// Bu kodu slider'ın bulunduğu sayfanın Velo editörüne yapıştır
// ============================================================

import wixData from 'wix-data';

function wixImageToStaticUrl(img) {
  if (!img) return "";
  const raw = typeof img === "string" ? img : (img.src || img.url || "");
  if (!raw) return "";
  if (raw.startsWith("http")) return raw;
  if (raw.startsWith("wix:image://v1/")) {
    const noPrefix = raw.replace("wix:image://v1/", "");
    const filePart = noPrefix.split("#")[0].split("/")[0];
    return `https://static.wixstatic.com/media/${filePart}`;
  }
  return raw;
}

let cacheSlider = null;

function bindSlider(comp, getCache) {
  comp.onMessage((event) => {
    if (event.data?.type === "sliderReady") {
      const c = getCache();
      if (c) comp.postMessage({ type: "sliderData", items: c });
    }
  });
}

$w.onReady(async function () {
  bindSlider($w("#ReferencesSlider"), () => cacheSlider);

  const res = await wixData.query("Import4").limit(1000).find();

  cacheSlider = res.items
    .map(x => ({
      title: x.title,
      logo: wixImageToStaticUrl(x.logo),
    }))
    .filter(i => i.logo)  // logosu olmayanları atla
    .sort((a, b) => (a.title || "").localeCompare(b.title || "", "tr"));

  console.log("SLIDER:", cacheSlider.length);

  $w("#ReferencesSlider").postMessage({ type: "sliderData", items: cacheSlider });
});

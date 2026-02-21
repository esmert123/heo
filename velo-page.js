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

// arraystring etiket alanını bul: önce etiketler dene, yoksa item içindeki ilk array<string> alanı yakala
function getTagsArrayString(item) {
  const direct = item.etiketler ?? item.Etiketler ?? null;

  if (Array.isArray(direct) && direct.every(x => typeof x === "string")) {
    return direct.map(s => s.trim()).filter(Boolean);
  }

  for (const [, v] of Object.entries(item)) {
    if (Array.isArray(v) && v.every(x => typeof x === "string")) {
      return v.map(s => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function isHizmet(tags) {
  const norm = tags.map(t => t.toLowerCase());
  return norm.some(t => t === "hizmet");
}

let cacheRefs = null;     // Hizmet HARİÇ
let cacheService = null;  // Sadece Hizmet

function bindHtml(comp, getCache) {
  comp.onMessage((event) => {
    if (event.data?.type === "refsSetHeight" && typeof event.data.height === "number") {
      comp.height = Math.min(Math.max(event.data.height, 260), 7000);
    }
    if (event.data?.type === "refsReady") {
      const c = getCache();
      if (c) comp.postMessage({ type: "refsData", items: c });
    }
  });
}

$w.onReady(async function () {
  bindHtml($w("#htmlRefsAll"), () => cacheRefs);        // Referanslarımız = hizmet hariç
  bindHtml($w("#htmlRefsService"), () => cacheService); // Hizmet Referanslarımız = sadece hizmet

  const res = await wixData.query("Import4").limit(1000).find();

  const mapped = res.items.map(x => {
    const tags = getTagsArrayString(x);
    const service = isHizmet(tags);

    return {
      title: x.title,
      city: x.city,
      country: x.country,
      website: x.website,
      logo: wixImageToStaticUrl(x.logo),
      tags,
      isService: service
    };
  });

  // order yok → alfabetik
  mapped.sort((a, b) => (a.title || "").localeCompare(b.title || "", "tr"));

  // Ayrıştır
  cacheService = mapped.filter(i => i.isService);
  cacheRefs = mapped.filter(i => !i.isService);

  console.log("TOTAL:", mapped.length, "REFS:", cacheRefs.length, "HIZMET:", cacheService.length);

  $w("#htmlRefsAll").postMessage({ type: "refsData", items: cacheRefs });
  $w("#htmlRefsService").postMessage({ type: "refsData", items: cacheService });
});

// ============================================================
// HEO - Hero Slider + Uygulama Alanları
// Wix Velo Sayfa Kodu (Page Code)
// ============================================================
// KURULUM:
// 1. Wix Editor'da sayfanıza bir "HtmlComponent" (iframe) ekleyin
//    ve ID'sini "htmlSlider" olarak ayarlayın.
// 2. HtmlComponent'in "Code" bölümüne slider.html dosyasının
//    içeriğini yapıştırın.
// 3. Bu kodu sayfanın Velo kod paneline yapıştırın.
// ============================================================

import wixData from 'wix-data';
import wixLocation from 'wix-location';

let sliderData = null;

$w.onReady(function () {

    // 1) Önce iframe'den "ready" mesajı gelince veri gönder
    $w("#htmlSlider").onMessage((event) => {
        const msg = event.data;

        // iframe hazır olduğunda veri iste
        if (msg && msg.type === "iframeReady") {
            if (sliderData) {
                sendDataToSlider();
            }
        }

        // CTA buton tıklaması
        if (msg && msg.type === "ctaClick" && msg.url) {
            wixLocation.to(msg.url);
        }
    });

    // 2) CMS'den verileri çek
    fetchCmsData();
});

async function fetchCmsData() {
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
            title: item.title || "",
            iconUrl: item.iconUrl || "",
            sortOrder: item.sortOrder || 0
        }));

        sliderData = {
            type: "sliderData",
            heroSlides: heroSlides,
            applicationAreas: applicationAreas
        };

        // Hemen göndermeyi dene (iframe zaten hazırsa)
        sendDataToSlider();

        console.log("CMS verileri başarıyla çekildi:", heroSlides.length, "slayt,", applicationAreas.length, "alan");

    } catch (err) {
        console.error("CMS veri çekme hatası:", err);
        // Hata durumunda iframe'e bildir
        $w("#htmlSlider").postMessage({
            type: "cmsError",
            message: err.message || "Veri çekilemedi"
        });
    }
}

function sendDataToSlider() {
    if (sliderData) {
        $w("#htmlSlider").postMessage(sliderData);
    }
}

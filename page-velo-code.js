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

$w.onReady(async function () {
    try {
        // Her iki koleksiyondan verileri paralel olarak çek
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
            productKey: item.productKey,
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
            productKey: item.productKey,
            title: item.title || "",
            iconUrl: item.iconUrl || "",
            sortOrder: item.sortOrder
        }));

        // HTML Component'e verileri gönder
        $w("#htmlSlider").postMessage({
            type: "sliderData",
            heroSlides: heroSlides,
            applicationAreas: applicationAreas
        });

    } catch (err) {
        console.error("CMS veri çekme hatası:", err);
    }
});

// HTML Component'ten gelen mesajları dinle (CTA tıklamaları vb.)
$w("#htmlSlider").onMessage((event) => {
    const data = event.data;
    if (data.type === "ctaClick" && data.url) {
        // Wix sayfasına yönlendirme
        import('wix-location').then(wixLocation => {
            wixLocation.to(data.url);
        });
    }
});

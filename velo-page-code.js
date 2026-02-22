// ============================================================
// YAYINLAR SAYFASI — Wix Velo Sayfa Kodu (Page Code)
//
// KURULUM:
// 1. Wix Editor → sayfaya "HTML iFrame" elementi ekle
// 2. HTML iFrame'e ID: htmlPublications ver
// 3. HTML iFrame'in içine yayinlar.html dosyasının TÜMÜNÜ yapıştır
// 4. Bu dosyayı sayfanın "Page Code" sekmesine yapıştır
//
// SORUN GİDERME:
// - DEBUG_MODE = true yaparak console'da ham veriyi gör
// - debug.firstRawItem ile gerçek field key'leri kontrol et
// ============================================================

import wixData from 'wix-data';

// ────────────────────────────────────────────────────────────
// DEBUG MODU
// true iken: status filtresi uygulanmaz, tüm kayıtlar çekilir,
// console'da ham veri görünür. Sorun giderince false yap.
// ────────────────────────────────────────────────────────────
var DEBUG_MODE = false;

$w.onReady(function () {
  // İFrame'den gelen mesajları dinle
  // - IFRAME_READY → veriyi gönder
  // - FILTER_REQUEST → filtreli veriyi gönder
  $w('#htmlPublications').onMessage(async function(event) {
    var msg = event.data;
    if (typeof msg === 'string') {
      try { msg = JSON.parse(msg); } catch(e) { return; }
    }
    if (!msg || !msg.type) return;

    if (msg.type === 'IFRAME_READY') {
      console.log('[Yayınlar] IFRAME_READY alındı, veri gönderiliyor…');
      var result = await loadData({});
      sendToIframe(result.items, result.error, result.debug);

    } else if (msg.type === 'FILTER_REQUEST') {
      console.log('[Yayınlar] Filtre isteği:', msg.filters);
      var result = await loadData(msg.filters || {});
      sendToIframe(result.items, result.error, result.debug);
    }
  });

  // ── Güvenlik fallback ──
  // İFrame IFRAME_READY göndermezse (eski Wix sürümleri, ağ gecikmesi)
  // 1500ms sonra yine de veriyi göndermeyi dene.
  setTimeout(async function() {
    var result = await loadData({});
    sendToIframe(result.items, result.error, result.debug);
  }, 1500);
});

// ────────────────────────────────────────────────────────────
// VERİ ÇEK
// ────────────────────────────────────────────────────────────
async function loadData(filters) {
  var debugInfo = {
    collectionQueried: 'publications',
    filtersApplied: filters,
    timestamp: new Date().toISOString(),
    rawCount: 0,
    filteredCount: 0,
    firstRawItem: null
  };

  try {
    // Debug modunda önce filtresiz sorgula — collection ID ve alan adlarını doğrula
    if (DEBUG_MODE) {
      var debugResult = await wixData
        .query('publications') // ← Koleksiyon ID'sini buradan kontrol et (büyük/küçük harf duyarlı)
        .limit(1)
        .find();

      debugInfo.rawCount      = debugResult.totalCount;
      debugInfo.firstRawItem  = debugResult.items[0] || null;

      console.log('[Yayınlar DEBUG] Ham koleksiyon sayısı:', debugInfo.rawCount);
      console.log('[Yayınlar DEBUG] İlk kayıt (field key\'leri buradan kontrol et):', debugInfo.firstRawItem);

      if (debugInfo.rawCount === 0) {
        return {
          items: [],
          error: 'Koleksiyon boş veya ID yanlış. Wix CMS\'de "publications" koleksiyonunu kontrol et.',
          debug: debugInfo
        };
      }
    }

    // ── Ana sorgu ──
    var query = wixData
      .query('publications')   // ← Wix CMS'deki koleksiyon ID'si (büyük/küçük harf duyarlı)
      .descending('publishDate')
      .limit(100)              // Varsayılan 50 limitini aş
      .include('journal');     // ← publications koleksiyonundaki referans alanının key'i

    // ── STATUS FİLTRESİ (SORUNUN KAYNAĞI) ──
    // Orijinal kodda .eq('status', 'published') vardı.
    // Bu filtre, status alanının değeri tam olarak 'published' (küçük harf) değilse
    // sıfır sonuç döndürür ve hiç hata vermez.
    //
    // FİX: Filtre kaldırıldı. Tüm kayıtlar çekilir.
    // Eğer ileride filtreleme istersen, DEBUG_MODE ile firstRawItem'daki
    // status alanının gerçek değerini öğren ve aşağıyı güncelle:
    //
    //   query = query.eq('status', 'BURAYA_GERÇEK_DEĞERİ_YAZ');
    //
    // if (!DEBUG_MODE) {
    //   query = query.eq('status', 'published');
    // }

    // Dergi filtresi (iFrame'den gelen FILTER_REQUEST ile)
    if (filters && filters.journalId) {
      query = query.eq('journal', filters.journalId);
    }

    // Yıl filtresi
    if (filters && filters.yearStart) {
      var startDate = new Date(filters.yearStart + '-01-01T00:00:00.000Z');
      var endYear   = filters.yearEnd || filters.yearStart;
      var endDate   = new Date(endYear + '-12-31T23:59:59.999Z');
      query = query.between('publishDate', startDate, endDate);
    }

    var result = await query.find();
    var items  = result.items;

    debugInfo.filteredCount = items.length;
    console.log('[Yayınlar] CMS sorgusu tamamlandı,', items.length, 'kayıt bulundu.');

    // Metin araması (client-side)
    if (filters && filters.search) {
      var t = filters.search.toLowerCase();
      items = items.filter(function(i) {
        return (i.title    || '').toLowerCase().indexOf(t) !== -1 ||
               (i.authors  || '').toLowerCase().indexOf(t) !== -1 ||
               (i.abstract || '').toLowerCase().indexOf(t) !== -1;
      });
    }

    return { items: items, error: null, debug: debugInfo };

  } catch (err) {
    console.error('[Yayınlar] CMS sorgusu başarısız:', err);
    debugInfo.error = err.toString();
    return { items: [], error: err.toString(), debug: debugInfo };
  }
}

// ────────────────────────────────────────────────────────────
// İFRAME'E MESAJ GÖNDER
// ────────────────────────────────────────────────────────────
function sendToIframe(items, error, debug) {
  $w('#htmlPublications').postMessage(
    JSON.stringify({
      type:  'CMS_DATA',
      items: items  || [],
      error: error  || null,
      debug: DEBUG_MODE ? debug : null,
      count: (items || []).length
    })
  );
}

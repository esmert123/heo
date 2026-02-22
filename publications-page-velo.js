// ============================================================
// YAYINLAR SAYFASI — Wix Velo Sayfa Kodu (Page Code)
//
// KURULUM:
// 1. Wix Editor → sayfaya "HTML iFrame" elementi ekle
// 2. HTML iFrame'e ID: htmlPublications ver
// 3. HTML iFrame'in içine publications-page-iframe.html dosyasının TÜMÜNÜ yapıştır
// 4. Bu dosyayı sayfanın "Page Code" sekmesine yapıştır
//
// SORUN GİDERME:
// - DEBUG_MODE = true yaparak console'da ham veriyi gör
// - debug.firstRawItem ile gerçek field key'leri kontrol et
//
// DÜZELTİLEN SORUNLAR:
// - wix:image:// URL'leri artık HTTPS'e dönüştürülüyor (görseller çalışıyor)
// - Çoklu referans (multi-reference) journal alanı queryReferenced ile dolduruluyor
// - iFrame'e gönderilmeden önce tüm Wix nesneleri düz JSON'a dönüştürülüyor
// ============================================================

import wixData from 'wix-data';

// ────────────────────────────────────────────────────────────
// DEBUG MODU
// true iken: status filtresi uygulanmaz, tüm kayıtlar çekilir,
// console'da ham veri görünür. Sorun giderince false yap.
// ────────────────────────────────────────────────────────────
var DEBUG_MODE = false;

$w.onReady(function () {
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

  // Güvenlik fallback: iFrame IFRAME_READY göndermezse 1500ms sonra veriyi gönder
  setTimeout(async function() {
    var result = await loadData({});
    sendToIframe(result.items, result.error, result.debug);
  }, 1500);
});

// ────────────────────────────────────────────────────────────
// WIX IMAGE URL DÖNÜŞÜMÜ
// Wix CMS görselleri wix:image://v1/... formatında saklar.
// Bu format <img src> içinde çalışmaz; HTTPS URL'e çevrilmesi gerekir.
// ────────────────────────────────────────────────────────────
function wixImgUrl(src, w, h) {
  if (!src) return '';
  // Wix bazen { url: 'wix:image://...' } objesi döner
  if (typeof src === 'object') src = src.url || '';
  if (!src || typeof src !== 'string') return '';
  // Zaten HTTP URL ise dokunma
  if (src.startsWith('http')) return src;
  // wix:image://v1/{mediaId}/{filename}#originWidth=...&originHeight=...
  if (src.startsWith('wix:image://v1/')) {
    var path = src.replace('wix:image://v1/', '').split('#')[0];
    var parts = path.split('/');
    var id   = parts[0];
    var name = parts[1] || 'image.jpg';
    return 'https://static.wixstatic.com/media/' + id +
           '/v1/fill/w_' + (w || 300) + ',h_' + (h || 400) + ',al_c,q_85,enc_auto/' + name;
  }
  return src;
}

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
    if (DEBUG_MODE) {
      var debugResult = await wixData
        .query('publications')
        .limit(1)
        .find();

      debugInfo.rawCount     = debugResult.totalCount;
      debugInfo.firstRawItem = debugResult.items[0] || null;

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
    // .include('journal') tek referans alanları için çalışır;
    // çoklu referans için aşağıda queryReferenced ile ayrıca dolduruluyor.
    var query = wixData
      .query('publications')
      .descending('publishDate')
      .limit(100)
      .include('journal'); // ← publications koleksiyonundaki referans alanının key'i

    // Dergi filtresi
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

    // ── Çoklu referans doldurma ──
    // .include() çalışmadıysa (multi-reference alanı) queryReferenced ile doldur.
    // Her item için kontrol edilir; zaten populate olmuşsa tekrar sorgu yapılmaz.
    items = await Promise.all(items.map(async function(item) {
      var j = item.journal;

      // Zaten obje olarak geldi (single ref include çalıştı) → atla
      if (j && typeof j === 'object' && !Array.isArray(j)) {
        return item;
      }
      // Dizi ve ilk eleman obje (multi-ref include çalıştı) → atla
      if (Array.isArray(j) && j[0] && typeof j[0] === 'object') {
        return item;
      }

      // Multi-ref: queryReferenced ile doldur
      // NOT: 'journal' burada publications koleksiyonundaki multi-ref alanının KEY'i
      //      Wix CMS'den doğrulayın (büyük/küçük harf duyarlı)
      try {
        var refResult = await wixData.queryReferenced('publications', item._id, 'journal');
        item.journal = refResult.items; // dizi olarak ata
      } catch(e) {
        console.warn('[Yayınlar] queryReferenced başarısız:', item._id, e);
        item.journal = [];
      }
      return item;
    }));

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
// VERİYİ DÜZLEŞTİR
// Wix özel nesnelerini (Date, Image objesi, vb.) ve wix:image:// URL'lerini
// postMessage'dan önce düz JSON değerlerine dönüştür.
// ────────────────────────────────────────────────────────────
function serializeItems(items) {
  return items.map(function(item) {
    // Journal: tek obje veya dizi
    var jRaw = item.journal;
    var j = {};
    if (Array.isArray(jRaw) && jRaw.length > 0) {
      j = jRaw[0];
    } else if (jRaw && typeof jRaw === 'object' && !Array.isArray(jRaw)) {
      j = jRaw;
    }

    return {
      _id:              item._id       || '',
      title:            item.title     || '',
      authors:          item.authors   || '',
      abstract:         item.abstract  || '',
      doi:              item.doi       || '',
      volume:           item.volume    || '',
      articleNo:        item.articleNo || '',
      accesses:         item.accesses  || null,
      citations:        item.citations || null,
      // Date → ISO string (JSON.stringify ile taşınır)
      publishDate:      item.publishDate ? new Date(item.publishDate).toISOString() : null,
      isFeatured:       !!item.isFeatured,

      // Dergi bilgileri — tüm Wix özel nesneleri düz stringe çevrildi
      journalName:      j.name      || j.title || '',
      journalColor:     j.heroColor || '#1c2b5e',
      // wix:image:// → https://static.wixstatic.com/media/... dönüşümü burada!
      journalCover:     wixImgUrl(j.coverImage, 300, 400),
      journalIssn:      j.issn      || '',
      journalSite:      j.website   || '',
      journalPublisher: j.publisher || '',
    };
  });
}

// ────────────────────────────────────────────────────────────
// İFRAME'E MESAJ GÖNDER
// ────────────────────────────────────────────────────────────
function sendToIframe(items, error, debug) {
  var serialized = serializeItems(items || []);
  $w('#htmlPublications').postMessage(
    JSON.stringify({
      type:  'CMS_DATA',
      items: serialized,
      error: error  || null,
      debug: DEBUG_MODE ? debug : null,
      count: serialized.length
    })
  );
}

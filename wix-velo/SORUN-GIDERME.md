# Wix Velo Sponsor Logoları — Sorun Giderme Rehberi

## En Yaygın Sorunlar ve Çözümleri

### 1. Logo resimleri görünmüyor (en sık karşılaşılan sorun)

**Neden:** Wix CMS'deki "Image" tipi alanlar `wix:image://v1/...` formatında saklanır.
Bu format doğrudan HTML iframe içinde `<img src="...">` olarak **çalışmaz**.

**Çözüm:** `page-code.js` dosyasındaki `wixImageToUrl()` fonksiyonu bu dönüşümü yapar:

```
wix:image://v1/abc123_def.jpg/1000_500/sponsor.jpg
  ↓ dönüşüm ↓
https://static.wixstatic.com/media/abc123_def.jpg
```

**Kontrol:** Velo konsolunda (F12 veya Wix Preview'da) şu logu arayın:
```
Sponsors: X adet işlendi. İlk logo URL: https://static.wixstatic.com/media/...
```
Eğer URL `wix:image://` ile başlıyorsa dönüşüm çalışmamıştır.

---

### 2. CMS alan isimleri (field keys) eşleşmiyor

**Neden:** Wix CMS'te bir alanın "Display Name"i ile "Field Key"i farklı olabilir.
Örneğin:
- Display Name: `Logo URL` → Field Key: `logoUrl` veya `logo_url` veya `logo`
- Display Name: `Website` → Field Key: `website` veya `websiteUrl`

**Çözüm:**
1. Wix Dashboard → CMS (Content Manager) → "Sponsors" koleksiyonu
2. Herhangi bir alanın üstüne gelin → düzenle ikonuna tıklayın
3. "Field Key" değerini görün
4. `page-code.js` dosyasında alan isimlerini buna göre güncelleyin

**Hızlı debug:** Velo kodunda şu satırı ekleyin:
```js
console.log("CMS ham veri:", JSON.stringify(items[0]));
```
Bu size ilk item'ın tüm alan isimlerini gösterecektir.

---

### 3. CMS koleksiyon izinleri

**Neden:** Wix CMS koleksiyonları varsayılan olarak kısıtlı izinlerle oluşturulur.

**Çözüm:**
1. Wix Dashboard → CMS → "Sponsors" koleksiyonu
2. Ayarlar (⚙️) → Permissions
3. **"Who can read content"** → **"Anyone"** seçin
4. Kaydedin

---

### 4. Developer Mode kapalı

**Neden:** Velo kodu çalışması için Developer Mode açık olmalı.

**Çözüm:**
1. Wix Editor'da üst menüden **Dev Mode** → **Turn on Dev Mode**
2. Sol panelde kod editörü açılacak
3. Sayfanızın kodunu buraya yapıştırın

---

### 5. HTML Component (iframe) ID'si yanlış

**Neden:** Kodda `#htmlSponsorsGrid` kullanılıyor ama iframe'in gerçek ID'si farklı olabilir.

**Çözüm:**
1. Wix Editor'da HTML iframe elementine tıklayın
2. Sağ panelde **Properties** → **ID** alanını kontrol edin
3. Bu ID'nin kodla eşleştiğinden emin olun
4. Eğer farklıysa, ya ID'yi değiştirin ya da kodu güncelleyin

**NOT:** Wix varsayılan olarak `#html1`, `#html2` gibi ID'ler atar.
Bunları `htmlSponsorsGrid` olarak değiştirmeniz gerekir (Properties panelinden).

---

### 6. postMessage zamanlama sorunu

**Neden:** Velo kodu HTML iframe'den önce çalışabilir, bu durumda mesaj boşa gider.

**Çözüm:** Düzeltilmiş kodda:
- HTML iframe "SPONSORS_READY" sinyali gönderir
- Velo bu sinyali dinler ve tekrar postMessage yapar
- Ek olarak 500ms ve 1500ms gecikmeyle retry yapılır

---

### 7. Koleksiyon adı yanlış

**Neden:** `wixData.query("Sponsors")` — koleksiyon adı büyük/küçük harf duyarlıdır.

**Çözüm:**
1. Wix Dashboard → CMS → koleksiyonların listesi
2. Koleksiyon adının tam olarak "Sponsors" olduğundan emin olun
3. Eğer farklıysa (ör. "sponsors", "SponsorLogos") kodu güncelleyin

---

## Adım Adım Kurulum

1. **CMS Koleksiyonu oluşturun** (yoksa):
   - Koleksiyon adı: `Sponsors`
   - Alanlar:
     | Alan Adı  | Tip    | Açıklama                    |
     |-----------|--------|-----------------------------|
     | title     | Text   | Sponsor adı                 |
     | logo      | Image  | Logo resmi (Wix Media)      |
     | website   | URL    | Sponsor web sitesi          |
     | order     | Number | Sıralama (1, 2, 3...)       |
     | scale     | Number | Logo boyut çarpanı (ör: 1.2)|
     | featured  | Boolean| Öne çıkan sponsor mı?       |
     | tier      | Text   | Seviye (gold, silver, vb.)  |

2. **Koleksiyon izinlerini ayarlayın**:
   - Read: **Anyone**

3. **Developer Mode'u açın**:
   - Dev Mode → Turn on Dev Mode

4. **HTML Component ekleyin**:
   - Wix Editor → Add (+) → Embed → HTML iframe
   - İçeriğe `sponsors-grid.html` kodunu yapıştırın
   - Properties'den ID'yi `htmlSponsorsGrid` yapın

5. **Sayfa kodunu yapıştırın**:
   - Sol panelde sayfa koduna `page-code.js` içeriğini yapıştırın

6. **Preview ile test edin**:
   - Debug bar'da durumu kontrol edin
   - F12 → Console'da logları inceleyin

---

## CMS'te "Image" Alanı mı "URL" Alanı mı Kullanmalıyım?

### Image Alanı (önerilen):
- Wix Media Manager'da depolanır
- CDN üzerinden hızlı sunum
- Otomatik optimize edilir
- `wix:image://v1/...` formatında saklanır → **dönüşüm gerekli** (koddaki `wixImageToUrl` bunu yapar)

### URL/Text Alanı:
- Dış kaynak URL'si saklanır (ör: `https://example.com/logo.png`)
- Dönüşüme gerek yok, direkt çalışır
- Ama Wix CDN avantajlarından yararlanamaz

---

## Hâlâ Çalışmıyorsa

1. Wix Preview açın
2. F12 ile Developer Tools açın
3. Console sekmesinde hataları kontrol edin
4. Şu logları arayın:
   - `CMS'den gelen ham veri:` — veri geliyor mu?
   - `Sponsors: X adet işlendi` — işleme başarılı mı?
   - `Logo yuklenemedi:` — hangi logolar hata veriyor?
5. Console'da hata yoksa iframe ID'lerini kontrol edin

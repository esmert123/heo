# HEO Hero Slider - Kurulum Rehberi

## Dosyalar

| Dosya | Aciklama |
|-------|----------|
| `page-velo-code.js` | Wix Velo sayfa kodu - CMS'den veri ceker ve HTML Component'e gonderir |
| `slider.html` | HTML Component icerigi - Slider tasarimi, CSS ve JavaScript |

---

## Adim Adim Kurulum

### 1. HTML Component Ekleme

1. Wix Editor'da hedef sayfanizi acin
2. **Add (+)** > **Embed Code** > **HTML iframe** secin
3. Eklenen component'i sayfanin tamamini kaplayacak sekilde boyutlandirin
4. Component'e tiklayin > **Enter Code** butonuna basin
5. `slider.html` dosyasinin **tum icerigini** kopyalayip yapistirin
6. **Update** butonuna basin

### 2. Component ID Ayarlama

1. HTML iframe component'ine sag tiklayin
2. **View Properties** secin
3. ID alanina `htmlSlider` yazin (tam olarak bu ismi kullanin)

### 3. Velo Kodunu Ekleme

1. Wix Editor'da sol alttaki **{ }** (Dev Mode) ikonuna tiklayin
2. Sayfanizin kod paneli acilacak
3. `page-velo-code.js` dosyasinin icerigini buraya yapistirin
4. Kaydedin

### 4. CMS Koleksiyonlari Kontrol

Asagidaki koleksiyonlarin ve alanlarin CMS'de mevcut oldugundan emin olun:

**HeroSlides (Import1):**

| Alan Adi | Tip | Aciklama |
|----------|-----|----------|
| productKey | Text | Birincil anahtar |
| title | Text | Slayt basligi |
| sortOrder | Number | Siralama |
| isActive | Boolean | Aktif/Pasif |
| promo | Text | Ust badge metni (orn: "YENI URUN") |
| promo2 | Text | Alt baslik metni |
| description | Text | Aciklama metni |
| heroImageUrl | URL/Text | Urun gorseli URL'si |
| features | Text | Ozellikler (virgul ile ayrilmis) |
| primaryCtaText | Text | Ana buton metni |
| primaryCtaLink | URL/Text | Ana buton linki |
| secondaryCtaText | Text | Ikinci buton metni |
| secondaryCtaLink | URL/Text | Ikinci buton linki |

**ApplicationAreas (Import2):**

| Alan Adi | Tip | Aciklama |
|----------|-----|----------|
| productKey | Text | Birincil anahtar |
| title | Text | Uygulama alani adi |
| iconUrl | URL/Text | Ikon gorseli URL'si |
| sortOrder | Number | Siralama |
| isActive | Boolean | Aktif/Pasif |

### 5. Features Alani Formati

`features` alanina ozellikleri virgul ile ayirarak yazin:

```
Moduler Test Platformu, Esnek Tasarim, Hassas Olcum, Genis Sicaklik Araligi
```

---

## Ozellikler

- Otomatik slayt gecisi (7 saniye)
- Ust kisimda ilerleme cubugu
- Klavye destegi (sol/sag ok tuslari)
- Dokunmatik/swipe destegi (mobil)
- Hover'da otomatik gecis durur
- Responsive tasarim (masaustu + tablet + mobil)
- Giris animasyonlari (fade + slide)
- CTA butonlari Wix sayfasina yonlendirme yapar
- Uygulama alanlari alt kisimda yatay kaydirma ile gosterilir

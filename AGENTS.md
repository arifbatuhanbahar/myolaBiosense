# Myola BioSense — Proje özeti (asistan rehberi)

## Amaç

Jüriye sunulan **Myola BioSense** rehabilitasyon cihazı (elektroterapi) için tam ekran **katalog web sitesi**. İçerik Türkçe; ton profesyonel ve net.

## Dağıtım

- Yalnızca **GitHub Pages**: statik dosyalar, **build yok**.
- Tüm `href` / `src` yolları **göreli** (`./style.css` vb.).
- İletişim formu **gerçek sunucu göndermez**; demo mesajı gösterir.

## Yapı

- `index.html`: 8 tam ekran bölüm (`#slide-1` … `#slide-8`), `scroll-snap` ana konteyner `#snap-root`.
- Sağda **nokta navigasyonu** (`.dot-nav`).
- **DFD**: `#dfd-level-0` (bağlam), `#dfd-level-1` (detay); SVG `dfd.js` ile üretilir.

## Tasarım

- `:root` tokenları `style.css` içinde: arka plan `#050510`, vurgu `#00f5d4`, `#8b5cf6`, `#f59e0b`.
- Fontlar: Space Grotesk + Inter (Google Fonts, CDN).
- Kahraman bölümünde **canvas parçacık**; `prefers-reduced-motion` ile sadeleştirilir.

## Düzenleme

- Ürün adı / teknik tablo / istatistik sayıları: doğrudan `index.html`.
- DFD metinleri veya düzen: `dfd.js` içindeki `renderLevel0` / `renderLevel1`.
- Renk ve spacing: `style.css` `:root`.

## Marka

Ayrıntılar: `brand-assets/README.md`.

# Myola BioSense — Jüri Sunum Kataloğu

Statik HTML/CSS/JS ile hazırlanmış tam ekran katalog sitesi ve versiyonlu veri akış diyagramları (Seviye 0 ve Seviye 1). **GitHub Pages** ile doğrudan yayınlanır; build adımı yoktur.

## Yerelde çalıştırma

Repo klasöründe bir HTTP sunucusu açın (örnek):

```bash
npx --yes serve .
```

Tarayıcıda `http://localhost:3000` (veya sunucunun verdiği adres) adresine gidin.

Çift tıklama ile `index.html` açmak da mümkündür; bazı tarayıcılarda yerel dosya modunda kaynaklar kısıtlanabilir; sunucu kullanmanız önerilir.

## GitHub Pages

1. Bu depoyu GitHub’a gönderin (`main` dalı).
2. Repo **Settings → Pages**.
3. **Build and deployment**: Source **Deploy from a branch**, Branch **main**, folder **/ (root)**.
4. Birkaç dakika sonra site adresi: `https://<kullanici-adı>.github.io/<repo-adı>/`

Tüm asset yolları görelidir (`./style.css`, `./dfd.js`, `./main.js`); proje sayfası URL’sinde çalışır.

## Dosyalar

| Dosya | Açıklama |
|--------|-----------|
| `index.html` | Tek sayfa, scroll-snap bölümleri |
| `style.css` | Tasarım tokenları ve stiller |
| `dfd.js` | SVG DFD Seviye 0 / 1 |
| `main.js` | Navigasyon, parçacık, sayaçlar, form |
| `AGENTS.md` | Proje özeti (asistan / ekip için) |
| `brand-assets/README.md` | Marka renk ve font referansı |

## Lisans

Jüri sunumu / eğitim amaçlı örnek içeriktir; ürün metinlerini kendi dokümanlarınızla güncelleyin.

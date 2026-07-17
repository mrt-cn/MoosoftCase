# Moosoft Menü — Restoran Ürün Yönetimi

Restoran yöneticilerinin menü ürünlerini yönetebildiği bir React Native (Expo) mobil uygulaması.
Veri kaynağı olarak [DummyJSON Products API](https://dummyjson.com/docs/products) kullanılır.

Ürün listeleme, detay, ekleme, düzenleme, silme, arama, kategori filtreleme, sıralama ve
kalıcı favoriler desteklenir.

---

## İçindekiler

- [Özellikler](#özellikler)
- [Teknolojiler](#teknolojiler)
- [Kurulum ve Çalıştırma](#kurulum-ve-çalıştırma)
- [Mimari](#mimari)
- [Klasör Yapısı](#klasör-yapısı)
- [Varsayımlar](#varsayımlar)
- [Bilinen Sınırlamalar](#bilinen-sınırlamalar)
- [Komutlar](#komutlar)

---

## Özellikler

- **Ürün listesi**: görsel, ad, fiyat, kategori ve favori durumu ile.
- **Ürün detayı**: tam bilgi + düzenle/sil aksiyonları.
- **Ekle / Düzenle**: tek bir ortak formla, Zod tabanlı doğrulama.
- **Sil**: onay diyaloğu ile korumalı.
- **Arama**: isimle, 400 ms debounce'lu.
- **Kategori filtreleme**: API'den gelen kategorilerle, "Tümü" seçeneği dahil.
- **Sıralama**: isim (A→Z / Z→A) ve fiyat (artan / azalan); aktif seçim UI'da görünür.
- **Pull-to-Refresh**: veriyi API'den yeniden çeker.
- **Favoriler**: ayrı ekran, cihazda kalıcı (uygulama yeniden başlatılınca korunur).
- **Durum yönetimi**: yükleme (skeleton), hata (tekrar dene), boş liste/arama/favori durumları.
- **Toast** ile başarı/hata geri bildirimi.

---

## Teknolojiler

| Katman           | Seçim                              | Gerekçe                                                                             |
| ---------------- | ---------------------------------- | ---------------------------------------------------------------------------------- |
| Framework        | **Expo (SDK 57)**                  | `npm install && npx expo start` ile anında çalışır; native derleme gerektirmez.    |
| Dil              | **TypeScript (strict)**            | API tiplerinin sözleşme olarak tanımlanması, sürdürülebilir kod.                    |
| Navigasyon       | **Expo Router** (file-based)       | Klasör yapısı = navigasyon haritası; ekran organizasyonu kendini belgeler.         |
| Server state     | **TanStack Query**                 | Loading/error/refetch/cache otomatik; case'in durum matrisini tek pattern ile çözer. |
| Client state     | **Zustand + persist**              | Favoriler ve lokal CRUD farkları için hafif, açıklaması kolay store.               |
| Kalıcı depolama  | **AsyncStorage** (soyutlanmış)     | Expo Go ile ekstra native derleme gerektirmez (bkz. [Varsayımlar](#varsayımlar)).  |
| Form             | **React Hook Form + Zod**          | Doğrulama kuralları tek şemada deklaratif; add/edit aynı şemayı paylaşır.          |
| UI               | **Custom bileşenler** (StyleSheet) | Yeniden kullanılabilir bileşen mimarisini net gösterir; tek tema dosyası.          |
| HTTP             | **fetch tabanlı ince client**      | Ekstra bağımlılık yok; tek noktadan hata normalizasyonu ve timeout.               |

---

## Kurulum ve Çalıştırma

### Gereksinimler

- **Node.js 18+** (test: Node 22)
- **npm**
- Telefonda **Expo Go** uygulaması veya bir Android/iOS emülatörü

### Adımlar

```bash
# 1) Bağımlılıkları yükle
npm install

# 2) Geliştirme sunucusunu başlat
npm start
```

Ardından:

- **Fiziksel cihaz:** Terminalde çıkan QR kodu Expo Go ile okutun.
- **Android emülatör:** `npm run android`
- **iOS simülatör (macOS):** `npm run ios`

> **Ortam değişkeni gerekmez.** Uygulama varsayılan olarak `https://dummyjson.com` adresini kullanır.
> Farklı bir base URL/timeout için `.env.example` dosyasını `.env` olarak kopyalayıp değerleri düzenleyin.

---

## Mimari

### Temel ilke: Server state ↔ Client state ayrımı

- **Server state** (API'den gelen ürünler/kategoriler) → **TanStack Query** cache'inde tutulur.
- **Client state** (favoriler + lokal CRUD değişiklikleri) → **Zustand** store'larında yaşar.

Bu ayrım uygulamanın belkemiğidir ve aşağıdaki en kritik problemi çözer.

### DummyJSON CRUD simülasyonu ve "overlay" katmanı

DummyJSON'da `POST /products/add`, `PUT /products/{id}`, `DELETE /products/{id}` istekleri
**başarılı yanıt döner ama sunucuda kalıcı değişiklik yapmaz.** Naif bir yaklaşımda ürün eklenir,
listeye dönülür, `refetch` çalışır ve **eklenen ürün kaybolur.**

Çözüm: API verisini salt-okunur kabul edip tüm lokal değişiklikleri ayrı bir **overlay** katmanında
(`localChanges` store) tutmak. UI'ın gördüğü liste her zaman şu birleşimdir:

```
UI listesi = merge( API verisi , localChanges )
```

`mergeProductList()` saf fonksiyonu her render'da:

1. `deleted` id'leri API listesinden çıkarır,
2. `updated` yamalarını uygular,
3. `added` (lokal eklenen) ürünleri başa ekler.

Overlay, `refetch`'ten **bağımsız** yaşadığı için **Pull-to-Refresh** eklenen/güncellenen/silinen
ürünleri ezmez — iki gereksinim (canlı veri + kalıcı CRUD sonucu) çelişmeden karşılanır.

### Veri boru hattı (liste ekranı)

```
API verisi → mergeWithLocalChanges → kategori filtresi → isim filtresi → sıralama → UI
```

Sıralama daima en son ve client-side yapılır; böylece lokal eklenen ürünler de doğru sıralanır.
Sıralama query key'e girmez, bu yüzden gereksiz refetch tetiklemez.

### Arama + kategori hibrit stratejisi

DummyJSON'da `search` ve `category` **tek istekte birleşmez**. Uygulanan strateji:

| Durum            | Veri kaynağı                                                 |
| ---------------- | ----------------------------------------------------------- |
| Filtre yok       | `GET /products`                                             |
| Yalnız kategori  | `GET /products/category/{slug}`                             |
| Yalnız arama     | `GET /products/search?q=...` (debounce 400 ms)              |
| Arama + kategori | Arama endpoint'i → sonuç **client-side** kategoriye göre süzülür |

---

## Klasör Yapısı

```text
src/
├── app/                      # Expo Router — ekranlar (dosya = rota)
│   ├── _layout.tsx           # Root: Query/SafeArea/Gesture provider'ları, tema, ToastHost
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Tab bar: Ürünler | Favoriler
│   │   ├── index.tsx         # Ürün Listesi
│   │   └── favorites.tsx     # Favoriler
│   └── product/
│       ├── [id].tsx          # Ürün Detayı
│       ├── add.tsx           # Ürün Ekle
│       └── edit/[id].tsx     # Ürün Düzenle
│
├── api/                      # HTTP katmanı (fetch client, tipler, ürün uç noktaları)
├── hooks/                    # TanStack Query hook'ları + useDebounce + queryKeys
├── store/                    # Zustand store'ları (favorites, localChanges overlay)
├── components/
│   ├── ui/                   # Atomik bileşenler (Button, Input, EmptyState, ...)
│   └── product/              # Alan bileşenleri (ProductCard, ProductForm, ...)
├── lib/                      # Saf mantık: merge (overlay), sort, validation, storage, queryClient
├── constants/                # theme.ts, config.ts (env)
└── utils/                    # toast, format
```

---

## Varsayımlar

- **CRUD kalıcılığı lokaldir.** DummyJSON değişiklikleri kalıcılaştırmadığı için create/update/delete
  sonuçları overlay katmanında saklanır ve cihazda kalıcı tutulur (persist).
- **Lokal eklenen ürünlere negatif ID verilir** (`-Date.now()`). Böylece API'nin döndürdüğü
  ID'lerle asla çakışmaz. Bu ürünler için detay/düzenleme/silme işlemleri API'ye gitmez
  (sunucuda bulunmadıkları için 404 döner), doğrudan overlay üzerinde yapılır.
- **Arama isim (title) üzerinden yapılır** (case: "searching products by name"). Arama endpoint'i
  veri kümesini daraltmak için kullanılır, sonuç ayrıca isimle client-side süzülür.
- **Favoriler yalnızca ID listesi olarak** saklanır ve API'ye gönderilmez (case şartı). Bir ürün
  silinince favorilerden de otomatik düşürülür.
- **Sıralama ve birleşik filtreleme client-side** yapılır (küçük veri kümesi, gereksiz network yok).
- **Depolama olarak AsyncStorage** seçildi. Plan aşamasında MMKV düşünülmüştü; ancak MMKV Expo Go'da
  çalışmaz (development build gerektirir). Teslimin birincil şartı "talimatlarla anında çalışabilirlik"
  olduğundan AsyncStorage tercih edildi. Depolama `src/lib/storage.ts` içinde soyutlandığı için
  ileride MMKV'ye geçiş tek dosyalık değişikliktir.

---

## Bilinen Sınırlamalar

- Ürün başına tek görsel (`thumbnail`) desteklenir; çoklu görsel galerisi yoktur.
- Liste tüm ürünleri tek seferde çeker (~194 kayıt); sonsuz kaydırma (infinite scroll) uygulanmamıştır.
  Veri kümesi küçük olduğu için client-side işlem tercih edilmiştir.
- DummyJSON simülasyonu gereği, uygulama kapatılıp açıldığında API tarafındaki "gerçek" liste
  sıfırlanır; yalnızca lokal değişiklikler (overlay) ve favoriler kalıcıdır.

---

## Komutlar

| Komut                  | Açıklama                              |
| ---------------------- | ------------------------------------ |
| `npm start`            | Expo geliştirme sunucusu             |
| `npm run android`      | Android'de aç                        |
| `npm run ios`          | iOS'ta aç (macOS)                    |
| `npm run lint`         | ESLint kontrolü                      |
| `npm run lint:fix`     | ESLint otomatik düzeltme             |
| `npm run format`       | Prettier ile biçimlendir             |
| `npm run typecheck`    | TypeScript tip kontrolü              |

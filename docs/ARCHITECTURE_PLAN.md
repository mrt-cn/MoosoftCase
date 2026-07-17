# Restoran Menü Yönetimi — Mimari Plan

> Case: DummyJSON tabanlı mobil menü yönetim paneli (React Native / Expo)
> Stack: **Expo + Expo Router + TanStack Query + Zustand (MMKV persist) + React Hook Form + Zod + Custom UI**
> Süre: 5 gün

---

## 1. Teknoloji Kararları ve Gerekçeleri

| Katman | Seçim | Mülakatta savunma gerekçesi |
|---|---|---|
| Framework | **Expo (SDK güncel)** | Değerlendiren kişi `npm i && npx expo start` ile anında çalıştırır; native build gerektirmez |
| Dil | **TypeScript (strict)** | API tiplerinin sözleşme olarak tanımlanması, "clean & maintainable code" kriteri |
| Navigasyon | **Expo Router** (file-based) | Klasör yapısı = navigasyon haritası; ekran organizasyonu kendini belgeler |
| Server state | **TanStack Query** | Loading / error / refetch / cache yönetimi otomatik; case'in 9 durum listesinin çoğunu tek pattern çözer |
| Client state | **Zustand + persist middleware** | Favoriler tamamen client-side; küçük, açıklaması kolay, MMKV ile persist hazır |
| Depolama | **react-native-mmkv** | AsyncStorage'dan hızlı, senkron API; case örneklerinde geçiyor |
| Form | **React Hook Form + Zod** | Validasyon kuralları tek şemada deklaratif; add/edit aynı şemayı paylaşır |
| UI | **Custom component'ler (StyleSheet)** | "Reusable components" kriterini en net gösterir; theme dosyasıyla tutarlılık |
| HTTP | **fetch tabanlı ince api client** | Axios'a gerek yok; tek wrapper ile hata normalizasyonu |

**Kritik mimari ilke — Server state ↔ Client state ayrımı:**
Ürün verisi (API'den gelen) TanStack Query cache'inde; favoriler ve
lokal CRUD farkları (bkz. §3) Zustand'da yaşar. Bu ayrım mülakatta
anlatının belkemiği olmalı.

---

## 2. Klasör Yapısı

```text
src/
├── app/                        # Expo Router — ekranlar
│   ├── _layout.tsx             # Root: QueryClientProvider, tema, toast host
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tab bar: Ürünler | Favoriler
│   │   ├── index.tsx           # 1) Ürün Listesi
│   │   └── favorites.tsx       # 5) Favoriler
│   └── product/
│       ├── [id].tsx            # 2) Ürün Detayı
│       ├── add.tsx             # 3) Ürün Ekle
│       └── edit/[id].tsx       # 4) Ürün Düzenle
│
├── api/
│   ├── client.ts               # fetch wrapper: baseURL, timeout, hata normalizasyonu
│   ├── products.api.ts         # getProducts, getProduct, searchProducts,
│   │                           # getCategories, getByCategory, create, update, remove
│   └── types.ts                # Product, Category, PaginatedResponse (DummyJSON şemaları)
│
├── hooks/
│   ├── useProducts.ts          # useQuery — liste (kategori/arama parametreli)
│   ├── useProduct.ts           # useQuery — tekil ürün
│   ├── useCategories.ts        # useQuery — kategoriler (staleTime: Infinity)
│   ├── useProductMutations.ts  # useMutation — create/update/delete + cache güncelleme
│   └── useDebounce.ts          # arama inputu için (400ms)
│
├── store/
│   ├── favorites.store.ts      # Zustand + persist(MMKV): favoriteIds: number[]
│   └── localChanges.store.ts   # TUZAK ÇÖZÜMÜ: lokal eklenen/güncellenen/silinen ürünler (§3)
│
├── components/
│   ├── ui/                     # Atomik: Button, Input, Badge, Card,
│   │                           # EmptyState, ErrorView, LoadingOverlay, ConfirmDialog
│   └── product/
│       ├── ProductCard.tsx     # Liste kalemi: görsel, ad, fiyat, kategori, favori
│       ├── ProductForm.tsx     # ORTAK form — add & edit tek component (§5)
│       ├── FavoriteButton.tsx  # Kalp toggle (liste + detay ortak)
│       ├── CategoryFilter.tsx  # Yatay chip listesi + "Tümü"
│       ├── SortSheet.tsx       # Bottom sheet, 4 seçenek, aktif olan işaretli
│       └── SearchBar.tsx       # Debounce'lu arama inputu
│
├── lib/
│   ├── sort.ts                 # sortProducts(products, option) — saf fonksiyon
│   ├── validation.ts           # Zod şemaları (productSchema)
│   └── merge.ts                # mergeWithLocalChanges(apiData, localChanges) (§3)
│
├── constants/
│   └── theme.ts                # renkler, spacing, tipografi
└── utils/
    └── toast.ts                # başarı/hata geri bildirimi
```

---

## 3. ⚠️ TUZAK #1 — DummyJSON CRUD Simülasyonu (case'in asıl sınavı)

**Sorun:** `POST/PUT/DELETE` başarılı döner ama sunucuda **hiçbir şey değişmez**.
Naif implementasyon: ürün ekle → listeye dön → `invalidateQueries` → refetch → **ürün yok**.
Bu, adayların çoğunun düştüğü tuzak. Case "API Behavior Notice" bölümüyle bunu açıkça test ediyor.

**Çözüm — Local Changes Overlay katmanı:**

```text
UI'ın gördüğü liste = merge( API verisi , localChanges )
```

`localChanges.store.ts` (Zustand, MMKV persist):

```ts
{
  added:   Product[],            // lokal eklenen ürünler (id: Date.now() ile negatifleştirilmiş
                                 // veya API'nin döndürdüğü sahte id — çakışma notu §3.1)
  updated: Record<id, Partial<Product>>,  // lokal güncellemeler
  deleted: number[]              // lokal silinen id'ler
}
```

`mergeWithLocalChanges()` saf fonksiyonu her liste/detay render'ında:
1. API listesinden `deleted` id'leri çıkarır
2. `updated` yamalarını üstüne uygular
3. `added` ürünleri listeye ekler

**Mutation akışı (ör. create):**
1. `POST /products/add` gönder (case: "doğru isteği gönder" şartı)
2. Başarılı yanıt → ürünü `localChanges.added`'a yaz
3. Toast: "Ürün eklendi" → listeye dön; merge sayesinde **anında görünür**
4. Hata → toast + formda kal (veri kaybolmaz)

**Neden optimistic update değil de overlay?** Optimistic update tek başına
yetmez: pull-to-refresh veya cache invalidation sonrası API "gerçeği"
lokal değişiklikleri ezer. Overlay katmanı refetch'ten **bağımsız** yaşadığı
için Tuzak #2'yi de (aşağıda) çözer. Mülakatta bu gerekçeyi anlat.

### 3.1 Kenar durumlar
- **ID çakışması:** DummyJSON `POST /add` her zaman `id: 195` gibi sabit/ardışık id döner. Lokal eklenen ürünlere `-Date.now()` gibi negatif id ver → API id'leriyle asla çakışmaz. README'ye assumption olarak yaz.
- **Lokal eklenen ürünün detayı:** `GET /products/{-negatifId}` 404 döner → `useProduct` önce `localChanges.added` içinde arar, yoksa API'ye gider.
- **Lokal eklenen ürünü düzenleme/silme:** API'ye istek atma (id sunucuda yok, 404 döner); doğrudan `added` içinde güncelle/çıkar. (Alternatif: yine de isteği atıp yanıtı yok saymak — hangisini seçersen README'de belirt.)

---

## 4. ⚠️ TUZAK #2 — Pull-to-Refresh vs Lokal Değişiklikler

**Sorun:** Case hem "refresh'te veriyi API'den yeniden çek" hem de "CRUD sonuçları UI'da kalıcı görünsün" diyor. Naif çözümde refresh, eklediğin ürünü siler — jüri bunu ilk deneyecek şeylerden biri.

**Çözüm:** Refresh yalnızca TanStack Query cache'ini tazeler (`refetch()`); overlay (localChanges) dokunulmaz kalır. Merge tekrar çalışır → API'nin taze verisi + lokal farklar birlikte görünür. Böylece iki gereksinim çelişmeden karşılanır.

---

## 5. ⚠️ TUZAK #3 — Arama + Kategori + Sıralama Kombinasyonu

**Sorun:** DummyJSON'da `search` ve `category` filtresi **aynı istekte birleştirilemez** (`/products/search?q=x` kategori parametresi almaz). Case her ikisini de istiyor ama birlikte davranışı tanımlamıyor — bilinçli boşluk.

**Çözüm — hibrit strateji (README'ye assumption olarak yaz):**

| Durum | Veri kaynağı |
|---|---|
| Filtre yok | `GET /products?limit=0` (veya sayfalama) |
| Yalnız kategori | `GET /products/category/{c}` |
| Yalnız arama | `GET /products/search?q=...` (debounce 400ms) |
| Arama + kategori | Arama endpoint'i → sonucu **client-side** kategoriye göre filtrele |
| Sıralama | Her zaman **client-side**, merge SONRASI en son adım |

**Boru hattı sırası (kritik):**
```text
API verisi → mergeWithLocalChanges → kategori filtresi(gerekirse) → sortProducts → UI
```
Sıralamanın en sonda olması, lokal eklenen ürünlerin de doğru sıralanmasını garantiler.

- Query key tasarımı: `['products', { category, search }]` → filtre değişince otomatik doğru cache.
- Sıralama query key'e **girmez** (lokal işlem, gereksiz refetch yaratmasın).
- Aktif sıralama UI'da görünür: SortSheet'te işaret + liste üstünde etiket chip ("Fiyat ↑"). Case bunu açıkça istiyor.

---

## 6. ⚠️ TUZAK #4 — Favorilerin Kalıcılığı ve Sahipsiz Favoriler

- Favoriler **yalnızca id listesi** olarak MMKV'de tutulur (case: "Favorite product IDs should be stored locally"). Ürün objesi saklanmaz → bayat veri riski yok.
- Favoriler ekranı: id listesi → eldeki merge edilmiş üründen eşleştir; cache'te olmayan id için `GET /products/{id}` (TanStack Query `useQueries`).
- **Kenar durum:** Favorilenen ürün silinirse → silme mutation'ı favorilerden de id'yi düşürür (store'lar arası tek yönlü temizlik). Aksi halde Favoriler ekranında hayalet kart kalır.
- **Restart testi:** Uygulamayı kapat-aç → favoriler durmalı. Zustand `persist` + MMKV bunu bedavaya verir; jürinin test edeceği açık senaryo.
- Favori toggle **API'ye gitmez** (case açıkça söylüyor) — yanlışlıkla PUT atmak eksi puan.

---

## 7. Ekran Mimarisi

### 7.1 Ürün Listesi (`(tabs)/index.tsx`)
- `FlatList` + `ProductCard`; görseller `expo-image` (cache'li).
- Üstte: `SearchBar` → `CategoryFilter` (yatay chips, "Tümü" dahil) → sıralama butonu.
- `RefreshControl` → `refetch()` (Tuzak #2 çözümüyle güvenli).
- Kart aksiyonları: tıkla→detay; kalp→favori toggle; uzun bas veya "⋮" menü→Düzenle/Sil.
- Sil → `ConfirmDialog` ("Bu ürünü silmek istediğinize emin misiniz?") → onayda `DELETE` → overlay'e yaz → toast.
- **Durumlar:** ilk yükleme=skeleton; hata=`ErrorView`+Tekrar Dene; boş arama=`EmptyState` ("'x' için sonuç yok"); refresh=RefreshControl spinner'ı.

### 7.2 Ürün Detayı (`product/[id].tsx`)
- `useProduct(id)`: önce overlay, sonra API (bkz. §3.1).
- Görsel, ad, açıklama, fiyat, kategori, `FavoriteButton`, Düzenle → edit ekranı, Sil → ConfirmDialog → başarıda `router.back()`.

### 7.3 / 7.4 Ürün Ekle & Düzenle — **tek `ProductForm`**
```tsx
<ProductForm mode="add" | "edit" initialValues={product?} onSubmit={mutate} submitting={isPending} />
```
- RHF + `zodResolver(productSchema)`; edit modunda `defaultValues` mevcut üründen (case: "form mevcut bilgiyi göstermeli").
- Kategori alanı: API'den gelen listeyle **picker/bottom-sheet** — serbest metin değil ("Category must be selected" şartını ancak seçim garantiler).
- Submit sırasında buton disabled + spinner (form submission loading şartı).
- Tek form component'i = "reusable components" kriterine doğrudan kanıt.

### 7.5 Favoriler (`(tabs)/favorites.tsx`)
- Boş durum: `EmptyState` ("Henüz favori ürününüz yok") — case'in açık şartı.
- Kartlar liste ekranıyla **aynı `ProductCard`** — yeniden kullanım kanıtı #2.

---

## 8. Form Validasyonu (Zod şeması)

```ts
const productSchema = z.object({
  title:       z.string().trim().min(1, 'Ürün adı boş olamaz'),
  description: z.string().trim().optional(),
  price:       z.coerce.number({ message: 'Fiyat geçerli bir sayı olmalı' })
                .positive('Fiyat 0\'dan büyük olmalı'),
  category:    z.string().min(1, 'Kategori seçilmelidir'),
  thumbnail:   z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
});
```

- ⚠️ **İnce tuzak:** Image URL *opsiyonel* ama *girildiyse* valide edilecek — `optional().or(z.literal(''))` deseni tam bunu karşılar. Zorunlu yaparsan gereksinimi aşarsın, hiç valide etmezsen eksik kalırsın.
- Fiyat: `coerce` ile string→number; virgül girişini (`"12,5"`) submit öncesi noktaya çevir (TR klavye gerçeği).
- Hatalar alan altında kırmızı metin; ilk hatalı alana scroll.

---

## 9. Loading / Error / Empty Matrisi (case'in 9 maddesi → çözüm)

| Case gereksinimi | Çözüm |
|---|---|
| Initial loading | `isPending` → skeleton liste |
| Form submission loading | `mutation.isPending` → buton spinner + disabled |
| Refresh loading | `RefreshControl refreshing={isRefetching}` |
| Empty search results | `EmptyState` varyantı (aranan metni göster) |
| Empty favorites | `EmptyState` varyantı + "Ürünlere göz at" CTA |
| API request errors | `ErrorView` + Retry (`refetch`) |
| Create error | Toast + formda kal, girilen veri korunur |
| Update error | Toast + formda kal |
| Delete error | Toast; overlay'e YAZMA (yanıt başarısızsa UI'dan silme) |

Tek `EmptyState` ve tek `ErrorView` component'i, varyant prop'larıyla → yeniden kullanım kanıtı #3.

---

## 10. API Katmanı Detayı

```ts
// client.ts — tek noktadan hata normalizasyonu
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // timeout (AbortController, 10sn), !res.ok → ApiError fırlat,
  // network hatası → kullanıcı dostu mesaja çevir
}
```

- DummyJSON liste yanıtı sarmalıdır: `{ products, total, skip, limit }` — tip olarak modelle.
- `limit=0` tüm ürünleri döndürür (~194). Küçük veri seti → tam liste + client-side işlem savunulabilir; istersen `skip/limit` ile infinite scroll bonus.
- Kategoriler: `GET /products/categories` `{slug, name, url}` objeleri döner (eski sürümdeki string dizisi değil!) — filtre isteklerinde `slug`, UI'da `name` kullan. Bu güncel şema farkı sık hata kaynağı.
- `POST /products/add` `Content-Type: application/json` şart; yanıt gönderdiğin body + sahte id döner.

---

## 11. Git Commit Stratejisi (açık değerlendirme kriteri)

Conventional Commits + özellik bazlı ilerleme:

```text
chore: expo + typescript + eslint/prettier kurulumu
feat(api): dummyjson client ve product tipleri
feat(products): liste ekranı + ProductCard
feat(products): kategori filtresi ve arama (debounce)
feat(products): siralama (client-side)
feat(product-detail): detay ekranı
feat(form): ProductForm + zod validasyonu (add)
feat(form): edit modu ve PUT entegrasyonu
feat(products): silme + onay dialogu
feat(local-changes): overlay store — dummyjson crud simülasyonu çözümü
feat(favorites): mmkv persist + favoriler ekranı
feat(ux): loading/error/empty durumları
docs: README — kurulum, mimari, varsayımlar
```

Küçük, tek amaçlı commit'ler; "initial commit"e her şeyi gömmek eksi puan.

---

## 12. README İskeleti (teslim şartları birebir)

1. **Kurulum:** gereksinimler, `npm i`, `npx expo start`, Expo Go / emülatör notu
2. **Mimari:** server/client state ayrımı, overlay katmanı diyagramı, klasör yapısı
3. **Teknolojiler:** tablo + tek cümle gerekçeler (§1'deki tablo)
4. **Varsayımlar (assumptions):**
   - DummyJSON CRUD'u simüle eder → lokal overlay ile kalıcılık (persist edilir)
   - Arama+kategori API'de birleşmiyor → hibrit strateji
   - Lokal eklenen ürünlere negatif id
   - Favoriler yalnızca lokal, API'ye gönderilmez
   - Sıralama ve birleşik filtreleme client-side
5. **Bilinen sınırlamalar** (örn. çoklu görsel desteklenmiyor, tek thumbnail)

---

## 13. 5 Günlük Uygulama Planı

| Gün | İş | Çıktı |
|---|---|---|
| 1 | Kurulum, tema, api client, tipler, liste ekranı + ProductCard | Çalışan liste |
| 2 | Arama (debounce), kategori filtresi, sıralama, pull-to-refresh | Tam liste deneyimi |
| 3 | Detay ekranı, ProductForm (add+edit), Zod validasyon, mutations | CRUD uçtan uca |
| 4 | localChanges overlay, favoriler + MMKV persist, silme onayı | Tuzaklar çözülmüş |
| 5 | Tüm loading/error/empty durumları, polish, README, commit temizliği | Teslime hazır |

Gün 4'teki overlay işi en riskli parça — erkene çekilemiyorsa Gün 3'te mutation'larla birlikte iskeletini kur.

---

## 14. Mülakat Savunma Notları (muhtemel sorular)

- **"Refresh atınca eklediğin ürün neden kaybolmuyor?"** → Overlay katmanı refetch'ten bağımsız; merge her render'da yeniden uygulanıyor.
- **"Neden Redux değil?"** → Server state'i TanStack Query zaten çözüyor; kalan client state (favoriler + overlay) için Redux boilerplate'i gereksiz. Zustand 2 store'la aynı işi görüyor.
- **"Arama neden API'de, sıralama neden lokalde?"** → Arama veri kümesini küçültüyor (network değer katıyor); sıralama eldeki veriyle O(n log n), network maliyeti gereksiz.
- **"Favoriler neden sadece id?"** → Ürün verisi tek doğruluk kaynağında (query cache + overlay) kalsın; kopya obje = bayat veri riski.
- **"MMKV neden AsyncStorage değil?"** → Senkron ve ~30x hızlı; Zustand persist adaptörü mevcut. (AsyncStorage da kabul; tercih gerekçelendirilmiş olmalı.)

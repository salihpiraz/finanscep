# FinansCep

Mobil öncelikli, Tailwind CSS ile tasarlanmış bütçe ve harcama takipçisi. React + Vite ile yazıldı. Sunucu gerekmez; veriler tarayıcının `localStorage` alanında saklanır.

## Özellikler
- Aylık bütçe özeti, halka grafik ve ilerleme çubuğu
- Harcama kategorilerine göre donut grafik
- Ay gezinme (önceki aylara bakabilme)
- **Bütçe devri:** kullanılmayan bütçe bir sonraki aya otomatik aktarılır
- İşlem ekleme, düzenleme ve silme
- Tek elle kullanım için alt sabit "Hızlı İşlem Ekle" butonu
- Açık/koyu tema desteği (cihaz ayarına göre otomatik)

## Yerelde çalıştırma
```bash
npm install
npm run dev
```
Tarayıcıda `http://localhost:5173` adresini aç.

Üretim derlemesi:
```bash
npm run build
npm run preview
```

## GitHub'a yükleme
```bash
git init
git add .
git commit -m "FinansCep ilk sürüm"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/finanscep.git
git push -u origin main
```
`KULLANICI_ADIN/finanscep` kısmını kendi GitHub kullanıcı adın ve deponla değiştir. Depoyu önce GitHub üzerinde (boş olarak) oluşturman gerekir.

## Vercel ile yayınlama
1. [vercel.com](https://vercel.com) adresinde GitHub hesabınla giriş yap.
2. **Add New → Project** de, az önce GitHub'a yüklediğin `finanscep` deposunu seç.
3. Vercel, Vite projesini otomatik tanır:
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (veya `vite build`)
   - Output Directory: `dist`
4. **Deploy** butonuna bas. Birkaç saniye içinde canlı bir `https://finanscep-xxxx.vercel.app` bağlantısı alırsın.
5. `main` dalına her `git push` yaptığında Vercel otomatik olarak yeniden yayınlar.

## Giriş ekranı ve güvenlik kurulumu

Uygulamaya tek kullanıcılı (yalnızca `admin`), sunucu taraflı doğrulanan bir giriş ekranı eklendi. Şifre kontrolü **tarayıcıda değil**, Vercel'in sunucusuz fonksiyonlarında (`/api/login.js`) yapılır; bu yüzden sayfa kaynağına bakarak atlatılamaz.

### 1. Vercel'de ortam değişkenlerini ayarla
Proje panelinde **Settings → Environment Variables** yoluna git ve şunları ekle (Production + Preview):

| Değişken | Değer |
|---|---|
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD_HASH` | aşağıda üretilecek hash |
| `SESSION_SECRET` | aşağıda üretilecek rastgele anahtar |

Bu projeyi senin için hazırlarken örnek bir şifre ve hash ürettim (terminal çıktısında gördün). **O şifreyi kullanmak istemiyorsan**, kendi bilgisayarında Node ile yeni bir tane üretebilirsin:

```bash
node -e "
const crypto=require('crypto');
const pass=process.argv[1];
const salt=crypto.randomBytes(16);
const hash=crypto.scryptSync(pass,salt,64,{N:16384,r:8,p:1});
console.log('ADMIN_PASSWORD_HASH=scrypt:16384:8:1:'+salt.toString('hex')+':'+hash.toString('hex'));
" "BURAYA_KENDI_GUCLU_SIFREN"
```

`SESSION_SECRET` için:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Önemli:** `ADMIN_PASSWORD_HASH` ve `SESSION_SECRET` asla git deposuna veya koda yazılmaz — yalnızca Vercel'in ortam değişkenleri panelinde durur. `.env.example` sadece biçimi gösterir.

### 2. Alınan önlemler
- **Injection:** Uygulamada hiçbir SQL/NoSQL sorgusu kurulmuyor; şifre doğrudan `scrypt` ile hash karşılaştırmasına giriyor, bu yüzden klasik SQL/NoSQL injection vektörü yapısal olarak yok.
- **Brute-force:** Aynı IP+kullanıcı adı 15 dakikada 5 başarısız denemeden sonra 15 dakika kilitlenir (`api/_auth.js`).
- **Zamanlama saldırıları:** Kullanıcı adı yanlış olsa bile sahte bir hash ile aynı sürede `scrypt` karşılaştırması yapılır; tüm karşılaştırmalar `crypto.timingSafeEqual` ile sabit zamanlıdır.
- **Kullanıcı adı sızdırma (enumeration):** Hatalı girişlerde her zaman aynı genel mesaj döner ("Kullanıcı adı veya şifre hatalı").
- **Oturum çerezi:** `HttpOnly` (JS ile okunamaz → XSS ile çalınamaz), `Secure` (yalnızca HTTPS), `SameSite=Strict` (CSRF'e kapalı), 12 saatte sona erer.
- **CSRF:** Giriş isteğinin `Origin`/`Referer` başlığı sitenin kendi alan adıyla eşleşmiyorsa istek reddedilir.
- **Güvenlik başlıkları:** `vercel.json` içinde CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` tanımlı.
- **Fail-closed:** Ortam değişkenleri eksikse (`SESSION_SECRET` veya `ADMIN_PASSWORD_HASH` yoksa) sistem kimseyi içeri almaz, hata verir — "açık kapı" bırakmaz.

### 3. Dürüst sınırlar (bunları bilmelisin)
- **Veriler yine de yalnızca tarayıcıda (`localStorage`) tutulur.** Giriş ekranı, uygulamayı kimin açabileceğini kontrol eder; sunucuda saklanan bir veri olmadığı için teknik olarak "çalınacak" bir veritabanı da yoktur. Farklı cihaz/tarayıcıda giriş yapsan bile o cihazın kendi (muhtemelen boş) verisini görürsün.
- Bellek içi hız sınırlama, fonksiyon "soğuk başlarsa" (uzun süre kullanılmayan bir deploy'da) sıfırlanabilir. Kalıcı/çok bölgeli hız sınırlama istersen Vercel panelinden **Storage → Create Database → KV** ekleyip `api/_auth.js` içindeki sayaçları oraya taşımak gerekir — istersen bunu da ekleyebilirim.
- Bu kurulum kişisel/hobi projeler için güçlü ve gerçekçi bir savunma sağlar; bankacılık seviyesinde "kırılamaz" bir sistem değildir (örn. çok faktörlü doğrulama, WAF, 7/24 izleme içermez).

## Not
Tüm veriler yalnızca kullanıcının kendi tarayıcısında (`localStorage`) tutulur; hiçbir veri bir sunucuya gönderilmez. Farklı bir cihaz veya tarayıcıda açıldığında veriler görünmez — bu normaldir.

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

## Not
Tüm veriler yalnızca kullanıcının kendi tarayıcısında (`localStorage`) tutulur; hiçbir veri bir sunucuya gönderilmez. Farklı bir cihaz veya tarayıcıda açıldığında veriler görünmez — bu normaldir.

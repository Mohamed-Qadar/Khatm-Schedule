# HATİM ÇİZELGESİ VE OKUMA PROGRAMI SİSTEMİ

Türkçe arayüzlü, mobil uyumlu ve A4 PDF çıktısı üreten bir React uygulamasıdır. Uygulama iki modül içerir:

- Hatim Çizelgesi
- Okuma Programı

## Özellikler

- Hatim için ad, hatim no ve başlangıç tarihi alınır.
- Tarihler 30 cüz için 7 günlük aralıklarla otomatik oluşturulur.
- Hatim çıktıları tek PDF veya çoklu ZIP PDF olarak indirilebilir.
- Okuma Programı içinde Vize, Final ve Bütünleme bölümleri bulunur.
- Her bölümde şehir bazlı alt tablolar eklenebilir, satır eklenebilir, satır silinebilir ve alanlar düzenlenebilir.
- PDF çıktıları A4 portrait düzeninde, temiz kenarlıklarla ve okunaklı biçimde oluşturulur.

## Geliştirme

```bash
npm install
npm run dev
```

## Derleme

```bash
npm run build
```

## Not

Çoklu PDF indirme özelliği ZIP dosyası olarak çalışır. Her alt PDF, ayrı ve düzenli bir çıktı olacak şekilde oluşturulur.

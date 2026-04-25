# 🏥 Ameliyat Öncesi Hazırlık Simülasyonu

> Artırılmış Gerçeklik (AR) tabanlı, hastanın kendi ortamında ameliyat öncesi hazırlık sürecini yöneten mobil uygulama.

---

## 📌 Proje Özeti

Hasta, ameliyat öncesi yapması gerekenleri hatırlamak veya doğru uygulamak için telefon kamerasını açar. Uygulama, AR teknolojisi sayesinde gerçek ortama dijital rehberlik katmanı ekler: ilaç kullanımı, su tüketimi, beslenme kısıtları ve hastane çantası kontrolü adım adım gösterilir.

---

## ✨ Özellikler

### 💊 1. İlaç Kutusu Rehberi
- Kamera ile ilaç kutusuna yöneltince AR animasyonu tetiklenir
- Hapın nasıl alınacağı, dozu ve saati 3D arayüzde gösterilir
- Yanlış ilaç tespit edilirse kırmızı uyarı çerçevesi belirir

### 💧 2. Su Tüketimi Takibi
- AR su şişesi objesi odada görünür
- Günlük içilen su miktarı girdikçe şişe gerçek zamanlı dolar
- Hedef tamamlandığında konfeti animasyonu oynatılır

### 🥗 3. Beslenme Rehberi
- Masa yüzeyine 3D yiyecek modelleri yerleştirilir
- **Yeşil** → ameliyat öncesi izinli besinler
- **Kırmızı** → yasaklı besinler (ile kısa açıklama etiketi)
- Saat bazlı kısıtlar (örn: gece yarısından sonra aç kalma) ayrıca gösterilir

### 🧳 4. Hastane Çantası Checklist
- AR ile oda ortamında eşya listesi holografik olarak süzülür
- Hazırlanan eşyalar **yeşil** tik ile işaretlenir
- Eksik veya unutulan eşyalar **kırmızı** yanıp söner
- Liste kişiselleştirilebilir (isteğe göre eşya ekle/çıkar)

---

## 🛠️ Teknoloji Stack

| Katman | Teknoloji |
|---|---|
| Mobil Platform | iOS (ARKit) / Android (ARCore) |
| Cross-platform Framework | Expo (React Native) + Viro Community |
| 3D Modeller | GLTF / GLB formatı, Blender ile hazırlanmış |
| Backend (opsiyonel) | Firebase Realtime Database |
| UI/UX | Figma prototip → uygulama içi AR overlay |

---

## 📁 Proje Yapısı

```
ameliyat-oncesi-ar/
├── assets/
│   ├── models/           # 3D GLTF modeller (ilaç, şişe, yiyecekler, eşyalar)
│   ├── animations/       # AR animasyon dosyaları
│   └── icons/            # UI ikonları
├── src/
│   ├── ar/
│   │   ├── MedicineAR.js         # İlaç kutusu AR modülü
│   │   ├── WaterTrackerAR.js     # Su takip AR modülü
│   │   ├── NutritionAR.js        # Beslenme rehberi AR modülü
│   │   └── BagChecklistAR.js     # Hastane çantası AR modülü
│   ├── components/       # Genel UI bileşenleri
│   ├── screens/          # Ekran akışları
│   ├── data/
│   │   ├── medications.json      # İlaç bilgileri
│   │   ├── nutrition.json        # Beslenme kısıt verileri
│   │   └── checklist.json        # Çanta eşya listesi
│   └── utils/            # Yardımcı fonksiyonlar
├── ml-models/
│   └── object_classifier.tflite  # Nesne tanıma modeli
├── docs/
│   └── wireframes/       # Ekran tasarımları
├── tests/
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Kurulum

### Gereksinimler
- Node.js >= 18
- Unity 2022.3 LTS *(Unity AR Foundation kullanılıyorsa)*
- Xcode 15+ *(iOS için)*
- Android Studio + NDK *(Android için)*
- ARKit destekli iPhone (iOS 12+) veya ARCore destekli Android cihaz

### Adımlar

```bash
# Projeyi klonla
git clone https://github.com/kullanici/ameliyat-oncesi-ar.git
cd ameliyat-oncesi-ar

# Bağımlılıkları yükle
npm install

### 📱 iOS (Expo Go) Çalıştırma
iOS cihazınızda uygulamayı test etmek için şu adımları izleyin:

1. **Expo Go Yükleyin**: App Store'dan "Expo Go" uygulamasını indirin.
2. **Ağ Bağlantısı**: Bilgisayarınız ve iOS cihazınızın **aynı ağa** (aynı Wi-Fi veya aynı Hotspot) bağlı olduğundan emin olun.
3. **Sunucuyu Başlatın**: Terminalde aşağıdaki komutu çalıştırın:
   ```bash
   EXPO_OFFLINE=1 npx expo start --go
   ```
4. **QR Kodu Okutun**: 
   - Terminalde çıkan QR kodunu iPhone kamerasını kullanarak taratın.
   - "Expo Go'da Aç" bildirimine tıklayın.

### Android
```bash
npx expo run:android
```
```

---

## 🎯 Kullanım Akışı

```
Uygulama Açılır
     │
     ▼
Ana Menü → [ İlaç | Su | Beslenme | Çanta ]
     │
     ▼
Kamera Açılır → Yüzey Algılanır → AR İçerik Yerleştirilir
     │
     ▼
Kullanıcı Etkileşimi (dokunma / nesne tarama)
     │
     ▼
Görev Tamamlandı → Onay Animasyonu → İlerleme Kaydedilir
```

---

## 📊 Veri Akışı

```
Hasta Profili (yaş, ameliyat türü, ilaçlar)
        │
        ▼
Kişiselleştirilmiş İçerik Motoru
        │
   ┌────┴────┐
   │         │
Yerel DB   Firebase (senkron)
        │
        ▼
AR Overlay  ←  ML Modeli (nesne tanıma)
```

---

## 🔐 Güvenlik & Gizlilik

- Hasta verileri **yerel cihazda** şifreli saklanır (AES-256)
- Kişisel sağlık verisi buluta gönderilmez (isteğe bağlı sync)
- KVKK & GDPR uyumlu veri işleme politikası
- Kamera erişimi yalnızca AR oturumu süresince aktiftir

---

## 🗺️ Yol Haritası

- [x] Proje konsepti & wireframe
- [ ] 3D model asset pack hazırlama
- [ ] AR Foundation temel entegrasyonu
- [ ] İlaç kutusu modülü (MVP)
- [ ] Su takibi modülü (MVP)
- [ ] Beslenme modülü
- [ ] Hastane çantası checklist
- [ ] Doktor panosu (uzaktan takip)
- [ ] Çoklu dil desteği (TR / EN / DE)
- [ ] App Store & Google Play yayını

---

## 🤝 Katkıda Bulunma

1. Bu repoyu fork edin
2. Feature branch oluşturun: `git checkout -b feature/su-takibi`
3. Değişikliklerinizi commit edin: `git commit -m "feat: su takibi AR animasyonu eklendi"`
4. Branch'i push edin: `git push origin feature/su-takibi`
5. Pull Request açın

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

---

## 👥 Ekip

| Rol | Sorumluluk |
|---|---|
| AR Developer | Unity / ARKit / ARCore entegrasyonu |
| 3D Artist | Yiyecek, ilaç, eşya modelleri |
| ML Engineer | Nesne tanıma modeli eğitimi |
| UI/UX Designer | AR overlay tasarımı |
| Backend Developer | Firebase & hasta profil yönetimi |
| Sağlık Danışmanı | Tıbbi içerik doğrulaması |

---

> **Not:** Bu uygulama tıbbi tavsiye vermez. Tüm içerikler ilgili sağlık profesyonellerinin denetiminde hazırlanmalıdır.

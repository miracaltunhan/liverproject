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
- İlaç detay ekranında hatırlatıcı kurma desteği

### 💧 2. Su Tüketimi Takibi *(feature/water-tracker — tamamlandı)*
- AR su şişesi objesi (3D GLB model) gerçek ortama yerleştirilir
- Hızlı miktar butonları (200 ml, 300 ml, 500 ml) ve özel giriş desteği
- Şişe doldurma animasyonu (dökme + sıçrama efekti)
- Hedef tamamlandığında konfeti animasyonu
- **Şişe Tarayıcı (BottleScanner):** Kamera ile fotoğraf çekip Gemini AI ile şişe kapasitesi ve doluluk seviyesi otomatik analiz edilir
- Periyodik su hatırlatma bildirimleri (expo-notifications) — ayarlanabilir aralık
- Bildirim ayarları AsyncStorage ile kalıcı olarak saklanır

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

### 👤 5. Hasta Profili
- Ad, yaş, ameliyat tarihi ve kişisel bilgiler
- Su hedefi ve ilaç listesi profil üzerinden yönetilir

---

## 🛠️ Teknoloji Stack

| Katman | Teknoloji |
|---|---|
| Mobil Platform | iOS / Android |
| Cross-platform Framework | Expo SDK 54 (React Native) |
| Navigasyon | React Navigation v6 (Stack) |
| AR / 3D | @viro-community/react-viro, Three.js (@react-three/fiber, @react-three/drei) |
| 3D Modeller | GLB formatı (`bottle.glb`, `water.glb`) |
| Yapay Zeka | Google Gemini 2.0 Flash (şişe görüntü analizi) |
| Bildirimler | expo-notifications |
| Yerel Depolama | @react-native-async-storage/async-storage |
| Durum Yönetimi | React Context API (PatientContext) |
| Animasyon | react-native-reanimated, Lottie |
| ML (Nesne Tanıma) | TensorFlow.js + COCO-SSD |
| Güvenli Depolama | expo-secure-store |

---

## 📁 Proje Yapısı

```
liverproject/
├── assets/
│   ├── models/               # 3D GLB modeller (bottle.glb, water.glb)
│   ├── animations/           # Lottie animasyon dosyaları
│   └── markers/              # AR marker görselleri
├── src/
│   ├── ar/
│   │   ├── MedicineAR.tsx        # İlaç kutusu AR modülü
│   │   ├── WaterTrackerAR.tsx    # Su takip AR modülü
│   │   ├── NutritionAR.tsx       # Beslenme rehberi AR modülü
│   │   ├── BagChecklistAR.tsx    # Hastane çantası AR modülü
│   │   └── MockARView.tsx        # Geliştirme ortamı için mock AR
│   ├── components/
│   │   ├── BottleScanner.tsx     # Kamera + Gemini AI şişe analizi
│   │   ├── AROverlay.tsx         # AR kamera overlay
│   │   ├── ExpandedCardOverlay.tsx
│   │   ├── FeatureCard.tsx
│   │   ├── Header.tsx
│   │   ├── Medicine3DViewer.tsx
│   │   ├── MedicineInfoCard.tsx
│   │   ├── MedicineSelectOverlay.tsx
│   │   ├── OrbitalCard.tsx
│   │   └── ProgressBar.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── WaterTrackerScreen.tsx
│   │   ├── MedicineScreen.tsx
│   │   ├── MedicineDetailScreen.tsx
│   │   ├── NutritionScreen.tsx
│   │   ├── BagChecklistScreen.tsx
│   │   └── PatientProfileScreen.tsx
│   ├── services/
│   │   ├── NotificationService.ts  # Su hatırlatma bildirimleri
│   │   └── VisionService.ts        # Gemini AI görüntü analizi
│   ├── store/
│   │   └── PatientContext.tsx      # Global durum yönetimi
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   ├── data/
│   │   ├── medications.json
│   │   ├── nutrition.json
│   │   └── checklist.json
│   ├── utils/
│   │   ├── storage.ts              # AsyncStorage yardımcıları
│   │   ├── notifications.ts
│   │   ├── arDetect.ts
│   │   └── dateHelpers.ts
│   ├── mocks/
│   │   └── react-native-fs.js
│   └── theme/
│       ├── colors.ts
│       ├── typography.ts
│       ├── spacing.ts
│       └── index.ts
├── app.config.js
├── app.json
├── App.tsx
├── babel.config.js
├── eas.json
├── metro.config.js
├── package.json
└── README.md
```

---

## 🚀 Kurulum

### Gereksinimler
- Node.js >= 18
- Expo CLI
- Xcode 15+ *(iOS için)*
- Android Studio *(Android için)*

### Adımlar

```bash
# Projeyi klonla
git clone https://github.com/miracaltunhan/liverproject.git
cd liverproject

# Bağımlılıkları yükle
npm install

### 📱 iOS (Expo Go) Çalıştırma
iOS cihazınızda uygulamayı test etmek için şu adımları izleyin:

1. **Expo Go Yükleyin**: App Store'dan "Expo Go" uygulamasını indirin.
2. **Ağ Bağlantısı**: Bilgisayarınız ve iOS cihazınızın **aynı ağa** (aynı Wi-Fi veya aynı Hotspot) bağlı olduğundan emin olun.
3. **Sunucuyu Başlatın**: Terminalde aşağıdaki komutu çalıştırın:
   ```bash
   npx expo start --go
   ```
4. **QR Kodu Okutun**: 
   - Terminalde çıkan QR kodunu iPhone kamerasını kullanarak taratın.
   - "Expo Go'da Aç" bildirimine tıklayın.

> **Not:** Expo Go ortamında push bildirimleri ve bazı native modüller kısıtlıdır; tam deneyim için development build kullanın.

### Android (Expo Go)
```bash
npx expo start --go
```

### Development Build (Önerilen)
```bash
# Android
eas build -p android --profile development

# iOS
eas build -p ios --profile development
```
```

---

## 🎯 Kullanım Akışı

```
Uygulama Açılır
     │
     ▼
Ana Menü → [ İlaç | Su | Beslenme | Çanta | Profil ]
     │
     ▼
İlgili Ekran Açılır
     │
     ├─ Su Takibi → Miktar gir / Şişe Tarayıcı ile kameradan oku
     │               → AR şişe animasyonu → Bildirim hatırlatıcısı ayarla
     │
     ├─ İlaç → İlaç seç → AR 3D bilgi kartı → Hatırlatıcı kur
     │
     ├─ Beslenme → AR yiyecek modelleri → İzinli / Yasaklı görüntüle
     │
     └─ Çanta → Checklist → AR hologram eşya listesi → Tikleme
```

---

## 📊 Veri Akışı

```
Hasta Profili (ad, yaş, ameliyat tarihi, ilaçlar, su hedefi)
        │
        ▼
PatientContext (React Context — global state)
        │
   ┌────┴────────────────┐
   │                     │
AsyncStorage          AR Ekranları
(kalıcı saklama)      (WaterTrackerAR, MedicineAR…)
        │
        ▼
Bildirim Servisi ← NotificationService.ts
        │
        ▼
Gemini AI API ← VisionService.ts (şişe fotoğraf analizi)
```

---

## 🔐 Güvenlik & Gizlilik

- Hasta verileri **yerel cihazda** saklanır (AsyncStorage / expo-secure-store)
- Kişisel sağlık verisi buluta gönderilmez
- Kamera erişimi yalnızca AR oturumu ve şişe tarama süresince aktiftir
- KVKK uyumlu veri işleme

---

## 🗺️ Yol Haritası

- [x] Proje konsepti & wireframe
- [x] 3D model asset'leri (bottle.glb, water.glb)
- [x] AR mock görünümü (geliştirme ortamı)
- [x] İlaç kutusu modülü
- [x] Su takibi modülü (AR şişe, animasyon, bildirimler)
- [x] Şişe Tarayıcı — Gemini AI görüntü analizi
- [x] Beslenme rehberi modülü
- [x] Hastane çantası checklist
- [x] Hasta profili ekranı
- [x] Bildirim servisi (periyodik su hatırlatıcıları)
- [ ] Doktor panosu (uzaktan takip)
- [ ] Çoklu dil desteği (TR / EN)
- [ ] App Store & Google Play yayını

---

## 🤝 Katkıda Bulunma

1. Bu repoyu fork edin
2. Feature branch oluşturun: `git checkout -b feature/yeni-ozellik`
3. Değişikliklerinizi commit edin: `git commit -m "feat: açıklama"`
4. Branch'i push edin: `git push origin feature/yeni-ozellik`
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

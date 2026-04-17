# Test Rehberi — Ameliyat Öncesi Hazırlık AR Uygulaması

Bu belgede uygulamayı **üç farklı yöntemle** nasıl test edeceğiniz adım adım açıklanmıştır.

---

## 1. Expo Go ile Hızlı Test (UI + Mock AR)

Herhangi bir build gerektirmez. AR modülleri **Mock (simülasyon) modunda** çalışır — gerçek ViroReact yerine kamera önizlemesi ve AR çerçeve animasyonu gösterilir.

### Gereksinimler
| | |
|---|---|
| Node.js | >= 18 |
| Telefon | iOS veya Android |
| Uygulama | **Expo Go** (App Store / Play Store'dan indir) |

### Adımlar

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. Geliştirici sunucusunu başlat
npx expo start
```

3. Terminalde görünen **QR kodu** telefonundaki Expo Go ile tara.
4. Uygulama telefonuna yüklenir ve çalışır.

### Expo Go'da Ne Çalışır?

| Özellik | Durum |
|---|---|
| Ana ekran & navigasyon | ✅ Tam |
| İlaç takibi UI | ✅ Tam |
| Su takibi UI | ✅ Tam |
| Beslenme rehberi UI | ✅ Tam |
| Çanta listesi UI | ✅ Tam |
| Hasta profili | ✅ Tam |
| AR Modülleri (Mock) | ✅ Kamera + simülasyon çerçevesi |
| Gerçek 3D AR nesneler | ❌ EAS Dev Client gerekir |

---

## 2. EAS Dev Client ile Tam AR Testi (Önerilen)

ViroReact native modülleri içeren özel bir build alırsınız. Gerçek AR deneyimi bu yöntemle test edilir.

### Ön Hazırlık

```bash
# EAS CLI'yı kur
npm install -g eas-cli

# Expo hesabına giriş yap
eas login

# Projeyi EAS'a bağla (ilk defada)
eas init
```

> `app.config.js` içindeki `extra.eas.projectId` değerini `eas init` çıktısındaki proje ID ile güncelle.

### Development Build Alma

```bash
# Android (APK — dahili test)
eas build -p android --profile development

# iOS (ipa — TestFlight veya dahili dağıtım)
eas build -p ios --profile development
```

Build tamamlandığında EAS panelinden APK/IPA'yı indir ve cihaza yükle.

### Dev Client Üzerinden Başlatma

```bash
npx expo start --dev-client
```

Cihazdaki **Expo Dev Client** uygulamasını aç → QR'ı tara → Uygulama tam AR modunda açılır.

---

## 3. React Native CLI ile Yerel Build (İleri Düzey)

Bu yöntemde Metro bundler ve Xcode/Android Studio doğrudan kullanılır.

```bash
# Android
npx react-native run-android

# iOS (Mac gerekir)
cd ios && pod install && cd ..
npx react-native run-ios
```

> Viro kütüphanesi için `metro.config.js` içindeki asset uzantıları gereklidir (`vrx`, `obj`, `mtl`, `glb`, `gltf`, `bin`).

---

## 4. Özellik Bazlı Test Senaryoları

### 4.1 — İlaç Zamanlaması (MedicineAR)

1. Ana ekranda **"İlaç Takibi"** kartına dokun.
2. İlaç listesinin yüklendiğini doğrula.
3. **"AR Görünümü"** butonuna bas.
4. Expo Go'da: Kamera açılır, ilaç kutusu ikonu ve açıklama görünür.
5. EAS Dev Client'ta: ARKit/ARCore başlar, 3D ilaç kutusu yüzeye yerleşir.

### 4.2 — Su Takibi (WaterTrackerAR)

1. **"Su Takibi"** ekranını aç.
2. `+` ikonuyla bardak ekle — sayacın güncellendiğini kontrol et.
3. AR görünümüne geç.
4. Expo Go'da: Animasyonlu su dolum çubuğu ve yüzde göstergesi görünür.

### 4.3 — Beslenme Rehberi (NutritionAR)

1. **"Beslenme"** ekranını aç.
2. İzinli / yasak besin sayılarının doğru listelendiğini kontrol et.
3. AR görünümünde yeşil ✓ ve kırmızı ✕ rozetlerin sayıları eşleşmeli.

### 4.4 — Çanta Listesi (BagChecklistAR)

1. **"Hastane Çantası"** ekranını aç.
2. Birkaç eşyayı işaretle (packed).
3. AR görünümünde ilerleme çubuğunun ve `X / Y eşya hazır` metninin güncellendiğini doğrula.

### 4.5 — Nesne Tarama (ObjectRecognition)

1. **"Nesne Tarama"** ekranını aç.
2. Expo Go'da: Tarama halkası ve "ML Tanıma Hazır" mesajı görünür.
3. EAS Dev Client'ta: Kamera nesneye yöneltildiğinde ViroReact ARObjectMarker tanımlı etiketleri tespit eder.

---

## 5. Sık Karşılaşılan Sorunlar

| Sorun | Neden | Çözüm |
|---|---|---|
| `Unable to resolve module @viro-community/react-viro` | Expo Go'da native modül eksik | Normaldir — Mock AR devreye girer. EAS Dev Client'a geç |
| Kamera izni reddedildi | iOS/Android sistem izni | Ayarlar → Uygulama → Kamera izni ver |
| QR kodu taranmıyor | Aynı Wi-Fi'de değil | Bilgisayar ve telefon aynı ağda olmalı; `npx expo start --tunnel` dene |
| `eas build` başarısız | EAS hesabı bağlı değil | `eas login` → `eas init` sırasıyla çalıştır |
| `expo-secure-store` okuma hatası | Cihaz şifrelemesi kapalı | Android'de ekran kilidi aktif olmalı |
| AR yüzey algılanamıyor | Yetersiz ışık | Mekânı aydınlat; kamerayı yavaşça hareket ettir |

---

## 6. Ortam Değişkenleri

`.env.example` dosyasını `.env` olarak kopyala ve değerleri doldur:

```bash
cp .env.example .env
```

| Değişken | Açıklama |
|---|---|
| `APP_ENV` | `development` / `preview` / `production` |

---

## 7. Hızlı Başvuru Komutları

```bash
npx expo start            # Expo Go için Metro sunucu
npx expo start --dev-client  # EAS Dev Client için
eas build -p android --profile development  # Android dev build
eas build -p ios --profile development      # iOS dev build
eas build -p android --profile preview      # Internal test APK
```

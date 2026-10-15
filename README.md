# Tes IQ & EQ v2

Rombak total dari `tes-iq-eq-app`: **tanpa Gemini, tanpa backend, 100% offline**.
Satu UI Expo (React Native + TypeScript) untuk Android/iOS, dan versi web-nya dibungkus Electron untuk Windows.

## Struktur
```
packages/core      logika bersama (TypeScript): bank soal JSON, mesin tes, skor, pengacakan
  data/iq|eq/      8 file JSON: {easy,normal,hard,extreme}.json × 100 soal
apps/app           Expo SDK 52 + expo-router (Android, iOS, web)
apps/desktop       Electron: memuat build web Expo lewat protokol app://bundle (origin tetap)
scripts/gen        generator soal (deterministik, jawaban dihitung & diverifikasi program)
scripts/validate.ts  validator bank soal
```

## Perintah
```
npm run gen:iq     # bangun ulang 400 soal IQ
npm run gen:eq     # rakit 400 soal EQ dari scripts/gen/eq/*.mjs (+ penyeimbang panjang opsi)
npm run validate   # cek 100 soal/tingkat, tanpa duplikat, 4 opsi unik, kategori valid
npm test           # unit test mesin tes & skor
```

## Status
- [x] Fase 1 — core (engine, skor, acak, riwayat soal), validator, test
- [x] Fase 1 — 400 soal IQ (25 pola angka · 20 matematika · 20 logika · 15 analogi · 10 klasifikasi · 10 spasial per tingkat)
- [x] Fase 2 — 400 soal EQ (8 aspek × 4 tingkat; ditulis manual, panjang opsi diseimbangkan agar jawaban benar tidak bisa ditebak dari panjangnya)
- [x] Fase 3 — UI Expo (mobile + web): beranda, pilih mode, tes ber-timer, hasil, tinjau jawaban, riwayat, statistik & lencana, tentang
- [x] Fase 4 — Electron untuk Windows (installer NSIS + versi portable)

## Cara kerja pengacakan
Tiap sesi: soal diambil acak dari pool (prioritas yang belum pernah muncul, seimbang antar-kategori),
urutan soal diacak penuh, urutan opsi diacak. ID soal yang sudah muncul dicatat (`SeenMap`) sehingga
sesi berikutnya tidak mengulang soal sampai pool tingkat itu habis.

## Menjalankan (butuh internet; Node >= 20.19.4)
Jalankan SEMUA perintah dari folder root repo (yang berisi `packages/` dan `apps/`), bukan dari `apps/app`.

Pemasangan pertama (sekali saja):
```
npm run app:setup
```
Perintah ini menjalankan `npm install`, lalu `expo install` untuk memasang React, React Native, expo-router, dan
paket pendukung lain pada versi yang cocok dengan Expo SDK 57.

Sehari-hari:
```
npm run app            # lalu scan QR dengan Expo Go (Android/iOS), tekan w untuk web
npm run app:web        # langsung di browser
npm run app:android
npm run app:export     # hasil statis web di apps/app/dist (dibungkus Electron)
```

Kode UI ditulis tanpa bisa dijalankan di sandbox pembuatnya. Logika inti (`packages/core`) diuji otomatis (`npm run test:all`).

### Masalah yang sering muncul
| Gejala | Penyebab | Solusi |
|---|---|---|
| `Unable to resolve module ../../App from node_modules/expo/AppEntry.js` | `expo` dijalankan dari folder root, yang tidak punya titik masuk aplikasi | Pakai `npm run app` / `npm run app:export` dari root (skrip itu masuk ke `apps/app`) |
| `Project is incompatible with this version of Expo Go ... SDK 57 vs SDK 52` | Versi SDK di project berbeda dengan Expo Go di ponsel | Proyek ini memakai SDK 57. Jangan jalankan paket lama; ulangi `npm run app:setup` |
| Error aneh setelah ganti versi paket | `node_modules` atau `package-lock.json` lama masih tersisa | Hapus `node_modules` dan `package-lock.json` di root, lalu `npm run app:setup` |
| `expo-doctor` memberi peringatan versi | Versi paket tidak selaras | `cd apps/app` lalu `npx expo install --fix` |

Saran: simpan project di path tanpa spasi (mis. `C:\dev\tes-iq-eq`) untuk menghindari masalah alat build.

## Mengubah jadi aplikasi yang bisa dipasang

Expo Go hanya untuk pengembangan: aplikasi berhenti bila komputer/Metro mati. Untuk dipakai sehari-hari, buat build mandiri.

### Android (.apk)
```
npm install -g eas-cli          # sekali saja
eas login                       # akun gratis di expo.dev
cd apps/app
eas build:configure             # sekali saja, menambahkan projectId ke app.json
npm run android:apk             # dari root; build berjalan di server Expo
```
Hasilnya tautan unduh `.apk` yang bisa dipasang langsung di ponsel (izinkan "pasang dari sumber tidak dikenal").
Untuk Google Play pakai profil `production` (menghasilkan `.aab`) dan ganti `com.example.tesiqeq` dengan ID milikmu.
Build lokal tanpa akun: `npx expo prebuild` lalu build dengan Android Studio (butuh JDK + Android SDK).

### iOS
Hanya lewat EAS Build dan membutuhkan akun Apple Developer berbayar (sekitar US$99/tahun). Tanpa itu, iOS hanya bisa lewat Expo Go.

### Windows (.exe)
Lihat bagian berikut. `npm run desktop:build` memanggil `scripts/build-web.mjs`, yang memeriksa prasyarat dan menyimpan log
lengkap ke `export-log.txt` bila build web gagal.

## Windows (.exe)
```
npm install
npm run desktop:dev      # build web -> salin ke apps/desktop/web -> buka jendela Electron
npm run desktop:build    # sama, lalu hasilkan installer di apps/desktop/release/
```
- Hasil: `TesIQEQ-Setup-<versi>.exe` (installer) dan `TesIQEQ-Portable-<versi>.exe` (tanpa instalasi).
- Bangun di Windows. Di Linux/macOS, electron-builder memerlukan Wine untuk target Windows.
- Riwayat tes disimpan di localStorage dengan origin tetap `app://bundle`, jadi tidak hilang saat aplikasi ditutup.
- Mode pengembangan dengan hot reload: jalankan `npx expo start --web` di apps/app, lalu
  `TESIQEQ_DEV_URL=http://localhost:8081 npm start -w @tesiqeq/desktop`.
- Ganti `appId` dan identifier bundle (`com.example.tesiqeq`) sebelum merilis.

## Belum ada
- Mini-game dan artikel dari aplikasi lama.
- Penandatanganan kode (code signing) untuk installer Windows, sehingga SmartScreen bisa menampilkan peringatan.

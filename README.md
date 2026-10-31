# 🧮 Modern & Şık Web Hesap Makinesi (Calculator)

Modern, duyarlı (responsive) ve şık tasarıma sahip web tabanlı Hesap Makinesi uygulaması. **HTML5**, **CSS3**, **Tailwind CSS** ve saf **Modern JavaScript (ES6+)** ile sıfırdan geliştirilmiştir.

![Calculator Preview](https://img.shields.io/badge/Status-Complete-emerald?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)

---

## ✨ Özellikler

- **Modern & Glassmorphism Tasarım**: Zarif cam efekti, yumuşak gölgeler ve neon parıltılarla donatılmış estetik arayüz.
- **Tam Fonksiyonel İşlemler**:
  - Dört İşlem: Toplama (`+`), Çıkarma (`−`), Çarpma (`×`), Bölme (`÷`)
  - Yüzde Alma (`%`): Akıllı yüzde hesaplama (ör. `200 + 10% = 220` veya `50% = 0.5`)
  - İşaret Değiştirme (`±`): Pozitif/negatif değer geçişi
  - Hassas Temizleme: `C` (mevcut girişi temizleme) ve `AC` (hepsini temizleme)
  - Geri Al / Sil (`⌫`): Hatalı girilen son basamağı veya seçili operatörü geri alma
- **Gelişmiş Kayan Nokta Hassasiyeti**: JavaScript'in `0.1 + 0.2 = 0.30000000000000004` gibi standart kayan nokta hatalarını önleyen hassas yuvarlama algoritması.
- **Sıfıra Bölünme Koruması**: Sıfıra bölme durumlarında çökmeyi önleyen bilgilendirici uyarı mekanizması (`Sıfıra bölünemez`).
- **Dinamik Yazı Boyutu**: Ekrana sığmayan uzun basamaklı sayılarda otomatik küçülen ve taşma yapmayan ekran.
- **Klavye Giriş Desteği**: Numpad ve standart klavye tuşlarıyla tam entegrasyon; tuş basıldığında ekrandaki butonun da basılması (animasyonlu geri bildirim).
- **Karanlık / Aydınlık Tema (Dark / Light Mode)**: Tercihinizi hatırlar (`localStorage` entegrasyonu) ve tek tıkla yumuşak geçiş sağlar.
- **İşlem Geçmişi (History Drawer)**: Son 30 işlemi hafızada tutar. Geçmişteki bir sonuca tıklayarak mevcut ekrana aktarabilir ve üzerinde hesaplamaya devam edebilirsiniz.
- **Etkileşimli Ses Efektleri**: Web Audio API kullanılarak üretilen yumuşak tuş tıklama ve işlem tamamlama sesleri (istenirse tek tıkla kapatılabilir).
- **%100 Duyarlı (Mobile-First Responsive)**: Akıllı telefonlar, tabletler ve masaüstü monitörlerde kusursuz görüntüleme.

---

## ⌨️ Klavye Kısayolları

| Tuş | İşlev |
| :--- | :--- |
| `0` - `9` | Sayı girişi |
| `.` veya `,` | Ondalık nokta |
| `+` | Toplama |
| `-` | Çıkarma |
| `*` veya `x` | Çarpma |
| `/` | Bölme |
| `Enter` veya `=` | Hesapla (Sonucu Göster) |
| `Backspace` | Son karakteri sil / Operatörü geri al |
| `Escape` veya `c` | Temizle (`C` / `AC`) |
| `%` | Yüzde hesapla |

---

## 🚀 Kurulum ve Çalıştırma

Uygulama herhangi bir derleyici veya bağımlılık yükleme adımı gerektirmez.

### 1. Depoyu Klonlayın
```bash
git clone https://github.com/Muhammed-Cosgun/basit-hesap-makinesi.git
cd basit-hesap-makinesi
```

### 2. Tarayıcıda Açın
Doğrudan `index.html` dosyasını tarayıcınızda çift tıklayarak veya herhangi bir yerel sunucu ile çalıştırabilirsiniz:

```bash
# Python ile:
python -m http.server 8000

# veya Node.js / npx ile:
npx serve .
```

---

## 📁 Proje Yapısı

```
basit-hesap-makinesi/
├── index.html       # Semantik HTML5 iskeleti ve Tailwind CSS bileşenleri
├── style.css        # Özel cam (glassmorphism) efektleri, buton animasyonları ve stiller
├── script.js        # Hesap makinesi motoru, klavye dinleyicileri ve durum yönetimi
├── test.js          # Kapsamlı otomatik test paketi (15 farklı senaryo)
└── README.md        # Proje dokümantasyonu
```

---

## 🧪 Testler

Uygulamanın tüm mantıksal fonksiyonları (dört işlem, ondalık hassasiyeti, işaret değişimi, yüzde, klavye eşleşmeleri ve hata yönetimi) `test.js` ile test edilmiştir:

```bash
node test.js
```

---

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) kapsamında açık kaynak olarak sunulmuştur.

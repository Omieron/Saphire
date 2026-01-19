# 🔷 Saphire - Production Quality Control System

Saphire, üretim süreçlerini yönetmek ve kalite kontrol formlarını dijitalleştirmek için tasarlanmış kapsamlı bir Spring Boot uygulamasıdır.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Proje Yapısı](#-proje-yapısı)
- [Kurulum](#-kurulum)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Veritabanı Şeması](#-veritabanı-şeması)
- [Güvenlik](#-güvenlik)
- [Geliştirme Rehberi](#-geliştirme-rehberi)

---

## ✨ Özellikler

### 🏭 Master Data Yönetimi
- **Şirket (Company)**: Çoklu şirket desteği
- **Lokasyon (Location)**: Fabrika/tesis yönetimi
- **Makine (Machine)**: Makine envanteri ve durum takibi
- **Ürün (Product)**: Ürün tanımları ve kodları
- **Kullanıcı (User)**: Rol tabanlı kullanıcı yönetimi (ADMIN, SUPERVISOR, OPERATOR)

### 🛤️ Üretim Rotaları
- **Product Routes**: Ürünlere özel üretim adımları
- **Route Steps**: Sıralı veya paralel üretim adımları
- **Step-Machine Mapping**: Her adım için uygun makine tanımları

### 📦 Üretim Takibi
- **Product Instance**: Her üretim partisi/birimi için takip
- **Production Steps**: Gerçek zamanlı üretim adımı durumları
- **Machine Status**: Anlık makine durumu (IDLE, RUNNING, MAINTENANCE, vb.)

### 📝 Kalite Kontrol (QC) Sistemi
- **Dinamik Form Şablonları**: Kod yazmadan özelleştirilebilir QC formları
- **Çoklu Input Tipleri**: NUMBER, DECIMAL, PASS_FAIL, TEXT, SELECT, PHOTO, SIGNATURE
- **Otomatik Değerlendirme**: Min/max, tolerans, hedef değer kontrolü
- **Onay Akışı**: Draft → Submitted → Approved/Rejected

---

## 🛠 Teknoloji Stack

| Kategori | Teknoloji |
|----------|-----------|
| **Framework** | Spring Boot 3.4.1 |
| **Database** | PostgreSQL 15+ |
| **ORM** | Spring Data JPA + Hibernate 6 |
| **Security** | Spring Security + JWT |
| **JSON** | Jackson + Hypersistence Utils (JSONB) |
| **Validation** | Jakarta Validation |
| **Build** | Maven |
| **Java** | 17+ |

---

## 📁 Proje Yapısı

```
src/main/java/com/crownbyte/Saphire/
├── config/                    # Konfigürasyon sınıfları
│   └── SecurityConfig.java    # Spring Security ayarları
│
├── controller/                # REST API Controller'lar
│   ├── AuthController.java    # Kimlik doğrulama
│   ├── CompanyController.java
│   ├── LocationController.java
│   ├── MachineController.java
│   ├── UserController.java
│   ├── ProductController.java
│   ├── ProductInstanceController.java
│   ├── QcFormTemplateController.java
│   └── QcFormRecordController.java
│
├── dto/                       # Data Transfer Objects
│   ├── request/               # API istek DTO'ları
│   │   ├── LoginRequest.java
│   │   ├── UserRequest.java
│   │   ├── CompanyRequest.java
│   │   ├── QcFormTemplateRequest.java
│   │   └── ...
│   └── response/              # API yanıt DTO'ları
│       ├── ApiResponse.java   # Generic wrapper
│       ├── PageResponse.java  # Sayfalama
│       ├── LoginResponse.java
│       └── ...
│
├── entity/                    # JPA Entity'ler
│   ├── base/
│   │   └── BaseEntity.java    # Ortak alanlar (createdAt, updatedAt)
│   ├── master/                # Master data
│   │   ├── CompanyEntity.java
│   │   ├── LocationEntity.java
│   │   ├── MachineEntity.java
│   │   ├── UserEntity.java
│   │   └── enums/
│   ├── route/                 # Üretim rotaları
│   │   ├── ProductRouteEntity.java
│   │   ├── ProductRouteStepEntity.java
│   │   └── enums/
│   ├── production/            # Üretim takibi
│   │   ├── ProductInstanceEntity.java
│   │   ├── ProductionStepEntity.java
│   │   └── enums/
│   └── qc/                    # Kalite kontrol
│       ├── QcFormTemplateEntity.java
│       ├── QcFormRecordEntity.java
│       └── enums/
│
├── repository/                # Spring Data JPA Repository'ler
│   ├── CompanyRepository.java
│   ├── UserRepository.java
│   └── ...
│
├── security/                  # Güvenlik bileşenleri
│   ├── JwtService.java        # Token oluşturma/doğrulama
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
│
└── service/                   # İş mantığı
    ├── impl/                  # Service interface'leri
    │   ├── CompanyServiceImpl.java
    │   └── ...
    ├── CompanyService.java    # Service implementasyonları
    └── ...
```

---

## 🚀 Kurulum

### Gereksinimler
- Java 17+
- Maven 3.8+
- PostgreSQL 15+
- Docker (opsiyonel)

### 1. Veritabanı Kurulumu

```bash
# Docker ile PostgreSQL
docker run -d \
  --name saphire-db \
  -e POSTGRES_DB=production_system \
  -e POSTGRES_USER=vacanza_master \
  -e POSTGRES_PASSWORD=vacanza_password \
  -p 5434:5432 \
  postgres:15
```

### 2. Uygulamayı Çalıştırma

```bash
# Projeyi clone'la
cd Saphire

# Bağımlılıkları indir ve çalıştır
mvn spring-boot:run
```

Uygulama `http://localhost:8080` adresinde çalışacaktır.

### 3. Konfigürasyon

`application.yaml` dosyasını ortamınıza göre düzenleyin:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5434/production_system
    username: vacanza_master
    password: vacanza_password
  jpa:
    hibernate:
      ddl-auto: update  # Prod'da 'validate' kullanın

jwt:
  secret: your-256-bit-secret-key-here
  expiration: 28800000  # 8 saat
```

---

## 📚 API Dokümantasyonu

### 🔐 Kimlik Doğrulama

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/v1/auth/register` | POST | Yeni kullanıcı kaydı |
| `/api/v1/auth/login` | POST | Giriş yapma, JWT token alma |
| `/api/v1/auth/me` | GET | Mevcut kullanıcı bilgisi |

#### Örnek: Kullanıcı Kaydı
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "ADMIN"
  }'
```

#### Örnek: Giriş
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Yanıt:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzM4NCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 28800000,
    "user": {
      "id": 1,
      "username": "admin",
      "role": "ADMIN"
    }
  }
}
```

### 🏢 Şirket API

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/v1/companies` | GET | Tüm şirketleri listele |
| `/api/v1/companies/{id}` | GET | ID ile şirket getir |
| `/api/v1/companies/code/{code}` | GET | Kod ile şirket getir |
| `/api/v1/companies` | POST | Yeni şirket oluştur |
| `/api/v1/companies/{id}` | PUT | Şirket güncelle |
| `/api/v1/companies/{id}` | DELETE | Şirket sil |

### 📍 Lokasyon API

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/v1/locations` | GET | Tüm lokasyonları listele |
| `/api/v1/locations/company/{companyId}` | GET | Şirkete göre lokasyonlar |
| `/api/v1/locations/company/{companyId}/active` | GET | Aktif lokasyonlar |

### 🔧 Makine API

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/v1/machines` | GET | Tüm makineleri listele |
| `/api/v1/machines/location/{locationId}` | GET | Lokasyona göre makineler |
| `/api/v1/machines/location/{locationId}/available` | GET | Kullanılabilir makineler |
| `/api/v1/machines/{id}/maintenance` | PATCH | Bakım modu aç/kapat |

### 📦 Üretim Instance API

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/v1/product-instances` | GET | Tüm üretim instance'ları |
| `/api/v1/product-instances/location/{id}/pending` | GET | Bekleyen işler |
| `/api/v1/product-instances/{id}/status` | PATCH | Durum güncelle |

### 📝 QC Form Template API

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/v1/qc-templates` | GET | Tüm şablonlar |
| `/api/v1/qc-templates/machine/{machineId}` | GET | Makineye özel şablonlar |
| `/api/v1/qc-templates/context/{contextType}` | GET | Bağlam tipine göre |

### 📋 QC Form Record API

| Endpoint | Method | Açıklama |
|----------|--------|----------|
| `/api/v1/qc-records` | POST | Yeni kayıt oluştur |
| `/api/v1/qc-records/{id}/submit` | POST | Form gönder |
| `/api/v1/qc-records/{id}/approve` | POST | Onayla |
| `/api/v1/qc-records/{id}/reject` | POST | Reddet |

---

## 🗃 Veritabanı Şeması

### Entity İlişkileri

```
Company (1) ──── (N) Location (1) ──── (N) Machine
                                              │
                                              └── MachineStatus (1:1)
                                              
Product (1) ──── (N) ProductRoute (1) ──── (N) ProductRouteStep
                           │                        │
                           │                        └── (N) RouteStepMachine
                           │
                           └── (N) ProductInstance (1) ──── (N) ProductionStep

QcFormTemplate (1) ──── (N) QcFormSection (1) ──── (N) QcFormField
       │
       └── (N) QcFormRecord (1) ──── (N) QcFormValue
```

### Enum Değerleri

| Enum | Değerler |
|------|----------|
| `UserRoleEnum` | ADMIN, SUPERVISOR, OPERATOR |
| `MachineStatusEnum` | IDLE, RUNNING, SETUP, MAINTENANCE, BREAKDOWN, OFFLINE |
| `InstanceStatusEnum` | PENDING, IN_PROGRESS, COMPLETED, FAILED, ON_HOLD |
| `ProductionStepStatusEnum` | PENDING, IN_PROGRESS, COMPLETED, FAILED, REWORK |
| `ContextTypeEnum` | MACHINE, PRODUCT, PROCESS, GENERAL |
| `ScheduleTypeEnum` | HOURLY, SHIFT, DAILY, WEEKLY, ON_DEMAND |
| `InputTypeEnum` | NUMBER, DECIMAL, BOOLEAN, YES_NO, VAR_YOK, PASS_FAIL, TEXT, TEXTAREA, SELECT, MULTI_SELECT, DATE, TIME, DATETIME, PHOTO, SIGNATURE |
| `RecordStatusEnum` | DRAFT, SUBMITTED, APPROVED, REJECTED |
| `ValueResultEnum` | PASS, FAIL, WARNING, NA |
| `OverallResultEnum` | PASS, FAIL, PARTIAL |

---

## 🔒 Güvenlik

### JWT Token Kullanımı

Tüm korumalı endpoint'lere erişim için `Authorization` header'ı gereklidir:

```
Authorization: Bearer <jwt-token>
```

### Rol Tabanlı Erişim

| Rol | Yetkiler |
|-----|----------|
| **ADMIN** | Tüm işlemler |
| **SUPERVISOR** | QC onaylama, raporlama |
| **OPERATOR** | Form doldurma, üretim takibi |

### Endpoint Güvenliği

- `/api/v1/auth/**` → Herkese açık
- `/api/v1/**` → JWT gerekli

---

## 🔧 Geliştirme Rehberi

### Yeni Entity Ekleme

1. `entity/` altında entity sınıfını oluştur
2. `repository/` altında JpaRepository interface'i oluştur
3. `dto/request/` ve `dto/response/` altında DTO'ları oluştur
4. `service/impl/` altında interface, `service/` altında implementation oluştur
5. `controller/` altında REST controller oluştur

### Yeni QC Input Tipi Ekleme

1. `entity/qc/enums/InputTypeEnum.java` dosyasına yeni tip ekle
2. `QcFormRecordService.evaluateFieldResult()` metoduna değerlendirme mantığı ekle

### API Response Formatı

Tüm API'ler tutarlı `ApiResponse<T>` wrapper kullanır:

```json
{
  "success": true,
  "message": "İşlem başarılı",
  "data": { ... },
  "timestamp": "2026-01-17T16:42:44.410976"
}
```

### Sayfalama

Liste endpoint'leri için `PageResponse<T>` kullanılabilir:

```json
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false
}
```

---

## 📈 Gelecek Geliştirmeler

### Yakın Vadeli
- [ ] Swagger/OpenAPI entegrasyonu
- [ ] Exception handling (GlobalExceptionHandler)
- [ ] Validation mesajları (i18n)
- [ ] Unit ve Integration testler
- [ ] Makine durumu WebSocket güncellemeleri

### Orta Vadeli
- [ ] Dashboard ve raporlama
- [ ] PDF rapor oluşturma
- [ ] Fotoğraf/dosya yükleme (MinIO/S3)
- [ ] E-posta bildirimleri
- [ ] Audit log sistemi

### Uzun Vadeli
- [ ] Mobil uygulama (React Native / Flutter)
- [ ] Barkod/QR kod entegrasyonu
- [ ] Makine sensör entegrasyonu (IoT)
- [ ] Yapay zeka tabanlı tahminler
- [ ] ERP entegrasyonları

---

## 📞 İletişim

- **Geliştirici**: Crownbyte Team
- **E-posta**: dev@crownbyte.com

---

## 📄 Lisans

Bu proje özel lisans altındadır. Tüm hakları saklıdır.

---

*Son güncelleme: Ocak 2026*

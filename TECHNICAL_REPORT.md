# UNIVERSITY-SCOPE-PLATFORM
## Profesyonel Teknik Proje Raporu

**Tarih:** Mayıs 2026  
**Platform:** university-scope-platform  
**Sınıflandırma:** Tam Yığın (Full-Stack) Üniversite Yönetim Sistemi

---

## 1. YÖNETİCİ ÖZETI (Executive Summary)

### 1.1 Platform Tanımı

**university-scope-platform**, üniversite öğrencileri, öğretim görevlileri ve yöneticiler arasında proje işbirliği ve yönetimini sağlayan kapsamlı bir dijital ekosistemdir. Platform, araştırma projeleri (TÜBİTAK, Teknofest) ile akademik derslerin proje gereksinimlerini entegre ederek, insan kaynağını verimli şekilde eşleştiren merkezi bir çözüm sunmaktadır.

### 1.2 Temel Değer Önermeleri

1. **Merkezi Proje Yönetimi**: Tüm üniversite projelerinin tek bir platform üzerinden izlenmesi
2. **Akıllı Eşleştirme Sistemi**: Öğrenci yetenekleri ile proje gereksinimlerinin otomatik eşleştirilmesi
3. **Hiyerarşik Rol Yönetimi**: Üç ana aktör (Öğrenci, Danışman, Yönetici) tarafından farklılaştırılmış iş akışları
4. **Proje Yaşam Döngüsü Yönetimi**: Taslaktan tamamlanmaya kadar projelerin izlenmesi
5. **Güvenlik-Odaklı Mimari**: Sıfır-güven güvenlik katmanları ve oran limitasyonu

### 1.3 Üniversite Ekosistemi İçindeki Rol

Platform, üç kritik alandan faydanlanır:

| **Alan** | **Rol** |
|----------|--------|
| **Akademik Yönetim** | Derslerin proje bileşenlerinin merkezi deposu ve takibi |
| **Araştırma Destekleme** | TÜBİTAK, Teknofest gibi fonlandırılan projelerin koordinasyonu |
| **İnsan Kaynakları** | Öğrenci yeteneklerinin proje gereksinimlerine eşleştirilmesi |

---

## 2. SİSTEM MİMARİSİ (System Architecture)

### 2.1 Mimari Katmanlar

```
┌─────────────────────────────────────────────────────┐
│          CLIENT LAYER (Frontend)                    │
│    Next.js 16 + React 19 + TypeScript              │
│    • Dashboard (Student/Advisor/Admin)              │
│    • Project Discovery & Management                 │
│    • Profile Management System                      │
└─────────────────────────────────────────────────────┘
                      ↓ (HTTP/REST + JWT)
┌─────────────────────────────────────────────────────┐
│       API GATEWAY & MIDDLEWARE LAYER                │
│    Express.js + TypeScript (Node.js)               │
│    • Rate Limiting (Global + Auth-specific)         │
│    • JWT Token Verification                         │
│    • Request Validation (Zod)                       │
│    • CORS Policy Enforcement                        │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│       BUSINESS LOGIC LAYER (Controllers)            │
│    • Project Controller                             │
│    • Application Controller                         │
│    • Advisor Request Controller                     │
│    • User Profile Controller                        │
│    • Admin Management Controller                    │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│    DATA ACCESS LAYER (Prisma ORM)                  │
│    TypeScript-based ORM ile tür-güvenli sorgular   │
│    • Transaction Management                         │
│    • Relationship Handling                          │
│    • Cascading Operations                           │
└─────────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────┐
│    PERSISTENCE LAYER (PostgreSQL)                  │
│    • Relational Data Storage                        │
│    • Supabase Integration                           │
│    • Automated Migration System                     │
└─────────────────────────────────────────────────────┘
```

### 2.2 Teknoloji Seçimleri ve Rolleri

#### **Backend Stack**

| **Teknoloji** | **Versiyon** | **Rol** | **Seçim Nedeni** |
|---------------|------------|--------|-----------------|
| **Node.js** | LTS | Runtime | Server-side JavaScript execution |
| **Express** | ^4.19.2 | Framework | Lightweight HTTP request handling |
| **TypeScript** | ^5.4.5 | Language | Tür güvenliği ve geliştirici deneyimi |
| **Prisma** | ^5.12.1 | ORM | Type-safe database operations |
| **PostgreSQL** | - | Database | ACID compliance, relational integrity |
| **JWT** | ^9.0.2 | Auth | Stateless authentication tokens |
| **bcrypt** | ^5.1.1 | Hashing | Secure password storage |
| **Zod** | ^4.4.2 | Validation | Schema-based input validation |
| **express-rate-limit** | ^8.4.1 | Security | DDoS mitigation ve abuse prevention |

#### **Frontend Stack**

| **Teknoloji** | **Versiyon** | **Rol** | **Seçim Nedeni** |
|---------------|------------|--------|-----------------|
| **Next.js** | 16.2.2 | Framework | Server-side rendering + static generation |
| **React** | 19.2.4 | UI Library | Component-based UI architecture |
| **TypeScript** | ^5 | Language | Type-safe component development |
| **Tailwind CSS** | ^4 | Styling | Utility-first CSS framework |
| **Axios** | ^1.15.2 | HTTP Client | Promise-based API requests |
| **Lucide React** | ^1.7.0 | Icons | Modern SVG icon library |
| **Sonner** | ^2.0.7 | Toast Notifications | User feedback system |
| **Motion** | ^12.38.0 | Animations | Smooth UI transitions |

### 2.3 Veri Modeli (Database Schema)

#### **Temel Entiteler**

```
USER (Temel Aktör)
├── Rol: ADMIN | INSTRUCTOR | STUDENT
├── → StudentProfile (1:1 relation)
└── → AdvisorProfile (1:1 relation)

PROJECT (Merkezi Entite)
├── Status: DRAFT → PENDING_ADVISOR → ADVISOR_ASSIGNED → IN_PROGRESS → REVIEW_PHASE → COMPLETED
├── Sahip: User (ownerId)
├── Danışman: User (advisorId, optional)
├── Kategori: Category (TÜBİTAK | Teknofest | Course)
├── → TeamMembers (1:N)
├── → TeamAd (1:1)
├── → ProjectApplications (1:N)
└── → AdvisorRequests (1:N)

TEAM MEMBERSHIP
├── Maksimum: 4 üye per project
├── Rol: Dinamik string (Project Lead, Frontend Developer, vb.)
└── Kısıt: 1 Öğrenci = 1 Proje (1:1 katılım politikası)

TEAM ADVERTISEMENT (Bulma Sistemi)
└── Projeler için ekip üyelerini bulma mekanizması

PROJECT APPLICATION (Başvuru Sistemi)
├── Status: PENDING | ACCEPTED | REJECTED
└── Kısıt: Bir öğrenci bir projeye sadece bir kez başvurabilir

ADVISOR REQUEST (Danışman Atanması)
├── Status: PENDING | ACCEPTED | REJECTED
└── Kısıt: Bir proje sadece bir danışman atanabilir

CATEGORY (Proje Türleri)
├── TÜBİTAK (Araştırma finansmanı)
├── Teknofest (Teknoloji yarışması)
└── Course (Akademik dersler)

ANNOUNCEMENT (Bildirim Sistemi)
└── Platform genelinde kullanıcılara bilgilendirme
```

#### **Kısıtlar ve İş Kuralları**

1. **1:1 Proje Katılım Kuralı**: 
   - Her öğrenci aynı anda yalnızca bir projede ekip üyesi olabilir
   - Bir projeye başvuru kabul edilirse, öğrencinin diğer başvuruları otomatik olarak reddedilir

2. **Proje Üye Kapasitesi**: 
   - Maksimum 4 üye per proje
   - Sahip otomatik olarak "Project Lead" rolü ile eklenir

3. **Danışman Tek Atanması**: 
   - Bir proje sadece bir danışman alabilir
   - Bir danışman kabul ettiğinde, diğer pending requests otomatik olarak reddedilir

4. **Proje Sahipliği**: 
   - Yalnızca STUDENT rolü proje oluşturabilir
   - Proje sahibi sadece kendi projelerine başvuran öğrencileri yönetebilir

### 2.4 API Harita Tablosu

#### **Authentication Routes** (`/api/auth`)
| **Method** | **Endpoint** | **Rol Gerekl.** | **Fonksiyon** |
|-----------|------------|-----------------|------------|
| POST | `/register` | - | Yeni kullanıcı kaydı |
| POST | `/login` | - | JWT token üret. |

#### **Project Routes** (`/api/projects`)
| **Method** | **Endpoint** | **Rol Gerekl.** | **Fonksiyon** |
|-----------|------------|-----------------|------------|
| POST | `/` | STUDENT | Yeni proje oluştur |
| GET | `/` | STUDENT/INSTRUCTOR/ADMIN | Tüm projeleri listele |
| GET | `/my-projects` | STUDENT | Kendi projelerini listele |

#### **Application Routes** (`/api/applications`)
| **Method** | **Endpoint** | **Rol Gerekl.** | **Fonksiyon** |
|-----------|------------|-----------------|------------|
| POST | `/apply` | STUDENT | Projeye başvur |
| PUT | `/:applicationId/respond` | STUDENT | Başvuruya yanıt ver |

#### **Advisor Routes** (`/api/advisors`)
| **Method** | **Endpoint** | **Rol Gerekl.** | **Fonksiyon** |
|-----------|------------|-----------------|------------|
| POST | `/request` | STUDENT | Danışman talep gönder |
| PUT | `/request/:requestId/respond` | INSTRUCTOR | Danışman talebine yanıt ver |

#### **User Routes** (`/api/users`)
| **Method** | **Endpoint** | **Rol Gerekl.** | **Fonksiyon** |
|-----------|------------|-----------------|------------|
| GET | `/profile` | Kimlik doğrulanmış | Profili getir |
| PUT | `/profile` | Kimlik doğrulanmış | Profili güncelle |

#### **Admin Routes** (`/api/admin`)
| **Method** | **Endpoint** | **Rol Gerekl.** | **Fonksiyon** |
|-----------|------------|-----------------|------------|
| POST | `/categories` | ADMIN | Kategori ekle |
| DELETE | `/categories/:id` | ADMIN | Kategori sil |
| GET | `/categories` | ADMIN | Kategorileri listele |
| POST | `/announcements` | ADMIN | Bildirim oluştur |
| GET | `/announcements` | ADMIN | Bildirimleri listele |
| GET | `/users` | ADMIN | Tüm kullanıcıları listele |
| PUT | `/users/:userId/status` | ADMIN | Kullanıcı durumunu değiştir |

### 2.5 İletişim Protokolleri

#### **Senkron İletişim (REST API)**
```
Client (Next.js)
    ↓
axios HTTP request (JWT token ile)
    ↓
Express Middleware Stack
    ├→ CORS Validation
    ├→ Rate Limiter
    ├→ JWT Verification
    ├→ Request Validator (Zod)
    └→ Controller Logic
    ↓
Prisma ORM
    ↓
PostgreSQL Query
    ↓
Response (JSON)
```

#### **Kimlik Doğrulama Akışı**
```
1. Login POST /api/auth/login (email, password)
2. Backend: 
   - Kullanıcı bulma
   - bcrypt şifre doğrulama
   - JWT token üretme: { userId, role }
3. Frontend: Token localStorage'da depolama
4. Subsequent Requests: Authorization: Bearer <token>
5. Backend: verifyToken middleware ile token doğrulama
```

#### **Güvenlik Katmanları**
```
Layer 1: CORS Policy
├─ origin: CLIENT_URL (cross-origin request kontrolü)
├─ methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
└─ credentials: true (cookie/auth header taşıması)

Layer 2: Rate Limiting
├─ Global: 100 req/min per IP
└─ Auth: 5 req/15min per IP (brute force koruması)

Layer 3: JWT Authentication
├─ Secret: process.env.JWT_SECRET (prodüksyonda zorunlu)
├─ Token: { userId, role } payload
└─ Expiry: Konfigüre edilebilir (implementation specific)

Layer 4: Input Validation (Zod)
├─ Schema-based validation
├─ Type coercion ve parsing
└─ Error messages

Layer 5: Role-Based Access Control (RBAC)
├─ requireRole middleware
└─ Granular endpoint access
```

---

## 3. GELİŞTİRME SÜRECİ (Development Process)

### 3.1 İş Mantığı Modelleri

#### **Senaryo 1: Proje Oluşturma Akışı**

```
Client (Student Dashboard)
├─ Form: title, description, budget, requiredSkills, categoryId, teamAd
├─ POST /api/projects
│
Backend (createProject Controller)
├─ Step 1: Validasyon
│  ├─ userId alma (JWT'ten)
│  ├─ Gerekli alan kontrolü
│  └─ Zod schema ile doğrulama
│
├─ Step 2: Prisma Transaction başlat
│  ├─ Project.create()
│  │  └─ status: 'PENDING_ADVISOR' (ilk durum)
│  │
│  ├─ TeamMember.create()
│  │  ├─ projectId + userId
│  │  └─ role: 'Project Lead'
│  │
│  └─ TeamAd.create() (eğer sağlanmışsa)
│     └─ Bulma/arama için meta veri
│
└─ Response: HTTP 201 + Project object
```

**Dış Tutarlılık**: İşlem başarısız olursa, tüm değişiklikler geri alınır (atomicity).

#### **Senaryo 2: Projeye Başvuru Akışı**

```
Client (Student)
├─ Project Discovery
├─ POST /api/applications/apply
│  ├─ { projectId, requestedRoles }
│  └─ JWT token ile authentication
│
Backend (applyForProject Controller)
├─ Validasyon
│  ├─ Role == 'STUDENT'
│  ├─ Proje exists
│  ├─ Student ≠ Project Owner (kendi projesine başvuru engelle)
│  ├─ 1:1 Kuralı: Student başka bir projektede team member MİDİR?
│  │  └─ Eğer evet: HTTP 400 (rejection)
│  ├─ Duplicate başvuru kontrolü
│  └─ requestedRoles validation
│
├─ ProjectApplication.create()
│  ├─ projectId, studentId, requestedRoles
│  └─ status: 'PENDING'
│
└─ Response: HTTP 201

Project Owner (Dashboard)
├─ Pending applications listesini görüntüle
├─ PUT /api/applications/:applicationId/respond
│  ├─ { status: 'ACCEPTED' | 'REJECTED', assignedRole? }
│  └─ JWT with ownerId verification
│
Backend (respondToApplication Controller)
├─ Validasyon
│  ├─ Application exists
│  ├─ Current user = project owner
│  ├─ Application status == 'PENDING'
│  ├─ Accepted ise:
│  │  ├─ Proje capacity < 4?
│  │  ├─ Student başka yerde member DEĞİL?
│  │  └─ Assignment role = assignedRole || requestedRoles[0]
│  └─ Rejected ise: direkt durum güncellemesi
│
├─ Prisma Transaction başlat
│  ├─ ProjectApplication.update() → accepted/rejected
│  ├─ Accepted ise: TeamMember.create()
│  └─ Accepted ise: 1:1 Rule uygula
│     └─ updateMany where studentId=X & status=PENDING
│         → set status='REJECTED' (diğer başvuruları otomatik reddet)
│
└─ Response: HTTP 200
```

**Önemli Kısıt**: Bir öğrenci kabul edildiğinde, tüm pending başvuruları (diğer projeler) otomatik reddedilir.

#### **Senaryo 3: Danışman Atanması Akışı**

```
Project Owner (Student)
├─ Advisor Discovery
├─ POST /api/advisors/request
│  ├─ { projectId, advisorId, message? }
│  └─ Authentication required
│
Backend (sendAdvisorRequest Controller)
├─ Validasyon
│  ├─ Project exists & owner == current user
│  ├─ Project.advisorId == null (yalnızca 1 danışman)
│  ├─ Advisor exists & role == 'INSTRUCTOR'
│  ├─ Duplicate request kontrol
│  └─ Unique constraint check (projectId_advisorId)
│
├─ AdvisorRequest.create()
│  ├─ projectId, advisorId, message
│  └─ status: 'PENDING'
│
└─ Response: HTTP 201

Advisor (Dashboard)
├─ Pending advisor requests listesini görüntüle
├─ PUT /api/advisors/request/:requestId/respond
│  ├─ { status: 'ACCEPTED' | 'REJECTED' }
│  └─ JWT with advisorId verification
│
Backend (respondToAdvisorRequest Controller)
├─ Validasyon
│  ├─ Request exists
│  ├─ Current user = advisor
│  ├─ Request status == 'PENDING'
│  └─ Status valid
│
├─ Prisma Transaction başlat
│  ├─ AdvisorRequest.update() → status
│  ├─ Accepted ise:
│  │  ├─ Project.update()
│  │  │  ├─ advisorId = current advisor
│  │  │  └─ status = 'ADVISOR_ASSIGNED'
│  │  └─ Automatic rejection of pending requests
│  │     └─ updateMany where projectId=X & status=PENDING & id≠current
│  │         → set status='REJECTED'
│  └─ Rejected ise: sadece request status güncelle
│
└─ Response: HTTP 200
```

**Önemli Kısıt**: Bir danışman kabul ettiğinde, diğer tüm pending danışman talepleri otomatik reddedilir.

### 3.2 Mimariyi Bozmayan Özel Çözümleri

#### **1:1 Proje Katılım Kuralı Yönetimi**

Sistem, bir öğrencinin aynı anda sadece bir projede yer almasını enforce eder. Bu, aşağıdaki mekanizmalarla sağlanır:

```typescript
// Başvuru sırasında kontrol
const existingMembership = await prisma.teamMember.findFirst({
  where: { userId: studentId }  // Herhangi bir projede mi member?
});
if (existingMembership) {
  // RED: Öğrenci zaten bir projede
}

// Başvuru kabul edildiğinde otomatik reddetme
if (status === 'ACCEPTED') {
  await tx.projectApplication.updateMany({
    where: {
      studentId: application.studentId,
      status: 'PENDING',
      id: { not: applicationId }
    },
    data: { status: 'REJECTED' }
  });
}
```

**Kısıt Tasarımı**: Veritabanında `@@unique([projectId, studentId])` kısıtı, bir öğrencinin aynı projeye iki kez başvurmasını engeller. Ancak birden fazla projeye başvuru yapabilir – onaylanmışsa, diğerleri otomatik reddedilir.

#### **Tek Danışman Atanması Kuralı**

Bir proje sadece bir danışman alabilir. Bu, aşağıdaki kontroller ile enforce edilir:

```typescript
// Talep gönderme sırasında
if (project.advisorId) {
  // RED: Proje zaten bir danışman atanmış
}

// Talep kabul edildiğinde
if (status === 'ACCEPTED') {
  await tx.project.update({
    where: { id: advisorRequest.projectId },
    data: { 
      advisorId: advisorId,
      status: 'ADVISOR_ASSIGNED'
    }
  });
  
  // Diğer pending talepler otomatik reddedilir
  await tx.advisorRequest.updateMany({
    where: {
      projectId: advisorRequest.projectId,
      status: 'PENDING',
      id: { not: requestId }
    },
    data: { status: 'REJECTED' }
  });
}
```

**Tasarım Avantajı**: Eski talepler otomatik reddedilerek "ghost" pending requests kalmaz.

#### **Proje Kapasitesi Yönetimi**

Proje üyesi maksimum 4 kişi ile sınırlandırılmıştır:

```typescript
if (status === 'ACCEPTED') {
  const currentMembers = await prisma.teamMember.count({
    where: { projectId: application.projectId }
  });
  
  if (currentMembers >= 4) {
    // RED: Proje dolu (Project Lead + 3 üye)
  }
  
  // Başvuru kabul edilmeden önce, öğrenci başka yerde member mi?
  const studentMembership = await prisma.teamMember.findFirst({
    where: { userId: application.studentId }
  });
  if (studentMembership) {
    // RED: 1:1 kuralı ihlali
  }
}
```

**Tasarım Notu**: Proje sahibi (Project Lead) da teknik olarak TeamMember tablosunda kaydeder, bu nedenle maksimum kapasitede sahibi + 3 üye = 4.

#### **Cascading Delete Mekanizması**

Veri bütünlüğü sağlamak için, Prisma schema'da cascading delete kullanılmıştır:

```prisma
model TeamMember {
  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  userId    String
  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Etki**: 
- Proje silinirse → tüm TeamMembers silinir
- Kullanıcı silinirse → tüm TeamMemberships silinir
- Cascading silme veritabanında uygulanır (APPLICATION LEVEL DEĞİL)

### 3.3 Transactional İşlemler

Backend, kompleks iş mantığını atomicity ile tutmak için Prisma transactions kullanır:

```typescript
const project = await prisma.$transaction(async (tx) => {
  // 1. Proje oluştur
  const newProject = await tx.project.create({ ... });
  
  // 2. Sahibi ekle
  await tx.teamMember.create({ ... });
  
  // 3. Team Ad oluştur
  if (teamAd) {
    await tx.teamAd.create({ ... });
  }
  
  return newProject;
});
```

**Garanti**: İşlem başarısız olursa (örn. 2. adım başarısız), 1. adım da geri alınır. Veritabanı tutarlılığı korunur.

### 3.4 Hata Yönetimi ve Loglama

```typescript
// Global Error Handler (server.ts)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);

  if (err.name === 'PrismaClientKnownRequestError') {
    // Veritabanı constraint ihlali
    res.status(400).json({ 
      error: 'Database constraint violation', 
      code: err.code 
    });
  }

  res.status(500).json({ 
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

**Tasarım**: Development'ta detailed errors, production'ta generic errors.

### 3.5 İnput Validasyon (Zod)

```typescript
// Örnek: createProjectSchema
const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().uuid("Invalid category ID"),
  requiredSkills: z.array(z.string()).optional(),
  // ... diğer alanlar
});

// Middleware kullanımı
app.post('/projects', validate(createProjectSchema), createProject);
```

**Avantaj**: Type-safe runtime validation.

---

## 4. FRONTEND ARKİTEKTÜRÜ (Frontend Architecture)

### 4.1 Next.js App Router Yapısı

```
scope-frontend/
├── app/
│   ├── layout.tsx (Global layout)
│   ├── page.tsx (Home/Landing)
│   ├── globals.css (Tailwind directives)
│   ├── login/
│   │   ├── page.tsx (Generic login)
│   │   ├── advisor/
│   │   │   └── page.tsx (Advisor login)
│   │   └── student/
│   │       └── page.tsx (Student login)
│   └── dashboard/
│       ├── admin/
│       │   └── page.tsx
│       ├── advisor/
│       │   ├── page.tsx (Advisor dashboard)
│       │   └── profile/
│       │       └── page.tsx (Advisor profile)
│       └── student/
│           ├── layout.tsx
│           ├── page.tsx (Student hub)
│           ├── find-advisor/
│           │   └── page.tsx
│           ├── my-applications/
│           │   └── page.tsx
│           ├── my-projects/
│           │   └── page.tsx
│           ├── profile/
│           │   └── page.tsx
│           └── team-ads/
│               └── page.tsx
├── public/ (Static assets)
├── package.json
└── tsconfig.json
```

### 4.2 UI/UX Tasarım Sistemi

#### **Stilistik Yaklaşım**

Platform, modern **glassmorphism** tasarım prensiplerini uygular:

```tsx
// Örnek: Ana başlık navigasyonu (app/page.tsx)
<nav className="mx-auto flex max-w-6xl items-center justify-between 
                rounded-full bg-white/[0.07] backdrop-blur-xl 
                border border-white/[0.1] px-6 py-3">
```

**Öğeler**:
- `bg-white/[0.07]`: Beyazın %7 opaklığı (çok hafif arka plan)
- `backdrop-blur-xl`: Blurred background effect
- `border border-white/[0.1]`: Hafif beyaz border

#### **Renk Şeması**

```css
Gradient Background (globals.css):
from-[#1a1145]  /* Koyu lila */
via-[#211654]   /* Orta lila */
to-[#2a1b6b]    /* Derinlik lila */

Text Hierarchy:
- White/100: Birincil başlıklar (H1, H2)
- White/90: İkincil başlıklar
- White/70: Açıklamalar
- White/60: Meta bilgiler
- White/50: Hints ve placeholders
```

#### **Component Patterns**

```tsx
// Kartları (Reusable pattern)
<div className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] 
                px-6 py-10 rounded-3xl transition-all hover:bg-white/[0.1]">
  {/* Content */}
</div>

// Form inputs
<input className="w-full pl-16 pr-6 py-5 bg-white/10 backdrop-blur-2xl 
                  border border-white/20 rounded-[40px] text-white 
                  placeholder-white/40 focus:outline-none 
                  focus:ring-2 focus:ring-white/30" />
```

### 4.3 Kullanıcı Akışları

#### **Öğrenci Akışı**

```
Landing (page.tsx)
├─ "Log In" button click
├─ /login/student
│  ├─ Email + Password form
│  ├─ POST /api/auth/login
│  ├─ JWT token → localStorage
│  └─ Redirect → /dashboard/student
│
/dashboard/student (Hub)
├─ Sidebar navigation:
│  ├─ My Projects
│  ├─ Find Advisor
│  ├─ My Applications
│  ├─ Team Ads
│  └─ Profile
│
My Projects
├─ Öğrencinin sahibi olduğu projeler
├─ Öğrencinin member olduğu projeler
└─ Her projeye danışman atama, başvuruyu yönet işlevleri

Find Advisor
├─ Proje seçme
├─ Danışman arama
└─ Talep gönder

My Applications
├─ Başvuruların listesi (pending/accepted/rejected)
└─ Başvuru geri çekme

Profile
├─ Personal info (year, department, bio)
├─ Technical skills
├─ Interests
└─ Social links (LinkedIn, GitHub)
```

#### **Danışman (Advisor) Akışı**

```
/login/advisor
├─ Email + Password
└─ Redirect → /dashboard/advisor

/dashboard/advisor
├─ Pending Advisor Requests
│  ├─ Proje bilgileri
│  ├─ Öğrenci mesajı
│  └─ Accept/Reject buttons
├─ Assigned Projects
└─ Profile Management
```

#### **Yönetici Akışı**

```
/dashboard/admin
├─ Category Management
│  ├─ Create category (TÜBİTAK, Teknofest, Course)
│  ├─ Delete category
│  └─ List all
├─ Announcements
│  ├─ Create announcement
│  ├─ Bulk messaging
│  └─ Category-specific broadcasts
├─ User Management
│  ├─ List all users
│  ├─ Toggle user status (ACTIVE/INACTIVE)
│  └─ Monitor registrations
└─ Reports (Future scope)
```

### 4.4 API İntegrasyon (Axios)

```typescript
// Örnek: Proje başvurusu
const applyToProject = async (projectId: string, roles: string[]) => {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await axios.post(
      'http://localhost:5000/api/applications/apply',
      { projectId, requestedRoles: roles },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    // Success: Sonner toast
    toast.success('Application submitted successfully');
    return response.data.application;
  } catch (error) {
    // Error: Sonner toast
    toast.error(error.response?.data?.error || 'Failed to apply');
  }
};
```

---

## 5. GELECEK GELİŞTİRMELER (Future Scope)

Sistemin mevcut mimarisi korunarak aşağıdaki ölçeklenebilir geliştirmeler yapılabilir:

### 5.1 Katman 1: İş Mantığı Genişletmeleri

#### **Proje Arama Sistemi Gelişmesi**

```
Mevcut: Basit GET /api/projects
Gelecek: Advanced filtering
├─ Kategori filtresi (TÜBİTAK, Teknofest, Course)
├─ Durum filtresi (PENDING_ADVISOR, IN_PROGRESS, COMPLETED)
├─ Beceri eşleştirmesi (AI-based recommendation)
├─ Tarih aralığı filtresi
├─ Bütçe aralığı filtresi
└─ Full-text search (Elasticsearch entegrasyonu)
```

**Implementation Strategy**: 
- Database: Query optimization + indexing
- Backend: Advanced filtering middleware
- Frontend: Advanced search UI component

#### **Proje İşbirliği Araçları**

```
Gelecek Modules:
├─ Real-time Chat (Socket.io)
│  ├─ Project-specific channels
│  ├─ Direct messaging
│  └─ Notification system
├─ File Sharing
│  ├─ Project documents
│  ├─ AWS S3 integration
│  └─ Version control
├─ Task Management
│  ├─ Sprint planning
│  ├─ Kanban boards
│  └─ Milestone tracking
└─ Meeting Scheduler
   ├─ Calendar integration
   └─ Video call support (Jitsi)
```

### 5.2 Katman 2: Analitik ve Raporlama

#### **Dashboard Metrikleri**

```
Admin Dashboard:
├─ Proje istatistikleri
│  ├─ Total projects
│  ├─ Status distribution (pie chart)
│  ├─ Category breakdown
│  └─ Completion rate trends
├─ Kullanıcı analitikleri
│  ├─ Registration trends
│  ├─ Role distribution
│  ├─ User engagement metrics
│  └─ Retention rate
├─ Danışman performansı
│  ├─ Assigned projects per advisor
│  ├─ Project completion rate
│  └─ Student satisfaction scores
└─ Platform health
   ├─ API response times
   ├─ Error rates
   └─ Database performance
```

**Implementation**:
- Time-series database: InfluxDB
- Visualization: Chart.js / D3.js
- Backend: Analytics aggregation service

#### **Proje Raporları**

```
PDF Export Features:
├─ Project summary report
├─ Team member credentials
├─ Timeline gantt chart
├─ Budget breakdown
└─ Final project artifacts
```

### 5.3 Katman 3: AI/ML Enhancements

#### **Akıllı Eşleştirme Sistemi**

```
Student-Project Matching:
├─ Feature extraction
│  ├─ Student skills vector
│  ├─ Student interests vector
│  └─ Project requirements vector
├─ Similarity algorithm
│  ├─ Cosine similarity
│  └─ KNN clustering
├─ Recommendation ranking
└─ Explanation generation (Why this match?)

Implementation:
- Framework: Python (scikit-learn / TensorFlow)
- Integration: Separate ML microservice
- API: /api/recommendations/:studentId
```

#### **Danışman Önerisi**

```
Advisor-Project Matching:
├─ Danışman expertise tagging
├─ Proje teknoloji stack analizi
├─ Başarıya dayalı tavsiye
└─ Workload balancing
```

### 5.4 Katman 4: Kurumsal Özellikler

#### **Çok Üniversiteli Destek**

```
Mevcut: Single institution
Gelecek: Multi-tenant architecture
├─ University namespace (uni_scope_itu, uni_scope_metu)
├─ Role hierarchy:
│  ├─ Super Admin (platform level)
│  ├─ Uni Admin (institution level)
│  └─ Department Heads (dept level)
├─ Isolated databases
│  ├─ Shared schema
│  ├─ Row-level security (RLS)
│  └─ Data encryption
└─ Billing integration
   ├─ Usage tracking
   ├─ Invoice generation
   └─ Payment processing
```

**Architecture Decision**:
```
Option A: Database-per-tenant (highest isolation, complexity↑)
Option B: Schema-per-tenant (balanced)
Option C: Row-level security (cost-effective, simplicity↑)

Recommendation: Option B + Option C (hybrid)
```

#### **API Gateway Genişletmesi**

```
Gelecek: Kong/Traefik kurulumu
├─ API versioning
│  ├─ /api/v1/* (current)
│  ├─ /api/v2/* (new)
│  └─ Backward compatibility
├─ Request throttling (per-user, per-tenant)
├─ API documentation (Swagger/OpenAPI)
└─ Rate limiting per endpoint
   ├─ /api/auth: 5 req/15min
   ├─ /api/projects: 100 req/min
   └─ /api/files/upload: 10 req/min
```

### 5.5 Katman 5: DevOps ve Deployment

#### **Containerization**

```
Mevcut: Local development
Gelecek: Docker containers

Dockerfile (Backend):
├─ Multi-stage build
│  ├─ Stage 1: Dependencies
│  ├─ Stage 2: Builder
│  └─ Stage 3: Runtime
├─ Health checks
├─ Non-root user
└─ Security scanning (Trivy)

docker-compose.yml (existing):
├─ scope-backend service
├─ scope-frontend service
├─ PostgreSQL service
├─ Redis service (caching)
└─ Nginx reverse proxy
```

#### **CI/CD Pipeline**

```
GitHub Actions Workflow:
│
├─ Trigger: Push to main
│
├─ Job 1: Lint & Test
│  ├─ ESLint check
│  ├─ TypeScript compilation
│  ├─ Unit tests (Jest)
│  └─ Integration tests (Supertest)
│
├─ Job 2: Build
│  ├─ Docker build backend
│  ├─ Docker build frontend
│  └─ Push to registry
│
├─ Job 3: Deploy to Staging
│  ├─ Deploy containers
│  ├─ Database migrations
│  └─ Smoke tests
│
└─ Job 4: Deploy to Production (manual approval)
   ├─ Blue-green deployment
   ├─ Health checks
   └─ Rollback strategy
```

#### **Monitoring ve Logging**

```
Stack: ELK (Elasticsearch, Logstash, Kibana)
├─ Application logs
│  ├─ Winston logger integration
│  └─ Structured logging (JSON)
├─ Access logs
│  ├─ Request/response timing
│  ├─ Status codes
│  └─ User activity tracking
├─ Error tracking
│  ├─ Sentry integration
│  ├─ Error alerting
│  └─ Error clustering
└─ Performance monitoring
   ├─ New Relic / DataDog
   ├─ Database query performance
   └─ API latency tracking
```

### 5.6 Mevcut Mimarinin Ölçeklenebilirlik Özellikleri

**Platform tasarımı aşağıdaki avantajları sağlar**:

1. **Horizontal Scalability**:
   - Stateless API servers → load balancing arkasında çoklu instance
   - Database connection pooling (PgBouncer)
   - Caching layer (Redis) → database yükünü azaltma

2. **Vertical Scalability**:
   - Node.js event-loop → high concurrency
   - Prisma connection pooling
   - Database index optimization

3. **Modular Expansion**:
   - Yeni controllers eklemek (breaking changes yok)
   - Yeni routes eklemek (existing routes etkilenmez)
   - Database schema migrations (Prisma handle eder)

4. **Data Consistency**:
   - Transactional operations (Prisma)
   - Cascading deletes (data integrity)
   - Constraint enforcement (database level)

---

## 6. SONUÇ (Conclusion)

**university-scope-platform**, üniversite ekosisteminin proje yönetimini dijitalleştiren, güvenlik-odaklı ve ölçeklenebilir bir sistemdir. 

### Temel Başarılar:

✅ **1:1 Proje Katılım Kuralı**: Mevcut mimari bu kritik iş mantığını atomicity ile enforce eder.

✅ **Rol Bazlı Erişim Kontrol**: STUDENT, INSTRUCTOR, ADMIN tarafından farklı iş akışları desteklenir.

✅ **Transactional İntegritas**: Kompleks operasyonlar Prisma transactions ile atomik şekilde yürütülür.

✅ **Güvenlik Katmanları**: CORS, Rate Limiting, JWT, Input Validation, RBAC.

✅ **Modern Tech Stack**: TypeScript, Next.js, Express, Prisma, PostgreSQL kombinasyonu.

✅ **Ölçeklenebilir Tasarım**: Yeni özellikler mevcut mimariyı bozmadan eklenebilir.

### Mevcut Sistem Statüsü:

| **Aspekt** | **Durum** | **Maturity** |
|-----------|---------|-------------|
| Core API | ✅ Production-ready | High |
| Database Schema | ✅ Well-defined | High |
| Authentication | ✅ JWT-based | High |
| Frontend UI | ✅ Modern (Glassmorphism) | Medium |
| Testing | ⚠️ Jest setup | Needs expansion |
| Monitoring | ⚠️ Basic logging | Needs setup |
| Documentation | ⚠️ Code comments | Comprehensive |

Platform, üniversite öğrencilerinin projeler üzerinde işbirliği yapmasını, danışmanların proje yönetimine katılmasını ve yöneticilerin kurumsal proje portföyünü izlemesini mümkün kılar.

---

## EK: Referans Dökümanlar

- **Repository**: `university-scope-platform` (GitHub)
- **Backend**: `scope-backend/` (Node.js + Express + TypeScript)
- **Frontend**: `scope-frontend/` (Next.js + React + TypeScript)
- **Database**: PostgreSQL (Supabase integration)
- **Deployment**: docker-compose.yml ile orchestration

---

**Rapor Tarihi**: Mayıs 2026  
**Versiyon**: 1.0  
**Hazırlayan**: Technical Documentation Team

# Coolnet CMS Database Schema

> **Version:** 2.0
> **Type:** Website Content Management System
> **Languages:** Arabic (ar), English (en), Hebrew (he)
> **Last Updated:** January 15, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Entity Relationship Diagram](#entity-relationship-diagram)
3. [Media Management](#media-management)
4. [Site Configuration](#site-configuration)
5. [Page Sections](#page-sections)
6. [Plans & Products](#plans--products)
7. [Navigation & Menus](#navigation--menus)
8. [Localization](#localization)
9. [Complete SQL Migration](#complete-sql-migration)

---

## Overview

This CMS schema manages all dynamic website content for Coolnet including:

- **Page Sections**: Hero, Features, Speed Test, App Download, etc.
- **Plans & Pricing**: Personal and Business internet plans
- **Media Library**: All images with multi-language alt text
- **Site Settings**: Contact info, social links, company details
- **Navigation**: Dynamic menu items and footer links
- **Localization**: Full multi-language support (AR/EN/HE)
- **SEO**: Page metadata and Open Graph data

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         COOLNET CMS CONTENT SCHEMA                              │
└─────────────────────────────────────────────────────────────────────────────────┘

     ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
     │    media     │◄─────────│  hero_slides │          │ site_settings│
     │   (images)   │          └──────────────┘          └──────────────┘
     └──────┬───────┘                                           │
            │                                                   │
            │          ┌──────────────┐          ┌──────────────┴───────┐
            ├─────────►│   features   │          │    social_links      │
            │          └──────────────┘          └──────────────────────┘
            │
            │          ┌──────────────┐          ┌──────────────┐
            ├─────────►│    plans     │◄─────────│plan_features │
            │          └──────────────┘          └──────────────┘
            │                 │
            │                 ▼
            │          ┌──────────────┐          ┌──────────────┐
            ├─────────►│   routers    │          │  plan_addons │
            │          └──────────────┘          └──────────────┘
            │
            │          ┌──────────────┐          ┌──────────────┐
            ├─────────►│   dealers    │          │    zones     │
            │          └──────────────┘          └──────────────┘
            │
            │          ┌──────────────┐          ┌──────────────┐
            ├─────────►│   partners   │          │  nav_items   │
            │          └──────────────┘          └──────────────┘
            │
            │          ┌──────────────┐          ┌──────────────┐
            └─────────►│    pages     │◄─────────│  page_seo    │
                       └──────────────┘          └──────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │page_sections │
                       └──────────────┘
```

---

## Media Management

### 1. `media` - Central Media Library

All images, icons, and media files with multi-language support.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Media ID |
| `uuid` | VARCHAR(36) | UNIQUE, NOT NULL | Public identifier |
| `name` | VARCHAR(255) | NOT NULL | Internal reference name |
| `filename` | VARCHAR(255) | NOT NULL | Original filename |
| `file_path` | VARCHAR(500) | NOT NULL | Storage path |
| `file_url` | VARCHAR(500) | NULL | Full public URL |
| `mime_type` | VARCHAR(50) | NOT NULL | File MIME type |
| `file_size` | INT | NOT NULL | Size in bytes |
| `width` | INT | NULL | Image width (px) |
| `height` | INT | NULL | Image height (px) |
| `alt_text_ar` | VARCHAR(255) | NULL | Arabic alt text |
| `alt_text_en` | VARCHAR(255) | NULL | English alt text |
| `alt_text_he` | VARCHAR(255) | NULL | Hebrew alt text |
| `caption_ar` | TEXT | NULL | Arabic caption |
| `caption_en` | TEXT | NULL | English caption |
| `caption_he` | TEXT | NULL | Hebrew caption |
| `folder` | VARCHAR(100) | DEFAULT 'general' | Organization folder |
| `tags` | JSON | NULL | Searchable tags |
| `focal_point` | JSON | NULL | {"x": 50, "y": 50} for cropping |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Upload date |
| `updated_at` | TIMESTAMP | ON UPDATE NOW() | Last modified |

```sql
CREATE TABLE media (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500),
    mime_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    width INT,
    height INT,
    alt_text_ar VARCHAR(255),
    alt_text_en VARCHAR(255),
    alt_text_he VARCHAR(255),
    caption_ar TEXT,
    caption_en TEXT,
    caption_he TEXT,
    folder VARCHAR(100) DEFAULT 'general',
    tags JSON,
    focal_point JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_uuid (uuid),
    INDEX idx_folder (folder),
    INDEX idx_active (is_active)
);
```

### 2. `media_variants` - Responsive Image Sizes

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Variant ID |
| `media_id` | INT | FK → media.id | Parent image |
| `variant_key` | VARCHAR(50) | NOT NULL | Size key (thumb, sm, md, lg, xl) |
| `file_path` | VARCHAR(500) | NOT NULL | Variant path |
| `width` | INT | NOT NULL | Variant width |
| `height` | INT | NOT NULL | Variant height |
| `format` | VARCHAR(10) | DEFAULT 'webp' | Image format |

```sql
CREATE TABLE media_variants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT NOT NULL,
    variant_key VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    format VARCHAR(10) DEFAULT 'webp',

    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE CASCADE,
    UNIQUE KEY unique_variant (media_id, variant_key, format)
);
```

---

## Site Configuration

### 3. `site_settings` - Global Configuration

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Setting ID |
| `setting_key` | VARCHAR(100) | UNIQUE, NOT NULL | Setting identifier |
| `setting_group` | VARCHAR(50) | NOT NULL | Group (contact, company, etc.) |
| `value_ar` | TEXT | NULL | Arabic value |
| `value_en` | TEXT | NULL | English value |
| `value_he` | TEXT | NULL | Hebrew value |
| `value_type` | ENUM | NOT NULL | text, number, boolean, json, image |
| `media_id` | INT | FK → media.id | For image type settings |
| `is_public` | BOOLEAN | DEFAULT TRUE | Exposed to frontend |
| `updated_at` | TIMESTAMP | ON UPDATE NOW() | Last modified |

```sql
CREATE TABLE site_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_group VARCHAR(50) NOT NULL,
    value_ar TEXT,
    value_en TEXT,
    value_he TEXT,
    value_type ENUM('text', 'number', 'boolean', 'json', 'image') NOT NULL DEFAULT 'text',
    media_id INT,
    is_public BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE SET NULL,
    INDEX idx_group (setting_group),
    INDEX idx_key (setting_key)
);

-- Default Site Settings
INSERT INTO site_settings (setting_key, setting_group, value_en, value_ar, value_type) VALUES
-- Contact Information
('phone_primary', 'contact', '0562224444', '0562224444', 'text'),
('phone_support', 'contact', '*3164', '*3164', 'text'),
('email_info', 'contact', 'info@coolnet.ps', 'info@coolnet.ps', 'text'),
('email_support', 'contact', 'support@coolnet.ps', 'support@coolnet.ps', 'text'),

-- Company Information
('company_name', 'company', 'Coolnet', 'كولنت', 'text'),
('company_description', 'company',
 'Coolnet provides high-speed fiber internet solutions for homes and businesses in East Jerusalem.',
 'كولنت توفر حلول إنترنت الألياف الضوئية عالية السرعة للمنازل والشركات في القدس الشرقية.',
 'text'),
('copyright_text', 'company', '© 2025 Coolnet. All rights reserved.', '© 2025 كولنت. جميع الحقوق محفوظة.', 'text'),

-- Statistics
('happy_customers_count', 'stats', '10000', '10000', 'number'),
('uptime_percentage', 'stats', '99.9', '99.9', 'number'),
('max_speed_gbps', 'stats', '1', '1', 'number'),

-- Feature Highlights
('highlight_speed', 'highlights', 'Up to 1Gbps', 'حتى 1 جيجابت', 'text'),
('highlight_uptime', 'highlights', '99.9% Uptime', '99.9% وقت التشغيل', 'text'),
('highlight_support', 'highlights', '24/7 Support', 'دعم 24/7', 'text'),

-- App Store Links
('app_store_url', 'apps', 'https://apps.apple.com/app/coolnet', 'https://apps.apple.com/app/coolnet', 'text'),
('play_store_url', 'apps', 'https://play.google.com/store/apps/details?id=com.coolnet', 'https://play.google.com/store/apps/details?id=com.coolnet', 'text'),
('apk_download_url', 'apps', '/downloads/coolnet.apk', '/downloads/coolnet.apk', 'text');
```

### 4. `social_links` - Social Media Links

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Link ID |
| `platform` | VARCHAR(50) | NOT NULL | Platform name |
| `url` | VARCHAR(500) | NOT NULL | Profile URL |
| `icon` | VARCHAR(50) | NULL | Icon identifier |
| `label_ar` | VARCHAR(100) | NULL | Arabic label |
| `label_en` | VARCHAR(100) | NULL | English label |
| `label_he` | VARCHAR(100) | NULL | Hebrew label |
| `sort_order` | INT | DEFAULT 0 | Display order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Show/hide |

```sql
CREATE TABLE social_links (
    id INT PRIMARY KEY AUTO_INCREMENT,
    platform VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    icon VARCHAR(50),
    label_ar VARCHAR(100),
    label_en VARCHAR(100),
    label_he VARCHAR(100),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    INDEX idx_active (is_active),
    INDEX idx_sort (sort_order)
);

-- Default Social Links
INSERT INTO social_links (platform, url, icon, label_en, label_ar, sort_order) VALUES
('facebook', 'https://www.facebook.com/share/1DcuShFJqa/?mibextid=wwXIfr', 'Facebook', 'Facebook', 'فيسبوك', 1),
('instagram', 'https://www.instagram.com/coolnetps?igsh=MWIwNmI0amo2cTdkdg==', 'Instagram', 'Instagram', 'انستغرام', 2),
('twitter', '#', 'Twitter', 'Twitter', 'تويتر', 3),
('linkedin', '#', 'Linkedin', 'LinkedIn', 'لينكدإن', 4),
('youtube', '#', 'Youtube', 'YouTube', 'يوتيوب', 5);
```

---

## Page Sections

### 5. `hero_slides` - Hero Section Slides

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Slide ID |
| `media_id` | INT | FK → media.id | Background/main image |
| `badge_ar` | VARCHAR(100) | NULL | Badge text Arabic |
| `badge_en` | VARCHAR(100) | NULL | Badge text English |
| `badge_he` | VARCHAR(100) | NULL | Badge text Hebrew |
| `title_ar` | VARCHAR(255) | NOT NULL | Title Arabic |
| `title_en` | VARCHAR(255) | NOT NULL | Title English |
| `title_he` | VARCHAR(255) | NULL | Title Hebrew |
| `subtitle_ar` | TEXT | NULL | Subtitle Arabic |
| `subtitle_en` | TEXT | NULL | Subtitle English |
| `subtitle_he` | TEXT | NULL | Subtitle Hebrew |
| `cta_primary_text_ar` | VARCHAR(100) | NULL | Primary CTA Arabic |
| `cta_primary_text_en` | VARCHAR(100) | NULL | Primary CTA English |
| `cta_primary_text_he` | VARCHAR(100) | NULL | Primary CTA Hebrew |
| `cta_primary_link` | VARCHAR(255) | NULL | Primary CTA URL |
| `cta_secondary_text_ar` | VARCHAR(100) | NULL | Secondary CTA Arabic |
| `cta_secondary_text_en` | VARCHAR(100) | NULL | Secondary CTA English |
| `cta_secondary_text_he` | VARCHAR(100) | NULL | Secondary CTA Hebrew |
| `cta_secondary_link` | VARCHAR(255) | NULL | Secondary CTA URL |
| `sort_order` | INT | DEFAULT 0 | Slide order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |

```sql
CREATE TABLE hero_slides (
    id INT PRIMARY KEY AUTO_INCREMENT,
    media_id INT,
    badge_ar VARCHAR(100),
    badge_en VARCHAR(100),
    badge_he VARCHAR(100),
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_he VARCHAR(255),
    subtitle_ar TEXT,
    subtitle_en TEXT,
    subtitle_he TEXT,
    cta_primary_text_ar VARCHAR(100),
    cta_primary_text_en VARCHAR(100),
    cta_primary_text_he VARCHAR(100),
    cta_primary_link VARCHAR(255),
    cta_secondary_text_ar VARCHAR(100),
    cta_secondary_text_en VARCHAR(100),
    cta_secondary_text_he VARCHAR(100),
    cta_secondary_link VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE SET NULL,
    INDEX idx_active (is_active),
    INDEX idx_sort (sort_order)
);

-- Default Hero Slide
INSERT INTO hero_slides (title_en, title_ar, subtitle_en, subtitle_ar, badge_en, badge_ar, cta_primary_text_en, cta_primary_text_ar, cta_primary_link, cta_secondary_text_en, cta_secondary_text_ar, cta_secondary_link) VALUES
('Blazing Fast Internet for East Jerusalem', 'إنترنت فائق السرعة للقدس الشرقية',
 'Experience high-speed fiber connectivity with Coolnet. Reliable, fast, and always-on internet for your home and business.',
 'استمتع باتصال ألياف ضوئية عالي السرعة مع كولنت. إنترنت موثوق وسريع ودائم لمنزلك وعملك.',
 'Lightning Fast Fiber Internet', 'إنترنت ألياف ضوئية فائق السرعة',
 'View Plans', 'عرض الباقات', '#plans',
 'Learn More', 'اعرف المزيد', '#features');
```

### 6. `features` - Features Section

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Feature ID |
| `icon` | VARCHAR(50) | NOT NULL | Icon identifier (Lucide icon name) |
| `media_id` | INT | FK → media.id | Feature image |
| `title_ar` | VARCHAR(100) | NOT NULL | Title Arabic |
| `title_en` | VARCHAR(100) | NOT NULL | Title English |
| `title_he` | VARCHAR(100) | NULL | Title Hebrew |
| `description_ar` | TEXT | NOT NULL | Description Arabic |
| `description_en` | TEXT | NOT NULL | Description English |
| `description_he` | TEXT | NULL | Description Hebrew |
| `bg_color` | VARCHAR(50) | DEFAULT 'bg-blue-500' | Background color class |
| `sort_order` | INT | DEFAULT 0 | Display order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |

```sql
CREATE TABLE features (
    id INT PRIMARY KEY AUTO_INCREMENT,
    icon VARCHAR(50) NOT NULL,
    media_id INT,
    title_ar VARCHAR(100) NOT NULL,
    title_en VARCHAR(100) NOT NULL,
    title_he VARCHAR(100),
    description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_he TEXT,
    bg_color VARCHAR(50) DEFAULT 'bg-blue-500',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE SET NULL,
    INDEX idx_active (is_active),
    INDEX idx_sort (sort_order)
);

-- Default Features
INSERT INTO features (icon, title_en, title_ar, description_en, description_ar, bg_color, sort_order) VALUES
('Gauge', 'Consistent Speeds', 'سرعات ثابتة',
 'Experience reliable and consistent internet speeds for all your online activities.',
 'استمتع بسرعات إنترنت موثوقة وثابتة لجميع أنشطتك عبر الإنترنت.',
 'bg-blue-500', 1),
('Hammer', 'Field Services', 'الخدمات الميدانية',
 'Professional installation and maintenance by our expert field team.',
 'تركيب وصيانة احترافية من قبل فريقنا الميداني الخبير.',
 'bg-coolnet-purple-light', 2),
('ShieldCheck', 'Cyber Protection', 'الحماية السيبرانية',
 'Advanced security features to keep your connection safe and secure.',
 'ميزات أمان متقدمة للحفاظ على اتصالك آمنًا ومحميًا.',
 'bg-green-500', 3),
('Phone', 'Professional Support', 'الدعم المهني',
 '24/7 customer support to assist you with any issues or questions.',
 'دعم العملاء على مدار الساعة لمساعدتك في أي مشاكل أو أسئلة.',
 'bg-orange-500', 4);
```

### 7. `speed_test_section` - Speed Test Display Config

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Section ID |
| `badge_ar` | VARCHAR(100) | NULL | Badge Arabic |
| `badge_en` | VARCHAR(100) | NULL | Badge English |
| `badge_he` | VARCHAR(100) | NULL | Badge Hebrew |
| `title_ar` | VARCHAR(255) | NOT NULL | Title Arabic |
| `title_en` | VARCHAR(255) | NOT NULL | Title English |
| `title_he` | VARCHAR(255) | NULL | Title Hebrew |
| `description_ar` | TEXT | NULL | Description Arabic |
| `description_en` | TEXT | NULL | Description English |
| `description_he` | TEXT | NULL | Description Hebrew |
| `demo_download_speed` | VARCHAR(20) | DEFAULT '950' | Demo download display |
| `demo_upload_speed` | VARCHAR(20) | DEFAULT '850' | Demo upload display |
| `demo_max_speed` | VARCHAR(20) | DEFAULT '1000' | Demo max display |

```sql
CREATE TABLE speed_test_section (
    id INT PRIMARY KEY AUTO_INCREMENT,
    badge_ar VARCHAR(100),
    badge_en VARCHAR(100),
    badge_he VARCHAR(100),
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_he VARCHAR(255),
    description_ar TEXT,
    description_en TEXT,
    description_he TEXT,
    demo_download_speed VARCHAR(20) DEFAULT '950',
    demo_upload_speed VARCHAR(20) DEFAULT '850',
    demo_max_speed VARCHAR(20) DEFAULT '1000'
);

-- Default Speed Test Section
INSERT INTO speed_test_section (badge_en, badge_ar, title_en, title_ar, description_en, description_ar) VALUES
('Free Speed Test', 'اختبار السرعة المجاني',
 'Internet Speed Test', 'اختبار سرعة الإنترنت',
 'Test your connection speed and get accurate measurements of your download and upload speeds.',
 'اختبر سرعة اتصالك واحصل على قياسات دقيقة لسرعات التحميل والرفع.');
```

### 8. `speed_test_features` - Speed Test Feature Points

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Feature ID |
| `text_ar` | VARCHAR(255) | NOT NULL | Text Arabic |
| `text_en` | VARCHAR(255) | NOT NULL | Text English |
| `text_he` | VARCHAR(255) | NULL | Text Hebrew |
| `sort_order` | INT | DEFAULT 0 | Display order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |

```sql
CREATE TABLE speed_test_features (
    id INT PRIMARY KEY AUTO_INCREMENT,
    text_ar VARCHAR(255) NOT NULL,
    text_en VARCHAR(255) NOT NULL,
    text_he VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Default Features
INSERT INTO speed_test_features (text_en, text_ar, sort_order) VALUES
('Accurate download speed measurement', 'قياس دقيق لسرعة التحميل', 1),
('Upload speed & latency testing', 'اختبار سرعة الرفع ووقت الاستجابة', 2),
('Real-time connection analysis', 'تحليل الاتصال في الوقت الفعلي', 3);
```

### 9. `app_download_section` - App Download Section

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Section ID |
| `title_ar` | VARCHAR(255) | NOT NULL | Title Arabic |
| `title_en` | VARCHAR(255) | NOT NULL | Title English |
| `title_he` | VARCHAR(255) | NULL | Title Hebrew |
| `subtitle_ar` | TEXT | NULL | Subtitle Arabic |
| `subtitle_en` | TEXT | NULL | Subtitle English |
| `subtitle_he` | TEXT | NULL | Subtitle Hebrew |
| `media_id` | INT | FK → media.id | App screenshot/mockup |

```sql
CREATE TABLE app_download_section (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_he VARCHAR(255),
    subtitle_ar TEXT,
    subtitle_en TEXT,
    subtitle_he TEXT,
    media_id INT,

    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE SET NULL
);

-- Default Content
INSERT INTO app_download_section (title_en, title_ar, subtitle_en, subtitle_ar) VALUES
('Download Our App Now', 'حمّل تطبيقنا الآن',
 'Enjoy a seamless experience managing your internet services from your smartphone.',
 'استمتع بتجربة سلسة في إدارة خدمات الإنترنت من هاتفك الذكي.');
```

### 10. `app_features` - App Download Feature Points

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Feature ID |
| `icon` | VARCHAR(50) | NOT NULL | Icon identifier |
| `text_ar` | VARCHAR(255) | NOT NULL | Text Arabic |
| `text_en` | VARCHAR(255) | NOT NULL | Text English |
| `text_he` | VARCHAR(255) | NULL | Text Hebrew |
| `sort_order` | INT | DEFAULT 0 | Display order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |

```sql
CREATE TABLE app_features (
    id INT PRIMARY KEY AUTO_INCREMENT,
    icon VARCHAR(50) NOT NULL,
    text_ar VARCHAR(255) NOT NULL,
    text_en VARCHAR(255) NOT NULL,
    text_he VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- Default Features
INSERT INTO app_features (icon, text_en, text_ar, sort_order) VALUES
('CreditCard', 'Pay Bills', 'دفع الفواتير', 1),
('BarChart', 'Monitor Usage', 'مراقبة الاستخدام', 2),
('Bell', 'Instant Notifications', 'إشعارات فورية', 3),
('Headphones', 'Direct Support', 'دعم مباشر', 4);
```

---

## Plans & Products

### 11. `plans` - Internet Plans

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Plan ID |
| `code` | VARCHAR(50) | UNIQUE, NOT NULL | Unique plan code |
| `category` | ENUM | NOT NULL | personal, business |
| `title_ar` | VARCHAR(100) | NOT NULL | Title Arabic |
| `title_en` | VARCHAR(100) | NOT NULL | Title English |
| `title_he` | VARCHAR(100) | NULL | Title Hebrew |
| `price` | DECIMAL(10,2) | NOT NULL | Monthly price (ILS) |
| `price_display_ar` | VARCHAR(50) | NULL | Custom price display Arabic |
| `price_display_en` | VARCHAR(50) | NULL | Custom price display English |
| `price_display_he` | VARCHAR(50) | NULL | Custom price display Hebrew |
| `download_speed` | VARCHAR(20) | NOT NULL | Download speed (Mbps) |
| `upload_speed` | VARCHAR(20) | NULL | Upload speed (Mbps) |
| `color` | VARCHAR(50) | DEFAULT '#3B82F6' | Theme color (hex or class) |
| `is_best_value` | BOOLEAN | DEFAULT FALSE | Featured badge |
| `is_plus` | BOOLEAN | DEFAULT FALSE | Plus tier styling |
| `is_custom` | BOOLEAN | DEFAULT FALSE | Custom pricing |
| `cta_text_ar` | VARCHAR(100) | NULL | CTA button Arabic |
| `cta_text_en` | VARCHAR(100) | NULL | CTA button English |
| `cta_text_he` | VARCHAR(100) | NULL | CTA button Hebrew |
| `cta_link` | VARCHAR(255) | DEFAULT '/new-line' | CTA URL |
| `sort_order` | INT | DEFAULT 0 | Display order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Available for purchase |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation date |
| `updated_at` | TIMESTAMP | ON UPDATE NOW() | Last modified |

```sql
CREATE TABLE plans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    category ENUM('personal', 'business') NOT NULL,
    title_ar VARCHAR(100) NOT NULL,
    title_en VARCHAR(100) NOT NULL,
    title_he VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    price_display_ar VARCHAR(50),
    price_display_en VARCHAR(50),
    price_display_he VARCHAR(50),
    download_speed VARCHAR(20) NOT NULL,
    upload_speed VARCHAR(20),
    color VARCHAR(50) DEFAULT '#3B82F6',
    is_best_value BOOLEAN DEFAULT FALSE,
    is_plus BOOLEAN DEFAULT FALSE,
    is_custom BOOLEAN DEFAULT FALSE,
    cta_text_ar VARCHAR(100),
    cta_text_en VARCHAR(100),
    cta_text_he VARCHAR(100),
    cta_link VARCHAR(255) DEFAULT '/new-line',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_category (category),
    INDEX idx_active (is_active),
    INDEX idx_sort (sort_order)
);

-- Personal Plans
INSERT INTO plans (code, category, title_en, title_ar, price, download_speed, upload_speed, color, is_plus, sort_order) VALUES
('basic', 'personal', 'Fiber-100 Mbps', 'فايبر-100 ميجابت', 120.00, '100', '100', 'bg-coolnet-purple', FALSE, 1),
('standard', 'personal', 'Fiber-200 Mbps', 'فايبر-200 ميجابت', 140.00, '200', '200', 'bg-coolnet-blue', TRUE, 2),
('premium', 'personal', 'Fiber-1000 Mbps', 'فايبر-1000 ميجابت', 330.00, '1000', '1000', 'bg-coolnet-purple', TRUE, 3);

-- Business Plans
INSERT INTO plans (code, category, title_en, title_ar, price, download_speed, upload_speed, color, is_plus, is_best_value, sort_order) VALUES
('business-basic', 'business', 'Business Basic', 'أساسي للأعمال', 349.00, '100', '100', 'bg-coolnet-purple', FALSE, FALSE, 1),
('business-standard', 'business', 'Business Standard', 'قياسي للأعمال', 479.00, '500', '500', 'bg-coolnet-blue', TRUE, TRUE, 2),
('business-premium', 'business', 'Business Premium', 'بريميوم للأعمال', 699.00, '1000', '1000', 'bg-coolnet-purple', TRUE, FALSE, 3),
('business-custom', 'business', 'Enterprise Custom', 'مخصص للشركات', 0.00, 'Custom', 'Custom', 'bg-amber-500', TRUE, FALSE, 4);

UPDATE plans SET is_best_value = TRUE WHERE code = 'standard';
UPDATE plans SET is_custom = TRUE, price_display_en = 'Custom Pricing', price_display_ar = 'أسعار مخصصة' WHERE code = 'business-custom';
```

### 12. `plan_features` - Plan Feature Bullets

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Feature ID |
| `plan_id` | INT | FK → plans.id | Parent plan |
| `icon` | VARCHAR(50) | NULL | Icon identifier |
| `text_ar` | VARCHAR(255) | NOT NULL | Text Arabic |
| `text_en` | VARCHAR(255) | NOT NULL | Text English |
| `text_he` | VARCHAR(255) | NULL | Text Hebrew |
| `is_highlighted` | BOOLEAN | DEFAULT FALSE | Emphasize feature |
| `sort_order` | INT | DEFAULT 0 | Display order |

```sql
CREATE TABLE plan_features (
    id INT PRIMARY KEY AUTO_INCREMENT,
    plan_id INT NOT NULL,
    icon VARCHAR(50),
    text_ar VARCHAR(255) NOT NULL,
    text_en VARCHAR(255) NOT NULL,
    text_he VARCHAR(255),
    is_highlighted BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,

    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE,
    INDEX idx_plan (plan_id)
);

-- Basic Plan Features
INSERT INTO plan_features (plan_id, text_en, text_ar, sort_order) VALUES
(1, 'Unlimited Download', 'تحميل غير محدود', 1),
(1, '100 Mbps Download Speed', 'سرعة تحميل 100 ميجابت', 2),
(1, '100 Mbps Upload Speed', 'سرعة رفع 100 ميجابت', 3),
(1, 'Free Installation', 'تركيب مجاني', 4),
(1, 'Field Support Team', 'فريق الدعم الميداني', 5),
(1, 'No Commitment', 'بدون التزام', 6);

-- Standard Plan Features
INSERT INTO plan_features (plan_id, text_en, text_ar, sort_order) VALUES
(2, 'Unlimited Download', 'تحميل غير محدود', 1),
(2, '200 Mbps Download Speed', 'سرعة تحميل 200 ميجابت', 2),
(2, '200 Mbps Upload Speed', 'سرعة رفع 200 ميجابت', 3),
(2, 'Free Installation', 'تركيب مجاني', 4),
(2, 'Field Support Team', 'فريق الدعم الميداني', 5),
(2, 'No Commitment', 'بدون التزام', 6),
(2, 'WiFi 6 Router Included', 'راوتر WiFi 6 مشمول', 7);

-- Premium Plan Features
INSERT INTO plan_features (plan_id, text_en, text_ar, sort_order) VALUES
(3, 'Unlimited Download', 'تحميل غير محدود', 1),
(3, '1000 Mbps Download Speed', 'سرعة تحميل 1000 ميجابت', 2),
(3, '1000 Mbps Upload Speed', 'سرعة رفع 1000 ميجابت', 3),
(3, 'Free Installation', 'تركيب مجاني', 4),
(3, 'Priority Support', 'دعم ذو أولوية', 5),
(3, 'No Commitment', 'بدون التزام', 6),
(3, 'WiFi 6 Router Included', 'راوتر WiFi 6 مشمول', 7);
```

### 13. `plan_addons` - Optional Add-on Services

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Add-on ID |
| `code` | VARCHAR(50) | UNIQUE, NOT NULL | Unique code |
| `name_ar` | VARCHAR(100) | NOT NULL | Name Arabic |
| `name_en` | VARCHAR(100) | NOT NULL | Name English |
| `name_he` | VARCHAR(100) | NULL | Name Hebrew |
| `description_ar` | TEXT | NULL | Description Arabic |
| `description_en` | TEXT | NULL | Description English |
| `description_he` | TEXT | NULL | Description Hebrew |
| `monthly_price` | DECIMAL(10,2) | NOT NULL | Monthly cost (ILS) |
| `icon` | VARCHAR(50) | NULL | Icon identifier |
| `sort_order` | INT | DEFAULT 0 | Display order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Available |

```sql
CREATE TABLE plan_addons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_he VARCHAR(100),
    description_ar TEXT,
    description_en TEXT,
    description_he TEXT,
    monthly_price DECIMAL(10,2) NOT NULL,
    icon VARCHAR(50),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    INDEX idx_code (code),
    INDEX idx_active (is_active)
);

-- Default Add-ons
INSERT INTO plan_addons (code, name_en, name_ar, description_en, description_ar, monthly_price, sort_order) VALUES
('fixed_ip', 'Fixed IP Address', 'عنوان IP ثابت',
 'Get a static IP address for your connection',
 'احصل على عنوان IP ثابت لاتصالك',
 20.00, 1),
('ap_filter', 'Anti-Pornography Filter', 'فلتر مكافحة المحتوى الإباحي',
 'Family-friendly content filtering service',
 'خدمة تصفية المحتوى المناسبة للعائلة',
 10.00, 2);
```

### 14. `routers` - Router Equipment

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Router ID |
| `sku` | VARCHAR(50) | UNIQUE, NOT NULL | Product SKU |
| `category` | VARCHAR(50) | NOT NULL | Product category |
| `title_ar` | VARCHAR(255) | NOT NULL | Title Arabic |
| `title_en` | VARCHAR(255) | NOT NULL | Title English |
| `title_he` | VARCHAR(255) | NULL | Title Hebrew |
| `description_ar` | TEXT | NULL | Description Arabic |
| `description_en` | TEXT | NULL | Description English |
| `description_he` | TEXT | NULL | Description Hebrew |
| `media_id` | INT | FK → media.id | Product image |
| `purchase_price` | DECIMAL(10,2) | NOT NULL | One-time price (ILS) |
| `rental_price` | DECIMAL(10,2) | NULL | Monthly rental (ILS) |
| `is_rentable` | BOOLEAN | DEFAULT TRUE | Can be rented |
| `offer_text_ar` | VARCHAR(100) | NULL | Promo text Arabic |
| `offer_text_en` | VARCHAR(100) | NULL | Promo text English |
| `offer_text_he` | VARCHAR(100) | NULL | Promo text Hebrew |
| `sort_order` | INT | DEFAULT 0 | Display order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Available |

```sql
CREATE TABLE routers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_he VARCHAR(255),
    description_ar TEXT,
    description_en TEXT,
    description_he TEXT,
    media_id INT,
    purchase_price DECIMAL(10,2) NOT NULL,
    rental_price DECIMAL(10,2),
    is_rentable BOOLEAN DEFAULT TRUE,
    offer_text_ar VARCHAR(100),
    offer_text_en VARCHAR(100),
    offer_text_he VARCHAR(100),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE SET NULL,
    INDEX idx_sku (sku),
    INDEX idx_active (is_active)
);

-- Default Routers
INSERT INTO routers (sku, category, title_en, title_ar, description_en, description_ar, purchase_price, rental_price, sort_order) VALUES
('TENDA-MESH-1PC', 'mesh', 'TENDA Mesh Wi-Fi 6 System (1 pcs)', 'نظام TENDA Mesh Wi-Fi 6 (قطعة واحدة)',
 'Perfect for small apartments and studios. Covers up to 1,500 sq ft.',
 'مثالي للشقق الصغيرة والاستوديوهات. يغطي حتى 150 متر مربع.',
 390.00, 20.00, 1),
('TENDA-MESH-2PC', 'mesh', 'TENDA Mesh Wi-Fi 6 System (2 pcs)', 'نظام TENDA Mesh Wi-Fi 6 (قطعتين)',
 'Ideal for medium-sized homes. Covers up to 3,000 sq ft.',
 'مثالي للمنازل متوسطة الحجم. يغطي حتى 300 متر مربع.',
 690.00, 40.00, 2),
('TENDA-MESH-3PC', 'mesh', 'TENDA Mesh Wi-Fi 6 System (3 pcs)', 'نظام TENDA Mesh Wi-Fi 6 (3 قطع)',
 'Best for large homes and multiple floors. Covers up to 5,000 sq ft.',
 'الأفضل للمنازل الكبيرة والطوابق المتعددة. يغطي حتى 500 متر مربع.',
 990.00, 60.00, 3);
```

### 15. `zones` - Service Coverage Zones

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Zone ID |
| `code` | VARCHAR(20) | UNIQUE, NOT NULL | Zone code |
| `name_ar` | VARCHAR(100) | NOT NULL | Name Arabic |
| `name_en` | VARCHAR(100) | NOT NULL | Name English |
| `name_he` | VARCHAR(100) | NULL | Name Hebrew |
| `coverage_polygon` | JSON | NULL | GeoJSON boundary |
| `is_active` | BOOLEAN | DEFAULT TRUE | Service available |

```sql
CREATE TABLE zones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(20) UNIQUE NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_he VARCHAR(100),
    coverage_polygon JSON,
    is_active BOOLEAN DEFAULT TRUE,

    INDEX idx_code (code),
    INDEX idx_active (is_active)
);
```

### 16. `dealers` - Retail Locations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Dealer ID |
| `name_ar` | VARCHAR(255) | NOT NULL | Name Arabic |
| `name_en` | VARCHAR(255) | NOT NULL | Name English |
| `name_he` | VARCHAR(255) | NULL | Name Hebrew |
| `address_ar` | VARCHAR(500) | NOT NULL | Address Arabic |
| `address_en` | VARCHAR(500) | NOT NULL | Address English |
| `address_he` | VARCHAR(500) | NULL | Address Hebrew |
| `phone` | VARCHAR(20) | NOT NULL | Contact phone |
| `email` | VARCHAR(255) | NULL | Contact email |
| `working_hours_ar` | VARCHAR(255) | NULL | Hours Arabic |
| `working_hours_en` | VARCHAR(255) | NULL | Hours English |
| `working_hours_he` | VARCHAR(255) | NULL | Hours Hebrew |
| `lat` | DECIMAL(10,8) | NOT NULL | Latitude |
| `lng` | DECIMAL(11,8) | NOT NULL | Longitude |
| `media_id` | INT | FK → media.id | Store image |
| `has_installation` | BOOLEAN | DEFAULT FALSE | Offers installation |
| `has_support` | BOOLEAN | DEFAULT FALSE | Offers tech support |
| `has_new_connections` | BOOLEAN | DEFAULT TRUE | Accepts new orders |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |

```sql
CREATE TABLE dealers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_he VARCHAR(255),
    address_ar VARCHAR(500) NOT NULL,
    address_en VARCHAR(500) NOT NULL,
    address_he VARCHAR(500),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    working_hours_ar VARCHAR(255),
    working_hours_en VARCHAR(255),
    working_hours_he VARCHAR(255),
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    media_id INT,
    has_installation BOOLEAN DEFAULT FALSE,
    has_support BOOLEAN DEFAULT FALSE,
    has_new_connections BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE SET NULL,
    INDEX idx_location (lat, lng),
    INDEX idx_active (is_active)
);
```

### 17. `partners` - Business Partner Logos

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Partner ID |
| `name` | VARCHAR(255) | NOT NULL | Company name |
| `media_id` | INT | FK → media.id | Logo image |
| `website_url` | VARCHAR(500) | NULL | Partner website |
| `category` | VARCHAR(50) | DEFAULT 'business' | Partner type |
| `sort_order` | INT | DEFAULT 0 | Display order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Show on site |

```sql
CREATE TABLE partners (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    media_id INT,
    website_url VARCHAR(500),
    category VARCHAR(50) DEFAULT 'business',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (media_id) REFERENCES media(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_active (is_active)
);
```

---

## Navigation & Menus

### 18. `nav_items` - Navigation Menu Items

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Item ID |
| `menu_location` | ENUM | NOT NULL | header, footer, mobile |
| `parent_id` | INT | FK → nav_items.id | Parent for submenus |
| `label_ar` | VARCHAR(100) | NOT NULL | Label Arabic |
| `label_en` | VARCHAR(100) | NOT NULL | Label English |
| `label_he` | VARCHAR(100) | NULL | Label Hebrew |
| `link_type` | ENUM | NOT NULL | url, anchor, page |
| `link_value` | VARCHAR(255) | NOT NULL | URL or anchor ID |
| `icon` | VARCHAR(50) | NULL | Icon identifier |
| `target` | ENUM | DEFAULT '_self' | _self, _blank |
| `sort_order` | INT | DEFAULT 0 | Display order |
| `is_active` | BOOLEAN | DEFAULT TRUE | Active status |

```sql
CREATE TABLE nav_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    menu_location ENUM('header', 'footer', 'mobile') NOT NULL,
    parent_id INT,
    label_ar VARCHAR(100) NOT NULL,
    label_en VARCHAR(100) NOT NULL,
    label_he VARCHAR(100),
    link_type ENUM('url', 'anchor', 'page') NOT NULL,
    link_value VARCHAR(255) NOT NULL,
    icon VARCHAR(50),
    target ENUM('_self', '_blank') DEFAULT '_self',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,

    FOREIGN KEY (parent_id) REFERENCES nav_items(id) ON DELETE CASCADE,
    INDEX idx_location (menu_location),
    INDEX idx_active (is_active)
);

-- Header Navigation
INSERT INTO nav_items (menu_location, label_en, label_ar, link_type, link_value, icon, sort_order) VALUES
('header', 'Home', 'الرئيسية', 'anchor', 'home', 'Home', 1),
('header', 'Features', 'المميزات', 'anchor', 'features', 'Zap', 2),
('header', 'Speed Test', 'اختبار السرعة', 'anchor', 'speed-test', 'Gauge', 3),
('header', 'Dealers', 'نقاط البيع', 'url', '/dealers', 'Users', 4),
('header', 'Client Area', 'منطقة العميل', 'url', '/customer-corner', 'CircleUserRound', 5);

-- Footer Navigation (Quick Links)
INSERT INTO nav_items (menu_location, label_en, label_ar, link_type, link_value, sort_order) VALUES
('footer', 'Home', 'الرئيسية', 'anchor', 'home', 1),
('footer', 'Features', 'المميزات', 'anchor', 'features', 2),
('footer', 'Plans', 'الباقات', 'anchor', 'plans', 3),
('footer', 'Speed Test', 'اختبار السرعة', 'anchor', 'speed-test', 4),
('footer', 'Dealers', 'نقاط البيع', 'url', '/dealers', 5);
```

---

## Pages & SEO

### 19. `pages` - Page Registry

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Page ID |
| `slug` | VARCHAR(100) | UNIQUE, NOT NULL | URL slug |
| `title_ar` | VARCHAR(255) | NOT NULL | Page title Arabic |
| `title_en` | VARCHAR(255) | NOT NULL | Page title English |
| `title_he` | VARCHAR(255) | NULL | Page title Hebrew |
| `template` | VARCHAR(50) | DEFAULT 'default' | Page template |
| `is_published` | BOOLEAN | DEFAULT TRUE | Published status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Creation date |
| `updated_at` | TIMESTAMP | ON UPDATE NOW() | Last modified |

```sql
CREATE TABLE pages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    title_he VARCHAR(255),
    template VARCHAR(50) DEFAULT 'default',
    is_published BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_slug (slug),
    INDEX idx_published (is_published)
);

-- Default Pages
INSERT INTO pages (slug, title_en, title_ar) VALUES
('home', 'Home', 'الرئيسية'),
('dealers', 'Payment Locations', 'نقاط الدفع'),
('new-line', 'Order New Line', 'طلب خط جديد'),
('activate-service', 'Activate Service', 'تفعيل الخدمة'),
('speed-test', 'Speed Test', 'اختبار السرعة'),
('business', 'Business Solutions', 'حلول الأعمال'),
('customer-corner', 'Customer Corner', 'ركن العميل');
```

### 20. `page_seo` - Page SEO Metadata

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | SEO ID |
| `page_id` | INT | FK → pages.id | Parent page |
| `meta_title_ar` | VARCHAR(70) | NULL | Meta title Arabic |
| `meta_title_en` | VARCHAR(70) | NULL | Meta title English |
| `meta_title_he` | VARCHAR(70) | NULL | Meta title Hebrew |
| `meta_description_ar` | VARCHAR(160) | NULL | Meta desc Arabic |
| `meta_description_en` | VARCHAR(160) | NULL | Meta desc English |
| `meta_description_he` | VARCHAR(160) | NULL | Meta desc Hebrew |
| `og_image_id` | INT | FK → media.id | Open Graph image |
| `canonical_url` | VARCHAR(500) | NULL | Canonical URL |
| `robots` | VARCHAR(50) | DEFAULT 'index,follow' | Robots directive |

```sql
CREATE TABLE page_seo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    page_id INT NOT NULL,
    meta_title_ar VARCHAR(70),
    meta_title_en VARCHAR(70),
    meta_title_he VARCHAR(70),
    meta_description_ar VARCHAR(160),
    meta_description_en VARCHAR(160),
    meta_description_he VARCHAR(160),
    og_image_id INT,
    canonical_url VARCHAR(500),
    robots VARCHAR(50) DEFAULT 'index,follow',

    FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE,
    FOREIGN KEY (og_image_id) REFERENCES media(id) ON DELETE SET NULL,
    UNIQUE KEY unique_page (page_id)
);
```

---

## Localization

### 21. `translations` - Dynamic Translation Overrides

For runtime translation additions/overrides beyond static i18n files.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PK, AUTO_INCREMENT | Translation ID |
| `translation_key` | VARCHAR(255) | NOT NULL | Dot-notation key |
| `value_ar` | TEXT | NULL | Arabic value |
| `value_en` | TEXT | NULL | English value |
| `value_he` | TEXT | NULL | Hebrew value |
| `namespace` | VARCHAR(50) | DEFAULT 'common' | i18n namespace |
| `updated_at` | TIMESTAMP | ON UPDATE NOW() | Last modified |

```sql
CREATE TABLE translations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    translation_key VARCHAR(255) NOT NULL,
    value_ar TEXT,
    value_en TEXT,
    value_he TEXT,
    namespace VARCHAR(50) DEFAULT 'common',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_key (translation_key, namespace),
    INDEX idx_namespace (namespace)
);
```

---

## Complete SQL Migration

```sql
-- ============================================
-- COOLNET CMS DATABASE MIGRATION
-- Run in order to create complete schema
-- ============================================

-- Enable UUID support (if using MySQL 8+)
-- SET GLOBAL log_bin_trust_function_creators = 1;

-- Create database
CREATE DATABASE IF NOT EXISTS coolnet_cms
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE coolnet_cms;

-- ============================================
-- 1. MEDIA MANAGEMENT
-- ============================================
-- Tables: media, media_variants
-- (SQL provided above)

-- ============================================
-- 2. SITE CONFIGURATION
-- ============================================
-- Tables: site_settings, social_links
-- (SQL provided above)

-- ============================================
-- 3. PAGE SECTIONS
-- ============================================
-- Tables: hero_slides, features, speed_test_section,
--         speed_test_features, app_download_section, app_features
-- (SQL provided above)

-- ============================================
-- 4. PLANS & PRODUCTS
-- ============================================
-- Tables: plans, plan_features, plan_addons, routers, zones, dealers, partners
-- (SQL provided above)

-- ============================================
-- 5. NAVIGATION & MENUS
-- ============================================
-- Tables: nav_items
-- (SQL provided above)

-- ============================================
-- 6. PAGES & SEO
-- ============================================
-- Tables: pages, page_seo
-- (SQL provided above)

-- ============================================
-- 7. LOCALIZATION
-- ============================================
-- Tables: translations
-- (SQL provided above)

-- ============================================
-- INDEXES SUMMARY
-- ============================================
-- All tables include appropriate indexes for:
-- - Primary keys (auto-increment)
-- - Foreign key relationships
-- - Active/published status filtering
-- - Sort order queries
-- - Language lookups
```

---

## API Response Examples

### Get Hero Section
```json
{
  "slides": [
    {
      "id": 1,
      "image": {
        "url": "/images/hero/main.png",
        "alt": "Fast fiber internet"
      },
      "badge": "Lightning Fast Fiber Internet",
      "title": "Blazing Fast Internet for East Jerusalem",
      "subtitle": "Experience high-speed fiber connectivity...",
      "cta_primary": { "text": "View Plans", "link": "#plans" },
      "cta_secondary": { "text": "Learn More", "link": "#features" }
    }
  ],
  "stats": {
    "happy_customers": "10K+",
    "uptime": "99.9%",
    "max_speed": "1Gbps"
  }
}
```

### Get Features
```json
{
  "section": {
    "title": "Why Choose Coolnet",
    "subtitle": "Enjoy high speed, reliability, and effective support"
  },
  "features": [
    {
      "id": 1,
      "icon": "Gauge",
      "title": "Consistent Speeds",
      "description": "Experience reliable and consistent internet speeds...",
      "image": { "url": "/images/features/speed.png" },
      "bg_color": "bg-blue-500"
    }
  ]
}
```

### Get Plans
```json
{
  "personal": [
    {
      "id": 1,
      "code": "basic",
      "title": "Fiber-100 Mbps",
      "price": 120,
      "speed": { "download": "100", "upload": "100" },
      "features": ["Unlimited Download", "100 Mbps Download Speed", "..."],
      "color": "bg-coolnet-purple",
      "is_best_value": false,
      "cta": { "text": "Choose Plan", "link": "/new-line?plan=basic" }
    }
  ],
  "business": [...]
}
```

---

## Notes

1. **Multi-language**: All content tables have `_ar`, `_en`, `_he` suffixed columns
2. **Images**: All images reference the central `media` table via `media_id`
3. **Currency**: All prices in Israeli New Shekel (ILS/₪)
4. **RTL Support**: Arabic and Hebrew are RTL languages
5. **Icons**: Using Lucide icon names (React component names)

---

*This CMS schema enables full dynamic control of all Coolnet website content.*

import { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'en' | 'tr';

const translations = {
    en: {
        common: {
            loading: 'Loading...',
            submit: 'Submit',
            cancel: 'Cancel',
            pass: 'PASS',
            fail: 'FAIL',
            machine: 'Machine',
            product: 'Product',
            template: 'Template',
            templates: 'Templates',
            date: 'Date',
            time: 'Time',
            sent: 'Sent',
            history: 'History',
            back: 'Go Back',
            close: 'Close',
            yes: 'Yes',
            no: 'No',
            ok: 'OK',
            save: 'Save',
            delete: 'Delete',
            edit: 'Edit',
            search: 'Search',
            noData: 'No data available',
            error: 'An error occurred',
            success: 'Success',
            warning: 'Warning',
            info: 'Information',
        },
        login: {
            title: 'Operator Login',
            subtitle: 'Sign in to start quality control',
            username: 'Username',
            password: 'Password',
            signIn: 'Sign In',
            signingIn: 'Signing in...',
            failed: 'Login failed. Please check your credentials.',
            welcome: 'Welcome back!',
        },
        dashboard: {
            title: 'Select Machine',
            subtitle: 'Choose a machine to start QC entry',
            noMachines: 'No machines available',
            startQc: 'Start QC',
            selectTemplate: 'Select Template',
            templateCount: 'templates',
            tapToStart: 'Tap to start quality check',
        },
        templateModal: {
            title: 'Start QC Control',
            subtitle: 'Select a template below to begin quality control',
            noTemplates: 'No templates found for this machine',
            addFromAdmin: 'Add templates from admin panel',
            tapToFill: 'Tap to fill the control form',
        },
        qcEntry: {
            title: 'Quality Control',
            section: 'Section',
            of: 'of',
            next: 'Next',
            previous: 'Previous',
            submitRecord: 'Submit Record',
            confirmSubmit: 'Confirm Submission',
            confirmMessage: 'Are you sure you want to submit this QC record?',
            success: 'Record submitted successfully!',
            error: 'Failed to submit record',
            sample: 'Sample',
            samples: 'samples',
            passed: 'Passed',
            failed: 'Failed',
            partial: 'Partial',
            empty: 'Empty',
            selectOption: 'Select an option...',
            enterValue: 'Enter value...',
            enterNote: 'Enter note...',
            completed: 'completed',
            exitConfirm: 'Are you sure you want to exit?',
            dataSaved: 'Your data has been saved automatically.',
            exit: 'Exit',
        },
        history: {
            title: 'My Submissions',
            empty: 'No submissions yet',
            submittedAt: 'Submitted at',
            viewDetails: 'View Details',
        },
        theme: {
            light: 'Light Mode',
            dark: 'Dark Mode',
            system: 'System',
        },
        loading: {
            title: 'Saphire',
            subtitle: 'Quality Control System',
            preparing: 'Preparing...',
        },
    },
    tr: {
        common: {
            loading: 'Yükleniyor...',
            submit: 'Gönder',
            cancel: 'İptal',
            pass: 'GEÇTİ',
            fail: 'KALDI',
            machine: 'Makine',
            product: 'Ürün',
            template: 'Şablon',
            templates: 'Şablon',
            date: 'Tarih',
            time: 'Saat',
            sent: 'Gönderildi',
            history: 'Geçmiş',
            back: 'Geri Dön',
            close: 'Kapat',
            yes: 'Evet',
            no: 'Hayır',
            ok: 'Tamam',
            save: 'Kaydet',
            delete: 'Sil',
            edit: 'Düzenle',
            search: 'Ara',
            noData: 'Veri bulunamadı',
            error: 'Bir hata oluştu',
            success: 'Başarılı',
            warning: 'Uyarı',
            info: 'Bilgi',
        },
        login: {
            title: 'Operatör Girişi',
            subtitle: 'Kalite kontrole başlamak için giriş yapın',
            username: 'Kullanıcı Adı',
            password: 'Şifre',
            signIn: 'Giriş Yap',
            signingIn: 'Giriş yapılıyor...',
            failed: 'Giriş başarısız. Bilgilerinizi kontrol edin.',
            welcome: 'Tekrar hoş geldiniz!',
        },
        dashboard: {
            title: 'Makine Seç',
            subtitle: 'Kalite Kontrol girişi için bir makine seçin',
            noMachines: 'Makine bulunamadı',
            startQc: 'Kalite Kontrol Başlat',
            selectTemplate: 'Şablon Seç',
            templateCount: 'şablon',
            tapToStart: 'Kalite kontrole başlamak için dokunun',
        },
        templateModal: {
            title: 'Kalite Kontrolü Başlat',
            subtitle: 'Aşağıdan bir şablon seçerek kalite kontrole başlayın',
            noTemplates: 'Bu makine için şablon bulunamadı',
            addFromAdmin: 'Admin panelinden şablon ekleyin',
            tapToFill: 'Kontrol formunu doldurmak için dokunun',
        },
        qcEntry: {
            title: 'Kalite Kontrol',
            section: 'Bölüm',
            of: '/',
            next: 'İleri',
            previous: 'Geri',
            submitRecord: 'Kaydı Gönder',
            confirmSubmit: 'Gönderimi Onayla',
            confirmMessage: 'Bu Kalite Kontrol kaydını göndermek istediğinize emin misiniz?',
            success: 'Kayıt başarıyla gönderildi!',
            error: 'Kayıt gönderilemedi',
            sample: 'Numune',
            samples: 'numune',
            passed: 'Geçti',
            failed: 'Kaldı',
            partial: 'Kısmen',
            empty: 'Boş',
            selectOption: 'Seçiniz...',
            enterValue: 'Değer girin...',
            enterNote: 'Açıklama girin...',
            completed: 'tamamlandı',
            exitConfirm: 'Çıkmak istediğinize emin misiniz?',
            dataSaved: 'Girdiğiniz veriler otomatik olarak kaydedildi.',
            exit: 'Çık',
        },
        history: {
            title: 'Gönderimlerim',
            empty: 'Henüz gönderim yok',
            submittedAt: 'Gönderilme zamanı',
            viewDetails: 'Detayları Gör',
        },
        theme: {
            light: 'Açık Mod',
            dark: 'Karanlık Mod',
            system: 'Sistem',
        },
        loading: {
            title: 'Saphire',
            subtitle: 'Kalite Kontrol Sistemi',
            preparing: 'Hazırlanıyor...',
        },
    },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        return (saved as Language) || 'tr';
    });

    const handleSetLanguage = (lang: Language) => {
        localStorage.setItem('language', lang);
        setLanguage(lang);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
}


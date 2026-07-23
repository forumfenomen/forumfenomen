export type LegalDocumentKey =
  | "kvkk-aydinlatma"
  | "gizlilik"
  | "cerez-politikasi"
  | "kullanim-kosullari"
  | "topluluk-kurallari"
  | "moderasyon-politikasi"
  | "telif-ve-ihlal"
  | "hesap-ve-veri-silme"
  | "kvkk-basvuru";

type LocalizedText = {
  tr: string;
  en: string;
};

type LegalSection = {
  title: LocalizedText;
  body: LocalizedText;
};

export type LegalDocument = {
  key: LegalDocumentKey;
  route: string;
  icon: string;
  title: LocalizedText;
  summary: LocalizedText;
  sections: LegalSection[];
};

export const legalDocuments: LegalDocument[] = [
  {
    key: "kvkk-aydinlatma",
    route: "/yasal/kvkk-aydinlatma",
    icon: "KV",

    title: {
      tr: "KVKK Aydınlatma Metni",
      en: "Personal Data Privacy Notice",
    },

    summary: {
      tr: "ForumFenomen tarafından işlenen kişisel veriler, işleme amaçları, hukuki sebepler, aktarım grupları ve kullanıcı hakları hakkında bilgi verir.",
      en: "Explains the personal data processed by ForumFenomen, purposes, legal grounds, recipient groups and user rights.",
    },

    sections: [
      {
        title: {
          tr: "1. Metnin Amacı",
          en: "1. Purpose of This Notice",
        },

        body: {
          tr: "Bu Aydınlatma Metni, forumfenomen.com platformunu kullanan ziyaretçi ve üyelerin kişisel verilerinin işlenmesine ilişkin bilgi vermek amacıyla hazırlanmıştır. Bu metin bir açık rıza veya sözleşme onayı değildir. Açık rıza gerektiren bir işlem bulunması halinde ilgili işlem için ayrıca ve özgür iradeye dayalı bir tercih sunulur.",
          en: "This Notice explains how personal data of visitors and members using forumfenomen.com is processed. It is not a consent form or contractual approval. Where processing requires consent, a separate and freely given choice will be presented.",
        },
      },

      {
        title: {
          tr: "2. Veri Sorumlusu",
          en: "2. Data Controller",
        },

        body: {
          tr: "Kişisel verileriniz, veri sorumlusu sıfatıyla Türkiye'de faaliyet gösteren ForumFenomen tarafından işlenmektedir. Geçici iletişim kanalı merhaba@forumfenomen.com adresidir. ForumFenomen'i işleten gerçek veya tüzel kişinin resmî unvanı ve açık adresi kesinleştiğinde bu bölüm güncellenecektir.",
          en: "Your personal data is processed by ForumFenomen, operating in Türkiye, as data controller. The temporary contact channel is merhaba@forumfenomen.com. This section will be updated when the official name and full address of the person or legal entity operating ForumFenomen are finalized.",
        },
      },

      {
        title: {
          tr: "3. Hesap ve Üyelik Verileri",
          en: "3. Account and Membership Data",
        },

        body: {
          tr: "Üyelik sistemi etkinleştirildiğinde e-posta adresi, kullanıcı adı, görünen ad, profil fotoğrafı, giriş sağlayıcı kimliği ve hesap oluşturma bilgileri işlenebilir. Bu veriler hesabın oluşturulması, oturum açılması, kullanıcıya hizmet sunulması, hesap güvenliğinin sağlanması ve üyelik sözleşmesinin yürütülmesi amaçlarıyla işlenir.",
          en: "When membership becomes active, email address, username, display name, profile image, identity-provider identifier and account creation details may be processed. These data are used to create accounts, authenticate users, provide services, secure accounts and perform the membership agreement.",
        },
      },

      {
        title: {
          tr: "4. Profil ve Kullanıcı İçerikleri",
          en: "4. Profile and User Content",
        },

        body: {
          tr: "Kullanıcının tercihine göre profil açıklaması, sosyal medya bağlantıları, uzmanlık alanları ve benzeri profil bilgileri işlenebilir. Açılan konular, yorumlar, etiketler, anketler, yüklenen görseller ve diğer kullanıcı içerikleri platform hizmetinin sunulması, topluluk etkileşiminin sağlanması, moderasyon ve uyuşmazlıkların yönetilmesi amaçlarıyla işlenir. Kullanıcı tarafından herkese açık paylaşılan içerikler diğer internet kullanıcıları tarafından görüntülenebilir.",
          en: "Profile descriptions, social links, areas of expertise and similar profile data may be processed where provided by the user. Topics, comments, tags, polls, uploaded images and other user content are processed to provide the platform, enable community interaction, moderate content and manage disputes. Public content may be viewed by other internet users.",
        },
      },

      {
        title: {
          tr: "5. Teknik ve Güvenlik Verileri",
          en: "5. Technical and Security Data",
        },

        body: {
          tr: "IP adresi, oturum ve erişim zamanları, cihaz ve tarayıcı bilgileri, hata kayıtları, güvenlik olayları ve benzeri teknik kayıtlar; platformun çalıştırılması, hataların giderilmesi, kötüye kullanımın ve yetkisiz erişimin önlenmesi, hesap güvenliğinin sağlanması ve hukuki yükümlülüklerin yerine getirilmesi amaçlarıyla işlenebilir.",
          en: "IP address, access and session times, device and browser information, error logs, security events and similar technical records may be processed to operate the platform, resolve errors, prevent abuse and unauthorized access, secure accounts and comply with legal obligations.",
        },
      },

      {
        title: {
          tr: "6. İletişim ve Destek Verileri",
          en: "6. Contact and Support Data",
        },

        body: {
          tr: "İletişim formu veya e-posta kanalları üzerinden iletilen ad soyad, e-posta adresi, iletişim konusu, mesaj içeriği ve kullanıcı tarafından eklenebilecek belgeler; taleplerin cevaplandırılması, destek sağlanması, şikâyetlerin incelenmesi ve hukuki hakların korunması amaçlarıyla işlenebilir.",
          en: "Full name, email address, contact subject, message content and documents submitted through contact forms or email may be processed to respond to requests, provide support, review complaints and protect legal rights.",
        },
      },

      {
        title: {
          tr: "7. Moderasyon ve Güvenlik Kayıtları",
          en: "7. Moderation and Safety Records",
        },

        body: {
          tr: "İçerik bildirimleri, moderasyon kararları, ihlal nedenleri, kullanıcı uyarıları ve hesap kısıtlama kayıtları; Forum Kurallarının uygulanması, topluluğun güvenliğinin korunması, tekrarlanan ihlallerin tespit edilmesi ve itirazların değerlendirilmesi amaçlarıyla işlenebilir.",
          en: "Content reports, moderation decisions, violation reasons, warnings and account restriction records may be processed to enforce Forum Rules, protect community safety, detect repeated violations and review appeals.",
        },
      },

      {
        title: {
          tr: "8. Toplama Yöntemi ve Hukuki Sebepler",
          en: "8. Collection Methods and Legal Grounds",
        },

        body: {
          tr: "Kişisel veriler; üyelik ve profil formları, sosyal giriş sağlayıcıları, kullanıcı paylaşımları, iletişim formları, güvenlik kayıtları, sunucu logları ve çerez veya benzeri teknolojiler aracılığıyla otomatik ya da kısmen otomatik yöntemlerle toplanabilir. Veriler; sözleşmenin kurulması veya ifası, hukuki yükümlülüğün yerine getirilmesi, bir hakkın tesisi, kullanılması veya korunması ve ilgili kişinin temel haklarına zarar vermeyen meşru menfaatler kapsamında işlenebilir. Açık rıza gereken işlemler ayrıca belirtilir.",
          en: "Personal data may be collected automatically or partly automatically through registration and profile forms, identity providers, user submissions, contact forms, security records, server logs, cookies and similar technologies. Processing may rely on contract performance, compliance with legal obligations, establishment or protection of rights and legitimate interests that do not override user rights. Processing requiring consent will be identified separately.",
        },
      },

      {
        title: {
          tr: "9. Verilerin Aktarılabileceği Taraflar",
          en: "9. Recipients of Personal Data",
        },

        body: {
          tr: "Kişisel veriler; barındırma, veri tabanı, dosya depolama, kimlik doğrulama, güvenlik, iletişim ve teknik destek hizmeti sağlayan tedarikçilerle yalnızca hizmetin gerektirdiği ölçüde paylaşılabilir. Hukuki uyuşmazlıklarda avukatlar ve danışmanlarla; mevzuata uygun taleplerde yetkili kamu kurumları ve adli makamlarla paylaşım yapılabilir. Reklamverenlere kişisel iletişim bilgileri doğrudan verilmez; reklam ve analiz hizmetleri için kullanılabilecek teknolojiler Çerez Politikasında ayrıca açıklanır.",
          en: "Personal data may be shared with providers of hosting, databases, file storage, authentication, security, communication and technical support only to the extent required for the service. Data may also be shared with lawyers and advisers in disputes and with competent authorities following lawful requests. Personal contact details are not directly provided to advertisers; advertising and analytics technologies will be explained separately in the Cookie Policy.",
        },
      },

      {
        title: {
          tr: "10. Yurt Dışına Aktarım",
          en: "10. International Transfers",
        },

        body: {
          tr: "ForumFenomen'in kullanacağı barındırma, veri tabanı, kimlik doğrulama veya benzeri hizmet sağlayıcıların yurt dışında bulunması halinde kişisel veriler yalnızca yürürlükteki KVKK hükümlerinde öngörülen aktarım şartlarından biri sağlanarak yurt dışına aktarılır. Kullanılan sağlayıcılar ve aktarım mekanizması teknik altyapı kesinleştiğinde somut olarak açıklanacaktır.",
          en: "Where hosting, database, authentication or similar providers used by ForumFenomen are located abroad, personal data will be transferred only where a transfer mechanism permitted under applicable data protection law is implemented. Providers and transfer mechanisms will be listed when the technical infrastructure is finalized.",
        },
      },

      {
        title: {
          tr: "11. Saklama Süreleri",
          en: "11. Retention Periods",
        },

        body: {
          tr: "Kişisel veriler her veri kategorisi bakımından işleme amacının gerektirdiği süre, üyelik ilişkisi ve uygulanabilir yasal saklama yükümlülükleri dikkate alınarak muhafaza edilir. Amaç ve hukuki sebep sona erdiğinde veriler silinir, yok edilir veya anonim hale getirilir. Güvenlik ve hukuki uyuşmazlık kayıtları, ilgili talep ve zamanaşımı süreleri boyunca sınırlı şekilde saklanabilir.",
          en: "Personal data is retained for the period required by its purpose, the membership relationship and applicable legal retention obligations. When the purpose and legal ground cease, data is deleted, destroyed or anonymized. Security and dispute records may be retained for relevant claim and limitation periods.",
        },
      },

      {
        title: {
          tr: "12. KVKK Kapsamındaki Haklar",
          en: "12. Your Data Protection Rights",
        },

        body: {
          tr: "İlgili kişiler, KVKK'nın 11. maddesi kapsamındaki haklarını kullanabilir. Bu kapsamda verilerin işlenip işlenmediğini öğrenme, bilgi talep etme, işleme amacını öğrenme, aktarılan taraflar hakkında bilgi isteme, eksik veya yanlış verilerin düzeltilmesini isteme ve şartları oluştuğunda silme veya yok etme talebinde bulunma hakları bulunmaktadır.",
          en: "Data subjects may exercise their rights under applicable data protection law, including asking whether data is processed, requesting information, learning the purposes of processing and recipients, requesting correction and, where conditions are met, requesting deletion or destruction.",
        },
      },

      {
        title: {
          tr: "13. Başvuru ve Güncellemeler",
          en: "13. Requests and Updates",
        },

        body: {
          tr: "KVKK kapsamındaki başvurular şimdilik merhaba@forumfenomen.com adresine, mümkünse üyelikte kullanılan e-posta hesabından gönderilebilir. Kimliğin doğrulanması için talebin niteliğiyle orantılı ek bilgi istenebilir. Veri işleme faaliyetlerinde değişiklik olması halinde bu metin işleme başlamadan önce güncellenir.",
          en: "Privacy requests may currently be sent to merhaba@forumfenomen.com, preferably from the email associated with the account. Proportionate information may be requested to verify identity. This Notice will be updated before materially changed processing begins.",
        },
      },
    ],
  },
  {
    key: "gizlilik",
    route: "/yasal/gizlilik",
    icon: "GZ",

    title: {
      tr: "Gizlilik Politikası",
      en: "Privacy Policy",
    },

    summary: {
      tr: "ForumFenomen'in kullanıcı gizliliğine, veri güvenliğine ve platform üzerindeki paylaşımlara ilişkin yaklaşımını açıklar.",
      en: "Explains ForumFenomen's approach to user privacy, data security and content shared on the platform.",
    },

    sections: [
      {
        title: {
          tr: "1. Politikanın Kapsamı",
          en: "1. Scope",
        },

        body: {
          tr: "Bu Gizlilik Politikası forumfenomen.com internet sitesi ile ForumFenomen'in ileride sunabileceği bağlantılı web ve mobil hizmetleri kapsar. Politika, kişisel verilerin korunmasına ilişkin genel yaklaşımı açıklar. Kişisel veri işleme faaliyetlerine ilişkin ayrıntılı ve hukuki bilgilendirme için KVKK Aydınlatma Metni esas alınır.",
          en: "This Privacy Policy applies to forumfenomen.com and related web or mobile services that ForumFenomen may provide. It describes the general approach to privacy. The KVKK Privacy Notice provides the detailed legal information about personal data processing.",
        },
      },

      {
        title: {
          tr: "2. Toplanabilecek Bilgiler",
          en: "2. Information We May Collect",
        },

        body: {
          tr: "Hizmetin niteliğine bağlı olarak hesap ve profil bilgileri, kullanıcı tarafından oluşturulan içerikler, iletişim ve destek talepleri, moderasyon kayıtları, IP adresi, cihaz, tarayıcı, oturum, hata ve güvenlik kayıtları ile çerez tercihleri işlenebilir. ForumFenomen'in mevcut planında özel mesaj, ödeme, banka hesabı veya kimlik belgesi toplama sistemi bulunmamaktadır. Böyle bir özellik ileride eklenirse politika ve aydınlatma metni kullanılmaya başlamadan önce güncellenir.",
          en: "Depending on the service, account and profile details, user content, contact and support requests, moderation records, IP address, device, browser, session, error and security records and cookie preferences may be processed. ForumFenomen's current plan does not include private messaging, payments, bank account collection or identity-document verification. If such features are added, this Policy and the Privacy Notice will be updated before use.",
        },
      },

      {
        title: {
          tr: "3. Üyelik ve Sosyal Giriş",
          en: "3. Membership and Social Login",
        },

        body: {
          tr: "Üyelik altyapısı etkinleştirildiğinde Google veya Apple gibi giriş sağlayıcılarından, kullanıcının izin verdiği kapsamda e-posta adresi, görünen ad, profil fotoğrafı ve sağlayıcıya özgü hesap kimliği alınabilir. ForumFenomen, kullanıcının sosyal hesap şifresine erişmez.",
          en: "When membership becomes active, ForumFenomen may receive an email address, display name, profile image and provider-specific account identifier from providers such as Google or Apple, within the permissions granted by the user. ForumFenomen does not receive the user's social account password.",
        },
      },

      {
        title: {
          tr: "4. Bilgilerin Kullanım Amaçları",
          en: "4. How Information Is Used",
        },

        body: {
          tr: "Bilgiler hesap oluşturmak ve yönetmek, içerikleri yayınlamak, platform özelliklerini sunmak, iletişim taleplerini cevaplamak, güvenliği sağlamak, spam ve kötüye kullanımı önlemek, içerikleri denetlemek, teknik sorunları çözmek, hukuki talepleri yönetmek ve hizmet performansını geliştirmek için kullanılabilir.",
          en: "Information may be used to create and manage accounts, publish content, provide platform features, respond to requests, protect security, prevent spam and abuse, moderate content, resolve technical issues, handle legal requests and improve service performance.",
        },
      },

      {
        title: {
          tr: "5. Herkese Açık İçerikler",
          en: "5. Public Content",
        },

        body: {
          tr: "Konu başlıkları, yorumlar, kullanıcı adı, profil fotoğrafı, profil açıklaması ve sosyal bağlantılar kullanıcının tercihine ve platform ayarlarına göre herkese açık olabilir. Herkese açık içerikler arama motorları tarafından indekslenebilir, bağlantı yoluyla paylaşılabilir veya üçüncü kişiler tarafından görüntülenebilir. Hassas kişisel bilgilerin herkese açık alanlarda paylaşılmaması gerekir.",
          en: "Topics, comments, usernames, profile images, profile descriptions and social links may be public depending on user choices and platform settings. Public content may be indexed by search engines, shared through links or viewed by third parties. Sensitive personal information should not be posted publicly.",
        },
      },

      {
        title: {
          tr: "6. Hizmet Sağlayıcılar",
          en: "6. Service Providers",
        },

        body: {
          tr: "ForumFenomen; barındırma, veri tabanı, dosya depolama, kimlik doğrulama, güvenlik, hata izleme ve iletişim gibi teknik hizmetler için üçüncü taraf sağlayıcılardan yararlanabilir. Sağlayıcılar yalnızca sundukları hizmet için gerekli verilere erişmeli ve uygun gizlilik ile güvenlik yükümlülüklerine tabi olmalıdır. Kullanılacak sağlayıcıların kesin listesi teknik altyapı tamamlandığında bu politikada açıklanacaktır.",
          en: "ForumFenomen may use third-party providers for hosting, databases, storage, authentication, security, error monitoring and communication. Providers should access only data required for their services and remain subject to appropriate confidentiality and security obligations. The final provider list will be added when the infrastructure is finalized.",
        },
      },

      {
        title: {
          tr: "7. Reklam ve Analiz Hizmetleri",
          en: "7. Advertising and Analytics",
        },

        body: {
          tr: "ForumFenomen ileride site performansını ölçmek veya reklam göstermek amacıyla analiz ve reklam hizmetleri kullanabilir. Zorunlu olmayan analiz ve reklam teknolojileri, kullanıma alınmaları halinde kullanıcı tercihleri ve uygulanabilir hukuki gereklilikler doğrultusunda çalıştırılır. Kullanılan çerezler, sağlayıcılar ve tercih yöntemleri Çerez Politikasında listelenir.",
          en: "ForumFenomen may later use analytics and advertising services to measure performance or display advertising. Non-essential analytics and advertising technologies will operate according to user preferences and applicable legal requirements. Cookies, providers and preference controls will be listed in the Cookie Policy.",
        },
      },

      {
        title: {
          tr: "8. Verilerin Paylaşılması",
          en: "8. Sharing of Information",
        },

        body: {
          tr: "ForumFenomen kişisel verileri satmaz. Veriler, hizmetin sunulması için gerekli teknik sağlayıcılarla, hukuki ve mali danışmanlarla, yasal hakların korunması gereken durumlarda ilgili taraflarla ve mevzuata uygun taleplerde yetkili makamlarla paylaşılabilir. Bir şirket birleşmesi veya platform devri gibi yapısal değişiklik olması halinde kullanıcılar uygun şekilde bilgilendirilir.",
          en: "ForumFenomen does not sell personal data. Information may be shared with technical providers required for the service, legal and financial advisers, relevant parties where legal rights must be protected and competent authorities following lawful requests. Users will be appropriately informed in the event of a merger or platform transfer.",
        },
      },

      {
        title: {
          tr: "9. Yurt Dışındaki Hizmetler",
          en: "9. Services Located Abroad",
        },

        body: {
          tr: "Bazı teknik sağlayıcıların sistemleri Türkiye dışında bulunabilir. Böyle bir kullanımda aktarımın hukuka uygunluğu değerlendirilir, gerekli sözleşme ve güvence mekanizmaları uygulanır ve aktarım hakkında kullanıcılara açık bilgi verilir. Henüz kullanılmayan bir hizmet veya gerçekleşmeyen bir aktarım bu politikada gerçekleşiyormuş gibi gösterilmez.",
          en: "Some technical providers may operate systems outside Türkiye. Where used, transfer compliance will be assessed, required contractual safeguards will be implemented and users will be clearly informed. Services or transfers that are not actually used will not be represented as active.",
        },
      },

      {
        title: {
          tr: "10. Veri Güvenliği",
          en: "10. Data Security",
        },

        body: {
          tr: "ForumFenomen; yetkisiz erişimi, veri kaybını, kötüye kullanımı ve izinsiz değişikliği önlemek amacıyla erişim yetkilendirmesi, güvenli bağlantı, kayıt izleme, yedekleme ve yazılım güncellemeleri gibi makul teknik ve idari önlemler uygular. Bununla birlikte internet üzerinden aktarılan hiçbir sistem için mutlak güvenlik garantisi verilemez.",
          en: "ForumFenomen applies reasonable technical and organizational safeguards such as access controls, secure connections, logging, backups and software updates to prevent unauthorized access, loss, misuse and alteration. However, absolute security cannot be guaranteed for any internet-based system.",
        },
      },

      {
        title: {
          tr: "11. Hesap ve İçerik Silme",
          en: "11. Account and Content Deletion",
        },

        body: {
          tr: "Kullanıcılar hesap silme özelliği devreye alındığında profil ayarları üzerinden veya İletişim sayfası aracılığıyla hesaplarının kapatılmasını talep edebilir. Hesabın kapatılması, hukuki yükümlülük veya hakların korunması için tutulması gereken sınırlı kayıtların derhal silineceği anlamına gelmeyebilir. Herkese açık tartışmaların bütünlüğünü korumak amacıyla bazı içerikler anonim hale getirilebilir.",
          en: "When account deletion becomes available, users may request closure through profile settings or the Contact page. Account closure may not require immediate deletion of limited records retained for legal obligations or protection of rights. Some content may be anonymized to preserve the integrity of public discussions.",
        },
      },

      {
        title: {
          tr: "12. Çocukların Gizliliği",
          en: "12. Children's Privacy",
        },

        body: {
          tr: "ForumFenomen, çocuklara ait kişisel verilerin korunmasına özel önem verir. Üyelik için uygulanacak asgari yaş ve veli onayı gerektiren durumlar kayıt sistemi devreye alınmadan önce açıkça belirlenecektir. Bir çocuğa ait verinin uygunsuz şekilde işlendiğinin düşünülmesi halinde merhaba@forumfenomen.com adresinden bildirim yapılabilir.",
          en: "ForumFenomen gives particular importance to children's privacy. The minimum membership age and circumstances requiring parental authorization will be determined before registration becomes active. Concerns about improperly processed child data may be reported to merhaba@forumfenomen.com.",
        },
      },

      {
        title: {
          tr: "13. Kullanıcı Tercihleri ve Hakları",
          en: "13. User Choices and Rights",
        },

        body: {
          tr: "Kullanıcılar profil bilgilerini güncelleyebilir, isteğe bağlı bilgileri kaldırabilir ve çerez tercihlerini değiştirebilir. Kişisel verilerle ilgili yasal haklar KVKK Aydınlatma Metni ve KVKK Başvuru Yöntemi sayfalarında açıklanır.",
          en: "Users may update profile details, remove optional information and change cookie preferences. Legal data protection rights are explained in the Privacy Notice and Privacy Request Procedure.",
        },
      },

      {
        title: {
          tr: "14. Politika Değişiklikleri",
          en: "14. Policy Changes",
        },

        body: {
          tr: "Yeni özellikler, kullanılan hizmet sağlayıcılar veya hukuki gereklilikler değiştiğinde bu Politika güncellenebilir. Önemli değişiklikler uygun bir bildirim yöntemiyle duyurulur. Güncel metin Yasal Merkez üzerinde yayımlandığı tarihten itibaren uygulanır.",
          en: "This Policy may be updated when features, providers or legal requirements change. Material changes will be communicated appropriately. The current version applies from the date it is published in the Legal Center.",
        },
      },
    ],
  },
  {
    key: "cerez-politikasi",
    route: "/yasal/cerez-politikasi",
    icon: "ÇR",
    title: {
      tr: "Çerez Politikası",
      en: "Cookie Policy",
    },
    summary: {
      tr: "Zorunlu, analitik ve reklam çerezlerinin kullanımını açıklar.",
      en: "Explains the use of necessary, analytics and advertising cookies.",
    },
    sections: [
      {
        title: {
          tr: "Çerez Nedir?",
          en: "What Is a Cookie?",
        },
        body: {
          tr: "Çerezlerin ve benzeri teknolojilerin temel işlevleri bu bölümde açıklanacaktır.",
          en: "This section will explain the basic functions of cookies and similar technologies.",
        },
      },
      {
        title: {
          tr: "Kullanılan Çerezler",
          en: "Cookies Used",
        },
        body: {
          tr: "Zorunlu, tercih, analitik ve reklam amaçlı çerezler kullanılan servisler belirlendikten sonra ayrı ayrı listelenecektir.",
          en: "Necessary, preference, analytics and advertising cookies will be listed after service providers are selected.",
        },
      },
      {
        title: {
          tr: "Tercihleri Yönetme",
          en: "Managing Preferences",
        },
        body: {
          tr: "Kullanıcıların zorunlu olmayan çerezleri kabul etme, reddetme ve tercihlerini değiştirme yöntemi burada açıklanacaktır.",
          en: "This section will explain how users can accept, reject and change non-essential cookie preferences.",
        },
      },
    ],
  },
  {
    key: "kullanim-kosullari",
    route: "/yasal/kullanim-kosullari",
    icon: "ÜK",

    title: {
      tr: "Üyelik ve Kullanım Sözleşmesi",
      en: "Membership and Terms of Use",
    },

    summary: {
      tr: "ForumFenomen üyeliğinin, platform kullanımının, kullanıcı içeriklerinin ve tarafların temel hak ve sorumluluklarının şartlarını düzenler.",
      en: "Governs ForumFenomen membership, platform usage, user content and the main rights and responsibilities of the parties.",
    },

    sections: [
      {
        title: {
          tr: "1. Taraflar",
          en: "1. Parties",
        },

        body: {
          tr: "Bu Üyelik ve Kullanım Sözleşmesi, forumfenomen.com platformunu Türkiye'de işleten ForumFenomen ile platforma üye olan kullanıcı arasında kurulmaktadır. ForumFenomen'in resmî işletici unvanı ve açık adresi kesinleştiğinde bu bölüm güncellenecektir. ForumFenomen ve kullanıcı birlikte taraflar olarak anılır.",
          en: "These Terms are entered into between ForumFenomen, operating forumfenomen.com in Türkiye, and the user registering for the platform. This section will be updated when the official operator name and address are finalized. ForumFenomen and the user are together referred to as the parties.",
        },
      },

      {
        title: {
          tr: "2. Sözleşmenin Konusu",
          en: "2. Subject of the Agreement",
        },

        body: {
          tr: "Sözleşme; üyelik hesabının oluşturulması, profil kullanımı, konu ve yorum paylaşımı, blog ve kategori alanlarının kullanılması, topluluk etkileşimleri, moderasyon ve ForumFenomen tarafından sunulabilecek diğer hizmetlere ilişkin tarafların hak ve yükümlülüklerini düzenler.",
          en: "These Terms govern account creation, profile use, topics and comments, blog and category areas, community interaction, moderation and other services that may be provided by ForumFenomen.",
        },
      },

      {
        title: {
          tr: "3. Tanımlar",
          en: "3. Definitions",
        },

        body: {
          tr: "Platform veya ForumFenomen, forumfenomen.com ve bağlantılı hizmetleri; ziyaretçi, hesap açmadan platformu kullanan kişiyi; kullanıcı veya üye, üyelik hesabına sahip kişiyi; içerik, metin, görsel, video, bağlantı, yorum, profil bilgisi, anket ve benzeri paylaşımları; Forum Kuralları ise platformda izin verilen ve yasaklanan davranışları düzenleyen topluluk standartlarını ifade eder.",
          en: "Platform or ForumFenomen means forumfenomen.com and related services; visitor means a person using the platform without an account; user or member means an account holder; content means text, images, videos, links, comments, profile information, polls and similar submissions; Forum Rules means the community standards governing permitted and prohibited behavior.",
        },
      },

      {
        title: {
          tr: "4. Üyelik Şartları",
          en: "4. Membership Requirements",
        },

        body: {
          tr: "Üyelik, ForumFenomen tarafından sunulan kayıt yöntemlerinden biri kullanılarak oluşturulur. Kullanıcı kayıt sırasında verdiği bilgilerin doğru ve güncel olmasını sağlamakla sorumludur. Üyelik için uygulanacak asgari yaş ve gerektiğinde veli onayı kuralları kayıt sistemi devreye alınmadan önce açıklanır. ForumFenomen, güvenlik veya kurallara uygunluk gerekçesiyle bir başvuruyu reddedebilir ya da ek doğrulama isteyebilir.",
          en: "Membership is created through registration methods offered by ForumFenomen. Users are responsible for accurate and current registration information. Minimum-age and parental authorization requirements will be stated before registration becomes active. ForumFenomen may reject an application or request additional verification for safety or compliance reasons.",
        },
      },

      {
        title: {
          tr: "5. Hesap Güvenliği",
          en: "5. Account Security",
        },

        body: {
          tr: "Kullanıcı hesabının ve bağlı giriş yöntemlerinin güvenliğini korumalı, hesabını başkasına kullandırmamalı ve yetkisiz erişim şüphesini gecikmeden bildirmelidir. Başka bir kişiyi, markayı veya ForumFenomen yetkilisini taklit eden hesaplar kapatılabilir. Hesaptan gerçekleştirilen faaliyetler konusunda kullanıcının kusuru ve somut olayın koşulları dikkate alınır.",
          en: "Users must protect their account and connected login methods, must not allow others to use the account and should promptly report suspected unauthorized access. Accounts impersonating another person, brand or ForumFenomen representative may be closed. Responsibility for account activity will be assessed according to fault and the circumstances.",
        },
      },

      {
        title: {
          tr: "6. Hizmetlerin Kullanımı",
          en: "6. Use of Services",
        },

        body: {
          tr: "Üyeler, hesaplarına tanımlanan özelliklerden Forum Kuralları ve bu Sözleşme çerçevesinde yararlanabilir. Bazı özellikler üyelik gerektirebilir, aşamalı olarak kullanıma açılabilir veya güvenlik ve performans gerekçesiyle sınırlandırılabilir. ForumFenomen her özelliğin kesintisiz veya süresiz olarak sunulacağını garanti etmez.",
          en: "Members may use features available to their accounts under these Terms and the Forum Rules. Some features may require membership, be released gradually or be restricted for security and performance. ForumFenomen does not guarantee that every feature will be continuously or permanently available.",
        },
      },

      {
        title: {
          tr: "7. Kullanıcı İçerikleri",
          en: "7. User Content",
        },

        body: {
          tr: "Kullanıcı paylaştığı içeriğin gerekli haklarına sahip olduğunu ve içeriğin hukuka, üçüncü kişi haklarına ve Forum Kurallarına uygun olduğunu kabul eder. İçeriğin mülkiyeti kullanıcıda kalır. Kullanıcı, içeriğin platformda barındırılması, görüntülenmesi, teknik olarak çoğaltılması, yeniden boyutlandırılması ve hizmetin sunulması için gerekli ölçüde ForumFenomen'e ücretsiz ve sınırlı bir kullanım izni verir. Bu izin, platformun işlevi dışındaki bağımsız ticari kullanım hakkı vermez.",
          en: "Users confirm that they hold the necessary rights to their content and that it complies with law, third-party rights and Forum Rules. Ownership remains with the user. The user grants ForumFenomen a free and limited license to host, display, technically reproduce and resize content as required to provide the service. This does not permit unrelated commercial exploitation outside the platform's operation.",
        },
      },

      {
        title: {
          tr: "8. Forum Kuralları ve Moderasyon",
          en: "8. Forum Rules and Moderation",
        },

        body: {
          tr: "Kullanıcı Forum Kuralları ve Topluluk Standartlarına uymalıdır. ForumFenomen; yanlış kategori, spam, hukuka aykırılık, güvenlik riski veya kural ihlali bulunan içerikleri inceleyebilir, düzenleyebilir, taşıyabilir, birleştirebilir, görünürlüğünü azaltabilir veya kaldırabilir. İhlalin niteliğine göre uyarı, özellik kısıtlaması, geçici askıya alma veya kalıcı hesap kapatma uygulanabilir.",
          en: "Users must follow the Forum Rules and Community Standards. ForumFenomen may review, edit, move, merge, reduce visibility or remove content involving incorrect categories, spam, illegality, safety risks or rule violations. Enforcement may include warnings, feature restrictions, temporary suspension or permanent account closure.",
        },
      },

      {
        title: {
          tr: "9. Reklam ve Ticari İçerikler",
          en: "9. Advertising and Commercial Content",
        },

        body: {
          tr: "Marka iş birliği, sponsorluk, UGC, affiliate bağlantısı, hediye ürün, ücretsiz hizmet veya diğer maddi menfaat içeren paylaşımlar açıkça belirtilmelidir. Kullanıcı, sunduğu ürün veya hizmete ilişkin bilgilerin doğru olmasından ve gerekli yasal yükümlülükleri yerine getirmekten sorumludur. ForumFenomen, açıkça taraf olduğunu belirtmediği sürece üyeler arasındaki ticari işlemin tarafı, ödeme aracısı veya garantörü değildir.",
          en: "Posts involving brand partnerships, sponsorships, UGC, affiliate links, gifted products, free services or other benefits must be clearly disclosed. Users are responsible for accurate product or service information and legal compliance. Unless expressly stated, ForumFenomen is not a party, payment intermediary or guarantor for transactions between members.",
        },
      },

      {
        title: {
          tr: "10. Yasaklanan Kullanımlar",
          en: "10. Prohibited Uses",
        },

        body: {
          tr: "Platform; yasa dışı içerik, dolandırıcılık, kimlik avı, zararlı yazılım, hesap ele geçirme, sahte takipçi veya etkileşim hizmeti, telif ihlali, kişisel bilgilerin izinsiz ifşası, nefret söylemi, tehdit, taciz, spam veya hizmetin teknik işleyişini bozmak amacıyla kullanılamaz. Ayrıntılı hükümler Forum Kurallarında yer alır.",
          en: "The platform may not be used for illegal content, fraud, phishing, malware, account compromise, fake followers or engagement, copyright infringement, unauthorized disclosure of personal information, hate speech, threats, harassment, spam or disruption of the service. Detailed provisions appear in the Forum Rules.",
        },
      },

      {
        title: {
          tr: "11. Fikrî Mülkiyet Hakları",
          en: "11. Intellectual Property",
        },

        body: {
          tr: "ForumFenomen adı, logosu, özgün tasarımı, yazılımı, arayüzleri, veri tabanı yapısı ve ForumFenomen tarafından üretilen içerikler ilgili fikrî mülkiyet mevzuatı kapsamında korunur. Kullanıcıya yalnızca platformu olağan amacı kapsamında kullanma hakkı verilir. Markanın, tasarımın veya yazılımın izinsiz kopyalanması, satılması ya da başka bir hizmette kullanılması yasaktır.",
          en: "The ForumFenomen name, logo, original design, software, interfaces, database structure and content created by ForumFenomen are protected by intellectual property law. Users receive only the right to use the platform for its ordinary purpose. Unauthorized copying, sale or use of the brand, design or software in another service is prohibited.",
        },
      },

      {
        title: {
          tr: "12. Üçüncü Taraf Bağlantıları",
          en: "12. Third-Party Links",
        },

        body: {
          tr: "Platformda sosyal medya siteleri, markalar, hizmet sağlayıcılar veya diğer üçüncü taraflara ait bağlantılar bulunabilir. Bu hizmetlerin içerik, güvenlik ve gizlilik uygulamaları ilgili üçüncü tarafın sorumluluğundadır. Bir bağlantının platformda bulunması ForumFenomen'in ilgili hizmeti onayladığı veya garanti ettiği anlamına gelmez.",
          en: "The platform may contain links to social networks, brands, service providers and other third parties. Their content, security and privacy practices are their responsibility. The presence of a link does not mean ForumFenomen endorses or guarantees the relevant service.",
        },
      },

      {
        title: {
          tr: "13. Hizmet Değişiklikleri ve Kesintiler",
          en: "13. Service Changes and Interruptions",
        },

        body: {
          tr: "ForumFenomen özellikleri geliştirebilir, değiştirebilir veya kaldırabilir. Bakım, güvenlik, teknik arıza, hizmet sağlayıcı problemi veya mücbir sebep nedeniyle geçici kesintiler yaşanabilir. ForumFenomen makul çabayı göstermekle birlikte hizmetin her zaman hatasız, güvenli veya kesintisiz olacağını taahhüt etmez.",
          en: "ForumFenomen may develop, change or remove features. Temporary interruptions may occur due to maintenance, security, technical failures, provider issues or force majeure. ForumFenomen will use reasonable efforts but does not promise that the service will always be error-free, secure or uninterrupted.",
        },
      },

      {
        title: {
          tr: "14. Hesabın Kısıtlanması veya Kapatılması",
          en: "14. Account Restriction or Closure",
        },

        body: {
          tr: "Kullanıcı hesabını kapatma talebinde bulunabilir. ForumFenomen; ağır veya tekrarlanan kural ihlali, güvenlik riski, sahte hesap, yaptırımdan kaçınma veya hukuki zorunluluk halinde hesabı geçici olarak kısıtlayabilir ya da kalıcı olarak kapatabilir. Uygun durumlarda kullanıcıya kararın temel nedeni ve itiraz kanalı bildirilir.",
          en: "Users may request account closure. ForumFenomen may temporarily restrict or permanently close accounts for severe or repeated violations, security risks, fake accounts, enforcement evasion or legal obligations. Where appropriate, users will be informed of the main reason and appeal channel.",
        },
      },

      {
        title: {
          tr: "15. Hesap Kapatma Sonrası Veriler",
          en: "15. Data After Account Closure",
        },

        body: {
          tr: "Hesabın kapatılması sonrasında kişisel veriler, KVKK Aydınlatma Metni ve uygulanabilir mevzuat kapsamında silinir, yok edilir veya anonim hale getirilir. Yasal yükümlülükler, güvenlik olayları ve uyuşmazlıkların çözümü için tutulması zorunlu sınırlı kayıtlar ilgili süre boyunca saklanabilir. Kamuya açık tartışmaların bütünlüğü için bazı içerikler kullanıcı kimliği kaldırılarak korunabilir.",
          en: "After account closure, personal data is deleted, destroyed or anonymized under the Privacy Notice and applicable law. Limited records required for legal obligations, security incidents and disputes may be retained for the relevant period. Some content may be retained without user identity to preserve public discussion integrity.",
        },
      },

      {
        title: {
          tr: "16. Sorumluluğun Sınırları",
          en: "16. Limitation of Responsibility",
        },

        body: {
          tr: "ForumFenomen kullanıcılar tarafından oluşturulan içeriklerin doğruluğunu, her kullanıcıyı, dış bağlantıları veya üyeler arasındaki ticari teklifleri önceden garanti etmez. Kullanıcılar bir bilgiye, öneriye veya ticari teklife güvenmeden önce kendi değerlendirmelerini yapmalıdır. ForumFenomen'in kanundan doğan ve sınırlandırılamayan sorumlulukları saklıdır.",
          en: "ForumFenomen does not pre-guarantee the accuracy of user content, every user, external links or commercial offers between members. Users should make their own assessment before relying on information, advice or an offer. Responsibilities that cannot legally be excluded remain unaffected.",
        },
      },

      {
        title: {
          tr: "17. Gizlilik ve Çerezler",
          en: "17. Privacy and Cookies",
        },

        body: {
          tr: "Kişisel verilerin işlenmesine ilişkin bilgiler KVKK Aydınlatma Metni ve Gizlilik Politikasında; çerez ve benzeri teknolojilere ilişkin bilgiler Çerez Politikasında açıklanır. Aydınlatma metninin okunması, kişisel veri işleme faaliyetlerine toplu açık rıza verildiği anlamına gelmez.",
          en: "Personal data processing is explained in the Privacy Notice and Privacy Policy, while cookies and similar technologies are covered by the Cookie Policy. Reading the Privacy Notice does not constitute blanket consent to data processing.",
        },
      },

      {
        title: {
          tr: "18. İletişim ve Bildirimler",
          en: "18. Contact and Notices",
        },

        body: {
          tr: "Sözleşmeye, hesaba veya platform kullanımına ilişkin bildirimler platform içi bildirim, kayıtlı e-posta adresi veya ForumFenomen'in resmî duyuru alanları üzerinden yapılabilir. Kullanıcılar sorularını merhaba@forumfenomen.com adresine veya İletişim sayfasına iletebilir.",
          en: "Notices regarding these Terms, accounts or use of the platform may be sent through in-platform notices, the registered email address or official ForumFenomen announcement areas. Questions may be sent to merhaba@forumfenomen.com or through the Contact page.",
        },
      },

      {
        title: {
          tr: "19. Uygulanacak Hukuk ve Uyuşmazlıklar",
          en: "19. Governing Law and Disputes",
        },

        body: {
          tr: "Bu Sözleşme Türk hukukuna tabidir. Tüketici işlemlerinde tüketicinin başvurabileceği zorunlu ve yetkili mercilere ilişkin hakları saklıdır. Yetkili mahkeme ve icra dairesi, ForumFenomen'in resmî işletici adresi ve tarafların hukuki sıfatı kesinleştirildiğinde uygulanabilir mevzuata uygun biçimde belirtilecektir.",
          en: "These Terms are governed by Turkish law. Mandatory consumer rights and competent consumer authorities remain unaffected. Any specific court and enforcement-office provision will be determined under applicable law after the official operator address and legal status are finalized.",
        },
      },

      {
        title: {
          tr: "20. Güncellemeler ve Yürürlük",
          en: "20. Updates and Effect",
        },

        body: {
          tr: "ForumFenomen; hizmetlerdeki, mevzuattaki veya teknik altyapıdaki değişiklikler nedeniyle bu Sözleşmeyi güncelleyebilir. Kullanıcı haklarını önemli ölçüde etkileyen değişiklikler uygun yöntemlerle duyurulur. Güncel Sözleşme yayımlandığı tarihte yürürlüğe girer. Platformun kullanılmaya devam edilmesi, yürürlükteki kurallara uyma yükümlülüğünü doğurur; ayrıca açık onay gereken değişiklikler için kullanıcıdan ayrı onay alınır.",
          en: "ForumFenomen may update these Terms due to changes in services, law or infrastructure. Material changes affecting user rights will be communicated appropriately. Updated Terms take effect when published. Continued use requires compliance with current rules, while changes requiring express agreement will be presented separately.",
        },
      },
    ],
  },
  {
    key: "topluluk-kurallari",
    route: "/yasal/topluluk-kurallari",
    icon: "FK",

    title: {
      tr: "Forum Kuralları ve Topluluk Standartları",
      en: "Forum Rules and Community Standards",
    },

    summary: {
      tr: "ForumFenomen’de güvenli, saygılı, faydalı ve içerik üreticilerine değer katan bir topluluk için geçerli kuralları açıklar.",
      en: "Explains the rules for maintaining a safe, respectful and useful ForumFenomen community that creates value for content creators.",
    },

    sections: [
      {
        title: {
          tr: "Madde 1 — Amaç ve Kapsam",
          en: "Article 1 — Purpose and Scope",
        },

        body: {
          tr: "Bu kuralların amacı ForumFenomen’in düzenli, güvenli ve faydalı biçimde kullanılmasını sağlamaktır. Kurallar; üyeleri, kullanıcı adlarını, profil bilgilerini, konu başlıklarını, yorumları, görselleri, videoları, bağlantıları, etiketleri, anketleri ve ForumFenomen üzerinde paylaşılabilecek diğer tüm içerikleri kapsar. Platformu ziyaret eden veya kullanan herkes ilgili olduğu ölçüde bu kurallara tabidir.",
          en: "These rules aim to ensure that ForumFenomen is used in an orderly, safe and useful manner. They apply to members, usernames, profile information, topics, comments, images, videos, links, tags, polls and all other content that may be shared on ForumFenomen. Everyone visiting or using the platform is subject to these rules where applicable.",
        },
      },

      {
        title: {
          tr: "Madde 2 — Tanımlar",
          en: "Article 2 — Definitions",
        },

        body: {
          tr: "ForumFenomen veya Platform, forumfenomen.com alan adı üzerinden sunulan hizmetleri; Yönetim, platformun işleyişinden sorumlu yetkilileri; Moderatör, topluluk kurallarını uygulamakla görevlendirilen kişileri; Üye, ForumFenomen hesabı kullanan kişiyi; Konu, üyeler tarafından açılan tartışma başlığını; Yorum, bir konu altında paylaşılan cevabı; İçerik ise metin, görsel, video, bağlantı, kullanıcı adı, profil bilgisi ve benzeri tüm paylaşımları ifade eder.",
          en: "ForumFenomen or Platform means the services provided through forumfenomen.com; Management means persons responsible for operating the platform; Moderator means persons authorized to apply community rules; Member means a person using a ForumFenomen account; Topic means a discussion opened by a member; Comment means a reply posted under a topic; and Content means all text, images, videos, links, usernames, profile information and similar submissions.",
        },
      },

      {
        title: {
          tr: "Madde 3 — Hukuka Uygunluk ve Kullanıcı Sorumluluğu",
          en: "Article 3 — Legal Compliance and User Responsibility",
        },

        body: {
          tr: "Üyeler oluşturdukları ve paylaştıkları içeriklerden sorumludur. Türkiye Cumhuriyeti mevzuatına aykırı, suç teşkil eden, başkalarının haklarını ihlal eden veya hukuka aykırı bir faaliyeti teşvik eden içeriklere izin verilmez. ForumFenomen, hukuka aykırılık şüphesi bulunan içerikleri inceleyebilir, erişimini sınırlandırabilir veya kaldırabilir. Yetkili makamların hukuka uygun talepleri ilgili mevzuat kapsamında değerlendirilir.",
          en: "Members are responsible for the content they create and share. Content that violates the laws of the Republic of Türkiye, constitutes an offence, infringes the rights of others or encourages unlawful activity is prohibited. ForumFenomen may review, restrict or remove content suspected of being unlawful. Lawful requests from competent authorities are handled under applicable legislation.",
        },
      },

      {
        title: {
          tr: "Madde 4 — Hesap Güvenliği ve Kimlik Taklidi",
          en: "Article 4 — Account Security and Impersonation",
        },

        body: {
          tr: "Her üye hesabının güvenliğinden ve kendi hesabı üzerinden gerçekleştirilen işlemlerden sorumludur. Başka bir kişiyi, markayı, kurumu, içerik üreticisini veya ForumFenomen yetkilisini taklit etmek yasaktır. Yanıltıcı kullanıcı adı, profil görseli veya açıklama kullanılarak sahte kimlik oluşturulamaz. Hesap kısıtlamalarını aşmak amacıyla yeni ya da başka bir hesap kullanmak ayrıca ihlal sayılır.",
          en: "Each member is responsible for securing their account and for activity performed through it. Impersonating another person, brand, organization, creator or ForumFenomen representative is prohibited. Misleading usernames, profile images or descriptions may not be used to create a false identity. Using a new or another account to evade restrictions is also a violation.",
        },
      },

      {
        title: {
          tr: "Madde 5 — Konu Başlığı, Kategori ve Tekrarlanan Paylaşımlar",
          en: "Article 5 — Topic Titles, Categories and Duplicate Posts",
        },

        body: {
          tr: "Konu başlığı içeriği açık ve anlaşılır biçimde özetlemeli, konu doğru ana kategori ve alt kategori altında açılmalıdır. Aynı veya büyük ölçüde benzer konu tekrar tekrar açılamaz. Daha önce açılmış bir tartışma bulunuyorsa mümkün olduğunda mevcut konuya katkı sağlanmalıdır. Yanlış kategoride açılan konular taşınabilir, birleştirilebilir veya kaldırılabilir.",
          en: "A topic title must clearly summarize its content and be posted in the correct main category and subcategory. The same or substantially similar topic may not be repeatedly created. Where an existing discussion is available, members should contribute to it where possible. Topics opened in the wrong category may be moved, merged or removed.",
        },
      },

      {
        title: {
          tr: "Madde 6 — Yazım Düzeni ve Okunabilirlik",
          en: "Article 6 — Writing Quality and Readability",
        },

        body: {
          tr: "İçerikler diğer üyelerin kolayca anlayabileceği şekilde yazılmalıdır. İçeriğin tamamını büyük harfle, kalın, italik veya aşırı sembollerle yazmak; anlamsız başlıklar kullanmak; gereksiz etiket, emoji ya da bağlantı eklemek; okunabilirliği kasıtlı olarak bozmak yasaktır. Yönetim, içeriğin anlamını değiştirmeden başlık, kategori, etiket veya biçim düzenlemesi yapabilir.",
          en: "Content should be written so other members can understand it easily. Writing entire posts in capital letters, bold, italics or excessive symbols; using meaningless titles; adding unnecessary tags, emojis or links; or deliberately reducing readability is prohibited. Management may adjust titles, categories, tags or formatting without changing the meaning.",
        },
      },

      {
        title: {
          tr: "Madde 7 — Anlamsız İçerik, Spam ve Yapay Etkileşim",
          en: "Article 7 — Meaningless Content, Spam and Artificial Engagement",
        },

        body: {
          tr: "Yalnızca ileti sayısını artırmak, konuyu sürekli üst sıralara taşımak veya dikkat çekmek amacıyla anlamsız yorumlar yapılamaz. Aynı içeriğin tekrar paylaşılması, ilgisiz bağlantı bırakılması, otomatik mesaj gönderilmesi, organize beğeni veya yorum talep edilmesi ve yapay etkileşim oluşturulması yasaktır. Konuyu canlı tutmak amacıyla art arda mesaj yazılması sınırlandırılabilir.",
          en: "Meaningless comments may not be posted merely to increase post count, repeatedly raise a topic or attract attention. Reposting the same content, leaving irrelevant links, sending automated messages, organizing likes or comments and creating artificial engagement are prohibited. Consecutive replies intended only to keep a topic active may be restricted.",
        },
      },

      {
        title: {
          tr: "Madde 8 — Saygılı İletişim",
          en: "Article 8 — Respectful Communication",
        },

        body: {
          tr: "Fikir ayrılıkları kişilere saldırmadan tartışılmalıdır. Hakaret, aşağılama, tehdit, taciz, zorbalık, hedef gösterme, ısrarlı rahatsız etme, küçük düşürme ve kişilik haklarına saldırı niteliğindeki içeriklere izin verilmez. Bir paylaşımın mizah, eleştiri, tepki veya ironi amacı taşıması bu kuralları ortadan kaldırmaz.",
          en: "Disagreements must be discussed without personal attacks. Insults, humiliation, threats, harassment, bullying, targeting, persistent disturbance, degradation and attacks on personal rights are prohibited. Presenting content as humor, criticism, reaction or irony does not override these rules.",
        },
      },

      {
        title: {
          tr: "Madde 9 — Nefret Söylemi ve Ayrımcılık",
          en: "Article 9 — Hate Speech and Discrimination",
        },

        body: {
          tr: "Irk, etnik köken, milliyet, dil, din, mezhep, cinsiyet, cinsel yönelim, engellilik, sağlık durumu veya benzeri kişisel özellikler nedeniyle kişi ya da grupları aşağılayan, dışlayan, tehdit eden veya şiddeti teşvik eden içerikler yasaktır. Topluluk huzurunu bozma amacı taşıyan ayrımcı semboller, kullanıcı adları ve profil içerikleri de bu kapsamdadır.",
          en: "Content that degrades, excludes, threatens or promotes violence against individuals or groups because of race, ethnicity, nationality, language, religion, gender, sexual orientation, disability, health status or similar characteristics is prohibited. Discriminatory symbols, usernames and profile content intended to disturb the community are also covered.",
        },
      },

      {
        title: {
          tr: "Madde 10 — Siyaset, Din ve Platform Dışı Tartışmalar",
          en: "Article 10 — Politics, Religion and Off-Topic Debates",
        },

        body: {
          tr: "ForumFenomen’in temel amacı içerik üretimi ve sosyal medya ekosistemine ilişkin bilgi paylaşımıdır. Bu amaçla ilgisi bulunmayan, topluluğu kutuplaştırmaya veya tartışma çıkarmaya yönelik siyasi, ideolojik ya da dini konular kaldırılabilir. İçerik üreticilerini doğrudan ilgilendiren mevzuat, reklam politikası veya güncel gelişmeler kaynak gösterilerek ve saygılı biçimde tartışılabilir.",
          en: "ForumFenomen primarily exists for knowledge sharing about content creation and the social media ecosystem. Political, ideological or religious topics unrelated to this purpose and intended to polarize the community may be removed. Regulations, advertising policies or current events directly affecting creators may be discussed respectfully and with sources.",
        },
      },

      {
        title: {
          tr: "Madde 11 — Kişisel Bilgiler ve Mahremiyet",
          en: "Article 11 — Personal Information and Privacy",
        },

        body: {
          tr: "Başkasına ait telefon numarası, adres, kimlik bilgisi, özel yazışma, konum, finansal bilgi, hesap erişim bilgisi, özel görüntü veya benzeri hassas bilgiler kişinin açık izni olmadan paylaşılamaz. Kullanıcıları ifşa etmeye, takip etmeye, tehdit etmeye veya güvenliğini tehlikeye atmaya yönelik paylaşımlar kaldırılır. Banka kartı, şifre, doğrulama kodu ve benzeri güvenlik bilgileri hiçbir koşulda açık alanda paylaşılmamalıdır.",
          en: "Phone numbers, addresses, identity information, private correspondence, locations, financial information, account credentials, private images or similar sensitive information belonging to others may not be shared without clear permission. Content intended to expose, track, threaten or endanger users will be removed. Card details, passwords, verification codes and similar security information must never be shared publicly.",
        },
      },

      {
        title: {
          tr: "Madde 12 — Yasa Dışı ve Tehlikeli İçerikler",
          en: "Article 12 — Illegal and Dangerous Content",
        },

        body: {
          tr: "Suç işlemeyi teşvik eden, yasa dışı ürün veya hizmet sunan, şiddeti öven, kendine veya başkasına zarar vermeye yönlendiren ya da ciddi güvenlik riski oluşturan içerikler yasaktır. Yetkisiz sistem erişimi, zararlı yazılım, kimlik avı veya güvenlik önlemlerini aşmaya yönelik uygulanabilir talimatlar paylaşılamaz. Eğitim ve savunma amaçlı siber güvenlik tartışmaları dahi hukuka uygun, güvenli ve zarar vermeyen sınırlar içinde olmalıdır.",
          en: "Content that encourages crime, offers illegal goods or services, glorifies violence, encourages harm to oneself or others, or creates a serious safety risk is prohibited. Actionable instructions for unauthorized access, malware, phishing or bypassing security measures may not be shared. Even educational or defensive cybersecurity discussions must remain lawful, safe and non-harmful.",
        },
      },

      {
        title: {
          tr: "Madde 13 — Çocuk Güvenliği",
          en: "Article 13 — Child Safety",
        },

        body: {
          tr: "Çocukların cinsel istismarı, sömürülmesi, teşhiri veya güvenliğini tehlikeye atan içerikler konusunda sıfır tolerans uygulanır. Bu tür içerikler derhal kaldırılır, ilgili hesap kalıcı olarak kapatılabilir ve gerekli görülmesi halinde yetkili mercilere bildirim yapılabilir. Çocuklara ait kişisel bilgilerin ve özel görüntülerin paylaşılmasında güvenlik ve mahremiyet önceliklidir.",
          en: "Zero tolerance applies to content involving child sexual abuse, exploitation, exposure or endangerment. Such content will be removed immediately, accounts may be permanently closed and reports may be made to competent authorities where necessary. Safety and privacy are paramount when sharing personal information or private images involving children.",
        },
      },

      {
        title: {
          tr: "Madde 14 — Dolandırıcılık ve Yanıltıcı Faaliyetler",
          en: "Article 14 — Fraud and Misleading Activity",
        },

        body: {
          tr: "Kimlik taklidi, sahte kampanya, sahte çekiliş, yanıltıcı kazanç vaadi, kimlik avı, şüpheli ödeme talebi, sahte belge veya istatistik kullanımı ve kullanıcıları maddi ya da dijital zarara uğratabilecek yönlendirmeler yasaktır. Bir üye veya işletme hakkında dolandırıcılık iddiasında bulunulacaksa iddia açık, ölçülü ve doğrulanabilir bilgiye dayanmalıdır. Suç isnadı içeren durumlarda ilgili yasal mercilere başvurulması gerekebilir.",
          en: "Impersonation, fake campaigns, fake giveaways, misleading income promises, phishing, suspicious payment demands, false documents or statistics and directions that may cause financial or digital harm are prohibited. Fraud allegations against a member or business must be clear, proportionate and based on verifiable information. Matters involving criminal allegations may need to be reported to competent authorities.",
        },
      },

      {
        title: {
          tr: "Madde 15 — Hesap, Takipçi ve Etkileşim Hizmetleri",
          en: "Article 15 — Accounts, Followers and Engagement Services",
        },

        body: {
          tr: "Çalınmış, ele geçirilmiş veya sahibinin izni olmadan devredilen sosyal medya hesaplarıyla ilgili içeriklere izin verilmez. Sahte takipçi, sahte izlenme, otomatik yorum, bot etkileşim veya sosyal medya platformlarının kurallarını açıkça ihlal eden hizmetlerin satışı, tanıtımı ya da talep edilmesi yasaktır. Organik büyüme, reklam yönetimi ve hukuka uygun danışmanlık hizmetleri açık ve yanıltıcı olmayan biçimde tartışılabilir.",
          en: "Content involving stolen, compromised or unauthorized social media accounts is prohibited. Selling, promoting or requesting fake followers, fake views, automated comments, bot engagement or services clearly violating social platform rules is prohibited. Organic growth, advertising management and lawful consulting services may be discussed transparently and without misleading claims.",
        },
      },

      {
        title: {
          tr: "Madde 16 — Telif Hakları ve İçerik Sahipliği",
          en: "Article 16 — Copyright and Content Ownership",
        },

        body: {
          tr: "Başkasına ait metin, görsel, video, müzik, tasarım, eğitim içeriği veya diğer eserler izin alınmadan sahiplenilemez, satılamaz veya dağıtılamaz. Alıntılarda mümkün olduğunda kaynak ve hak sahibi belirtilmelidir. Başkasına ait ücretli eğitim, şablon, yazılım veya dijital ürünün izinsiz kopyası paylaşılamaz. Geçerli hak sahibi bildirimleri sonucunda içerik kaldırılabilir.",
          en: "Text, images, videos, music, designs, educational material or other works belonging to others may not be claimed, sold or distributed without permission. Sources and rights holders should be identified where possible. Unauthorized copies of paid training, templates, software or digital products may not be shared. Content may be removed following a valid rights-holder notice.",
        },
      },

      {
        title: {
          tr: "Madde 17 — Yapay Zekâ ve Düzenlenmiş İçerikler",
          en: "Article 17 — AI and Manipulated Content",
        },

        body: {
          tr: "Gerçek kişi, marka, olay, ürün sonucu veya kazanç hakkında yanlış izlenim oluşturabilecek yapay zekâ üretimi ya da yoğun biçimde düzenlenmiş içerikler uygun şekilde belirtilmelidir. Yapay zekâ kullanılarak kimlik taklidi yapmak, sahte kanıt, sahte yorum, sahte başarı sonucu veya yanıltıcı reklam üretmek yasaktır. Eğitim amacıyla paylaşılan yapay zekâ içeriklerinde kullanılan yöntemin ve önemli sınırlamaların açıklanması teşvik edilir.",
          en: "AI-generated or heavily edited content that may create a false impression about a real person, brand, event, product result or income claim should be appropriately disclosed. Using AI to impersonate others or create fake evidence, reviews, performance results or misleading advertisements is prohibited. Educational AI content should explain the method used and important limitations where relevant.",
        },
      },

      {
        title: {
          tr: "Madde 18 — Reklam, Sponsorluk, UGC ve Affiliate İçerikleri",
          en: "Article 18 — Advertising, Sponsorships, UGC and Affiliate Content",
        },

        body: {
          tr: "Bir marka, işletme veya ürünle maddi ya da ayni menfaat ilişkisi bulunan içerikler açıkça belirtilmelidir. Ücretli iş birliği, hediye ürün, ücretsiz hizmet, indirim, komisyon, affiliate bağlantısı ve UGC çalışması gibi ilişkiler kullanıcıların kolayca anlayabileceği şekilde reklam veya tanıtım olarak açıklanmalıdır. Örtülü reklam, sahte deneyim, kullanılmayan bir ürün hakkında kullanılmış izlenimi verme ve doğrulanamayan sonuç vaatleri yasaktır.",
          en: "Content involving a financial or non-financial benefit from a brand, business or product must be clearly disclosed. Paid partnerships, gifted products, free services, discounts, commissions, affiliate links and UGC relationships must be identified as advertising or promotion in a way users can easily understand. Hidden advertising, fake experiences, pretending to have used a product and unverifiable performance claims are prohibited.",
        },
      },

      {
        title: {
          tr: "Madde 19 — Tanıtım ve Ticari Paylaşımlar",
          en: "Article 19 — Promotions and Commercial Posts",
        },

        body: {
          tr: "Kişisel hizmet, ajans, eğitim, ürün veya marka tanıtımları yalnızca izin verilen kategori ve formatlarda paylaşılmalıdır. Topluluk tartışmalarını sürekli satışa yönlendirmek, ilgisiz konulara reklam bırakmak, yanıltıcı fiyat veya indirim kullanmak ve kullanıcıları baskıyla satın almaya yönlendirmek yasaktır. Ticari içerik paylaşan kişi teklifin kapsamını, ücretini, önemli şartlarını ve varsa sınırlamalarını açıkça belirtmelidir.",
          en: "Personal services, agencies, training, products or brands may be promoted only in permitted categories and formats. Repeatedly redirecting discussions toward sales, placing advertisements in unrelated topics, using misleading prices or discounts and pressuring users to purchase are prohibited. Commercial posts must clearly state the offer, price, important conditions and relevant limitations.",
        },
      },

      {
        title: {
          tr: "Madde 20 — Forum Dışında Gerçekleşen İşlemler",
          en: "Article 20 — Transactions Outside ForumFenomen",
        },

        body: {
          tr: "ForumFenomen, açıkça aksi belirtilmedikçe üyeler arasında kurulabilecek ticari ilişkinin, ödemenin, teslimatın veya sözleşmenin tarafı değildir. Platform bir ödeme, emanet veya garanti hizmeti sunmaz. Üyeler forum dışında gerçekleştirdikleri işlemlerde karşı tarafı, teklif koşullarını ve ödeme güvenliğini kendileri değerlendirmelidir. Şüpheli ödeme bağlantıları ve herkese açık IBAN veya hassas finansal bilgi paylaşımları kaldırılabilir.",
          en: "Unless expressly stated otherwise, ForumFenomen is not a party to commercial relationships, payments, deliveries or agreements between members. The platform does not provide payment, escrow or guarantee services. Members must independently evaluate counterparties, offer terms and payment security in off-platform transactions. Suspicious payment links and public sharing of bank or sensitive financial details may be removed.",
        },
      },

      {
        title: {
          tr: "Madde 21 — Şikâyet ve İddiaların Kanıtlanması",
          en: "Article 21 — Complaints and Supporting Evidence",
        },

        body: {
          tr: "Bir kişi, marka veya işletme hakkında ciddi bir iddia paylaşan üye, iddiasını doğrulanabilir bilgi ve belgelerle desteklemelidir. Kişisel veri, özel yazışma veya hassas bilgi içeren kanıtlar herkese açık biçimde paylaşılmamalı; gerekli bölümler gizlenmelidir. Kanıt içermeyen karalama kampanyaları, organize saldırılar ve karşı tarafı tehdit etmeye yönelik şikâyetler kaldırılabilir.",
          en: "A member making a serious claim about a person, brand or business must support it with verifiable information and evidence. Evidence containing personal data, private correspondence or sensitive information must not be posted publicly and relevant sections should be redacted. Unsupported smear campaigns, organized attacks and complaints intended to threaten another party may be removed.",
        },
      },

      {
        title: {
          tr: "Madde 22 — Moderasyon İşlemleri ve Yaptırımlar",
          en: "Article 22 — Moderation Actions and Sanctions",
        },

        body: {
          tr: "İhlalin niteliği, oluşturduğu risk, tekrar durumu ve kullanıcının önceki ihlalleri dikkate alınarak içerik düzenleme, kategori değiştirme, konu birleştirme, içeriğin görünürlüğünü azaltma, içeriği kaldırma, uyarı verme, özellikleri geçici kısıtlama, hesabı 24 saat ile 7 gün arasında kısıtlama, 7 ile 30 gün arasında askıya alma veya hesabı kalıcı olarak kapatma işlemleri uygulanabilir. Ağır ihlallerde bu sıralama izlenmeden doğrudan kalıcı yaptırım uygulanabilir.",
          en: "Depending on severity, risk, repetition and prior violations, actions may include editing content, changing categories, merging topics, reducing visibility, removing content, issuing warnings, temporarily restricting features, restricting an account for 24 hours to 7 days, suspending it for 7 to 30 days or permanently closing it. Severe violations may result in immediate permanent enforcement without following this order.",
        },
      },

      {
        title: {
          tr: "Madde 23 — Tekrarlanan İhlaller ve Yaptırımdan Kaçınma",
          en: "Article 23 — Repeated Violations and Evasion",
        },

        body: {
          tr: "Aynı veya benzer ihlallerin tekrarlanması daha ağır yaptırıma neden olabilir. Kısıtlanan ya da kapatılan hesabın yerine yeni hesap açmak, başka bir kişinin hesabını kullanmak, teknik yöntemlerle erişim sağlamak veya başkalarını kendi adına paylaşım yapmaya yönlendirmek yaptırımdan kaçınma sayılır. Bu hesaplar da kısıtlanabilir veya kapatılabilir.",
          en: "Repeated similar violations may result in stronger sanctions. Creating a new account, using another person's account, employing technical methods to gain access or directing others to post on behalf of a restricted or closed account constitutes enforcement evasion. Related accounts may also be restricted or closed.",
        },
      },

      {
        title: {
          tr: "Madde 24 — Moderasyon Kararına İtiraz",
          en: "Article 24 — Appeals",
        },

        body: {
          tr: "Bir moderasyon kararının hatalı olduğunu düşünen kullanıcı merhaba@forumfenomen.com adresi veya İletişim sayfasındaki Genel İletişim formu üzerinden itiraz edebilir. İtirazda kullanıcı adı, ilgili konu veya içerik bağlantısı, karar tarihi ve kararın neden hatalı olduğuna ilişkin kısa açıklama bulunmalıdır. Aynı karara ilişkin yeni bilgi içermeyen tekrarlanan başvurular yeniden incelenmeyebilir.",
          en: "A user who believes a moderation decision is incorrect may appeal through merhaba@forumfenomen.com or the General Contact form. Appeals should include the username, relevant topic or content link, decision date and a brief explanation. Repeated submissions containing no new information may not be reviewed again.",
        },
      },

      {
        title: {
          tr: "Madde 25 — Yönetim Hakkında Görüş ve Eleştiri",
          en: "Article 25 — Feedback About Management",
        },

        body: {
          tr: "Üyeler ForumFenomen’in işleyişi ve moderasyon kararları hakkında saygılı, somut ve çözüm odaklı eleştiri yapabilir. Hakaret, tehdit, kişisel bilgileri ifşa etme, moderatörleri hedef gösterme veya topluluğu organize biçimde rahatsız etmeye yönelik içerikler eleştiri kapsamında değerlendirilmez. Teknik sorunlar ve öneriler uygun kategori veya İletişim sayfası üzerinden iletilmelidir.",
          en: "Members may provide respectful, specific and constructive criticism about ForumFenomen operations and moderation decisions. Insults, threats, disclosure of personal information, targeting moderators or organizing disruption are not protected as criticism. Technical issues and suggestions should be submitted through the appropriate category or Contact page.",
        },
      },

      {
        title: {
          tr: "Madde 26 — Kuralların Güncellenmesi ve Bütünlüğü",
          en: "Article 26 — Updates and Integrity of the Rules",
        },

        body: {
          tr: "Bu kurallar, kategoriye özel kurallar, Kullanım Koşulları, Gizlilik Politikası ve diğer ForumFenomen politikalarıyla birlikte uygulanır. Topluluğun gelişmesi, yeni özellikler, güvenlik riskleri veya yasal gereklilikler nedeniyle kurallar güncellenebilir. Önemli değişiklikler uygun yöntemlerle duyurulur. Bir hükmün uygulanamaz olması diğer hükümlerin geçerliliğini ortadan kaldırmaz.",
          en: "These rules operate together with category-specific rules, the Terms of Use, Privacy Policy and other ForumFenomen policies. They may be updated as the community develops, features change, new safety risks emerge or legal requirements evolve. Material changes will be communicated appropriately. If one provision is unenforceable, the remaining provisions continue to apply.",
        },
      },
    ],
  },
  {
    key: "moderasyon-politikasi",
    route: "/yasal/moderasyon-politikasi",
    icon: "MD",

    title: {
      tr: "Moderasyon Politikası",
      en: "Moderation Policy",
    },

    summary: {
      tr: "ForumFenomen’de içerik inceleme, bildirim, yaptırım ve itiraz süreçlerinin nasıl yürütüldüğünü açıklar.",
      en: "Explains how content review, reporting, enforcement and appeal processes operate on ForumFenomen.",
    },

    sections: [
      {
        title: {
          tr: "1. Moderasyonun Amacı",
          en: "1. Purpose of Moderation",
        },

        body: {
          tr: "ForumFenomen moderasyonunun amacı, farklı görüşlerin özgürce paylaşılabildiği ancak kullanıcı güvenliğinin, kişisel hakların ve topluluk düzeninin korunduğu bir ortam oluşturmaktır. Moderasyon yalnızca görüş ayrılığı bulunduğu için değil, kuralların ihlal edilip edilmediğine göre uygulanır.",
          en: "ForumFenomen moderation aims to create an environment where different views can be shared freely while protecting user safety, personal rights and community order. Moderation is based on rule violations, not merely on disagreement.",
        },
      },

      {
        title: {
          tr: "2. İncelenen Alanlar",
          en: "2. Areas Subject to Review",
        },

        body: {
          tr: "Konu başlıkları, yorumlar, profiller, kullanıcı adları, görseller, videolar, bağlantılar, etiketler, anketler ve platforma yüklenen diğer içerikler moderasyon kapsamında incelenebilir. Kamuya açık olmayan teknik güvenlik kayıtları da hesap güvenliği ve kötüye kullanım araştırmalarında değerlendirilebilir.",
          en: "Topics, comments, profiles, usernames, images, videos, links, tags, polls and other content uploaded to the platform may be reviewed. Non-public technical security records may also be assessed during account security and abuse investigations.",
        },
      },

      {
        title: {
          tr: "3. İçeriklerin Tespit Edilmesi",
          en: "3. Detection of Content",
        },

        body: {
          tr: "İçerikler kullanıcı bildirimleri, moderatör kontrolleri ve otomatik güvenlik sistemleri aracılığıyla incelemeye alınabilir. Otomatik sistemlerden gelen sonuçlar destekleyici sinyal olarak kullanılabilir; bağlam gerektiren durumlarda insan değerlendirmesi yapılabilir.",
          en: "Content may be reviewed following user reports, moderator checks and automated safety systems. Automated results may be used as supporting signals, while human review may be used where context is required.",
        },
      },

      {
        title: {
          tr: "4. Değerlendirme İlkeleri",
          en: "4. Review Principles",
        },

        body: {
          tr: "İncelemede içeriğin bağlamı, amacı, hedef aldığı kişi veya grup, oluşturabileceği zarar, kamu yararı, tekrar durumu ve kullanıcının önceki ihlalleri dikkate alınabilir. Alıntı, haber verme, eleştiri veya eğitim amacı bulunan içerikler de paylaşım biçimine ve oluşturduğu riske göre değerlendirilir.",
          en: "Reviews may consider context, intent, targeted individuals or groups, potential harm, public interest, repetition and previous violations. Content shared for quotation, reporting, criticism or education is also assessed according to presentation and risk.",
        },
      },

      {
        title: {
          tr: "5. Uygulanabilecek İşlemler",
          en: "5. Possible Actions",
        },

        body: {
          tr: "İhlalin niteliğine göre içerik düzenleme talebi, etiket veya kategori düzeltmesi, içeriğin görünürlüğünün azaltılması, içeriğin kaldırılması, özelliklerin geçici olarak kısıtlanması, hesap uyarısı, geçici hesap askısı veya kalıcı hesap kapatma uygulanabilir.",
          en: "Depending on the violation, actions may include requesting edits, correcting tags or categories, reducing visibility, removing content, temporarily restricting features, issuing warnings, temporarily suspending or permanently closing an account.",
        },
      },

      {
        title: {
          tr: "6. Ağır ve Acil İhlaller",
          en: "6. Severe and Urgent Violations",
        },

        body: {
          tr: "Şiddet tehdidi, çocuk güvenliği ihlali, ciddi dolandırıcılık, kimlik avı, hassas kişisel bilgilerin ifşası veya yakın zarar riski bulunan durumlarda içerik önceden bildirim yapılmadan kaldırılabilir ve hesap derhal kısıtlanabilir. Yasal zorunluluk bulunan durumlarda ilgili bilgiler yetkili mercilerle paylaşılabilir.",
          en: "Content involving threats of violence, child safety violations, serious fraud, phishing, disclosure of sensitive personal information or imminent harm may be removed without prior notice and accounts may be restricted immediately. Information may be shared with competent authorities where legally required.",
        },
      },

      {
        title: {
          tr: "7. Tekrarlanan İhlaller ve Yaptırımdan Kaçınma",
          en: "7. Repeated Violations and Evasion",
        },

        body: {
          tr: "Aynı veya benzer ihlallerin tekrarlanması daha ağır yaptırımlara neden olabilir. Kısıtlanan ya da kapatılan bir hesabın yaptırımlarından kaçınmak amacıyla yeni hesap açmak, başka hesapları kullanmak veya teknik yöntemlerle erişim sağlamaya çalışmak ayrıca ihlal sayılır.",
          en: "Repeated similar violations may result in stronger enforcement. Creating new accounts, using other accounts or employing technical methods to evade restrictions or account closure is itself a violation.",
        },
      },

      {
        title: {
          tr: "8. İçeriğin Düzenlenmesi",
          en: "8. Content Adjustments",
        },

        body: {
          tr: "Açık yazım hataları, yanlış kategori, uygunsuz başlık, aşırı etiket veya kişisel bilgi içeren kısımlar gerektiğinde düzenlenebilir. İçeriğin anlamını önemli ölçüde değiştiren işlemlerde içeriğin kaldırılması veya kullanıcıdan düzeltme istenmesi tercih edilebilir.",
          en: "Obvious spelling errors, incorrect categories, unsuitable titles, excessive tags or sections containing personal information may be adjusted where necessary. Removal or a correction request may be preferred where an edit would materially change the meaning.",
        },
      },

      {
        title: {
          tr: "9. İtiraz ve Yeniden İnceleme",
          en: "9. Appeals and Reconsideration",
        },

        body: {
          tr: "Bir moderasyon kararının hatalı olduğunu düşünen kullanıcılar İletişim sayfasındaki Genel İletişim kanalından itiraz edebilir. İtirazda kullanıcı adı, ilgili konu veya içerik bağlantısı ve kararın neden hatalı olduğuna ilişkin kısa açıklama bulunmalıdır. Aynı karara ilişkin tekrarlanan ve yeni bilgi içermeyen başvurular yeniden değerlendirilmeyebilir.",
          en: "Users who believe a moderation decision is incorrect may appeal through the General Contact channel. Appeals should include the username, relevant content link and a brief explanation. Repeated appeals containing no new information may not be reviewed again.",
        },
      },

      {
        title: {
          tr: "10. Tarafsızlık ve Çıkar Çatışması",
          en: "10. Impartiality and Conflicts of Interest",
        },

        body: {
          tr: "Moderasyon kararları kullanıcıların popülerliği, görüşü veya ticari ilişkisi yerine davranış ve içerik üzerinden verilmelidir. Bir moderatörün kişisel olarak taraf olduğu veya çıkar çatışması yaşadığı durumlarda inceleme başka bir yetkiliye bırakılabilir.",
          en: "Moderation decisions should be based on behavior and content rather than popularity, opinions or commercial relationships. Where a moderator is personally involved or has a conflict of interest, the review may be assigned to another authorized person.",
        },
      },

      {
        title: {
          tr: "11. Politikanın Güncellenmesi",
          en: "11. Policy Updates",
        },

        body: {
          tr: "Topluluğun gelişmesi, yeni güvenlik riskleri, teknik özellikler veya yasal gereklilikler doğrultusunda bu politika güncellenebilir. Önemli değişiklikler uygun yöntemlerle kullanıcılara duyurulur ve güncel metin Yasal Merkez’de yayınlanır.",
          en: "This policy may be updated as the community evolves, new safety risks or technical features emerge, or legal requirements change. Material changes will be communicated appropriately and the current version will be published in the Legal Center.",
        },
      },
    ],
  },
  {
    key: "telif-ve-ihlal",
    route: "/yasal/telif-ve-ihlal",
    icon: "TL",
    title: {
      tr: "Telif ve İhlal Bildirimi",
      en: "Copyright and Violation Notices",
    },
    summary: {
      tr: "Telif hakkı ve hukuka aykırı içerik bildirimlerinin nasıl yapılacağını açıklar.",
      en: "Explains how copyright and unlawful content notices can be submitted.",
    },
    sections: [
      {
        title: {
          tr: "Telif Bildirimi",
          en: "Copyright Notice",
        },
        body: {
          tr: "Hak sahibinin kimliği, ihlal edildiği belirtilen eser ve ilgili içerik bağlantısı gibi gerekli bilgiler burada listelenecektir.",
          en: "Required information such as the rights holder, protected work and reported content link will be listed here.",
        },
      },
      {
        title: {
          tr: "İçerik İncelemesi",
          en: "Content Review",
        },
        body: {
          tr: "Geçerli bildirimlerin incelenmesi, içerik sahibinden bilgi istenmesi ve gerektiğinde içeriğin kaldırılması süreci açıklanacaktır.",
          en: "The process for reviewing valid notices, requesting information and removing content when necessary will be explained.",
        },
      },
      {
        title: {
          tr: "Kötüye Kullanım",
          en: "Misuse",
        },
        body: {
          tr: "Yanlış veya kötü niyetli telif bildirimlerine ilişkin kurallar yayın öncesinde eklenecektir.",
          en: "Rules regarding false or malicious copyright notices will be added before publication.",
        },
      },
    ],
  },
  {
    key: "hesap-ve-veri-silme",
    route: "/yasal/hesap-ve-veri-silme",
    icon: "VS",
    title: {
      tr: "Hesap ve Veri Silme",
      en: "Account and Data Deletion",
    },
    summary: {
      tr: "Hesap kapatma ve kişisel verilerin silinmesini isteme yöntemlerini açıklar.",
      en: "Explains how to close an account and request personal data deletion.",
    },
    sections: [
      {
        title: {
          tr: "Hesap Kapatma",
          en: "Account Closure",
        },
        body: {
          tr: "Profil ayarlarından hesap kapatma işlemi üyelik sistemi tamamlandığında bu bölümde adım adım açıklanacaktır.",
          en: "Account closure steps will be explained after the membership system is completed.",
        },
      },
      {
        title: {
          tr: "Veri Silme Talebi",
          en: "Data Deletion Request",
        },
        body: {
          tr: "Hesap dışında kalan kişisel verilere yönelik silme taleplerinin iletileceği yöntem burada açıklanacaktır.",
          en: "The method for requesting deletion of personal data outside the account will be explained here.",
        },
      },
      {
        title: {
          tr: "Yasal Saklama Süreleri",
          en: "Legal Retention",
        },
        body: {
          tr: "Yasal yükümlülükler nedeniyle hemen silinemeyen kayıtlar ve saklama süreleri yayın öncesinde belirtilecektir.",
          en: "Records that cannot be deleted immediately due to legal obligations and their retention periods will be described before publication.",
        },
      },
    ],
  },
  {
    key: "kvkk-basvuru",
    route: "/yasal/kvkk-basvuru",
    icon: "KB",

    title: {
      tr: "KVKK Başvuru Yöntemi",
      en: "Personal Data Request Procedure",
    },

    summary: {
      tr: "Kişisel verilerinizle ilgili taleplerinizi ForumFenomen'e nasıl iletebileceğinizi açıklar.",
      en: "Explains how to submit requests concerning your personal data to ForumFenomen.",
    },

    sections: [
      {
        title: {
          tr: "1. Kimler Başvurabilir?",
          en: "1. Who May Submit a Request?",
        },

        body: {
          tr: "Kişisel verisi ForumFenomen tarafından işlenen gerçek kişiler veya mevzuata uygun biçimde yetkilendirilmiş temsilcileri başvuruda bulunabilir. Başvuru yalnızca başvuru sahibine ait kişisel veriler bakımından yapılmalıdır.",
          en: "Individuals whose personal data is processed by ForumFenomen, or their duly authorized representatives, may submit a request. A request should concern only the applicant's personal data.",
        },
      },

      {
        title: {
          tr: "2. Başvuru Konuları",
          en: "2. Request Subjects",
        },

        body: {
          tr: "Başvuruda kişisel verilerin işlenip işlenmediğinin öğrenilmesi, işlenmişse bilgi talep edilmesi, işleme amacı ve aktarım yapılan taraflar hakkında bilgi alınması, eksik veya yanlış bilgilerin düzeltilmesi ve şartları oluşmuşsa verilerin silinmesi, yok edilmesi veya anonim hale getirilmesi istenebilir.",
          en: "Requests may ask whether personal data is processed, request information, ask about purposes and recipients, request correction and, where conditions are met, request deletion, destruction or anonymization.",
        },
      },

      {
        title: {
          tr: "3. Başvuru Kanalı",
          en: "3. Request Channel",
        },

        body: {
          tr: "Başvurular şimdilik merhaba@forumfenomen.com adresine gönderilebilir. Başvurunun mümkünse ForumFenomen hesabında kayıtlı e-posta adresinden yapılması önerilir. Resmî işletici adresi, KEP adresi veya ayrı bir KVKK e-posta adresi oluşturulduğunda bu sayfa güncellenecektir.",
          en: "Requests may currently be sent to merhaba@forumfenomen.com. Applicants should preferably use the email address registered to their ForumFenomen account. This page will be updated when an official operator address, registered electronic mail address or dedicated privacy email becomes available.",
        },
      },

      {
        title: {
          tr: "4. Başvuruda Bulunması Gereken Bilgiler",
          en: "4. Required Information",
        },

        body: {
          tr: "Başvuruda ad soyad, başvuruyu yapan kişinin ForumFenomen kullanıcı adı varsa kullanıcı adı, iletişim e-posta adresi, talebin açık açıklaması ve talebi destekleyen bilgi veya belgeler bulunmalıdır. Başka bir kişi adına başvuru yapılıyorsa temsil yetkisini gösteren belge eklenmelidir.",
          en: "The request should include full name, ForumFenomen username where available, contact email, a clear description of the request and supporting information or documents. A representative must also provide evidence of authorization.",
        },
      },

      {
        title: {
          tr: "5. Kimlik Doğrulama",
          en: "5. Identity Verification",
        },

        body: {
          tr: "Kişisel verilerin yetkisiz kişilere açıklanmasını önlemek amacıyla ForumFenomen, başvuru sahibinin kimliğini doğrulamak için talebin niteliğiyle orantılı ek bilgi isteyebilir. Gerekli olmadığı sürece kimlik belgesinin tamamı veya başvuruyla ilgisiz hassas bilgiler talep edilmez.",
          en: "To prevent disclosure to unauthorized persons, ForumFenomen may request proportionate information to verify the applicant's identity. Full identity documents or unrelated sensitive information will not be requested unless necessary.",
        },
      },

      {
        title: {
          tr: "6. Başvurunun Değerlendirilmesi",
          en: "6. Assessment of Requests",
        },

        body: {
          tr: "Başvurular talebin niteliğine göre en kısa sürede ve mevzuatta öngörülen süre içinde değerlendirilir. Başvuru kabul edilebilir, kısmen kabul edilebilir veya hukuki ve fiilî gerekçeleri açıklanarak reddedilebilir. Başvurunun yanlış veya eksik olması halinde ek bilgi istenebilir.",
          en: "Requests will be assessed as soon as reasonably possible and within the period required by law. A request may be accepted, partially accepted or refused with legal and factual reasons. Additional information may be requested where the submission is incomplete or inaccurate.",
        },
      },

      {
        title: {
          tr: "7. Cevap ve Ücret",
          en: "7. Response and Fees",
        },

        body: {
          tr: "Başvurular kural olarak ücretsiz sonuçlandırılır. İşlemin ayrıca bir maliyet gerektirmesi halinde yalnızca mevzuatın izin verdiği ölçüde ücret talep edilebilir. Cevap, başvurunun yapıldığı veya güvenli olduğu doğrulanan iletişim kanalına gönderilir.",
          en: "Requests are generally handled free of charge. A fee may be requested only where permitted by law and where the process creates an additional cost. Responses will be sent through the request channel or another verified secure contact method.",
        },
      },

      {
        title: {
          tr: "8. Başvuru Güvenliği",
          en: "8. Request Security",
        },

        body: {
          tr: "Başvuruda şifre, tek kullanımlık doğrulama kodu, banka kartı bilgisi veya talebin değerlendirilmesi için gerekli olmayan hassas bilgiler gönderilmemelidir. ForumFenomen, başvuruyu yalnızca yetkili kişilerin erişebileceği şekilde değerlendirmeye yönelik makul güvenlik önlemleri uygular.",
          en: "Applicants must not send passwords, one-time verification codes, bank card details or sensitive information unnecessary for the request. ForumFenomen applies reasonable safeguards so requests are reviewed only by authorized persons.",
        },
      },
    ],
  },
];

export function getLegalDocument(
  key: LegalDocumentKey
) {
  return legalDocuments.find(
    (document) =>
      document.key === key
  );
}




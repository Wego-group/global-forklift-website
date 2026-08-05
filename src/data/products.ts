import type { Lang } from "./languages";

export type LocalizedText = Record<Lang, string>;

const localized = (value: string): LocalizedText => ({
  en: value,
  es: value,
  fr: value,
  ja: value,
  de: value,
  pt: value,
  ko: value,
  ar: value
});

const translated = (value: Record<Lang, string>) => value;

export type ProductCategory = {
  slug: string;
  label: Record<Lang, string>;
  summary: Record<Lang, string>;
  image: string;
  capacityRange: string;
  powerTypes: LocalizedText[];
  status?: "catalog" | "planned";
};

export type ProductSpec = {
  labelKey: string;
  value: LocalizedText;
};

export type Product = {
  slug: string;
  sku: string;
  brand: string;
  category: string;
  image: string;
  gallery: string[];
  capacityTons: string;
  liftHeightM: string;
  powerType: string;
  availability: "PreOrder" | "InStock" | "OutOfStock";
  brochure?: string;
  translations: Record<
    Lang,
    {
      name: string;
      shortDescription: string;
      seoTitle: string;
      seoDescription: string;
      highlights: string[];
      applications: string[];
    }
  >;
  specs: ProductSpec[];
};

type ProductSeed = {
  slug: string;
  sku: string;
  brand?: string;
  name: string;
  category: string;
  imageDirectory: string;
  imageCount: number;
  capacity: string;
  mastType: string;
  powerType: string;
  tireType: string;
  applications?: string[];
};

function productTranslations(seed: ProductSeed): Product["translations"] {
  const brand = seed.brand ?? "WEGO";
  const category = categories.find((item) => item.slug === seed.category);
  const kind: Record<Lang, string> = {
    en: category?.label.en ?? "Forklift",
    es: category?.label.es ?? "Montacargas",
    fr: category?.label.fr ?? "Chariot élévateur",
    ja: category?.label.ja ?? "フォークリフト",
    de: category?.label.de ?? "Gabelstapler",
    pt: category?.label.pt ?? "Empilhadeira",
    ko: category?.label.ko ?? "지게차",
    ar: category?.label.ar ?? "رافعة شوكية"
  };
  const names: Record<Lang, string> = {
    en: seed.name,
    es: `${brand} ${seed.sku} ${seed.capacity} - ${kind.es}`,
    fr: `${brand} ${seed.sku} ${seed.capacity} - ${kind.fr}`,
    ja: `${brand} ${seed.sku} ${seed.capacity} ${kind.ja}`,
    de: `${brand} ${seed.sku} ${seed.capacity} ${kind.de}`,
    pt: `${brand} ${seed.sku} ${seed.capacity} - ${kind.pt}`,
    ko: `${brand} ${seed.sku} ${seed.capacity} ${kind.ko}`,
    ar: `${brand} ${seed.sku} ${seed.capacity} - ${kind.ar}`
  };
  const mast: Record<Lang, string> = {
    en: seed.mastType,
    es: seed.mastType.includes("3-stage") ? "mástil de 3 etapas" : seed.mastType.includes("2-stage") ? "mástil de 2 etapas" : "mástil configurable",
    fr: seed.mastType.includes("3-stage") ? "mât à 3 étages" : seed.mastType.includes("2-stage") ? "mât à 2 étages" : "mât configurable",
    ja: seed.mastType.includes("3-stage") ? "3段マスト" : seed.mastType.includes("2-stage") ? "2段マスト" : "選択可能なマスト",
    de: seed.mastType.includes("3-stage") ? "3-Stufen-Mast" : seed.mastType.includes("2-stage") ? "2-Stufen-Mast" : "konfigurierbarer Mast",
    pt: seed.mastType.includes("3-stage") ? "mastro de 3 estágios" : seed.mastType.includes("2-stage") ? "mastro de 2 estágios" : "mastro configurável",
    ko: seed.mastType.includes("3-stage") ? "3단 마스트" : seed.mastType.includes("2-stage") ? "2단 마스트" : "선택형 마스트",
    ar: seed.mastType.includes("3-stage") ? "سارية ثلاثية المراحل" : seed.mastType.includes("2-stage") ? "سارية ثنائية المراحل" : "سارية قابلة للتخصيص"
  };
  const templates: Record<Lang, { short: string; seo: string; highlights: string[]; applications: string[] }> = {
    en: {
      short: `${names.en} with ${seed.capacity} rated capacity and ${mast.en.toLowerCase()}. Confirm the final powertrain, lift height, tyres, and attachments for export.`,
      seo: `View specifications and current images for ${names.en}. Request a confirmed WEGO export quotation for your destination, quantity, and configuration.`,
      highlights: [`Rated capacity: ${seed.capacity}`, `Model: ${seed.sku}`, `${mast.en}; final configuration is confirmed before quotation`],
      applications: seed.applications ?? ["Factory and warehouse material handling", "Loading, unloading, and short-distance transport", "Export projects requiring model and attachment confirmation"]
    },
    es: {
      short: `${names.es}, capacidad nominal de ${seed.capacity} y ${mast.es}. Confirme motor o batería, altura, neumáticos y accesorios para exportación.`,
      seo: `Consulte las especificaciones y fotos de ${names.es}. Solicite una cotización de exportación WEGO según destino, cantidad y configuración.`,
      highlights: [`Capacidad nominal: ${seed.capacity}`, `Modelo: ${seed.sku}`, `${mast.es}; la configuración final se confirma antes de cotizar`],
      applications: ["Manipulación en fábricas y almacenes", "Carga, descarga y transporte interno", "Proyectos de exportación con accesorios personalizados"]
    },
    fr: {
      short: `${names.fr}, capacité nominale ${seed.capacity} et ${mast.fr}. Confirmez la motorisation, la hauteur, les pneus et les accessoires pour l'export.`,
      seo: `Consultez les caractéristiques et photos de ${names.fr}. Demandez un devis export WEGO selon la destination, la quantité et la configuration.`,
      highlights: [`Capacité nominale : ${seed.capacity}`, `Modèle : ${seed.sku}`, `${mast.fr} ; la configuration finale est confirmée avant devis`],
      applications: ["Manutention en usine et en entrepôt", "Chargement, déchargement et transport interne", "Projets export avec accessoires personnalisés"]
    },
    ja: {
      short: `${names.ja}。定格荷重${seed.capacity}、${mast.ja}。輸出仕様の動力、揚高、タイヤ、アタッチメントを見積時に確定します。`,
      seo: `${names.ja}の仕様と現行写真をご確認いただけます。仕向地、数量、仕様に応じたWEGOの輸出見積をご依頼ください。`,
      highlights: [`定格荷重：${seed.capacity}`, `モデル：${seed.sku}`, `${mast.ja}、最終仕様は見積前に確定`],
      applications: ["工場・倉庫内の荷役", "積み込み、荷下ろし、構内搬送", "アタッチメント指定を伴う輸出案件"]
    },
    de: {
      short: `${names.de} mit ${seed.capacity} Nenntragfähigkeit und ${mast.de}. Antrieb, Hubhöhe, Reifen und Anbaugeräte werden für den Export bestätigt.`,
      seo: `Technische Daten und aktuelle Bilder für ${names.de}. Fordern Sie ein WEGO Exportangebot nach Zielort, Menge und Ausführung an.`,
      highlights: [`Nenntragfähigkeit: ${seed.capacity}`, `Modell: ${seed.sku}`, `${mast.de}; die endgültige Ausführung wird vor dem Angebot bestätigt`],
      applications: ["Materialumschlag in Werk und Lager", "Be- und Entladen sowie innerbetrieblicher Transport", "Exportprojekte mit kundenspezifischen Anbaugeräten"]
    },
    pt: {
      short: `${names.pt}, capacidade nominal de ${seed.capacity} e ${mast.pt}. Confirme motorização, elevação, pneus e acessórios para exportação.`,
      seo: `Veja especificações e fotos de ${names.pt}. Solicite uma cotação de exportação WEGO conforme destino, quantidade e configuração.`,
      highlights: [`Capacidade nominal: ${seed.capacity}`, `Modelo: ${seed.sku}`, `${mast.pt}; a configuração final é confirmada antes da cotação`],
      applications: ["Movimentação em fábricas e armazéns", "Carga, descarga e transporte interno", "Projetos de exportação com acessórios personalizados"]
    },
    ko: {
      short: `${names.ko}. 정격 하중 ${seed.capacity}, ${mast.ko}. 수출용 동력계, 인상 높이, 타이어와 어태치먼트는 견적 시 확정합니다.`,
      seo: `${names.ko}의 사양과 현재 사진을 확인하고 목적지, 수량 및 구성에 맞는 WEGO 수출 견적을 요청하세요.`,
      highlights: [`정격 하중: ${seed.capacity}`, `모델: ${seed.sku}`, `${mast.ko}, 최종 구성은 견적 전에 확정`],
      applications: ["공장 및 창고 자재 운반", "상하차와 단거리 구내 운송", "맞춤형 어태치먼트가 필요한 수출 프로젝트"]
    },
    ar: {
      short: `${names.ar} بحمولة مقننة ${seed.capacity} و${mast.ar}. يتم تأكيد المحرك وارتفاع الرفع والإطارات والملحقات للتصدير.`,
      seo: `اطلع على المواصفات والصور الحالية لـ ${names.ar}. اطلب عرض تصدير من WEGO حسب الوجهة والكمية والتجهيز.`,
      highlights: [`الحمولة المقننة: ${seed.capacity}`, `الموديل: ${seed.sku}`, `${mast.ar}؛ يؤكد التجهيز النهائي قبل عرض السعر`],
      applications: ["مناولة المواد في المصانع والمستودعات", "التحميل والتفريغ والنقل الداخلي", "مشروعات التصدير ذات الملحقات المخصصة"]
    }
  };

  return Object.fromEntries(
    (Object.keys(templates) as Lang[]).map((lang) => [lang, {
      name: names[lang],
      shortDescription: templates[lang].short,
      seoTitle: `${names[lang]} | ${kind[lang]} | WEGO`,
      seoDescription: templates[lang].seo,
      highlights: templates[lang].highlights,
      applications: templates[lang].applications
    }])
  ) as Product["translations"];
}

function imageGallery(directory: string, count: number) {
  return Array.from({ length: count }, (_, index) => `/images/products/${directory}/${String(index + 1).padStart(2, "0")}.webp`);
}

export const categories: ProductCategory[] = [
  {
    slug: "lithium-electric-forklifts",
    label: translated({
      en: "Lithium & Electric Forklifts",
      es: "Montacargas de litio y eléctricos",
      fr: "Chariots lithium et électriques",
      ja: "リチウム・電動フォークリフト",
      de: "Lithium- und Elektrostapler",
      pt: "Empilhadeiras de lítio e elétricas",
      ko: "리튬 및 전동 지게차",
      ar: "رافعات الليثيوم والكهرباء"
    }),
    summary: translated({
      en: "2.5T-3.5T battery-powered counterbalance forklifts for warehouses, factories, and clean material handling.",
      es: "Montacargas contrapesados de batería de 2,5T a 3,5T para almacenes, fábricas y manipulación limpia.",
      fr: "Chariots électriques à contrepoids de 2,5T à 3,5T pour entrepôts, usines et manutention propre.",
      ja: "倉庫、工場、クリーンな荷役向けの2.5T～3.5Tバッテリー式カウンターバランスフォークリフト。",
      de: "Batteriebetriebene Gegengewichtsstapler von 2,5T bis 3,5T für Lager, Werke und sauberen Materialumschlag.",
      pt: "Empilhadeiras contrabalançadas a bateria de 2,5T a 3,5T para armazéns, fábricas e movimentação limpa.",
      ko: "창고, 공장 및 청정 작업용 2.5T-3.5T 배터리 카운터밸런스 지게차.",
      ar: "رافعات كهربائية متوازنة بحمولة 2.5T إلى 3.5T للمستودعات والمصانع والمناولة النظيفة."
    }),
    image: "/images/products/lithium-25t/01.webp",
    capacityRange: "2.5T-3.5T",
    powerTypes: [
      translated({ en: "Lithium battery", es: "Bateria de litio", fr: "Batterie lithium", ja: "リチウムバッテリー", de: "Lithiumbatterie", pt: "Bateria de litio", ko: "리튬 배터리", ar: "بطارية ليثيوم" }),
      translated({ en: "Electric", es: "Electrico", fr: "Electrique", ja: "電動", de: "Elektrisch", pt: "Eletrica", ko: "전동", ar: "كهربائية" })
    ],
    status: "catalog"
  },
  {
    slug: "diesel-forklifts",
    label: translated({
      en: "Diesel Forklifts",
      es: "Montacargas diésel",
      fr: "Chariots diesel",
      ja: "ディーゼルフォークリフト",
      de: "Dieselstapler",
      pt: "Empilhadeiras a diesel",
      ko: "디젤 지게차",
      ar: "رافعات ديزل"
    }),
    summary: translated({
      en: "2.5T-5.0T diesel forklifts with two-stage and three-stage mast options for general outdoor and industrial handling.",
      es: "Montacargas diésel de 2,5T a 5,0T con mástiles de 2 y 3 etapas para trabajo industrial y exterior.",
      fr: "Chariots diesel de 2,5T à 5,0T avec mâts à 2 ou 3 étages pour la manutention industrielle et extérieure.",
      ja: "屋外・産業用途向け、2段または3段マストを選べる2.5T～5.0Tディーゼルフォークリフト。",
      de: "Dieselstapler von 2,5T bis 5,0T mit 2- oder 3-Stufen-Mast für Industrie- und Außeneinsätze.",
      pt: "Empilhadeiras a diesel de 2,5T a 5,0T com mastros de 2 ou 3 estágios para trabalho industrial e externo.",
      ko: "산업 및 야외 작업용 2단·3단 마스트 옵션의 2.5T-5.0T 디젤 지게차.",
      ar: "رافعات ديزل بحمولة 2.5T إلى 5.0T مع سارية ثنائية أو ثلاثية المراحل للعمل الصناعي والخارجي."
    }),
    image: "/images/products/diesel-35t-2-stage/01.webp",
    capacityRange: "2.5T-5.0T",
    powerTypes: [translated({ en: "Diesel", es: "Diesel", fr: "Diesel", ja: "ディーゼル", de: "Diesel", pt: "Diesel", ko: "디젤", ar: "ديزل" })],
    status: "catalog"
  },
  {
    slug: "heavy-duty-forklifts",
    label: translated({
      en: "Heavy Duty Forklifts",
      es: "Montacargas de gran capacidad",
      fr: "Chariots grande capacité",
      ja: "大型フォークリフト",
      de: "Schwerlaststapler",
      pt: "Empilhadeiras de grande porte",
      ko: "대형 지게차",
      ar: "رافعات للخدمة الشاقة"
    }),
    summary: translated({
      en: "7.0T-10.0T diesel forklifts for large loads, industrial yards, steel, ports, and demanding logistics work.",
      es: "Montacargas diésel de 7,0T a 10,0T para grandes cargas, patios industriales, acero, puertos y logística exigente.",
      fr: "Chariots diesel de 7,0T à 10,0T pour charges lourdes, parcs industriels, sidérurgie, ports et logistique exigeante.",
      ja: "大型荷物、工業ヤード、鉄鋼、港湾、高負荷物流向けの7.0T～10.0Tディーゼルフォークリフト。",
      de: "Diesel-Schwerlaststapler von 7,0T bis 10,0T für große Lasten, Industriehöfe, Stahlwerke, Häfen und anspruchsvolle Logistik.",
      pt: "Empilhadeiras a diesel de 7,0T a 10,0T para grandes cargas, pátios industriais, aço, portos e logística exigente.",
      ko: "대형 화물, 산업 야드, 철강, 항만 및 고강도 물류용 7.0T-10.0T 디젤 지게차.",
      ar: "رافعات ديزل بحمولة 7.0T إلى 10.0T للأحمال الكبيرة والساحات الصناعية والصلب والموانئ."
    }),
    image: "/images/products/heavy-duty-100t/01.webp",
    capacityRange: "7.0T-10.0T",
    powerTypes: [translated({ en: "Diesel", es: "Diesel", fr: "Diesel", ja: "ディーゼル", de: "Diesel", pt: "Diesel", ko: "디젤", ar: "ديزل" })],
    status: "catalog"
  },
  {
    slug: "rough-terrain-forklifts",
    label: translated({
      en: "Rough Terrain Forklifts",
      es: "Montacargas todoterreno",
      fr: "Chariots tout-terrain",
      ja: "不整地フォークリフト",
      de: "Geländestapler",
      pt: "Empilhadeiras todo-terreno",
      ko: "험지용 지게차",
      ar: "رافعات للأراضي الوعرة"
    }),
    summary: translated({
      en: "3.5T rough terrain forklift for uneven yards, construction sites, farms, and outdoor cargo handling.",
      es: "Montacargas todoterreno de 3,5T para patios irregulares, obras, granjas y manipulación exterior.",
      fr: "Chariot tout-terrain de 3,5T pour terrains irréguliers, chantiers, exploitations agricoles et manutention extérieure.",
      ja: "不整地ヤード、建設現場、農場、屋外荷役向けの3.5T不整地フォークリフト。",
      de: "3,5T-Geländestapler für unebene Höfe, Baustellen, Landwirtschaft und Materialumschlag im Freien.",
      pt: "Empilhadeira todo-terreno de 3,5T para pátios irregulares, obras, fazendas e movimentação externa.",
      ko: "비포장 야드, 건설 현장, 농장 및 야외 화물 작업용 3.5T 험지용 지게차.",
      ar: "رافعة للأراضي الوعرة بحمولة 3.5T للساحات غير المستوية ومواقع البناء والمزارع."
    }),
    image: "/images/products/rough-terrain-35t/01.webp",
    capacityRange: "3.5T",
    powerTypes: [translated({ en: "Diesel", es: "Diesel", fr: "Diesel", ja: "ディーゼル", de: "Diesel", pt: "Diesel", ko: "디젤", ar: "ديزل" })],
    status: "catalog"
  },
  {
    slug: "electric-pallet-stackers",
    label: translated({
      en: "Electric Pallet Stackers",
      es: "Apiladores eléctricos",
      fr: "Gerbeurs électriques",
      ja: "電動スタッカー",
      de: "Elektro-Hochhubwagen",
      pt: "Empilhadores elétricos",
      ko: "전동 스태커",
      ar: "مكدسات طبالي كهربائية"
    }),
    summary: translated({
      en: "Compact electric pallet stacker for pallet movement and warehouse stacking. Capacity and lift configuration are confirmed per inquiry.",
      es: "Apilador eléctrico compacto para mover palés y apilar en almacenes. La capacidad y elevación se confirman con cada consulta.",
      fr: "Gerbeur électrique compact pour déplacer et stocker les palettes. La capacité et la levée sont confirmées sur demande.",
      ja: "パレット搬送と倉庫内積み付け向けの小型電動スタッカー。能力と揚高はお問い合わせ時に確認します。",
      de: "Kompakter Elektro-Hochhubwagen für Palettentransport und Lagereinsätze. Tragfähigkeit und Hubhöhe werden auf Anfrage bestätigt.",
      pt: "Empilhador elétrico compacto para movimentação e armazenagem de paletes. Capacidade e elevação são confirmadas na consulta.",
      ko: "팔레트 이동 및 창고 적재용 소형 전동 스태커. 용량과 인상 사양은 문의 시 확정됩니다.",
      ar: "مكدس طبالي كهربائي مدمج لنقل الطبالي والتكديس بالمستودع. تؤكد الحمولة والرفع عند الاستفسار."
    }),
    image: "/images/products/electric-pallet-stacker/01.webp",
    capacityRange: "Model based",
    powerTypes: [translated({ en: "Battery", es: "Bateria", fr: "Batterie", ja: "バッテリー", de: "Batterie", pt: "Bateria", ko: "배터리", ar: "بطارية" })],
    status: "catalog"
  }
];

const productSeeds: ProductSeed[] = [
  {
    slug: "wego-diesel-forklift-25t-3-stage",
    sku: "WG-D25-3M",
    name: "WEGO 2.5T Diesel Forklift - 3-Stage Mast",
    category: "diesel-forklifts",
    imageDirectory: "diesel-25t-3-stage",
    imageCount: 8,
    capacity: "2.5T",
    mastType: "3-stage mast",
    powerType: "Diesel",
    tireType: "Pneumatic / solid options"
  },
  {
    slug: "wego-diesel-forklift-25t-classic",
    sku: "WG-D25-C",
    name: "WEGO 2.5T Diesel Forklift - Classic Series",
    category: "diesel-forklifts",
    imageDirectory: "diesel-25t-classic",
    imageCount: 8,
    capacity: "2.5T",
    mastType: "Mast configuration to be confirmed",
    powerType: "Diesel",
    tireType: "Pneumatic / solid options"
  },
  {
    slug: "wego-lithium-forklift-25t",
    sku: "WG-L25",
    name: "WEGO 2.5T Lithium Forklift",
    category: "lithium-electric-forklifts",
    imageDirectory: "lithium-25t",
    imageCount: 17,
    capacity: "2.5T",
    mastType: "Mast configuration to be confirmed",
    powerType: "Lithium battery",
    tireType: "Pneumatic / solid options"
  },
  {
    slug: "wego-diesel-forklift-30t-2-stage",
    sku: "WG-D30-2M",
    name: "WEGO 3.0T Diesel Forklift - 2-Stage Mast",
    category: "diesel-forklifts",
    imageDirectory: "diesel-30t-2-stage",
    imageCount: 9,
    capacity: "3.0T",
    mastType: "2-stage mast",
    powerType: "Diesel",
    tireType: "Pneumatic / solid options"
  },
  {
    slug: "wego-lithium-forklift-30t",
    sku: "WG-L30",
    name: "WEGO 3.0T Lithium Forklift",
    category: "lithium-electric-forklifts",
    imageDirectory: "lithium-30t",
    imageCount: 12,
    capacity: "3.0T",
    mastType: "Mast configuration to be confirmed",
    powerType: "Lithium battery",
    tireType: "Pneumatic / solid options"
  },
  {
    slug: "wego-diesel-forklift-35t-2-stage",
    sku: "A35-2M",
    name: "WEGO A35 3.5T Diesel Forklift - 2-Stage Mast",
    category: "diesel-forklifts",
    imageDirectory: "diesel-35t-2-stage",
    imageCount: 8,
    capacity: "3.5T",
    mastType: "2-stage mast",
    powerType: "Diesel",
    tireType: "Pneumatic / solid options"
  },
  {
    slug: "wego-electric-forklift-k35",
    sku: "K35",
    name: "WEGO K35 3.5T Electric Forklift",
    category: "lithium-electric-forklifts",
    imageDirectory: "electric-35t",
    imageCount: 12,
    capacity: "3.5T",
    mastType: "Mast configuration to be confirmed",
    powerType: "Electric",
    tireType: "Pneumatic / solid options"
  },
  {
    slug: "wego-diesel-forklift-35t-classic",
    sku: "WG-D35-C",
    name: "WEGO 3.5T Diesel Forklift - Classic Series",
    category: "diesel-forklifts",
    imageDirectory: "diesel-35t-classic",
    imageCount: 8,
    capacity: "3.5T",
    mastType: "Mast configuration to be confirmed",
    powerType: "Diesel",
    tireType: "Pneumatic / solid options"
  },
  {
    slug: "wego-rough-terrain-forklift-35t",
    sku: "WG-RT35",
    name: "WEGO 3.5T Rough Terrain Forklift",
    category: "rough-terrain-forklifts",
    imageDirectory: "rough-terrain-35t",
    imageCount: 9,
    capacity: "3.5T",
    mastType: "Mast configuration to be confirmed",
    powerType: "Diesel",
    tireType: "Rough-terrain pneumatic",
    applications: ["Construction sites and uneven yards", "Farms, timber, and outdoor storage", "Outdoor loading on unpaved surfaces"]
  },
  {
    slug: "wego-diesel-forklift-40t-2-stage",
    sku: "WG-D40-2M",
    name: "WEGO 4.0T Diesel Forklift - 2-Stage Mast",
    category: "diesel-forklifts",
    imageDirectory: "diesel-40t-2-stage",
    imageCount: 8,
    capacity: "4.0T",
    mastType: "2-stage mast",
    powerType: "Diesel",
    tireType: "Pneumatic / solid options"
  },
  {
    slug: "wego-diesel-forklift-40t-3-stage",
    sku: "WG-D40-3M",
    name: "WEGO 4.0T Diesel Forklift - 3-Stage Mast",
    category: "diesel-forklifts",
    imageDirectory: "diesel-40t-3-stage",
    imageCount: 6,
    capacity: "4.0T",
    mastType: "3-stage mast",
    powerType: "Diesel",
    tireType: "Pneumatic / solid options"
  },
  {
    slug: "wego-diesel-forklift-50t-3-stage",
    sku: "A50-3M",
    name: "WEGO A50 5.0T Diesel Forklift - 3-Stage Mast",
    category: "diesel-forklifts",
    imageDirectory: "diesel-50t-3-stage",
    imageCount: 8,
    capacity: "5.0T",
    mastType: "3-stage mast",
    powerType: "Diesel",
    tireType: "Pneumatic / solid options"
  },
  {
    slug: "wego-heavy-duty-forklift-70t-2-stage",
    sku: "WG-D70-2M",
    name: "WEGO 7.0T Heavy Duty Diesel Forklift",
    category: "heavy-duty-forklifts",
    imageDirectory: "heavy-duty-70t-2-stage",
    imageCount: 6,
    capacity: "7.0T",
    mastType: "2-stage mast",
    powerType: "Diesel",
    tireType: "Large pneumatic"
  },
  {
    slug: "wego-heavy-duty-forklift-80t",
    sku: "WG-D80",
    name: "WEGO 8.0T Heavy Duty Diesel Forklift",
    category: "heavy-duty-forklifts",
    imageDirectory: "heavy-duty-80t",
    imageCount: 9,
    capacity: "8.0T",
    mastType: "Mast configuration to be confirmed",
    powerType: "Diesel",
    tireType: "Large pneumatic"
  },
  {
    slug: "wego-heavy-duty-forklift-100t",
    sku: "WG-D100",
    name: "WEGO 10.0T Heavy Duty Diesel Forklift",
    category: "heavy-duty-forklifts",
    imageDirectory: "heavy-duty-100t",
    imageCount: 10,
    capacity: "10.0T",
    mastType: "Mast configuration to be confirmed",
    powerType: "Diesel",
    tireType: "Large pneumatic"
  },
  {
    slug: "heli-electric-pallet-stacker-mc12",
    sku: "MC12",
    brand: "HELI",
    name: "HELI MC12 Electric Pallet Stacker",
    category: "electric-pallet-stackers",
    imageDirectory: "electric-pallet-stacker",
    imageCount: 25,
    capacity: "Confirm with sales",
    mastType: "Mast and lift height to be confirmed",
    powerType: "Battery",
    tireType: "PU / nylon",
    applications: ["Pallet movement in warehouses", "Low-noise indoor stacking", "Short-distance material transport"]
  }
];

const specValue = {
  dieselEngine: translated({
    en: "Diesel engine",
    es: "Motor diésel",
    fr: "Moteur diesel",
    ja: "ディーゼルエンジン",
    de: "Dieselmotor",
    pt: "Motor diesel",
    ko: "디젤 엔진",
    ar: "محرك ديزل"
  }),
  lithiumBattery: translated({
    en: "Lithium battery",
    es: "Batería de litio",
    fr: "Batterie lithium",
    ja: "リチウムバッテリー",
    de: "Lithiumbatterie",
    pt: "Bateria de lítio",
    ko: "리튬 배터리",
    ar: "بطارية ليثيوم"
  }),
  electricDrive: translated({
    en: "Electric drive",
    es: "Propulsión eléctrica",
    fr: "Entraînement électrique",
    ja: "電動駆動",
    de: "Elektroantrieb",
    pt: "Acionamento elétrico",
    ko: "전동 구동",
    ar: "دفع كهربائي"
  }),
  batteryPower: translated({
    en: "Battery powered",
    es: "Alimentación por batería",
    fr: "Alimentation par batterie",
    ja: "バッテリー駆動",
    de: "Batteriebetrieb",
    pt: "Alimentação por bateria",
    ko: "배터리 구동",
    ar: "تشغيل بالبطارية"
  }),
  twoStageMast: translated({
    en: "2-stage mast",
    es: "Mástil de 2 etapas",
    fr: "Mât à 2 étages",
    ja: "2段マスト",
    de: "2-Stufen-Mast",
    pt: "Mastro de 2 estágios",
    ko: "2단 마스트",
    ar: "سارية ثنائية المراحل"
  }),
  threeStageMast: translated({
    en: "3-stage mast",
    es: "Mástil de 3 etapas",
    fr: "Mât à 3 étages",
    ja: "3段マスト",
    de: "3-Stufen-Mast",
    pt: "Mastro de 3 estágios",
    ko: "3단 마스트",
    ar: "سارية ثلاثية المراحل"
  }),
  mastOptions: translated({
    en: "2-stage / 3-stage options",
    es: "Opciones de 2 / 3 etapas",
    fr: "Options 2 / 3 étages",
    ja: "2段 / 3段オプション",
    de: "2- / 3-Stufen-Optionen",
    pt: "Opções de 2 / 3 estágios",
    ko: "2단 / 3단 옵션",
    ar: "خيارات ثنائية / ثلاثية المراحل"
  }),
  automaticHydraulic: translated({
    en: "Automatic hydraulic transmission",
    es: "Transmisión hidráulica automática",
    fr: "Transmission hydraulique automatique",
    ja: "油圧オートマチック",
    de: "Hydraulisches Automatikgetriebe",
    pt: "Transmissão hidráulica automática",
    ko: "유압 자동 변속기",
    ar: "ناقل حركة هيدروليكي أوتوماتيكي"
  }),
  pneumaticSolidOptional: translated({
    en: "Pneumatic; solid optional",
    es: "Neumáticos; macizos opcionales",
    fr: "Pneumatiques; pleins en option",
    ja: "空気入り、ノーパンク選択可",
    de: "Luftreifen; Vollgummi optional",
    pt: "Pneumáticos; sólidos opcionais",
    ko: "공기압 타이어, 솔리드 옵션",
    ar: "هوائية؛ صلبة اختيارية"
  }),
  pneumatic: translated({
    en: "Pneumatic tyres",
    es: "Neumáticos",
    fr: "Pneumatiques",
    ja: "空気入りタイヤ",
    de: "Luftreifen",
    pt: "Pneumáticos",
    ko: "공기압 타이어",
    ar: "إطارات هوائية"
  }),
  roughTerrainPneumatic: translated({
    en: "Rough-terrain pneumatic tyres",
    es: "Neumáticos todoterreno",
    fr: "Pneumatiques tout-terrain",
    ja: "不整地用空気入りタイヤ",
    de: "Gelände-Luftreifen",
    pt: "Pneumáticos todo-terreno",
    ko: "험지용 공기압 타이어",
    ar: "إطارات هوائية للطرق الوعرة"
  }),
  solid: translated({
    en: "Solid tyres",
    es: "Neumáticos macizos",
    fr: "Pneus pleins",
    ja: "ノーパンクタイヤ",
    de: "Vollgummireifen",
    pt: "Pneus sólidos",
    ko: "솔리드 타이어",
    ar: "إطارات صلبة"
  }),
  puNylon: translated({
    en: "PU / nylon wheels",
    es: "Ruedas de PU / nailon",
    fr: "Roues PU / nylon",
    ja: "PU / ナイロン車輪",
    de: "PU- / Nylonrollen",
    pt: "Rodas de PU / nylon",
    ko: "PU / 나일론 휠",
    ar: "عجلات PU / نايلون"
  }),
  acMotor: translated({
    en: "AC motor",
    es: "Motor de CA",
    fr: "Moteur CA",
    ja: "ACモーター",
    de: "AC-Motor",
    pt: "Motor CA",
    ko: "AC 모터",
    ar: "محرك تيار متردد"
  }),
  walkie: translated({
    en: "Pedestrian / walkie",
    es: "Conductor acompañante",
    fr: "Conducteur accompagnant",
    ja: "歩行操作式",
    de: "Mitgängerbetrieb",
    pt: "Operação pedestre",
    ko: "보행식",
    ar: "تشغيل بالمشي خلفها"
  }),
  quotationConfirmed: translated({
    en: "Confirmed with quotation",
    es: "Confirmado con la cotización",
    fr: "Confirmé avec le devis",
    ja: "見積時に確認",
    de: "Mit dem Angebot bestätigt",
    pt: "Confirmado com a cotação",
    ko: "견적 시 확정",
    ar: "يؤكد مع عرض السعر"
  }),
  standardWarranty: translated({
    en: "12 months or 2,000 operating hours",
    es: "12 meses o 2.000 horas de trabajo",
    fr: "12 mois ou 2 000 heures de service",
    ja: "12か月または2,000稼働時間",
    de: "12 Monate oder 2.000 Betriebsstunden",
    pt: "12 meses ou 2.000 horas de operação",
    ko: "12개월 또는 2,000 운전시간",
    ar: "12 شهرا أو 2,000 ساعة تشغيل"
  })
};

const spec = (labelKey: string, value: string | LocalizedText): ProductSpec => ({
  labelKey,
  value: typeof value === "string" ? localized(value) : value
});

function productSpecs(seed: ProductSeed): ProductSpec[] {
  const warranty = spec("specWarranty", specValue.standardWarranty);

  switch (seed.slug) {
    case "wego-lithium-forklift-25t":
      return [
        spec("specModel", "CPCD25F"),
        spec("specRatedCapacity", "2,500 kg"),
        spec("specPower", specValue.lithiumBattery),
        spec("specBattery", "80 V / 280 Ah"),
        spec("specCharger", "80 V / 100 A"),
        spec("specLiftHeight", "3,000-6,000 mm"),
        spec("specLoadCenter", "500-600 mm"),
        spec("specForkLength", "1,070 mm"),
        spec("specTires", specValue.pneumatic),
        warranty
      ];
    case "wego-lithium-forklift-30t":
      return [
        spec("specModel", seed.sku),
        spec("specRatedCapacity", "3,000 kg"),
        spec("specPower", specValue.lithiumBattery),
        spec("specMast", specValue.threeStageMast),
        spec("specLiftHeight", "4,500 mm"),
        spec("specLoadCenter", "500-600 mm"),
        spec("specBattery", specValue.quotationConfirmed),
        spec("specForkLength", specValue.quotationConfirmed),
        spec("specTires", specValue.solid),
        warranty
      ];
    case "wego-electric-forklift-k35":
      return [
        spec("specModel", "K35"),
        spec("specRatedCapacity", "3,500 kg"),
        spec("specPower", specValue.electricDrive),
        spec("specMast", specValue.mastOptions),
        spec("specLiftHeight", "3,000-4,000 mm"),
        spec("specLoadCenter", "500-600 mm"),
        spec("specBattery", specValue.quotationConfirmed),
        spec("specForkLength", specValue.quotationConfirmed),
        spec("specTires", specValue.pneumaticSolidOptional),
        warranty
      ];
    case "wego-diesel-forklift-25t-3-stage":
      return dieselSpecs(seed, "CPCD25FR", specValue.threeStageMast, "4,500-8,000 mm", "1,070-2,500 mm");
    case "wego-diesel-forklift-25t-classic":
      return dieselSpecs(seed, "CPCD25FR", specValue.twoStageMast, "3,000-5,000 mm", "1,070-2,500 mm");
    case "wego-diesel-forklift-30t-2-stage":
      return dieselSpecs(seed, "CPCD30FR", specValue.twoStageMast, "3,000-5,000 mm", "1,220-2,500 mm", "China 490BPG");
    case "wego-diesel-forklift-35t-2-stage":
      return [
        ...dieselSpecs(seed, "CPCD35FR", specValue.twoStageMast, "3,000-5,000 mm", "1,220-2,500 mm"),
        spec("specRatedPower", "39 kW"),
        spec("specOperatingWeight", "4,580 kg")
      ];
    case "wego-diesel-forklift-35t-classic":
      return [
        ...dieselSpecs(seed, "CPCD35FR", specValue.mastOptions, "3,000-8,000 mm", "1,220-2,500 mm"),
        spec("specRatedPower", "39 kW"),
        spec("specOperatingWeight", "4,580 kg")
      ];
    case "wego-rough-terrain-forklift-35t":
      return [
        spec("specModel", "CPCD35FR"),
        spec("specRatedCapacity", "3,500 kg"),
        spec("specPower", specValue.dieselEngine),
        spec("specLiftHeight", "3,000-6,000 mm"),
        spec("specLoadCenter", "500-600 mm"),
        spec("specDimensions", "3,800 x 1,230 x 2,306 mm"),
        spec("specTires", specValue.roughTerrainPneumatic),
        spec("specOperatingWeight", "4,580 kg"),
        warranty
      ];
    case "wego-diesel-forklift-40t-2-stage":
      return dieselSpecs(
        seed,
        "CPCD40FR",
        specValue.twoStageMast,
        "3,000-5,000 mm",
        "1,220-2,400 mm",
        "Xinchai 498BPG 45 kW / Quanchai 4C6 48 kW"
      );
    case "wego-diesel-forklift-40t-3-stage":
      return dieselSpecs(
        seed,
        "CPCD40FR",
        specValue.threeStageMast,
        "4,500-6,000 mm",
        "1,220-2,400 mm",
        "Xinchai 498BPG 45 kW / Quanchai 4C6 48 kW"
      );
    case "wego-diesel-forklift-50t-3-stage":
      return dieselSpecs(
        seed,
        "CPCD50F",
        specValue.threeStageMast,
        "4,500-6,000 mm",
        "1,220-2,400 mm",
        "China III 62.5 kW"
      );
    case "wego-heavy-duty-forklift-70t-2-stage":
      return dieselSpecs(seed, "CPCD70F", specValue.twoStageMast, "3,000-6,000 mm", "1,220-2,400 mm", "China / Japan");
    case "wego-heavy-duty-forklift-80t":
      return dieselSpecs(seed, "CPCD80F", specValue.mastOptions, "3,000-5,000 mm", "1,520-2,500 mm", "China / Japan");
    case "wego-heavy-duty-forklift-100t":
      return [
        spec("specModel", "CPCD100F"),
        spec("specRatedCapacity", "10,000 kg"),
        spec("specPower", specValue.dieselEngine),
        spec("specMast", specValue.twoStageMast),
        spec("specLiftHeight", "3,000-5,000 mm"),
        spec("specLoadCenter", "500 mm"),
        spec("specTransmission", specValue.automaticHydraulic),
        spec("specEngine", "China III 4J1"),
        spec("specForkLength", "1,520-2,500 mm"),
        spec("specTires", specValue.pneumatic),
        warranty
      ];
    case "heli-electric-pallet-stacker-mc12":
      return [
        spec("specModel", "MC12"),
        spec("specRatedCapacity", "1,200 kg"),
        spec("specPower", specValue.batteryPower),
        spec("specDriveMotor", specValue.acMotor),
        spec("specOperatorType", specValue.walkie),
        spec("specLiftHeight", specValue.quotationConfirmed),
        spec("specBattery", specValue.quotationConfirmed),
        spec("specTires", specValue.puNylon),
        warranty
      ];
    default:
      return [
        spec("specModel", seed.sku),
        spec("specRatedCapacity", seed.capacity),
        spec("specPower", seed.powerType),
        spec("specMast", seed.mastType),
        spec("specTires", seed.tireType),
        warranty
      ];
  }
}

function dieselSpecs(
  seed: ProductSeed,
  model: string,
  mast: LocalizedText,
  liftHeight: string,
  forkLength: string,
  engine = "China / Japan"
): ProductSpec[] {
  return [
    spec("specModel", model),
    spec("specRatedCapacity", `${Math.round(Number.parseFloat(seed.capacity.replace("T", "")) * 1000).toLocaleString("en-US")} kg`),
    spec("specPower", specValue.dieselEngine),
    spec("specMast", mast),
    spec("specLiftHeight", liftHeight),
    spec("specLoadCenter", "500 mm"),
    spec("specTransmission", specValue.automaticHydraulic),
    spec("specEngine", engine),
    spec("specForkLength", forkLength),
    spec("specTires", specValue.pneumaticSolidOptional),
    spec("specWarranty", specValue.standardWarranty)
  ];
}

export const products: Product[] = productSeeds.map((seed) => {
  const gallery = imageGallery(seed.imageDirectory, seed.imageCount);

  return {
    slug: seed.slug,
    sku: seed.sku,
    brand: seed.brand ?? "WEGO",
    category: seed.category,
    image: gallery[0],
    gallery,
    capacityTons: seed.capacity,
    liftHeightM: seed.mastType,
    powerType: seed.powerType,
    availability: "PreOrder",
    translations: productTranslations(seed),
    specs: productSpecs(seed)
  };
});

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getProduct(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductName(product: Product, lang: Lang) {
  return product.translations[lang]?.name ?? product.translations.en.name;
}

export function getCategoryProducts(categorySlug: string) {
  return products.filter((product) => product.category === categorySlug);
}

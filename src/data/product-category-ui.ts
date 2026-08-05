import type { Lang } from "./languages";
import type { LocalizedText } from "./products";

type CategoryApplication = { title: LocalizedText; description: LocalizedText };

const loc = (value: LocalizedText) => value;
const item = (title: LocalizedText, description: LocalizedText): CategoryApplication => ({ title, description });

const categoryApplications: Record<string, CategoryApplication[]> = {
  "lithium-electric-forklifts": [
    item(
      loc({ en: "Indoor warehouse operations", es: "Operaciones en almacenes interiores", fr: "Operations en entrepot", ja: "屋内倉庫作業", de: "Innerbetriebliche Lagerarbeit", pt: "Operacoes em armazens internos", ko: "실내 창고 작업", ar: "عمليات المستودعات الداخلية" }),
      loc({ en: "Low-noise battery power and zero local exhaust suit racking, packing, and finished-goods areas.", es: "La energia de bateria, silenciosa y sin emisiones locales, es adecuada para estanterias, embalaje y producto terminado.", fr: "La batterie silencieuse et sans emission locale convient aux rayonnages, a l'emballage et aux produits finis.", ja: "低騒音で現場排気のないバッテリー駆動は、棚間作業、梱包、完成品エリアに適しています。", de: "Leiser Batterieantrieb ohne lokale Abgase eignet sich fur Regale, Verpackung und Fertigwarenbereiche.", pt: "A bateria de baixo ruido e sem emissao local atende estantes, embalagem e areas de produtos acabados.", ko: "저소음 배터리 구동과 현장 배기가스가 없는 특성은 랙, 포장 및 완제품 구역에 적합합니다.", ar: "تجعل البطارية الهادئة والخالية من الانبعاثات المحلية الرافعة مناسبة للرفوف والتعبئة ومناطق المنتجات النهائية." })
    ),
    item(
      loc({ en: "Food and pharmaceutical storage", es: "Almacenamiento alimentario y farmaceutico", fr: "Stockage alimentaire et pharmaceutique", ja: "食品・医薬品保管", de: "Lebensmittel- und Pharmalager", pt: "Armazenagem de alimentos e farmaceutica", ko: "식품 및 의약품 보관", ar: "تخزين الاغذية والادوية" }),
      loc({ en: "A clean electric powertrain supports controlled warehouses, cold-chain staging, and strict indoor-air requirements.", es: "La propulsion electrica limpia favorece almacenes controlados, preparacion de cadena de frio y requisitos estrictos de aire interior.", fr: "La motorisation electrique propre convient aux entrepots controles, a la chaine du froid et aux exigences d'air interieur.", ja: "クリーンな電動方式は、温度管理倉庫、コールドチェーンの荷揃え、厳しい屋内空気条件に対応します。", de: "Der saubere Elektroantrieb passt zu kontrollierten Lagern, Kuhlketten und strengen Anforderungen an die Innenluft.", pt: "A motorizacao eletrica limpa atende armazens controlados, cadeia fria e requisitos rigorosos de ar interno.", ko: "청정 전동 파워트레인은 관리형 창고, 콜드체인 준비 구역 및 엄격한 실내 공기 조건에 적합합니다.", ar: "يدعم نظام الدفع الكهربائي النظيف المستودعات الخاضعة للرقابة ومناطق سلسلة التبريد ومتطلبات جودة الهواء الداخلية." })
    ),
    item(
      loc({ en: "Production line supply", es: "Abastecimiento de lineas de produccion", fr: "Alimentation des lignes de production", ja: "生産ライン供給", de: "Versorgung von Produktionslinien", pt: "Abastecimento de linhas de producao", ko: "생산 라인 공급", ar: "تغذية خطوط الانتاج" }),
      loc({ en: "Responsive electric drive supports frequent component movement and repeatable factory handling cycles.", es: "La respuesta electrica facilita movimientos frecuentes de componentes y ciclos repetitivos de fabrica.", fr: "La conduite electrique reactive facilite les mouvements frequents de composants et les cycles repetitifs en usine.", ja: "応答性の高い電動走行により、部品の頻繁な搬送と反復的な工場内荷役を支えます。", de: "Der reaktionsschnelle Elektroantrieb unterstutzt haufige Teilebewegungen und wiederkehrende Werkszyklen.", pt: "A tracao eletrica responsiva favorece o transporte frequente de componentes e ciclos repetitivos na fabrica.", ko: "반응성이 좋은 전동 구동은 잦은 부품 이동과 반복적인 공장 물류 작업을 지원합니다.", ar: "يدعم الدفع الكهربائي سريع الاستجابة نقل المكونات المتكرر ودورات المناولة المتكررة داخل المصنع." })
    )
  ],
  "diesel-forklifts": [
    item(
      loc({ en: "Outdoor loading yards", es: "Patios exteriores de carga", fr: "Parcs de chargement exterieurs", ja: "屋外積み込みヤード", de: "Aussenliegende Ladehofe", pt: "Patios externos de carga", ko: "야외 상하차 야드", ar: "ساحات التحميل الخارجية" }),
      loc({ en: "Diesel power supports continuous trailer loading, unloading, and cargo transfer in open industrial yards.", es: "La potencia diesel admite carga y descarga continua de camiones y transferencia de mercancias en patios abiertos.", fr: "Le diesel convient au chargement continu des remorques, au dechargement et au transfert de marchandises en parc ouvert.", ja: "ディーゼル動力は、屋外の工業ヤードで継続的なトレーラー積み込み、荷下ろし、貨物移送に対応します。", de: "Dieselantrieb unterstutzt kontinuierliches Be- und Entladen sowie den Guterumschlag auf offenen Industriehofen.", pt: "A potencia diesel atende carga e descarga continua de caminhoes e transferencia de cargas em patios abertos.", ko: "디젤 동력은 개방형 산업 야드에서 지속적인 트레일러 상하차와 화물 이송을 지원합니다.", ar: "تدعم قوة الديزل تحميل وتفريغ المقطورات ونقل البضائع بصورة مستمرة في الساحات الصناعية المفتوحة." })
    ),
    item(
      loc({ en: "Factory and building materials", es: "Fabricas y materiales de construccion", fr: "Usines et materiaux de construction", ja: "工場・建材取扱い", de: "Werke und Baustoffe", pt: "Fabricas e materiais de construcao", ko: "공장 및 건축 자재", ar: "المصانع ومواد البناء" }),
      loc({ en: "Multiple capacities and mast choices handle machinery, pallets, construction materials, and general industrial loads.", es: "Las opciones de capacidad y mastil permiten mover maquinaria, pales, materiales de construccion y cargas industriales.", fr: "Les choix de capacite et de mat permettent de manutentionner machines, palettes, materiaux et charges industrielles.", ja: "複数の荷重・マスト仕様により、機械、パレット、建材、一般産業貨物を取り扱えます。", de: "Verschiedene Tragfahigkeiten und Maste bewaltigen Maschinen, Paletten, Baustoffe und allgemeine Industrielasten.", pt: "Opcoes de capacidade e mastro movimentam maquinas, paletes, materiais de construcao e cargas industriais.", ko: "다양한 용량과 마스트 옵션으로 기계, 팔레트, 건축 자재 및 일반 산업 화물을 처리합니다.", ar: "تتيح خيارات الحمولة والسارية مناولة المعدات والطبالي ومواد البناء والاحمال الصناعية العامة." })
    ),
    item(
      loc({ en: "Mixed-surface logistics", es: "Logistica en superficies mixtas", fr: "Logistique sur surfaces mixtes", ja: "複合路面物流", de: "Logistik auf gemischten Flachen", pt: "Logistica em pisos mistos", ko: "복합 노면 물류", ar: "الخدمات اللوجستية على اسطح متنوعة" }),
      loc({ en: "Pneumatic tyre options and gradeability suit routes between warehouses, docks, and outdoor storage.", es: "Los neumaticos y la capacidad de pendiente se adaptan a rutas entre almacenes, muelles y zonas exteriores.", fr: "Les pneus et l'aptitude en pente conviennent aux trajets entre entrepots, quais et zones exterieures.", ja: "空気入りタイヤ仕様と登坂性能により、倉庫、ドック、屋外保管場を結ぶ経路に適応します。", de: "Luftreifenoptionen und Steigfahigkeit passen zu Wegen zwischen Lager, Rampe und Aussenlager.", pt: "Pneus pneumaticos e capacidade de rampa atendem rotas entre armazens, docas e patios externos.", ko: "공기압 타이어 옵션과 등판 성능은 창고, 도크 및 야외 보관장을 잇는 동선에 적합합니다.", ar: "تلائم خيارات الاطارات الهوائية والقدرة على صعود المنحدرات المسارات بين المستودعات والارصفة والتخزين الخارجي." })
    )
  ],
  "heavy-duty-forklifts": [
    item(
      loc({ en: "Ports and terminals", es: "Puertos y terminales", fr: "Ports et terminaux", ja: "港湾・ターミナル", de: "Hafen und Terminals", pt: "Portos e terminais", ko: "항만 및 터미널", ar: "الموانئ والمحطات" }),
      loc({ en: "High-capacity models support heavy cargo transfer, terminal yards, and long outdoor duty cycles.", es: "Los modelos de gran capacidad apoyan cargas pesadas, patios de terminal y ciclos exteriores prolongados.", fr: "Les modeles grande capacite assurent le transfert de charges lourdes et les longs cycles en terminal.", ja: "大容量モデルは、重量貨物の移送、ターミナルヤード、長時間の屋外稼働に対応します。", de: "Schwerlastmodelle unterstutzen den Umschlag schwerer Guter und lange Ausseneinsatze im Terminal.", pt: "Modelos de grande capacidade atendem cargas pesadas, patios de terminal e longos ciclos externos.", ko: "대형 모델은 중량 화물 이송, 터미널 야드 및 장시간 야외 작업을 지원합니다.", ar: "تدعم الطرازات عالية الحمولة نقل البضائع الثقيلة والعمل في ساحات المحطات ودورات التشغيل الخارجية الطويلة." })
    ),
    item(
      loc({ en: "Steel and metal handling", es: "Manipulacion de acero y metal", fr: "Manutention de l'acier et des metaux", ja: "鉄鋼・金属荷役", de: "Stahl- und Metallumschlag", pt: "Movimentacao de aco e metais", ko: "철강 및 금속 취급", ar: "مناولة الصلب والمعادن" }),
      loc({ en: "Robust chassis and large load centres suit coils, billets, fabricated structures, and dense industrial cargo.", es: "El chasis robusto y los centros de carga amplios sirven para bobinas, palanquillas y estructuras metalicas.", fr: "Le chassis robuste et les grands centres de charge conviennent aux bobines, billettes et structures metalliques.", ja: "堅牢な車体と大きな荷重中心は、コイル、ビレット、加工構造物、高密度貨物に適します。", de: "Robustes Fahrwerk und grosse Lastschwerpunkte eignen sich fur Coils, Knuppel und Stahlkonstruktionen.", pt: "Chassi robusto e centros de carga amplos atendem bobinas, tarugos e estruturas metalicas.", ko: "견고한 차체와 큰 하중 중심은 코일, 빌릿, 제작 구조물 및 고밀도 화물에 적합합니다.", ar: "يلائم الهيكل القوي ومراكز الحمل الكبيرة لفائف الصلب والكتل والهياكل المصنعة والبضائع الصناعية الكثيفة." })
    ),
    item(
      loc({ en: "Heavy manufacturing", es: "Fabricacion pesada", fr: "Industrie lourde", ja: "重工業", de: "Schwerindustrie", pt: "Industria pesada", ko: "중공업", ar: "الصناعات الثقيلة" }),
      loc({ en: "Seven-to-ten-ton capacity supports machinery installation, plant logistics, moulds, and oversized materials.", es: "La capacidad de siete a diez toneladas sirve para maquinaria, logistica de planta, moldes y materiales grandes.", fr: "La capacite de sept a dix tonnes convient aux machines, a la logistique d'usine, aux moules et aux charges hors gabarit.", ja: "7～10トンの能力で、機械据付、工場物流、金型、大型資材を支えます。", de: "Sieben bis zehn Tonnen Tragfahigkeit unterstutzen Maschinenmontage, Werkslogistik, Formen und Grossmaterial.", pt: "Capacidade de sete a dez toneladas atende instalacao de maquinas, logistica fabril, moldes e materiais grandes.", ko: "7~10톤 용량은 기계 설치, 공장 물류, 금형 및 대형 자재 작업을 지원합니다.", ar: "تدعم حمولة سبعة الى عشرة اطنان تركيب المعدات ولوجستيات المصنع والقوالب والمواد كبيرة الحجم." })
    )
  ],
  "rough-terrain-forklifts": [
    item(
      loc({ en: "Construction sites", es: "Obras de construccion", fr: "Chantiers de construction", ja: "建設現場", de: "Baustellen", pt: "Canteiros de obras", ko: "건설 현장", ar: "مواقع البناء" }),
      loc({ en: "Higher ground clearance and outdoor tyres move blocks, timber, tools, and pallets across uneven sites.", es: "La mayor altura libre y los neumaticos exteriores ayudan a mover bloques, madera, herramientas y pales.", fr: "La garde au sol et les pneus tout-terrain facilitent le transport de blocs, bois, outils et palettes.", ja: "高い最低地上高と屋外タイヤにより、不整地でブロック、木材、工具、パレットを搬送できます。", de: "Mehr Bodenfreiheit und Gelande-Reifen bewegen Blocke, Holz, Werkzeuge und Paletten auf unebenem Grund.", pt: "Maior vao livre e pneus externos movimentam blocos, madeira, ferramentas e paletes em terreno irregular.", ko: "높은 지상고와 야외용 타이어로 고르지 않은 현장에서 블록, 목재, 공구 및 팔레트를 운반합니다.", ar: "يساعد الخلوص الارضي المرتفع والاطارات الخارجية على نقل الطوب والاخشاب والادوات والطبالي عبر المواقع غير المستوية." })
    ),
    item(
      loc({ en: "Agriculture and forestry", es: "Agricultura y silvicultura", fr: "Agriculture et foresterie", ja: "農業・林業", de: "Land- und Forstwirtschaft", pt: "Agricultura e silvicultura", ko: "농업 및 임업", ar: "الزراعة والغابات" }),
      loc({ en: "The 3.5T platform handles farm supplies, timber, feed, and seasonal cargo on unpaved surfaces.", es: "La plataforma de 3,5T mueve suministros agricolas, madera, pienso y cargas estacionales en suelo sin pavimentar.", fr: "La plateforme 3,5T manutentionne fournitures agricoles, bois, aliments et charges saisonnieres sur sol non pave.", ja: "3.5T仕様は、未舗装路面で農業資材、木材、飼料、季節貨物を取り扱います。", de: "Die 3,5T-Plattform bewegt Agrarguter, Holz, Futtermittel und Saisonwaren auf unbefestigten Flachen.", pt: "A plataforma de 3,5T movimenta insumos agricolas, madeira, racao e cargas sazonais em piso nao pavimentado.", ko: "3.5톤 플랫폼은 비포장 노면에서 농자재, 목재, 사료 및 계절 화물을 처리합니다.", ar: "تتعامل منصة 3.5 طن مع مستلزمات المزارع والاخشاب والاعلاف والبضائع الموسمية على الاسطح غير الممهدة." })
    ),
    item(
      loc({ en: "Remote outdoor yards", es: "Patios exteriores remotos", fr: "Parcs exterieurs isoles", ja: "遠隔屋外ヤード", de: "Abgelegene Aussenlager", pt: "Patios externos remotos", ko: "원격 야외 야드", ar: "الساحات الخارجية البعيدة" }),
      loc({ en: "A practical diesel configuration suits sites without paved floors or indoor charging infrastructure.", es: "Una configuracion diesel practica sirve para lugares sin suelo pavimentado ni infraestructura de carga interior.", fr: "Une configuration diesel pratique convient aux sites sans sol pave ni infrastructure de recharge interieure.", ja: "実用的なディーゼル仕様は、舗装床や屋内充電設備がない現場に適しています。", de: "Eine praktische Dieselausfuhrung passt zu Standorten ohne befestigte Boden oder Ladeinfrastruktur.", pt: "Uma configuracao diesel pratica atende locais sem piso pavimentado ou infraestrutura interna de recarga.", ko: "실용적인 디젤 구성은 포장 바닥이나 실내 충전 인프라가 없는 현장에 적합합니다.", ar: "يلائم تجهيز الديزل العملي المواقع التي لا تتوفر فيها ارضيات ممهدة او بنية شحن داخلية." })
    )
  ],
  "electric-pallet-stackers": [
    item(
      loc({ en: "Narrow aisle stacking", es: "Apilado en pasillos estrechos", fr: "Gerbage en allees etroites", ja: "狭通路積み付け", de: "Stapeln in Schmalgangen", pt: "Empilhamento em corredores estreitos", ko: "협소 통로 적재", ar: "التكديس في الممرات الضيقة" }),
      loc({ en: "The compact chassis places and retrieves pallets where counterbalance forklifts need too much turning space.", es: "El chasis compacto coloca y retira pales donde un montacargas contrapesado necesita demasiado giro.", fr: "Le chassis compact place et retire les palettes la ou un chariot a contrepoids manque d'espace de braquage.", ja: "小型車体により、カウンターバランス車では旋回スペースが不足する場所でもパレットを出し入れできます。", de: "Das kompakte Fahrwerk lagert Paletten dort ein und aus, wo Gegengewichtsstapler zu viel Wendeflache benotigen.", pt: "O chassi compacto coloca e retira paletes onde empilhadeiras contrabalancadas exigem muito espaco de giro.", ko: "컴팩트한 차체는 카운터밸런스 지게차에 회전 공간이 부족한 곳에서 팔레트를 입출고합니다.", ar: "يتيح الهيكل المدمج وضع وسحب الطبالي في المواقع التي تحتاج فيها الرافعة المتوازنة الى مساحة دوران اكبر." })
    ),
    item(
      loc({ en: "Retail and distribution storage", es: "Almacenamiento minorista y distribucion", fr: "Stockage retail et distribution", ja: "小売・配送保管", de: "Handels- und Verteillager", pt: "Armazenagem no varejo e distribuicao", ko: "소매 및 유통 보관", ar: "التخزين للتجزئة والتوزيع" }),
      loc({ en: "Quiet battery operation suits stock rooms, distribution centres, and frequent indoor replenishment.", es: "La bateria silenciosa es adecuada para almacenes de tienda, centros de distribucion y reposicion frecuente.", fr: "La batterie silencieuse convient aux reserves, centres de distribution et operations frequentes de reapprovisionnement.", ja: "静かなバッテリー運転は、店舗倉庫、配送センター、頻繁な屋内補充作業に適します。", de: "Leiser Batteriebetrieb eignet sich fur Lagerräume, Verteilzentren und haufige Nachschubaufgaben.", pt: "A operacao silenciosa a bateria atende estoques, centros de distribuicao e reposicao interna frequente.", ko: "조용한 배터리 운전은 재고실, 물류센터 및 잦은 실내 보충 작업에 적합합니다.", ar: "يناسب التشغيل الهادئ بالبطارية مخازن التجزئة ومراكز التوزيع وعمليات اعادة التعبئة الداخلية المتكررة." })
    ),
    item(
      loc({ en: "Short-distance pallet movement", es: "Movimiento de pales a corta distancia", fr: "Deplacement de palettes a courte distance", ja: "短距離パレット搬送", de: "Palettentransport uber kurze Strecken", pt: "Movimentacao de paletes em curta distancia", ko: "단거리 팔레트 운반", ar: "نقل الطبالي لمسافات قصيرة" }),
      loc({ en: "Walk-behind controls efficiently move and lift pallets between receiving, storage, and dispatch zones.", es: "El control peatonal mueve y eleva pales con eficiencia entre recepcion, almacenamiento y expedicion.", fr: "La conduite accompagnee deplace et leve efficacement les palettes entre reception, stockage et expedition.", ja: "歩行操作により、入荷、保管、出荷エリア間でパレットを効率的に搬送・昇降します。", de: "Mitgangersteuerung bewegt und hebt Paletten effizient zwischen Wareneingang, Lager und Versand.", pt: "O controle pedestre movimenta e eleva paletes entre recebimento, armazenagem e expedicao.", ko: "보행식 조작으로 입고, 보관 및 출고 구역 사이에서 팔레트를 효율적으로 이동하고 인양합니다.", ar: "تتيح ادوات التحكم بالمشي نقل ورفع الطبالي بكفاءة بين مناطق الاستلام والتخزين والشحن." })
    )
  ]
};

export function getCategoryApplications(categorySlug: string, lang: Lang) {
  return (categoryApplications[categorySlug] ?? []).map((application) => ({
    title: application.title[lang],
    description: application.description[lang]
  }));
}

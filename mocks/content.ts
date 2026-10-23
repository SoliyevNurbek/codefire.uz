/** Hand-written Uzbek content for the mock database. Generated data lives in data.ts. */

export const FIRST_NAMES_M = [
  "Aziz", "Jasur", "Sardor", "Timur", "Bekzod", "Javohir", "Otabek", "Islom", "Doniyor", "Behruz",
  "Abdulloh", "Sherzod", "Asadbek", "Ulug'bek", "Rustam", "Eldor", "Shohruh", "Jahongir", "Mirjalol", "Akmal",
];
export const FIRST_NAMES_F = [
  "Malika", "Dilnoza", "Nodira", "Shahzoda", "Madina", "Sevara", "Kamola", "Gulnoza", "Zarina", "Laylo",
  "Mohira", "Feruza", "Nilufar", "Diyora", "Munisa", "Sabina",
];
export const LAST_NAMES = [
  "Karimov", "Tursunov", "Rahimov", "Yusupov", "Aliyev", "Ismoilov", "Qodirov", "Nazarov", "Sobirov", "Mirzayev",
  "Ergashev", "Xolmatov", "Abdullayev", "Hasanov", "Umarov", "Saidov", "Raximov", "Jo'rayev", "Normatov", "Valiyev",
];

export const REGIONS = [
  "Toshkent", "Samarqand", "Buxoro", "Farg'ona", "Andijon", "Namangan", "Xorazm", "Qashqadaryo",
  "Surxondaryo", "Navoiy", "Jizzax", "Sirdaryo", "Qoraqalpog'iston", "Toshkent viloyati",
];

export const SCHOOLS = [
  "TATU", "INHA University", "Westminster (Toshkent)", "O'zMU", "Samarqand davlat universiteti",
  "Al-Xorazmiy maktabi", "Prezident maktabi (Toshkent)", "Yangi O'zbekiston universiteti", "TDTU",
  "Buxoro davlat universiteti", "Farg'ona davlat universiteti", "Turin politexnika universiteti",
];

export const COUNTRIES: Record<string, string> = {
  UZ: "O'zbekiston",
  KZ: "Qozog'iston",
  KG: "Qirg'iziston",
  TJ: "Tojikiston",
  TM: "Turkmaniston",
  RU: "Rossiya",
  TR: "Turkiya",
  KR: "Janubiy Koreya",
};

export const TAGS = [
  "matematika", "satrlar", "graflar", "DP", "ochko'z", "binar qidiruv", "saralash", "sonlar nazariyasi",
  "geometriya", "ma'lumotlar tuzilmalari", "daraxtlar", "BFS/DFS", "ikki ko'rsatkich", "kombinatorika",
  "bit amallar", "implementatsiya",
];

export const PROBLEM_TITLES = [
  "Juft va toq", "Bozor kuni", "Navro'z sumalagi", "Choyxona navbati", "Registon maydoni", "Ipak yo'li karvoni",
  "Kitob javoni", "Olmalar va noklar", "Avtobus bekati", "Shaxmat taxtasi", "Qo'shni sonlar", "Eng katta bo'luvchi",
  "Tub sonlar", "Labirint", "Daryo ko'prigi", "Qor bo'roni", "Telefon raqamlari", "Sehrli kvadrat",
  "Matnni shifrlash", "Robot yo'li", "Uchburchaklar", "Tangalar", "Poyezd jadvali", "Futbol turniri",
  "Bog'dagi daraxtlar", "Maktab navbatchiligi", "Qavslar ketma-ketligi", "Minoralar", "Anor donalari",
  "Yo'lovchilar", "Sport zali", "Imtihon natijalari", "Do'kon chegirmasi", "Raqamlar o'yini", "Orol va ko'priklar",
  "Kanal suvi", "Quyosh panellari", "Dasturchilar kuni", "Ikkilik satr", "Kubiklar minorasi", "Aylana yo'l",
  "Xazina xaritasi", "Ko'p qavatli uy", "Qulf kodi", "Paxta terimi", "Somsa pishirish", "Chorsu bozori",
  "Amudaryo oqimi", "Lift tugmalari", "Qadimiy tangalar",
];

export interface FeaturedProblem {
  id: string;
  name: string;
  tags: string[];
  difficulty: number;
  legend: string;
  inputSpec: string;
  outputSpec: string;
  notes: string | null;
  examples: { input: string; output: string }[];
  timeLimitMs: number;
  memoryLimitMb: number;
}

export const FEATURED_PROBLEMS: FeaturedProblem[] = [
  {
    id: "37A",
    name: "Ikki son yig'indisi",
    tags: ["matematika", "implementatsiya"],
    difficulty: 800,
    legend:
      "Malika bozordan ikki xil meva sotib oldi: $a$ so'mlik olma va $b$ so'mlik nok. U jami qancha pul sarflaganini bilmoqchi.\n\nIkki butun son $a$ va $b$ berilgan. Ularning yig'indisi $a + b$ ni toping.",
    inputSpec: "Yagona qatorda ikkita butun son $a$ va $b$ berilgan ($-10^9 \\le a, b \\le 10^9$).",
    outputSpec: "Bitta butun son — $a + b$ ni chiqaring.",
    notes: "Javob 32 bitli butun songa sig'maydi: $|a + b|$ $2 \\cdot 10^9$ gacha bo'lishi mumkin. C++ da `long long` ishlating.",
    examples: [
      { input: "3 5", output: "8" },
      { input: "-7 12", output: "5" },
      { input: "1000000000 1000000000", output: "2000000000" },
    ],
    timeLimitMs: 1000,
    memoryLimitMb: 256,
  },
  {
    id: "112B",
    name: "Toshkent metrosi",
    tags: ["graflar", "BFS/DFS"],
    difficulty: 1350,
    legend:
      "Toshkent metrosida $n$ ta bekat va $m$ ta yo'nalish bor. Har bir yo'nalish ikki bekatni ikki tomonlama bog'laydi va bir bekatdan qo'shnisiga yetish aynan bir daqiqa oladi.\n\nJasur $s$ bekatda turibdi va $t$ bekatga imkon qadar tez yetib bormoqchi. Eng kam necha daqiqa kerakligini toping.",
    inputSpec:
      "Birinchi qatorda $n$ va $m$ ($2 \\le n \\le 2 \\cdot 10^5$, $1 \\le m \\le 2 \\cdot 10^5$).\n\nKeyingi $m$ qatorning har birida ikkita son $u_i$ va $v_i$ — bog'langan bekatlar ($1 \\le u_i, v_i \\le n$, $u_i \\ne v_i$).\n\nOxirgi qatorda $s$ va $t$.",
    outputSpec: "Eng kam daqiqalar sonini chiqaring. Agar $t$ ga yetib bo'lmasa, $-1$ chiqaring.",
    notes: null,
    examples: [
      { input: "5 5\n1 2\n2 3\n3 4\n4 5\n1 3\n1 5", output: "3" },
      { input: "4 2\n1 2\n3 4\n1 4", output: "-1" },
    ],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
  },
  {
    id: "208C",
    name: "Eng uzun palindrom",
    tags: ["satrlar", "DP"],
    difficulty: 1600,
    legend:
      "Satr palindrom deyiladi, agar u chapdan o'ngga va o'ngdan chapga bir xil o'qilsa. Masalan, `kiyik` va `abba` palindrom, `codefire` esa yo'q.\n\nUzunligi $n$ bo'lgan $s$ satr berilgan. Uning eng uzun palindrom qism satrini toping. Qism satr — ketma-ket keluvchi belgilar: $s_l s_{l+1} \\ldots s_r$.",
    inputSpec: "Yagona qatorda kichik lotin harflaridan iborat $s$ satr ($1 \\le |s| \\le 10^6$).",
    outputSpec:
      "Eng uzun palindrom qism satrning uzunligini chiqaring. $O(n^2)$ yechim to'liq balni olmaydi — Manacher algoritmi yoki xeshlashni ko'rib chiqing.",
    notes: null,
    examples: [
      { input: "babad", output: "3" },
      { input: "codefire", output: "1" },
      { input: "qazaqistonnotsiqazaq", output: "7" },
    ],
    timeLimitMs: 1000,
    memoryLimitMb: 256,
  },
  {
    id: "315D",
    name: "Paxta dalasi",
    tags: ["geometriya", "saralash"],
    difficulty: 1900,
    legend:
      "Fermer $n$ ta qoziq bilan paxta dalasini o'rab olmoqchi. Qoziqlar tekislikda $(x_i, y_i)$ nuqtalarda turibdi. Dalani o'rash uchun eng qisqa to'siq — qoziqlarning qavariq qobig'i perimetri.\n\nTo'siq uzunligini toping.",
    inputSpec: "Birinchi qatorda $n$ ($3 \\le n \\le 10^5$). Keyingi $n$ qatorda $x_i, y_i$ ($|x_i|, |y_i| \\le 10^9$).",
    outputSpec: "Perimetrni $10^{-6}$ aniqlikda chiqaring.",
    notes: null,
    examples: [{ input: "4\n0 0\n4 0\n4 3\n0 3", output: "14.000000" }],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
  },
  {
    id: "421E",
    name: "Segment daraxti",
    tags: ["ma'lumotlar tuzilmalari", "daraxtlar"],
    difficulty: 2200,
    legend:
      "$n$ ta sondan iborat $a$ massiv va $q$ ta so'rov berilgan. So'rovlar ikki turda:\n\n- `1 l r x` — $a_l, \\ldots, a_r$ ga $x$ qo'shing;\n- `2 l r` — $\\max(a_l, \\ldots, a_r)$ ni chiqaring.",
    inputSpec: "Birinchi qatorda $n$ va $q$ ($1 \\le n, q \\le 2 \\cdot 10^5$). Ikkinchi qatorda $a_i$ ($|a_i| \\le 10^9$). Keyin $q$ ta so'rov.",
    outputSpec: "Har bir ikkinchi turdagi so'rov uchun javobni alohida qatorda chiqaring.",
    notes: null,
    examples: [{ input: "5 4\n1 3 2 5 4\n2 1 3\n1 2 4 3\n2 1 3\n2 4 5", output: "3\n6\n8" }],
    timeLimitMs: 2000,
    memoryLimitMb: 256,
  },
  {
    id: "500F",
    name: "Samarqand yo'llari",
    tags: ["graflar", "kombinatorika"],
    difficulty: 2650,
    legend:
      "Samarqandda $n$ ta chorraha va $m$ ta yo'l bor. Har bir yo'lning uzunligi $w_i$. Registondan ($1$-chorraha) Shohi Zindaga ($n$-chorraha) boruvchi eng qisqa yo'llar sonini $10^9 + 7$ ga bo'lgandagi qoldiqni toping.",
    inputSpec: "Birinchi qatorda $n, m$ ($2 \\le n \\le 10^5$, $1 \\le m \\le 3 \\cdot 10^5$). Keyin $m$ qatorda $u_i, v_i, w_i$ ($1 \\le w_i \\le 10^9$).",
    outputSpec: "Eng qisqa yo'llar sonini $10^9 + 7$ modul bo'yicha chiqaring.",
    notes: null,
    examples: [{ input: "4 4\n1 2 1\n2 4 1\n1 3 1\n3 4 1", output: "2" }],
    timeLimitMs: 3000,
    memoryLimitMb: 512,
  },
];

export const LANGUAGES = [
  {
    id: "cpp17",
    name: "GNU C++17",
    monaco: "cpp",
    template: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    \n    return 0;\n}\n",
  },
  {
    id: "cpp20",
    name: "GNU C++20",
    monaco: "cpp",
    template: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    \n    return 0;\n}\n",
  },
  { id: "python3", name: "Python 3.12", monaco: "python", template: "import sys\ninput = sys.stdin.readline\n\n\ndef main():\n    pass\n\n\nmain()\n" },
  { id: "pypy3", name: "PyPy 3.10", monaco: "python", template: "import sys\ninput = sys.stdin.readline\n\n\ndef main():\n    pass\n\n\nmain()\n" },
  {
    id: "java21",
    name: "Java 21",
    monaco: "java",
    template: "import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        \n    }\n}\n",
  },
  { id: "kotlin", name: "Kotlin 2.0", monaco: "kotlin", template: "fun main() {\n    \n}\n" },
  { id: "go", name: "Go 1.23", monaco: "go", template: "package main\n\nimport (\n\t\"bufio\"\n\t\"fmt\"\n\t\"os\"\n)\n\nfunc main() {\n\treader := bufio.NewReader(os.Stdin)\n\t_ = reader\n\tfmt.Println()\n}\n" },
  { id: "rust", name: "Rust 1.82", monaco: "rust", template: "use std::io::{self, Read};\n\nfn main() {\n    let mut input = String::new();\n    io::stdin().read_to_string(&mut input).unwrap();\n    \n}\n" },
  { id: "csharp", name: "C# 12", monaco: "csharp", template: "using System;\n\nclass Program {\n    static void Main() {\n        \n    }\n}\n" },
  { id: "nodejs", name: "Node.js 22", monaco: "javascript", template: "const lines = require(\"fs\").readFileSync(0, \"utf8\").trim().split(\"\\n\");\n\n" },
  { id: "pascal", name: "Free Pascal 3.2", monaco: "pascal", template: "program Solution;\nvar\n  \nbegin\n  \nend.\n" },
];

export const CLANS = [
  { slug: "tatu-algo", name: "TATU Algo", motto: "Har kuni bitta masala, har hafta bitta raund", region: "Toshkent" },
  { slug: "samarqand-sherlari", name: "Samarqand Sherlari", motto: "Registondan reytinggacha", region: "Samarqand" },
  { slug: "al-xorazmiy-avlodi", name: "Al-Xorazmiy avlodi", motto: "Algoritm so'zi bizdan chiqqan", region: "Xorazm" },
  { slug: "inha-coders", name: "INHA Coders", motto: "Sinov, xato, qabul", region: "Toshkent" },
  { slug: "vodiy", name: "Farg'ona Vodiysi", motto: "Vodiy bolalari ICPC finalida", region: "Farg'ona" },
  { slug: "buxoro-bytes", name: "Buxoro Bytes", motto: "Qadimiy shahar, zamonaviy kod", region: "Buxoro" },
  { slug: "registon", name: "Registon", motto: "Uch madrasa — uch masala", region: "Samarqand" },
  { slug: "navoiy-tungi", name: "Navoiy tungi qushlari", motto: "Raund tunda bo'lsa ham qatnashamiz", region: "Navoiy" },
];

export const COURSES = [
  {
    slug: "algoritmlarga-kirish",
    title: "Algoritmlarga kirish",
    description: "Murakkablik, saralash, binar qidiruv va prefiks yig'indilar. Birinchi raundga tayyorgarlik uchun.",
    level: "beginner" as const,
    hours: 18,
    modules: [
      { title: "Asoslar", lessons: ["Kirish va chiqarish", "Murakkablik va Big-O", "Massivlar bilan ishlash"] },
      { title: "Saralash va qidirish", lessons: ["Saralash algoritmlari", "Binar qidiruv", "Javob bo'yicha binar qidiruv"] },
      { title: "Texnikalar", lessons: ["Prefiks yig'indilar", "Ikki ko'rsatkich", "Ochko'z algoritmlar"] },
    ],
  },
  {
    slug: "cpp-olimpiada",
    title: "C++ dan olimpiadagacha",
    description: "STL, tez kiritish, tipik xatolar. Python yoki Pascaldan o'tayotganlar uchun.",
    level: "beginner" as const,
    hours: 12,
    modules: [
      { title: "Til asoslari", lessons: ["Tiplar va to'lib ketish", "Funksiyalar va havolalar", "Tez kiritish-chiqarish"] },
      { title: "STL", lessons: ["vector va string", "set va map", "priority_queue", "Algoritmlar kutubxonasi"] },
    ],
  },
  {
    slug: "graflar",
    title: "Graflar nazariyasi",
    description: "BFS, DFS, eng qisqa yo'llar, minimal ostov daraxt va topologik saralash.",
    level: "intermediate" as const,
    hours: 24,
    modules: [
      { title: "Aylanib chiqish", lessons: ["Graflarni saqlash", "BFS", "DFS va komponentalar"] },
      { title: "Eng qisqa yo'llar", lessons: ["Dijkstra algoritmi", "Bellman–Ford", "Floyd–Warshall"] },
      { title: "Daraxtlar", lessons: ["Minimal ostov daraxt", "LCA", "Topologik saralash"] },
    ],
  },
  {
    slug: "dinamik-dasturlash",
    title: "Dinamik dasturlash",
    description: "Holat, o'tish va baza. Klassik masalalardan bitmask va daraxtdagi DP gacha.",
    level: "intermediate" as const,
    hours: 30,
    modules: [
      { title: "Boshlang'ich DP", lessons: ["Holat va o'tish", "Ryukzak masalasi", "Eng uzun o'suvchi ketma-ketlik"] },
      { title: "Ikki o'lchovli DP", lessons: ["Satrlarda DP", "Oraliq DP", "To'rda yo'llar"] },
      { title: "Ilg'or", lessons: ["Bitmask DP", "Daraxtdagi DP", "Raqamli DP"] },
    ],
  },
  {
    slug: "malumotlar-tuzilmalari",
    title: "Ma'lumotlar tuzilmalari",
    description: "Segment daraxti, Fenwick, DSU, sparse table — qachon qaysi biri kerak.",
    level: "intermediate" as const,
    hours: 22,
    modules: [
      { title: "Oraliq so'rovlar", lessons: ["Sparse table", "Fenwick daraxti", "Segment daraxti"] },
      { title: "Kengaytmalar", lessons: ["Lazy propagation", "DSU", "Persistent tuzilmalar"] },
    ],
  },
  {
    slug: "olimpiada-geometriyasi",
    title: "Olimpiada geometriyasi",
    description: "Vektorlar, qavariq qobiq, kesishmalar va aniqlik muammolari.",
    level: "advanced" as const,
    hours: 16,
    modules: [
      { title: "Vektorlar", lessons: ["Skalyar va vektor ko'paytma", "Nuqta va to'g'ri chiziq", "Aniqlik va epsilon"] },
      { title: "Algoritmlar", lessons: ["Qavariq qobiq", "Aylanuvchi kalibrlar", "Ko'pburchak yuzi"] },
    ],
  },
];

export const BLOG_POSTS = [
  {
    slug: "round-147-tahlili",
    title: "Codefire Round #147 tahlili",
    tags: ["tahlil", "raund"],
    excerpt: "Barcha olti masalaning yechimlari, muallif kodlari va eng ko'p uchragan xatolar.",
    content: `Raundda **1 184** ishtirokchi qatnashdi. Rahmat hammaga! Quyida masalalar tahlili.

## A. Juft va toq

Massivdagi juft va toq sonlar sonini sanaymiz. Javob — ularning ayirmasi moduli. Murakkablik $O(n)$.

\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n; cin >> n;
    int even = 0;
    for (int i = 0; i < n; i++) {
        int x; cin >> x;
        if (x % 2 == 0) even++;
    }
    cout << abs(2 * even - n) << "\\n";
}
\`\`\`

## B. Bozor kuni

Ochko'z yondashuv ishlaydi: narxlarni saralab, eng arzonidan boshlab olamiz. Ko'pchilik \`int\` to'lib ketishiga tushdi — yig'indi $10^{14}$ gacha yetadi.

## C. Navro'z sumalagi

Javob bo'yicha binar qidiruv. Agar $k$ soatda tayyorlash mumkin bo'lsa, $k+1$ soatda ham mumkin — demak predikat monoton.

$$f(k) = \\sum_{i=1}^{n} \\left\\lfloor \\frac{k}{t_i} \\right\\rfloor \\ge m$$

## Statistika

| Masala | Yechganlar | Birinchi yechim |
|---|---|---|
| A | 1 102 | 0:01 |
| B | 870 | 0:04 |
| C | 412 | 0:11 |
| D | 96 | 0:38 |
`,
  },
  {
    slug: "dijkstra-xatolari",
    title: "Dijkstrada 5 ta keng tarqalgan xato",
    tags: ["graflar", "o'quv"],
    excerpt: "Eskirgan juftliklarni o'tkazib yubormaslik, to'lib ketish va manfiy qirralar haqida.",
    content: `Dijkstra — eng ko'p yoziladigan algoritmlardan biri, lekin unda xato qilish oson.

## 1. Eskirgan juftliklar

Navbatdan olingan juftlik eskirgan bo'lishi mumkin. Uni tekshirmasangiz, murakkablik $O(m \\log m)$ dan oshib ketadi.

\`\`\`cpp
while (!pq.empty()) {
    auto [d, v] = pq.top(); pq.pop();
    if (d != dist[v]) continue; // muhim qator
    for (auto [to, w] : g[v]) {
        if (dist[v] + w < dist[to]) {
            dist[to] = dist[v] + w;
            pq.push({dist[to], to});
        }
    }
}
\`\`\`

## 2. To'lib ketish

Masofalar $10^9 \\cdot 10^5$ gacha bo'lsa, \`long long\` va \`INF = 4e18\` ishlating.

## 3. Manfiy qirralar

Dijkstra manfiy qirralar bilan ishlamaydi. Bunday holda Bellman–Ford yoki SPFA kerak.
`,
  },
  {
    slug: "pythonda-tez-kiritish",
    title: "Pythonda tez kiritish: TLE dan qochish",
    tags: ["python", "maslahat"],
    excerpt: "sys.stdin, readline va PyPy — qaysi biri qachon yordam beradi.",
    content: `Python bilan TLE olishning eng ko'p sababi — sekin kiritish.

\`\`\`python
import sys
input = sys.stdin.readline

n = int(input())
a = list(map(int, input().split()))
print(sum(a))
\`\`\`

Juda katta kiritish uchun hammasini birdaniga o'qing:

\`\`\`python
data = sys.stdin.buffer.read().split()
\`\`\`

Rekursiya chuqur bo'lsa, \`sys.setrecursionlimit\` yetarli emas — iterativ DFS yozing.
`,
  },
  {
    slug: "ioi-2026-tajribasi",
    title: "IOI 2026: jamoamiz tajribasi",
    tags: ["olimpiada", "tajriba"],
    excerpt: "O'zbekiston terma jamoasi qanday tayyorlangani va musobaqadan saboqlar.",
    content: `Bu yil jamoamiz ikkita kumush va bitta bronza medal oldi.

## Tayyorgarlik

Har kuni bitta virtual raund va tahlil. Haftasiga bir marta — to'liq 5 soatlik sinov.

## Saboqlar

- Birinchi soatda barcha masalalarni o'qib chiqing.
- Qisman ballarni e'tiborsiz qoldirmang: IOI formatida ular hal qiluvchi.
- Stress-test uchun oddiy yechim yozib qo'ying.
`,
  },
  {
    slug: "reyting-tizimi",
    title: "Codefire reyting tizimi qanday ishlaydi",
    tags: ["platforma"],
    excerpt: "Elo asosidagi hisoblash, Spark dan Phoenix gacha darajalar va yangi ishtirokchilar uchun qoidalar.",
    content: `Reyting har bir reytingli raunddan keyin qayta hisoblanadi.

## Darajalar

| Daraja | Reyting |
|---|---|
| Spark | 0–1199 |
| Ember | 1200–1399 |
| Flame | 1400–1699 |
| Blaze | 1700–1999 |
| Inferno | 2000–2399 |
| Phoenix | 2400+ |

Kutilgan o'rin quyidagicha hisoblanadi:

$$E_i = 1 + \\sum_{j \\ne i} \\frac{1}{1 + 10^{(r_i - r_j)/400}}$$

Birinchi oltita raundda o'zgarishlar kattaroq bo'ladi — shunda yangi ishtirokchi tezroq o'z darajasiga yetadi.
`,
  },
  {
    slug: "maktab-olimpiadasi-2027",
    title: "Maktab o'quvchilari olimpiadasi — ro'yxatdan o'tish ochildi",
    tags: ["e'lon", "olimpiada"],
    excerpt: "Saralash bosqichi Codefire'da IOI formatida o'tadi. Qatnashish bepul.",
    content: `Respublika maktab o'quvchilari olimpiadasining saralash bosqichi **Codefire** platformasida o'tkaziladi.

- Format: IOI, qisman ballar bilan
- Davomiylik: 4 soat
- Tillar: C++, Python, Pascal, Java

Ro'yxatdan o'tish uchun Musobaqalar sahifasiga o'ting.
`,
  },
];

export const ACHIEVEMENTS = [
  { id: "first-ac", title: "Birinchi uchqun", description: "Birinchi masalani yechdingiz" },
  { id: "streak-30", title: "O'chmas olov", description: "30 kun ketma-ket masala yechdingiz" },
  { id: "solved-100", title: "Yuzlik", description: "100 ta masala yechildi" },
  { id: "first-blood", title: "Birinchi qon", description: "Raundda masalani birinchi bo'lib yechdingiz" },
  { id: "polyglot", title: "Poliglot", description: "5 xil tilda yechim yubordingiz" },
  { id: "rated-10", title: "Faxriy ishtirokchi", description: "10 ta reytingli raundda qatnashdingiz" },
];

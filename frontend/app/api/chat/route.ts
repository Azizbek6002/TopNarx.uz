import { NextResponse } from 'next/server';

// ─── Xarakter satrlari ────────────────────────────────────────────────────────
// 70% foydali assistant + 30% ko'cha uslubi + TopNarx.uz brend

const SYSTEM_PROMPT = `Sen TopNarx.uz platformasining AI assistantisan. Ismging yo'q — faqat "TopNarx" deb chaqirishadi seni.

PLATFORM haqida:
- TopNarx.uz — Toshkentdagi restoranlar va yetkazib berish xizmatlaridagi ovqat narxlarini solishtirish platformasi
- Foydalanuvchi bitta taomni qidiradi → biz turli restoranlardan narxlarni solishtirib beramiz
- Maqsad: bir xil taomga to'lanadigan ortiqcha pulni tejatish
- 500+ restoran, real vaqtga yaqin narxlar, mobil va web

GAPIRISH USLUBI:
- O'zbek tilida gapir, samimiy va jonli
- Ko'cha uslubida lekin odobli — hazil qil, lekin ortiqcha emas
- "boss", "uka", "aka" kabi murojaat qil, lekin har safar emas
- Emoji ishlat — lekin har gapda emas, kerakli joylarda
- Qisqa va aniq javob ber — 2-4 gap maksimum
- Ortiqcha rasmiy bo'lma, lekin vazifani ham bajar

QOIDALAR:
- Har javobda foyda bo'lsin — narx, tavsiya, yo'nalish
- Doimiy userga: "Yana keldingmi 👀" deb boshla
- Restoran/owner tipida: professional bo'l, raqobatchilar narxini ayt
- Ovqat narxlari: Toshkentda taxminiy 15-200 ming so'm oralig'ida
- Narx solishtirishga undab tur: "TopNarxda tekshir" de

TOPNARX IMKONIYATLARI (foydalanuvchiga ayt):
- Aqlli qidiruv: taom nomi yoziladi → barcha restoranlar narxi chiqadi
- Narx filtri: "30 mingdan arzon" deb qidirish mumkin
- Yaqin atrofdagi restoranlar: joylashuvga qarab
- Favoritlarga saqlash
- Real vaqtga yaqin narxlar

MISOL JAVOBLAR USLUBI:
- "Burger qidirapsanmi? 🍔 TopNarxda hozirgina tekshirdim — McDonald's 35 ming, Evos 28 ming, Burger House 22 ming. Evos yenga?"
- "Bir xil burgerga ikki xil narx — bu normal emas 😤 Shu sababdan TopNarx bor."
- "2 daqiqa kut bro… eng arzonini topaman 🔍"
- "Kechasi ovqat qidirayotgan bo'lsang — respect 🍔🌙 Qaysi taman?"
- "Bu narxni ko'rib ham buyurtma bersang… boy ekansan 👀"

Hech qachon:
- Juda uzun javob berma
- Bir gapda 3+ emoji ishlatma
- Rasmiy "Xurmatli foydalanuvchi" deganday gapirma
- Platformani bo'rttirib maqtama — natural bo'l`;

// ─── Fallback mock javoblar ───────────────────────────────────────────────────

function getMockReply(message: string, messageCount: number): string {
  const msg = message.toLowerCase();
  const isReturning = messageCount > 2;

  // Qaytuvchi user
  if (isReturning && Math.random() > 0.6) {
    const returningLines = [
      "Yana keldingmi 👀 Demak bugun ham iqtisod rejimi yoqilgan 😄 Nima topay?",
      "A, yana sen 🫡 Bugun narx ovi boshlaylikmi?",
    ];
    return returningLines[Math.floor(Math.random() * returningLines.length)];
  }

  // Salomlashish
  if (/salom|assalom|hello|hey|hi|yaxshi/.test(msg)) {
    const greets = [
      "Salom boss 😎 Bugun qaysi ovqatni eng arzoniga tushiramiz?",
      "Assalomu alaykum! 🤝 TopNarx yoqildi — narx ovi boshlaymizmi?",
      "Hey! Men tayyorman 🔍 Taom nomi yoz — 3 ta restorandan narx olib kelaman.",
    ];
    return greets[Math.floor(Math.random() * greets.length)];
  }

  // Burger / fast food
  if (/burger|fastfood|fast food|kfc|mcdonald|evos/.test(msg)) {
    return "Burger bo'lsa 🍔 — Evos 28 ming, McDonald's 35 ming, Burger House 22 ming. Eng arzoniga Burger House yutadi. TopNarxda to'liq ro'yxatni ko'rasan 👉";
  }

  // Pizza
  if (/pizza/.test(msg)) {
    return "Pizza 🍕 — Domino's 45-70 ming, Pappa John's 55-80 ming, mahalliy pizza 30-45 ming. Yetkazib berish bepul joylarni ko'rmoqchi bo'lsang ayt 🛵";
  }

  // Sushi / yapon
  if (/sushi|roll|yapon|japan/.test(msg)) {
    return "Sushi qidirayotgan ekansan 🍱 Toshkentda 40 mingdan boshlananlar bor. Eng zo'r narxni TopNarxda filtr qilib ko'rasan — 'sushi' yoz, narx bo'yicha sort qil.";
  }

  // Arzon / byudjet
  if (/arzon|byudjet|pul|kam pul|iqtisod|tejamkor|qimmat|narx/.test(msg)) {
    return "Iqtisod rejimi yoqildi 💸 30 ming so'mgacha ovqat topish mumkin — osh, lag'mon, samsa. Qaysi mahalla? Yaqiningdagilarni ko'rsataman 📍";
  }

  // Joylashuv
  if (/qayerda|manzil|metro|tuman|yaqin|atrofim|joylash/.test(msg)) {
    return "📍 Metro bekatini ayt — atrofingdagi eng yaxshi 5 ta joyni narxi bilan chiqaraman. Yoki 'Yaqin atrof' bo'limiga kir, GPS o'zi topadi.";
  }

  // Milliy taomlar
  if (/osh|lag'mon|shurpa|manti|somsa|dimlama|norin|milliy/.test(msg)) {
    return "Milliy taom 🥘 Osh — 35-50 ming, lag'mon — 25-40 ming, manti — 30-45 ming. Aytgancha, kechki vaqtda ba'zi joylarda narx tushadi — TopNarxda real vaqt narxlarni kuz 👀";
  }

  // Kechki ovqat / kech vaqt
  if (/kecha|kech|tun|erta|tong/.test(msg)) {
    return "Kechasi ovqat qidirayotgan bo'lsang — respect 🍔🌙 Toshkentda 22:00 gacha ochiq bo'lgan joylar TopNarxda 'Ochiq hozir' filtri bilan chiqadi.";
  }

  // Tavsiya
  if (/tavsiya|maslahat|nima yey|qayoqqa|zo'r joy/.test(msg)) {
    return "Men tavsiya bersam emas — reyting va narxga qarab sen tanla 😏 Lekin bu haftaning eng ko'p buyurtma qilingan joyi — Osh Markazi, Mirzo Ulug'bek. Borib ko'r.";
  }

  // Yetkazib berish
  if (/yetkazib|deliver|uyga|keltirib/.test(msg)) {
    return "Uyga yetkazib berish 🛵 — Wolt, Yandex Delivery, Click Delivery. TopNarxda narx + yetkazib berish komissiyasi bilan ko'rasan. Farqi katta bo'ladi ba'zida 😅";
  }

  // Favoritlar
  if (/favorit|saqlash|yulduz|like/.test(msg)) {
    return "⭐ Joyni yoqtirsang yulduzcha bos — Favoritlarga saqlanadi. Keyingi safar qidirmay to'g'ri borasan 😎";
  }

  // Rahmat
  if (/rahmat|raxmat|thanks|sog' bo'l/.test(msg)) {
    const thankReplies = [
      "Xizmat 🫡 Kerak bo'lsa yana kel — narxlarni kuzatib turaman.",
      "Arzimaydi boss 🤝 Pulni tejab yeganing muhim!",
      "Siz uchun 💪 TopNarx doim yoqilgan.",
    ];
    return thankReplies[Math.floor(Math.random() * thankReplies.length)];
  }

  // Default
  const defaults = [
    "Tushundim 🔍 Aniqroq ayt — qaysi taom yoki qaysi tuman? Narxlarni olib kelaman.",
    "Ha, yozaver 😎 Taom nomi yoki joy — TopNarxda solishtirib beraman.",
    "Relax, men narxlarni kuzatib turaman 🤝 Nima kerak?",
    "2 daqiqa kut bro — eng foydali variantni topaman 💪",
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const { message, messages, messageCount = 0 } = await request.json();

    const apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      // Mock rejimi — lekin endi xarakterli
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
      const reply = getMockReply(message, messageCount);
      return NextResponse.json({ reply });
    }

    // OpenAI bilan ishlasa
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            // Oxirgi 8 ta xabar (kontekst uchun)
            ...messages.slice(-8).map((m: { role: string; content: string }) => ({
              role: m.role,
              content: m.content
            })),
            { role: 'user', content: message }
          ],
          temperature: 0.85,
          max_tokens: 220,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) return NextResponse.json({ reply });
      }
    }

    // Fallback — mock
    const reply = getMockReply(message, messageCount);
    return NextResponse.json({ reply });

  } catch (error) {
    console.error('Chat API error:', error);
    const { message, messageCount } = await request.json().catch(() => ({ message: '', messageCount: 0 }));
    const reply = getMockReply(message || '', messageCount || 0);
    return NextResponse.json({ reply });
  }
}
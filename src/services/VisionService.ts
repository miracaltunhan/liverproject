const GEMINI_API_KEY = 'AIzaSyCqWsPcSZMuC9SE84CuRjfg9VkVrhKNF-g';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export interface BottleAnalysis {
  nesne_bulundu: boolean;
  nesne_tipi?: string;
  marka_tahmini?: string;
  kapasite_ml?: number;
  mevcut_ml?: number;
  doluluk_yuzde?: number;
  guven_skoru?: number;
  aciklama?: string;
  hata?: string;
}

const SYSTEM_PROMPT = `Sen bir medikal görüntü analiz asistanısın. Karaciğer ameliyatı öncesi hidrasyon takip uygulaması için su şişelerini analiz ediyorsun.

KURALLAR:
- Sadece ve sadece geçerli JSON döndür
- Hiçbir açıklama, markdown, kod bloğu yazma
- Şişe görünmüyorsa hata kodu döndür
- Tahminlerde temkinli ol, abartma`;

const USER_PROMPT = `Bu fotoğrafı analiz et.

Eğer fotoğrafta su/içecek şişesi varsa:
- Şişenin toplam kapasitesini tahmin et (şekline ve standart boyutlara göre)
- Su seviyesini gör (şeffaf şişelerde su çizgisi, mat şişelerde doluluk hissi)
- Renk, etiket ve şekle bakarak marka/tip tahmin et

Döndüreceğin JSON:
{
  "nesne_bulundu": true,
  "nesne_tipi": "su şişesi",
  "marka_tahmini": "Erikli 500ml",
  "kapasite_ml": 500,
  "mevcut_ml": 350,
  "doluluk_yuzde": 70,
  "guven_skoru": 0.85,
  "aciklama": "Şeffaf plastik şişe, su çizgisi yaklaşık 2/3 seviyesinde"
}

Eğer şişe yoksa:
{
  "nesne_bulundu": false,
  "hata": "Fotoğrafta su şişesi tespit edilemedi"
}`;

const FALLBACK: BottleAnalysis = {
  nesne_bulundu: false,
  hata: 'Analiz sırasında hata oluştu.',
};

export async function analyzeBottleImage(
  base64Image: string,
): Promise<BottleAnalysis> {
  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        systemInstruction: {parts: [{text: SYSTEM_PROMPT}]},
        contents: [
          {
            parts: [
              {inlineData: {mimeType: 'image/jpeg', data: base64Image}},
              {text: USER_PROMPT},
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 512,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[VisionService] API error:', res.status, errText);
      return {...FALLBACK, hata: `API hatası: ${res.status}`};
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return {...FALLBACK, hata: 'API boş yanıt döndürdü.'};

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return {...FALLBACK, hata: 'JSON parse hatası.'};

    return JSON.parse(jsonMatch[0]) as BottleAnalysis;
  } catch (err) {
    console.error('[VisionService] Error:', err);
    return FALLBACK;
  }
}

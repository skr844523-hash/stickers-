
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "الطلب غير مسموح." });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return res.status(503).json({
      error: "أضف TELEGRAM_BOT_TOKEN في إعدادات Vercel."
    });
  }

  const { name, file_id } = req.query || {};

  try {
    if (file_id) {
      const infoResponse = await fetch(
        `https://api.telegram.org/bot${token}/getFile?file_id=${encodeURIComponent(file_id)}`
      );

      const info = await infoResponse.json();

      if (!info.ok || !info.result?.file_path) {
        return res.status(502).json({
          error: "تعذر الحصول على ملف الملصق."
        });
      }

      const fileResponse = await fetch(
        `https://api.telegram.org/file/bot${token}/${info.result.file_path}`
      );

      if (!fileResponse.ok) {
        return res.status(502).json({
          error: "تعذر تنزيل الملصق."
        });
      }

      const bytes = Buffer.from(await fileResponse.arrayBuffer());

      res.setHeader(
        "Content-Type",
        fileResponse.headers.get("content-type") || "image/webp"
      );
      res.setHeader("Cache-Control", "private, max-age=300");

      return res.status(200).send(bytes);
    }

    if (!name || !/^[A-Za-z0-9_]{1,64}$/.test(name)) {
      return res.status(400).json({
        error: "اسم حزمة تيليجرام غير صحيح."
      });
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/getStickerSet?name=${encodeURIComponent(name)}`
    );

    const data = await response.json();

    if (!data.ok) {
      return res.status(404).json({
        error: "لم يتم العثور على الحزمة. تأكد أن الرابط عام وصحيح."
      });
    }

    const stickers = (data.result.stickers || [])
      .filter(sticker => !sticker.is_animated && !sticker.is_video)
      .slice(0, 120)
      .map(sticker => ({
        file_id: sticker.file_id,
        emoji: sticker.emoji || "🙂",
        url: `/api/telegram?file_id=${encodeURIComponent(sticker.file_id)}`
      }));

    return res.status(200).json({
      title: data.result.title || name,
      stickers
    });
  } catch {
    return res.status(500).json({
      error: "حدث خطأ أثناء الاتصال بتيليجرام."
    });
  }
}

# Sticker ZIP Pro (PWA)

- Export selected images as a regular `.zip`.
- Export selected images as `.wastickers`, the archive format commonly imported by Sticker Maker. It contains `title.txt`, `author.txt`, sticker images and `cover.png`.
- Static public Telegram sticker packs can be imported using a Vercel serverless function and Telegram Bot API.

## Deploy
1. Upload the contents to a GitHub repository.
2. Import the repository into Vercel.
3. In Vercel > Project Settings > Environment Variables, add `TELEGRAM_BOT_TOKEN` with a Telegram bot token. Keep this secret; never put it in frontend files.
4. Redeploy after adding the variable.
5. Use HTTPS and open the app on Android to install the PWA.

## Limitations
- Telegram import requires a backend token. The browser-only PWA cannot securely call Telegram's Bot API on its own.
- This endpoint imports static stickers only; animated/video stickers are skipped. Telegram's Bot API must be able to access the named public set.
- The `.wastickers` format is a ZIP archive with metadata and sticker files. Sticker Maker's behavior may vary by app version/device; use Android's Share/Open with if tapping the file does not offer it.
- Link import is for public packs and direct image URLs only. Respect creators' rights and do not redistribute packs without permission.

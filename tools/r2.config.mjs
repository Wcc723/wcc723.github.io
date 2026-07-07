// R2 非機密設定(可進版控)。
// 金鑰不放這裡:
//   - 用 wrangler OAuth(wrangler login)上傳 → 完全不需金鑰、不需 .env。
//   - 用 aws-sdk(S3 API token)上傳 → 金鑰放 .env(見 .env.example)。
// env 變數(R2_BUCKET / R2_PUBLIC_BASE)若有設定,優先於此檔。
export const bucket = 'casper-blog-images';
export const publicBase = 'https://img.casper.tw';

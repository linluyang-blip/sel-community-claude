// basePath 必須與 GitHub repo 名稱一致，next.config.ts 也使用這個值。
export const basePath = "/sel-community-claude";
export const siteUrl = `https://linluyang-blip.github.io${basePath}`;

// next/image 與一般 <img> 不會自動補上 basePath。
export const asset = (path: string) => `${basePath}${path}`;

import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), "utf8")
const exists = (file) => fs.existsSync(path.join(root, file))
const fail = (message) => {
  throw new Error(message)
}

const html = read("sobre.html")
const css = read("assets/css/site.css")
const bundle = read("assets/css/home.bundle.css")
const responsive = read("assets/css/responsive.css")
const sw = read("sw.js")

const expectedSections = [
  "hero-sobre",
  "criterio",
  "origem",
  "metodo",
  "linha-editorial",
  "ecossistema",
  "proxima-obra",
]

let lastIndex = -1
for (const id of expectedSections) {
  const index = html.indexOf(`id="${id}"`)
  if (index === -1) {
    fail(`Missing required about page section: ${id}`)
  }
  if (index <= lastIndex) {
    fail(`Section ${id} is out of narrative order`)
  }
  lastIndex = index
}

const forbidden = ["page-simple-header", "timeline-container", "timeline-item"]
for (const token of forbidden) {
  if (html.includes(token)) {
    fail(`Legacy institutional layout should not return: ${token}`)
  }
}

const requiredCopy = [
  "Obras que permanecem",
  "Publicar e escolher",
  "Conglomerado QRZ",
  "desde 1995",
  "ideias que precisam permanecer",
  "Iniciar conversa",
]

const normalizedHtml = html
  .normalize("NFD")
  .replace(/\p{Diacritic}/gu, "")

for (const text of requiredCopy) {
  const normalizedText = text.normalize("NFD").replace(/\p{Diacritic}/gu, "")
  if (!normalizedHtml.includes(normalizedText)) {
    fail(`Required narrative copy not found: ${text}`)
  }
}

const forbiddenTextMarks = ["\u2014", "\u2013", "\uFFFD"]
for (const mark of forbiddenTextMarks) {
  if (html.includes(mark)) {
    fail("sobre.html contains a forbidden text mark or replacement character")
  }
}

for (const file of ["sobre.html", "assets/css/site.css", "assets/css/responsive.css"]) {
  const contents = read(file)
  if (/\u00c3[\u0080-\u00bf]|\u00c2[\u0080-\u00bf]/u.test(contents)) {
    fail(`Possible mojibake found in ${file}`)
  }
}

const assetRefs = [...html.matchAll(/(?:src|href)="([^"#?]+)(?:\?[^"]*)?"/g)]
  .map((match) => match[1])
  .filter((ref) => ref.startsWith("assets/") || ref === "manifest.json")

for (const ref of assetRefs) {
  if (!exists(ref)) {
    fail(`Missing referenced asset: ${ref}`)
  }
}

const cssVersion = html.match(/home\.bundle\.css\?v=([0-9.]+)/)?.[1]
const jsVersion = html.match(/js\.global\.js\?v=([0-9.]+)/)?.[1]
const swVersion = sw.match(/CACHE_VERSION = 'v([0-9.]+)'/)?.[1]

if (!cssVersion || cssVersion !== jsVersion || cssVersion !== swVersion) {
  fail("Cache versions must match between sobre.html and sw.js")
}

for (const selector of [".about-origin", ".about-origin__grid", ".about-proof", ".about-ecosystem__facts", ".about-cta__panel"]) {
  if (!css.includes(selector)) {
    fail(`Missing desktop CSS selector: ${selector}`)
  }
  if (!bundle.includes(selector)) {
    fail(`Missing bundled CSS selector served by sobre.html: ${selector}`)
  }
}

for (const selector of [".about-origin__grid", ".about-proof"]) {
  if (!responsive.includes(selector)) {
    fail(`Missing responsive CSS selector: ${selector}`)
  }
}

console.log("sobre.html QA passed")

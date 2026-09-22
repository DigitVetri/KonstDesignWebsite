import { createServer } from 'vite'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { readFile, readdir, access, writeFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

// Structural rendering checks, without running a browser or claiming visual QA.
globalThis.window = {
  innerWidth: 1440, innerHeight: 900,
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
  addEventListener() {}, removeEventListener() {},
}
const server = await createServer({ server: { middlewareMode: true, hmr: false, watch: null }, appType: 'custom' })
try {
  const { default: App } = await server.ssrLoadModule('/src/App.jsx')
  for (const [name, width, height] of [['desktop',1440,900], ['mobile',390,844]]) {
    window.innerWidth = width; window.innerHeight = height
    const html = renderToStaticMarkup(createElement(App))
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${name}: one main heading`)
    for (const id of ['about','services','projects','experience','recognition','how-we-work','start-project','studios']) assert.ok(html.includes(`id="${id}"`), `${name}: ${id} present`)
    for (const href of [...html.matchAll(/href="#([^"]+)"/g)]) assert.ok(html.includes(`id="${href[1]}"`), `${name}: anchor ${href[1]} resolves`)
    assert.ok(html.includes('aria-expanded="false"'))
    assert.ok(html.includes('Discover our work'))
    assert.equal((html.match(/class="service-card"/g)||[]).length,6)
    assert.ok(html.includes('Rathinapuri Residence'))
    assert.ok(!html.includes('PREPARING THE ROOM'))
    if (name === 'mobile') assert.ok(html.includes('about-reading'))
    for (const match of html.matchAll(/(?:src|href)="(\/assets\/[^"?]+)"/g)) await access(`public${match[1]}`)
    await writeFile(`/tmp/konst-${name}-render.html`, html)
    console.log(`PASS ${name}: sections, headings, anchors, menu, galleries and image references`)
  }
  const files = []
  async function walk(dir) { for (const entry of await readdir(dir,{withFileTypes:true})) {const path=`${dir}/${entry.name}`;if(entry.isDirectory())await walk(path);else if(/\.(jsx?|css)$/.test(path))files.push(path)} }
  await walk('src')
  for(const file of files) {
    const content = await readFile(file,'utf8')
    for(const match of content.matchAll(/(?:from\s+|import\s*)['"](\.[^'"]+)['"]/g)) await access(new URL(match[1],new URL(file,`file://${process.cwd()}/`)))
  }
  console.log(`PASS ${files.length} source files: local module references`)
} finally { await server.close() }

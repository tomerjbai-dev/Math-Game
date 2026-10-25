import { describe, expect, it } from 'vitest'
import manifestText from '../public/manifest.webmanifest?raw'

const manifest = JSON.parse(manifestText)
const publicFiles = Object.keys(import.meta.glob('../public/**/*.png')).map((path) => path.replace('../public/', ''))

// ARCHITECTURE 2.7: Hebrew manifest whose paths follow the GitHub Pages base path
describe('web app manifest', () => {
  it('has the required Hebrew install fields', () => {
    expect(manifest).toMatchObject({
      name: 'אלופי הכפל',
      short_name: 'אלופי הכפל',
      lang: 'he',
      dir: 'rtl',
      display: 'standalone',
    })
  })

  it('uses paths relative to the deploy folder, not the site root', () => {
    expect(manifest.start_url).not.toMatch(/^\//)
    expect(manifest.scope).not.toMatch(/^\//)
  })

  it('lists 192 and 512 icons that exist in public/', () => {
    const sizes = manifest.icons.map((icon: { sizes: string }) => icon.sizes)
    expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']))
    for (const icon of manifest.icons) {
      expect(publicFiles).toContain(icon.src)
    }
  })
})

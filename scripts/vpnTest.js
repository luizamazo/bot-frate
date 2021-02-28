const puppeteer = require('puppeteer-extra')

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

puppeteer.launch({ headless: true }).then(async browser => {
  const page = await browser.newPage()
  await page.goto('https://ipleak.net/')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'vpnTest.png', fullPage: true })
  console.log('Teste realizado, verifique na imagem vpnTest.png')
  await browser.close()
})
const puppeteer = require('puppeteer-extra')

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
puppeteer.use(AdblockerPlugin({ blockTrackers: true }))
 
puppeteer.launch({ headless: false, ignoreHTTPSErrors: true }).then(async browser => {
  let number = 31,
  userYop = `testando${number}`
  const yopMail = await browser.newPage()
  await yopMail.setViewport({ width: 1280, height: 1800 })
  await yopMail.goto('http://m.yopmail.com/en/', {waitUntil: 'networkidle2'})
  await yopMail.waitForSelector('input[name=login]')
  await yopMail.$eval('input[name=login]', (el, userYop) => {
    return el.value = userYop
  }, userYop)
  await (await yopMail.$('input[type="submit"]')).press('Enter')

  const granFratello = await browser.newPage()
  await granFratello.setViewport({ width: 1200, height: 1800 })
 /*  await granFratello.setRequestInterception(true);
    granFratello.on("request", async (req) => {
      try {
        switch (await req.resourceType()) {
          case "image":
          case "stylesheet":
          case "font":
            await req.abort()
            break;
          default:
            await req.continue()
            break;
        }
      } catch (e) {
        console.log(e)
      }
    }) */
  await granFratello.goto('https://grandefratello.mediaset.it/vota/', {
    waitUntil: 'networkidle0'
  })

  const createUserGF = async (userYop) => {
    try{
      await granFratello.waitForSelector('#user_name')
      await granFratello.$eval('#user_name', el => el.click())
      await granFratello.waitForSelector('.register')
      await granFratello.$eval('.register', el => el.click())
      await pageRegisterSelectorLoad()
      await seedInputFields(userYop) 
      console.log('wairit')
    }catch(e){
      console.log('deuruims', e)
    }
  }

  const pageRegisterSelectorLoad = async () => {
    await granFratello.waitForSelector('input[name="email"]')
    await granFratello.waitForSelector('input[name="profile.username"]')
    await granFratello.waitForSelector('input[name="password"]')
    await granFratello.waitForSelector('input[name="passwordRetype"]')
    await granFratello.waitForSelector('input[name="profile.firstName"]')
    await granFratello.waitForSelector('input[name="profile.lastName"]')
    await granFratello.waitForSelector('#gigya-dropdown-122191383995894850') //birthday
    await granFratello.waitForSelector('#gigya-dropdown-118502566152086350') //birthmonth
    await granFratello.waitForSelector('#gigya-dropdown-8784083251535020') //birthyear
    await granFratello.waitForSelector('input[name="profile.hometown"]')
    await granFratello.waitForSelector('input[name="profile.gender"]')
    await granFratello.waitForSelector('input[name="preferences.profiling.isConsentGranted"]')
    await granFratello.waitForSelector('input[name="preferences.marketing.isConsentGranted"]')
    await granFratello.waitForSelector('input[name="preferences.data.isConsentGranted"]')
  }

  const seedInputFields = async (userYop) => {
    const passYop = 'Vixen100'
    await granFratello.$eval('input[name="email"]', (el, userYop) => {
      return el.value = `${userYop}@yopmail.com`
    }, userYop)
    await granFratello.$eval('input[name="profile.username"]', (el, userYop) => {
      return el.value = userYop
    }, userYop)
    await granFratello.$eval('input[name="password"]', (el, passYop) => {
      return el.value = passYop
    }, passYop)
    await granFratello.$eval('input[name="passwordRetype"]', (el, passYop) => {
      return el.value = passYop
    }, passYop)
    await granFratello.$eval('input[name="profile.firstName"]', (el, userYop) => {
      return el.value = userYop
    }, userYop)
    await granFratello.$eval('input[name="profile.lastName"]', (el, userYop) => {
      return el.value = userYop
    }, userYop)
    
    let birthDate = Math.floor(Math.random() * (31 - 1 + 1)) + 1
    let birthMonth = Math.floor(Math.random() * (12 - 1 + 1)) + 1
    let birthYear = Math.floor(Math.random() * (1998 - 1967 + 1)) + 1967

    await granFratello.select('#gigya-dropdown-122191383995894850', birthDate.toString())
    await granFratello.select('#gigya-dropdown-118502566152086350', birthMonth.toString())
    await granFratello.select('#gigya-dropdown-8784083251535020', birthYear.toString()) 
    
    let gender = ['m', 'f'],
    cities = ['Milano', 'Roma', 'Sicilia']
    randGender = '',
    randCity = ''
    Array.prototype.getRandomVal = function(){
      return this[Math.floor(Math.random() * this.length)]
    }
    
    randCity = cities.getRandomVal()
    await granFratello.$eval('input[name="profile.hometown"]', (el, randCity) => {
      return el.value = randCity
    }, randCity)
    
    randGender = gender.getRandomVal()
    if(randGender == 'm'){
      await granFratello.$eval('input[value="m "]', el => el.click())
    }else if(randGender == 'f'){
      await granFratello.$eval('input[value="f"]', el => el.click())
    }
    await granFratello.$$eval('input[value="true"]', checkboxes => {
      checkboxes.forEach(chbox => chbox.click())
   })
   await granFratello.$eval('input[type="submit"]', el => el.click())
  }

//await createUserGF(userYop)

let pages = await browser.pages()
await pages[1].waitForTimeout(1000)
await pages[1].evaluate( async () => { 
  console.log('ebntro')
  try{
    // document.querySelector('body > center > div:nth-child(3) > table > tbody > tr > td:nth-child(10) > a').click()
    let iframe = document.getElementById('ifinbox'),
    doc = iframe.contentDocument 
    console.log(doc)
    let oi = doc.querySelector('body > div > #m1 > div > a').click()
    console.log('rerfrsh deu bom', oi)
  }catch(e){
    console.log('refresh deu ruim', e)
  } 
})

//number++
  
})
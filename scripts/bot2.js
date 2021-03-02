let path = require('path')
const puppeteer = require('puppeteer-extra')
const fs = require('fs')
const { orderBy } = require('natural-orderby')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const { Console } = require('console')

puppeteer.use(StealthPlugin())
puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: '1d4ea1f75b42ee3bdb37b0b7b6754835', 
    },
    visualFeedback: true, 
  })
)

puppeteer.launch({ headless: true, ignoreHTTPSErrors: true, defaultViewport: null }).then(async browser => {
  let flag = false,
  jsonPath = path.resolve('../json/emails-botzin.json')
  const granFratello = await browser.newPage()
 // await granFratello.setViewport({ width: 1200, height: 3000})
 
  await granFratello.goto('https://grandefratello.mediaset.it/vota/', {
    waitUntil: 'networkidle2',
    timeout: 0
  }) 

  const createUserGF = async (userYop, granFratello) => {
    seedInputSuccess = false
    try{
      await granFratello.waitForTimeout(5000)
      await granFratello.waitForSelector('#user_name')
      await granFratello.$eval('#user_name', el => el.click())
      await granFratello.waitForTimeout(8000)
      await granFratello.waitForSelector('.register')
      await granFratello.$eval('.register', el => el.click())
      await pageRegisterSelectorLoad()
      seedInputSuccess =await seedInputFields(userYop, granFratello) 
      if(seedInputSuccess){
        await granFratello.waitForTimeout(5000)
        await granFratello.evaluate( async () => { 
          document.querySelector('div.gigya-screen-dialog-main > div.gigya-screen-dialog-top > div.gigya-screen-dialog-close > a').click()
        })
        await granFratello.waitForTimeout(5000)
        console.log(`Conta ${userYop} criada com sucesso`)
        let json = await readJson(jsonPath)
        json.push(userYop)
        await writeJson(jsonPath, json) 
        return true
      }else{
        return false
      }
    }catch(e){
      console.log('DEU RUIM:', e)
      flag = true 
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

  const seedInputFields = async (userYop, granFratello) => {
    const passYop = 'Vixen100'
    let error = false
    await granFratello.focus('input[name="email"')
    await granFratello.keyboard.type(`${userYop}@${process.argv[4]}`,  {delay: 20})
    /* await granFratello.$eval('input[name="email"]', (el, userYop) => {
      return el.value = `${userYop}@yopmail.com`
    }, userYop)*/

    await granFratello.$eval('input[name="profile.username"]', (el, userYop) => {
      return el.value = userYop
    }, userYop) 
    await granFratello.waitForTimeout(2000)
    const errorMessage = await granFratello.evaluate(() => {
      return document.querySelector('#register-site-login > div:nth-child(1) > div.gigya-layout-row > div > span').textContent
    })
    if(errorMessage != undefined && errorMessage.includes("L'indirizzo email non è valido.")){
      console.log('Acho q esse domain deu ruim')
      error = true
    }
    if(!error){
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
      
      let birthDate = Math.floor(Math.random() * (28 - 1 + 1)) + 1
      let birthMonth = Math.floor(Math.random() * (12 - 1 + 1)) + 1
      let birthYear = Math.floor(Math.random() * (1998 - 1967 + 1)) + 1967
  
      await granFratello.select('#gigya-dropdown-122191383995894850', birthDate.toString())
      await granFratello.select('#gigya-dropdown-118502566152086350', birthMonth.toString())
      await granFratello.select('#gigya-dropdown-8784083251535020', birthYear.toString()) 
      
      let gender = ['m', 'f'],
      cities = ['Milano', 'Roma', 'Sicilia', 'Cagliari', 'Genova', 'Rimini', 'Vicenza', 'Udine', 'Taranto', 'Torino']
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
  
     console.log('Resolvendo o captcha... user:', userYop)
     await Promise.all([
        await granFratello.waitForTimeout(10000),
        await granFratello.$eval('input[type="submit"]', el => el.click()),
        await granFratello.solveRecaptchas()
      ])
      console.log('Foi...')
      return true
    }else{
      return false
    }
  }

let writeJson = async (jsonPath, content) => {
  return new Promise(function(resolve, reject){
    const jsonString = JSON.stringify(content)
    fs.writeFile(jsonPath, jsonString, err => {
      if(err){
        console.error('Error writing JSON file', err)
      }else{
        console.log('Salvando a conta no log...')
        resolve()
      }
    })
  })
}

let readJson = async jsonPath => {
  return new Promise(function(resolve, reject){
    fs.readFile(jsonPath, 'utf8', (err, jsonString) => {
      if(err){
        console.log('Reading json file failed', err)
      }
      try{
        const json = JSON.parse(jsonString)
        resolve(json)
      }catch(err){
        console.error('Error parsing Json', err)
      }
    })
  })
}

const checkDuplicateEmail = async (emailsJson, userYop) => {
  let flagDuplicate = false
  if(emailsJson.length > 0){
    for(email of emailsJson){
      if(email == userYop){
        console.log('Esse email já existe', email)
        console.log('Tentando novamente...')
        flagDuplicate = true
        break;
      }
    }
  }
  return flagDuplicate
}

let number = 0,
creationSuccess = false
while(!flag){
  number = Math.floor(Math.random() * (process.argv[3] - 1 + 1)) + 1
  let userYop = `${process.argv[2]}${number}`
  let emailsJson = await readJson(jsonPath)
  let isEmailDuplicate = await checkDuplicateEmail(emailsJson, userYop)
  if(isEmailDuplicate){
    continue;
  }else{
    creationSuccess = await createUserGF(userYop, granFratello)
    if(!creationSuccess){
      flag = true
    }
  }
 emailsJson = await readJson(jsonPath)
 if(emailsJson.length == process.argv[3]){
    let cleanEmails = []
    //await writeJson(jsonPath, cleanEmails)
    flag = true
  }
  if(flag){
   let jsonToReorder = await readJson(jsonPath)
   if(jsonToReorder.length  > 0){
    reorderEmails = orderBy(jsonToReorder)
    await writeJson(jsonPath, reorderEmails)
   }
    browser.close()
  }  
} 

  
})
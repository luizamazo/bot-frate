const puppeteer = require('puppeteer-extra')
const fs = require('fs')
let path = require('path')
 
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

puppeteer.launch({ headless: false, ignoreHTTPSErrors: true }).then(async browser => {
  let flag = false,
  jsonPath = path.resolve('../json/emails-vbot.json'),
  logPath = path.resolve('../json/vbot-log.json')
  const granFratello = await browser.newPage()
  
  await granFratello.goto('https://grandefratello.mediaset.it/vota/', {
    waitUntil: 'load',
    timeout: 0
  }) 

  const checkGF = async (email,password) => {
    try{
      await granFratello.waitForTimeout(3000)
      await granFratello.waitForSelector('#user_name')
      await granFratello.$eval('#user_name > span', el => el.click())
 
      console.log('Iniciando...')
      await granFratello.waitForTimeout(2000)
      await granFratello.waitForSelector('input[name="username"]')
      await granFratello.waitForSelector('input[name="password"]')
      let domain = process.argv[2]
      await granFratello.$eval('input[name="username"]', (el, email, domain) => {
        return el.value = `${email}@${domain}`
      }, email, domain)
      await granFratello.$eval('input[name="password"]', (el, password) => {
        return el.value = password
      }, password)
      await granFratello.$eval('input[type="submit"]', el => el.click())
      await granFratello.waitForTimeout(2000)
      const errorMessage = await granFratello.evaluate(() => {
        let err = document.querySelector('#gigya-login-form > div.gigya-layout-row.with-divider > div.gigya-layout-cell.responsive.with-site-login > div.gigya-error-display.gigya-composite-control.gigya-composite-control-form-error.gigya-error-code-403042.gigya-error-display-active > div')
          if(err){
            return err.textContent
          } 
      })
      let log = await readJson(logPath),
      error = false
      if(errorMessage != undefined && errorMessage.includes("Email o password errata")){
        console.log('Acho que a conta foi banida... email ou senha deu ruim')
        log.push({
          msg: 'Error: Conta possivelmente banida', 
          user: email,
          errorMsg: errorMessage
       })
        await writeJson(logPath, log)
        error = true
      }

      if(!error){
        console.log('Conta ainda funciona:', email)
        log.push({
          msg: 'Conta ainda funciona', 
          user: email
        })
        await writeJson(logPath, log)
        console.log('Fazendo logout...')
        try{
          await granFratello.waitForSelector('#user_name')
          await granFratello.$eval('#user_name > span', el => el.click())
          await granFratello.waitForSelector('#logout')
          await granFratello.$eval('#logout', el => el.click())
          await granFratello.waitForTimeout(3000)

          return true
        }catch(e){
          console.error('Deu ruim no logout', e)
        }
      }
    }catch(e){
      console.log('Deu ruim na validação das contas', e)
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
        console.log('Reescrevendo o log...')
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

let password = `${process.argv[3]}`
while(!flag){
    let emailsJson = await readJson(jsonPath)
    if(emailsJson.length == 0){
      console.log('Acabou as contas')
      flag = true
    }else{
      for(emails of emailsJson){
        await checkGF(emails, password)
      }
      flag = true
    }
  if(flag){
   browser.close()
  } 
}

})
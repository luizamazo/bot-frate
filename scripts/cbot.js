const puppeteer = require('puppeteer-extra')
const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
let path = require('path')
const fs = require('fs')
puppeteer.use(AdblockerPlugin())
puppeteer.use(StealthPlugin())

puppeteer.launch({ headless: true, ignoreHTTPSErrors: true }).then(async browser => {
  let flag = false,
  jsonPath = path.resolve('../json/emails-cbot.json'),
  logPath = path.resolve('../json/cbot-log.json')
  const emailGenerator = await browser.newPage()
  await emailGenerator.goto('https://generator.email/', {
    waitUntil: 'load',
    timeout: 0
  }) 

  const confirmEmail = async (user) => {
    try{
      await emailGenerator.waitForTimeout(5000)
      await emailGenerator.waitForSelector('#userName')
      await emailGenerator.waitForSelector('#domnamserch666')

      await emailGenerator.focus('#userName')
      await emailGenerator.keyboard.down('Control')
      await emailGenerator.keyboard.press('A')
      await emailGenerator.keyboard.up('Control')
      await emailGenerator.keyboard.press('Backspace')
      await emailGenerator.keyboard.type(user,  {delay: 20})
     
      await emailGenerator.$eval('#copbtn', el => el.click())
      await emailGenerator.focus('#domainName2')
      await emailGenerator.keyboard.down('Control')
      await emailGenerator.keyboard.press('A')
      await emailGenerator.keyboard.up('Control')
      await emailGenerator.keyboard.press('Backspace') 
      await emailGenerator.keyboard.type(process.argv[2],  {delay: 20})
      await emailGenerator.waitForTimeout(4000)
      await emailGenerator.focus('#userName')
      await emailGenerator.$eval('#refresh > button', el => el.click())
      let log = await readJson(logPath)

      try{
        await emailGenerator.waitForTimeout(5000)
        const emailArrived = await emailGenerator.evaluate(() => {
          return document.querySelector('#email-table').textContent
        })
        if(emailArrived.includes('Conferma la tua registrazione') && !emailArrived.includes('Benvenuto!')){
          await emailGenerator.$eval('#cont_tmpl > table > tbody > tr:nth-child(2) > td > table > tbody > tr > td > p.bt > a', el => el.click())
          await emailGenerator.waitForTimeout(8000)
          let pages = await browser.pages()
          await pages[2].evaluate(() => {window.close()})
          log.push({
            msg: 'Conta confirmada', 
            user: user
         })
          console.log(`Confirmei a conta
          user: ${user} 
          `)
        }else if(!emailArrived.includes('Conferma la tua registrazione')){
          log.push({
             msg: 'Não chegou email de confirmação', 
             user: user, 
             inbox: emailArrived
          })
          console.log(`Não chegou email de confirmação 
          user: ${user} 
          inbox: ${emailArrived}
          `)
        }else if(emailArrived.includes('Benvenuto!')){
          log.push({
            msg: 'Já tá confirmado ', 
            user: user, 
            inbox: emailArrived
         })
          console.log(`Já tá confirmado 
          user: ${user} 
          inbox: ${emailArrived}
          `)
        }
        await writeJson(logPath, log)
        return true 
      }catch(e){
        console.log('Ihhhh faiô, inbox vazio')
        log.push({
          msg: 'Deu ruim',
          user: user, 
          error: e
       })
       await writeJson(logPath, log)
      }
    }catch(e){
      console.log('Deu ruim em tudo', e)
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

while(!flag){
  let emailsJson = await readJson(jsonPath)
  if(emailsJson.length == 0){
    flag = true
  }else{
    for(email of emailsJson){
      await confirmEmail(email)
    }
    flag = true
  }
  if(flag){
   browser.close()
  } 
}  

})
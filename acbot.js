const puppeteer = require('puppeteer-extra')
const fs = require('fs')
let path = require('path')

const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

puppeteer.launch({ headless: true, ignoreHTTPSErrors: true }).then(async browser => {
  let flag = false,
  jsonPath = path.resolve('emails-ac.json')
  const granFratello = await browser.newPage()
 // await granFratello.setViewport({ width: 1200, height: 1800 })
 
  await granFratello.goto('https://grandefratello.mediaset.it/vota/', {
    waitUntil: 'load',
    timeout: 0
  }) 

  const voteGF = async (email,password) => {
    try{
      await granFratello.waitForTimeout(5000)
      await granFratello.waitForSelector('#user_name')
      await granFratello.$eval('#user_name > span', el => el.click())
 
      await granFratello.waitForSelector('input[name="username"]')
      await granFratello.waitForSelector('input[name="password"]')
      await granFratello.$eval('input[name="username"]', (el, email) => {
        return el.value = `${email}@ceroa.com`
      }, email)
      await granFratello.$eval('input[name="password"]', (el, password) => {
        return el.value = password
      }, password)
      await granFratello.$eval('input[type="submit"]', el => el.click())

      let zeroVotes = false
      while(!zeroVotes){
        zeroVotes = await vote(zeroVotes)
      }

      if(zeroVotes){
        console.log('Fazendo logout...')
        try{
          await granFratello.waitForSelector('#user_name')
          await granFratello.$eval('#user_name > span', el => el.click())
          await granFratello.waitForSelector('#logout')
          await granFratello.$eval('#logout', el => el.click())
          await granFratello.waitForTimeout(2000)
        }catch(e){
          console.error('afs', e)
        }

        if(zeroVotes){return true}
      }
    }catch(e){
      console.log('deu ruim', e)
      return false
    }
  }


let vote = async () => {
  await granFratello.waitForTimeout(5000)
  try {
    const consent = await granFratello.evaluate(() => document.querySelector('#gigya-profile-form > div:nth-child(1) > div:nth-child(3) > label').textContent)
    if(consent.includes('da oggi puoi usare le stesse credenziali per Mediaset Play, Infinity e tutti gli altri siti e app Mediaset, così sarà più facile accedere ai nostri servizi e dovrai ricordarti una sola password!')){
      try {
        await granFratello.$$eval('input[value="false"]', checkboxes => {
          checkboxes.forEach(chbox => chbox.click())
       })
       await granFratello.$eval('#gigya-profile-form > div:nth-child(3) > div:nth-child(1) > div > input', el => el.click())
       await granFratello.waitForTimeout(3000)
       await granFratello.$eval('#gigya-profile-form > div:nth-child(1) > div > input', el => el.click())
       await granFratello.waitForTimeout(5000)
      } catch (error) {
        console.log('modal cnsent deu ruim')
      }
    }
  } catch (error) {
    console.log("mediaplus consent didnt show up")
  }
  if(process.argv[2] == 's'){
    await granFratello.$eval('a[title="Samantha"]', el => el.click())
  }else if(process.argv[2] == 'd'){
    await granFratello.$eval('a[title="Dayane"]', el => el.click())
  }

  await granFratello.$eval('#main > div > div.b_vote.active > h3 > span', el => el.click())
  await granFratello.waitForTimeout(5000)
  await granFratello.waitForSelector('.b_info.on')
  const msgOk = await granFratello.evaluate(() => document.querySelector('.b_info.on').textContent)
  //console.log('Mensagem:', msgOk) 
  if(msgOk.includes('Hai a disposizione ancora')){
    try{
      if(process.argv[2] == 's'){
        console.log('Votei na Bolsonara || Ainda há votos nessa sessão, revotando...\n')
      }else if(process.argv[2] == 'd'){
        console.log('Votei na BDS || Ainda há votos nessa sessão, revotando...\n')
      }
      await granFratello.waitForSelector('#msg_ok > span.revote > a')
      await granFratello.$eval('#msg_ok > span.revote > a', el => el.click())
      return false
    }catch(error){
      console.log('deu ruim no revote')
    } 
  }else if(msgOk.includes('Hai utilizzato tutti i voti esprimibili per questa sessione.') || msgOk.includes('Hai raggiunto il limite massimo di voti esprimibili')){
    console.log('Acabou os votos dessa sessão')
    return true
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

let password = `${process.argv[3]}`,
success = false
while(!flag){
  if(process.argv[2] == 's' || process.argv[2] == 'd'){
    let emailsJson = await readJson(jsonPath)
    if(emailsJson.length == 0){
      console.log('Acabou as contas')
      flag = true
    }else{
      for(emails of emailsJson){
        success = await voteGF(emails, password)
        if(success){
          emailsJson.shift()
          console.log('Finalizou a conta', emails)
          await writeJson(jsonPath, emailsJson)
        }
        success = false
      }
    }
  }else{
    console.log('Quer votar em quem fi? Só pode votar na Bolsi ou na BDS')
    flag = true
  }
  if(flag){
    browser.close()
  } 
}

})
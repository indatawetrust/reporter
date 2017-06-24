#! /usr/bin/env node

const PQueue = require('p-queue-safe'),
      request = require('request-promise'),
      cheerio = require('cheerio'),
      json = require('jsonfile'),
      argv = require('yargs').argv,
      ms = require('ms'),
      progress = require('progress'),
      fs = require('fs'),
      start = +new Date()

let config = {}

try {

  config = require(`${process.cwd()}/conf.json`)

} catch (e) {
  
  config = Object.assign(argv, {
    limit: argv.limit || 10
  })
}

let page = 1,
    links = [],
    heartbeat = null,
    bar = new progress(':bar :percent :len link saved', { total: config.limit ? config.limit : (config.end-config.start), width: 20 }),
    special = typeof config.special === "string" ? 
              config.special.split(',')
                          .map(d => ({[d.split(':')[0].trim()]: d.split(':')[1].trim().split('*')}))
                          .reduce((a,b) => Object.assign(a,b)) : null;
try {
  
  if (config.heartbeat)
    heartbeat = require(`${process.cwd()}/heartbeat.js`);

} catch (e) {
  
  console.log(`heartbeat.js file not found.`)
  process.exit()
    
}

const jumper = ($, el, option) => {
  switch (option) {
    case '<':
        el = $(el).prev()
      break
    case '^':
        el = $(el).parent()
      break
    case '>':
        el = $(el).next()
      break
  }

  return $(el)
}

const queue = new PQueue({ retry: true, }),
      crawl = body => {
        
        let $ = cheerio.load(body)
        
        if ($(config.list).length && page <= (config.limit ? config.limit : (config.end-config.start))) {
          bar.tick({
            len: links.length 
          })
          
          $(config.list).each((i, el) => {
            let item = {
              url: config.link ? $(el).find(config.link).attr('href') : $(el).attr('href'),
              title: $(el).find(config.title).text().trim().replace(/[\n\t]/g, '')
            }
            
            for (let elem in special) {
              if (special[elem][0].match(/[<\^>]/)) {
                let relative = special[elem][0].match(/[<\^>]/)[0],
                    selector = special[elem][0].replace(/[<\^> ]/g, ''),
                    attr = special[elem][1],
                    key = elem
                
                elem = jumper($, el, relative)
                
                if (attr === 'text') {
                  item[key] = elem.find(selector).text().replace(/\r|\t|\n/g, '').replace(/ {2,}/g, '').trim()
                } else {
                  item[key] = elem.find(selector).attr(attr)
                }
              } else {
                if (special[elem][1] === 'text') {
                  item[elem] = $(el).find(special[elem][0]).text().replace(/\r|\t|\n/g, '').replace(/ {2,}/g, '').trim()
                } else {
                  item[elem] = $(el).find(special[elem][0]).attr(special[elem][1])
                }
              }
            }
            
            let is = []

            for (let i in item) {
              is.push(item[i] && item[i].trim() != '')   
            }
            
            if (is.filter(e => e).length > (config.min || 1))
              links.push(item)
            
            if (heartbeat)
              heartbeat(item)

          })
          
          queue.add(() => request(`${config.site}${++page}`)).then(crawl);

        } else {
          
          bar.tick({
            len: links.length 
          })

          console.log(`Completed in ${ms(+new Date()-start)}.\n${links.length} link saved to ${config.file || 'report'}.json file.`)
          
          json.writeFileSync(`${process.cwd()}/${config.file || 'report'}.json`, links)

        }

      }

queue.add(() => request(`${config.site}${page}`)).then(crawl)

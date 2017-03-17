#! /usr/bin/env node

const PQueue = require('p-queue'),
      request = require('request-promise'),
      cheerio = require('cheerio'),
      json = require('jsonfile'),
      argv = require('yargs').argv,
      ms = require('ms'),
      progress = require('progress'),
      fs = require('fs'),
      start = +new Date()

let page = 1,
    links = [],
    config = {},
    heartbeat = null,
    bar = new progress(':bar :percent', { total: argv.limit, width: 20 })

try {

  config = fs.statSync(`${process.cwd()}/conf.json`);

} catch (e) {
  
  config.site = argv.site
  config.list = argv.list
  config.link = argv.link
  config.title = argv.title
  config.limit = argv.limit
  config.heartbeat = argv.heartbeat
    
}

try {
  
  if (config.heartbeat)
    heartbeat = require(`${process.cwd()}/heartbeat.js`);

} catch (e) {
  
  console.log(`heartbeat.js file not found.`)
  process.exit()
    
}

const queue = new PQueue({ concurrency: 1 }),
      crawl = body => {
        
        let $ = cheerio.load(body)

        if ($(config.list).length && page <= argv.limit) {

          bar.tick(1)
          
          $(config.list).each((i, el) => {

            let item = {
              url: $(el).find(config.link).attr('href'),
              text: $(el).find(config.title).text().trim().replace(/[\n\t]/g, '')
            }
            
            links.push(item)
            
            if (heartbeat)
              heartbeat(item)

          })
        
          queue.add(() => request(`${config.site}${++page}`)).then(crawl);

        } else {

          console.log(`Completed in ${ms(+new Date()-start)}.\n${links.length} link saved to report.json file.`)
          
          json.writeFileSync(`${process.cwd()}/report.json`, links)

        }

      }

queue.add(() => request(`${config.site}${page}`)).then(crawl)

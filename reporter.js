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
    bar = new progress(':bar :percent :len link saved', { total: argv.limit ? argv.limit : (argv.end-argv.start), width: 20 })

try {

  config = fs.statSync(`${process.cwd()}/conf.json`);

} catch (e) {
  
  config.site = argv.site
  config.list = argv.list
  config.link = argv.link
  config.title = argv.title
  config.limit = argv.limit
    
}

try {
  
  heartbeat = require(`${process.cwd()}/heartbeat.js`);

} catch (e) {
  
  console.log(`heartbeat.js file not found.`)
  process.exit()
    
}

const queue = new PQueue({ retry: true, }),
      crawl = body => {
        
        let $ = cheerio.load(body)

        if ($(config.list).length && page <= (argv.limit ? argv.limit : (argv.end-argv.start))) {

          bar.tick({
            len: links.length 
          })
          
          $(config.list).each((i, el) => {
            
            let item = {
              url: $(el).find(config.link).attr('href'),
              title: $(el).find(config.title).text().trim().replace(/[\n\t]/g, '')
            }
            
            links.push(item)
            
            if (heartbeat)
              heartbeat(item)

          })
          
          queue.add(() => request(`${config.site}${++page}`)).then(crawl);

        } else {
          
          bar.tick({
            len: links.length 
          })

          console.log(`Completed in ${ms(+new Date()-start)}.\n${links.length} link saved to report.json file.`)
          
          json.writeFileSync(`${process.cwd()}/${argv.file ? argv.file : 'report'}.json`, links)

        }

      }

queue.add(() => request(`${config.site}${page}`)).then(crawl)

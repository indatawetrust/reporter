#! /usr/bin/env node

const PQueue = require('p-queue'),
      request = require('request-promise'),
      cheerio = require('cheerio'),
      json = require('jsonfile'),
      argv = require('yargs').argv,
      ms = require('ms'),
      progress = require('progress'),
      start = +new Date()

let page = 1,
    links = [],
    bar = new progress(':bar :percent', { total: argv.limit, width: 20 })

const queue = new PQueue({ concurrency: 1 }),
      crawl = body => {
        
        let $ = cheerio.load(body)

        if ($(argv.list).length && page <= argv.limit) {

          bar.tick(1)
          
          $(argv.list).each((i, el) => { 
            links.push({
              url: $(el).find(argv.link).attr('href'),
              text: $(el).find(argv.title).text().trim().replace(/[\n\t]/g, '')
            })
          })
        
          queue.add(() => request(`${argv.site}${++page}`)).then(crawl);

        } else {

          console.log(`Completed in ${ms(+new Date()-start)}.\n${links.length} link saved to report.json file.`)
          
          json.writeFileSync(`${process.cwd()}/report.json`, links)

        }

      }

queue.add(() => request(`${argv.site}${page}`)).then(crawl)

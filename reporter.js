#! /usr/bin/env node

const PQueue = require('p-queue'),
      request = require('request-promise'),
      cheerio = require('cheerio'),
      json = require('jsonfile'),
      start = +new Date()

let page = 1,
    links = []

const queue = new PQueue({ concurrency: 1 }),
      crawl = body => {
        
        let $ = cheerio.load(body)

        if ($('.athing').length) {
        
          $('.athing').each((i, el) => {
            links.push({
              url: $(el).find('.storylink').attr('href'),
              text: $(el).find('.storylink').text()
            })
          })
        
          queue.add(() => request(`https://news.ycombinator.com/news?p=${++page}`)).then(crawl);

        } else {

          console.log(`Completed in ${((+new Date()-start)*0.001).toFixed(2)} second.\n${links.length} link saved to news.json file.`)
          
          json.writeFileSync(`${process.cwd()}/news.json`, links)

        }

      }

queue.add(() => request(`https://news.ycombinator.com/news?p=${page}`)).then(crawl)

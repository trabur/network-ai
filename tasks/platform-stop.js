#!/usr/bin/env node
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
const argv = yargs(hideBin(process.argv)).argv

// allow require Node >= 14
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// workflow
import gulp from 'gulp';
const { series, parallel } = gulp;

// shell
import pkg from 'ssh2'
const { Client } = pkg;

async function stop () {
  // configuration
  let platformName = argv.name
  console.log('run platform', platformName)

  await new Promise((resolve, reject) => {
    var c = new Client()
    c.on('connect', function() {
      console.log('Connection :: connect');
    });
    
    c.on('ready', function() {
      console.log('Connection :: ready');

      // execute
      c.exec(`cd ~/Projects/istrav-platform-backend && pm2 stop dist/main.js --name="${platformName}"`, { allowHalfOpen: false }, function (error, channel) {
        channel.on('data', (data) => {
          console.log(data.toString());
        });
        channel.on('close', (data) => {
          c.end()
        });
      })
    })
    c.on('error', function(err) {
      console.log('Connection :: error :: ' + err);
    });
    c.on('end', function() {
      console.log('Connection :: end');
    });
    c.on('close', function(had_error) {
      console.log('Connection :: close');
      resolve()
    });
    c.connect({
      host: '192.168.10.97',
      port: 22,
      username: 'istrav',
      password: 'furlong'
    });
  })
}

// tasks
export default series(
  stop
)
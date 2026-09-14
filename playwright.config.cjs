const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
 testDir:'tests/browser',timeout:120000,expect:{timeout:30000},workers:1,retries:0,
 reporter:[['list'],['html',{open:'never'}]],
 use:{baseURL:'http://127.0.0.1:4173',viewport:{width:390,height:844},hasTouch:true,isMobile:true,trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[{name:'chromium',use:{browserName:'chromium'}},{name:'webkit',use:{browserName:'webkit'}}],
 webServer:{command:'python3 -m http.server 4173 --bind 127.0.0.1',url:'http://127.0.0.1:4173',reuseExistingServer:!process.env.CI}
});

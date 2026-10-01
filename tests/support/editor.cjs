async function openTools(page){const tools=page.locator('#albumTools');if(await tools.getAttribute('open')===null)await tools.locator(':scope > summary').click()}
module.exports={openTools};

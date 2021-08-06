require('dotenv').config();
const { StopBWBot } = require('./bot')

// https://id.twitch.tv/oauth2/authorize?client_id=wc0atk5s5bgw67jgh7d6sypye91wyc&redirect_uri=http://localhost&response_type=token&scope=moderation:read channel:moderate chat:read chat:edit&state=c3ab8aa609ea11e793ae92361f002671
// https://id.twitch.tv/oauth2/authorize?client_id=wc0atk5s5bgw67jgh7d6sypye91wyc&redirect_uri=http://localhost&response_type=code&scope=moderation:read+channel:moderate+chat:read+chat:edit&force_verify=true&state=c3ab8aa609ea11e793ae92361f002671
// https://id.twitch.tv/oauth2/token?client_id=wc0atk5s5bgw67jgh7d6sypye91wyc&client_secret=83u9sp0zmb1f8l59uw1pfa9w8r96r9&code=4ntjomhsrosd1aqv7dvez28tsfi9m4&grant_type=authorization_code&redirect_uri=http://localhost

~(async () => {
    const clientId = process.env.CLIENT_ID;
    const accessToken = process.env.ACCESS_TOKEN;

    const botAdmins = ['kerilv', 'bratishkinoff', 'joebarbaroef'];
    const reasons = ['banword', 'банворд', 'bw', 'бв'];

    const bot = new StopBWBot(clientId, accessToken, botAdmins, reasons);
    global.bot = bot;

    bot.init();
    
    bot.connect();
    
})()


require('dotenv').config();
const mongoose = require('mongoose');
const Token = require('./models/tokenModel');
const User = require('./models/user');
const { StopBWBot } = require('./bot')

const reasons = ['banword', 'банворд', 'bw', 'бв'];
// https://id.twitch.tv/oauth2/authorize?client_id=wc0atk5s5bgw67jgh7d6sypye91wyc&redirect_uri=http://localhost&response_type=token&scope=moderation:read channel:moderate chat:read chat:edit&state=c3ab8aa609ea11e793ae92361f002671
// https://id.twitch.tv/oauth2/authorize?client_id=wc0atk5s5bgw67jgh7d6sypye91wyc&redirect_uri=http://localhost&response_type=code&scope=moderation:read+channel:moderate+chat:read+chat:edit&force_verify=true&state=c3ab8aa609ea11e793ae92361f002671
// https://id.twitch.tv/oauth2/token?client_id=wc0atk5s5bgw67jgh7d6sypye91wyc&client_secret=83u9sp0zmb1f8l59uw1pfa9w8r96r9&code=1gve67rxezc1dget1xk7z7m31zv642&grant_type=authorization_code&redirect_uri=http://localhost

~(async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
        });

        const tokenData = await Token.find({});
        const user = await User.find({});

        const clientId = process.env.CLIENT_ID;
        const clientSecret = process.env.CLIENT_SECRET;
        
        const accessToken = tokenData[0].accessToken;
        const refreshToken = tokenData[0].refreshToken;
        const expiryTimestamp = tokenData[0].expiryTimestamp;
    
        const botAdmins = user.map((e) => e.userName);
    
        const bot = new StopBWBot(clientId, clientSecret, accessToken, refreshToken, expiryTimestamp, botAdmins, reasons);
        global.bot = bot;
    
        bot.init();
        
        bot.connect();
    } catch (err) {
        console.error(err);
    }
    
})()


const { RefreshableAuthProvider, StaticAuthProvider } = require('twitch-auth');
const { ChatClient } = require('twitch-chat-client');
const { ApiClient } = require('twitch');
const { PubSubClient } = require('twitch-pubsub-client');
const { commands } = require('./commands');

const Token = require('./models/tokenModel');

class StopBWBot {
    constructor (clientId, clientSecret, accessToken, refreshToken, expiryTimestap, botAdmins, reasonsArray) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiryTimestap = expiryTimestap;
        this.botAdmins = botAdmins;
        this.reasons = reasonsArray;
    };

    async init() {
        this.authProvider = new RefreshableAuthProvider(
            this.authProvider = new StaticAuthProvider(
                this.clientId,
                this.accessToken,
                ['moderation:read', 'chat:read', 'chat:edit', 'channel:moderate'],
            ), 
            {
                clientSecret: this.clientSecret,
                refreshToken: this.refreshToken,
                expiry: this.expiryTimestamp === null ? null : new Date(this.expiryTimestamp),
                onRefresh: async ({ accessToken, refreshToken, expiryDate }) => {
                    const newTokenData = {
                        accessToken,
                        refreshToken,
                        expiryTimestamp: expiryDate === null ? null : expiryDate.getTime()
                    };
                    await Token.updateOne({}, {
                        $set: newTokenData
                    })

                }

            }
        );
        this.chatClient = new ChatClient(this.authProvider, { channels: ['stopbwbot'] });
        this.apiClient = new ApiClient({ authProvider: this.authProvider });
        this.pubSubClient = new PubSubClient();
    }
    async getUserId() {
        try {
            // const channelId = await this.apiClient.helix.users.getUserByName('joebarbaroef');
            // console.log(channelId.id);
            return await this.pubSubClient.registerUserListener(this.apiClient);
        } catch (err) {
            console.error(err);
        }
    }
    async connect() {
        try {
            this.chatClient.connect().then(() => {
                console.log(`connect`);
                this.chatClient.onMessage(async (channel, user, message) => {
                    if (user === 'stopbwbot') return;

                    if (this.botAdmins.indexOf(user) === -1) {
                        await this.chatClient.say(channel, 'У вас нет прав на выполнение данной команды Sadge');
                        return;
                    }

                    const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);

                    if (!message.match(regexpCommand)) return;

                    const [raw, command, argument] = message.match(regexpCommand);
                    const { response } = commands[command.toLowerCase()] || {}
                    if (typeof response === 'function') {
                        switch (command) {
                            case 'slteam':
                                await this.chatClient.say(channel, `Подключаюсь к скваду ${argument}... modCheck`);
                                break;
                            default:
                                break;
                        }
                            
                        const AsyncFunction = (async () => {}).constructor;
                        if(response instanceof AsyncFunction) {
                            const data = await response({ user, argument });
                            await this.chatClient.say(channel, data);
                        } else {
                            await this.chatClient.say(channel, response(argument))
                        }
                    } else if (typeof response === 'string') {
                        await this.chatClient.say(channel, response);
                    } else {
                        await this.chatClient.say(channel, 'Я не знаю такой команды Sadge');
                    }
                });
            });

            
        } catch (err) {
            console.error(err);
        }
    }
    async modListener(userId, channelId, streamers) {
        try {
            return await this.pubSubClient.onModAction(userId, channelId, async (message) => {
                if (message.userName === 'stopbwbot') return;
    
                if (message.action !== 'ban') return;
    
                const [target, reason] = message.args;
                if (this.reasons.indexOf(reason.toLowerCase()) === -1) return;

                const squad = streamers[0].squadName;
                for(let i = 0; i <= streamers.length - 1; i++) {
                    if (channelId !== streamers[i].id) {
                        try {
                            await this.chatClient.ban(streamers[i].name, target, reason)
                            console.log(`${streamers[i].name} ${target} has been banned stopbwbot ${reason}!`);
                        } catch (err) {
                            console.error(err);
                        }
                    };
                }
                await this.chatClient.say('stopbwbot', `StopBWbot забанил ${target} на всех стримах ${squad} monkaW`);
            });
        } catch (err) {
            console.error(err);
            return null;
        }
    }
    async getStreamersFromTeam(teamName) {
        try {
            let arr = [];
            const tags = await this.apiClient.helix.teams.getTeamByName(teamName);
            if(tags) {
                const users = await tags.getUserRelations() ;
                for(let i = 0; i <= users.length - 1; i++) {
                    arr.push({ id: users[i].id, name: users[i].name, modListener: null, teamName: tags.name });
                }
            }
            return arr;
        } catch (err) {
            console.error(err); 
            return [];
        }
    }
    async getTeamsFromUser(userName) {
        try {
            const arr = [];
            if (userName !== 'kerilv') {
                const user = await this.apiClient.helix.users.getUserByName(userName);
                const helixTeam = await this.apiClient.helix.teams.getTeamsForBroadcaster({ id: user.id });
                if(helixTeam.length !== 0) {
                    helixTeam.forEach((e) => {
                        arr.push(e.name);
                    })
                }
            } else {
                arr.push('test');
            }
            return arr;
        } catch (err) {
            console.error(err);
            return [];
        }
    }
    async clientSay(channel, message) {
        await this.chatClient.say(channel, message);
    }
}

module.exports = { StopBWBot };
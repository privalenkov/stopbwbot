const { StaticAuthProvider } = require('twitch-auth');
const { ChatClient } = require('twitch-chat-client');
const { ApiClient } = require('twitch');
const { PubSubClient } = require('twitch-pubsub-client');
const { commands } = require('./commands');


class StopBWBot {
    constructor (clientId, authToken, botAdmins, reasonsArray) {
        this.clientId = clientId;
        this.authToken = authToken;
        this.botAdmins = botAdmins;
        this.reasons = reasonsArray;
    };

    init() {
        this.authProvider = new StaticAuthProvider(
            this.clientId,
            this.authToken,
            ['moderation:read', 'chat:read', 'chat:edit', 'channel:moderate'],
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
                this.chatClient.onMessage((channel, user, message) => {
                    if (user === 'stopbwbot') return;

                    if (this.botAdmins.indexOf(user) === -1) {
                        this.chatClient.say(channel, 'У вас нет прав на выполнение данной команды Sadge');
                        return;
                    }

                    const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\W+)?(.*)?/);

                    if (!message.match(regexpCommand)) return;

                    const [raw, command, argument] = message.match(regexpCommand);
                    const { response } = commands[command.toLowerCase()] || {}

                    if (typeof response === 'function') {
                        switch (command) {
                            case 'selectsquad':
                                this.chatClient.say(channel, `Подключаюсь к скваду ${argument}... modCheck`);
                                break;
                            default:
                                break;
                        }
                            
                        const AsyncFunction = (async () => {}).constructor;
                        if(response instanceof AsyncFunction) {
                            response(argument).then((data) => this.chatClient.say(channel, data))
                        } else {
                            this.chatClient.say(channel, response(argument))
                        }
                    } else if (typeof response === 'string') {
                        this.chatClient.say(channel, response);
                    } else {
                        this.chatClient.say(channel, 'Я не знаю такой команды Sadge');
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
                if (this.reasons.indexOf(reason) === -1) return;

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
                this.chatClient.say('stopbwbot', `StopBWbot забанил ${target} на всех стримах ${squad}`);
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
            const users = await tags.getUserRelations();
            for(let i = 0; i <= users.length - 1; i++) {
                const user = await users[i].getUser();
                arr.push({ id: user.id, name: user.name, modListener: null, teamName: tags.name });
            }
            return arr;
        } catch (err) {
            console.error(err); 
        }
    }
}

module.exports = { StopBWBot };
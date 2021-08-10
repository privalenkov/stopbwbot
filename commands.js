let  streamers = '';
// const StreamerModel = require('./models/streamerModel');
const BanModel = require('./models/banModel');

const commands = {
    slteam: {
        response: async (obj) => {
            try {
                //// убрать
                if (streamers.length !== 0) {
                    return `${obj.user} Я занят. Слежу за сквадом ${obj.argument} catJAM`;
                }
                if (!obj.argument) {
                    return `${obj.user} Введите имя сквада !slteam <имя_сквада>`;
                }

                // const userTeams = await global.bot.getTeamsFromUserByName(obj.user);
                // if (userTeams.indexOf(obj.argument) === -1) {
                //     return `${obj.user} У вас нет прав на выполнение данной команды Sadge`;
                // }
                // const st = global.streamers.filter((data) => data.squadName === obj.argument);
                // const st = await StreamerModel.find({ squadName: obj.argument }, {_id: 0});

                // if(st.length !== 0) {
                //     return `Я уже слежу за сквадом ${obj.argument} Starege`;
                // }

                if (obj.argument !== 'test') {
                    streamers = await global.bot.getStreamersFromTeam(obj.argument);
                } else {
                    streamers = [
                        { id: '535189734', name: 'kerilv', modListener: null, teamName: 'test' },
                        { id: '713566718', name: 'stopbwbot', modListener: null, teamName: 'test5' },
                        { id: '438633374', name: 'anime4ort', modListener: null, teamName: 'test' },
                        { id: '520270072', name: 'joebarbaroef', modListener: null, teamName: 'test' },
                    ];  
                }
                // await StreamerModel.insertMany(streamers);
                // global.streamers = await StreamerModel.find({}, {_id: 0});
                // const st = global.streamers.filter((data) => data.squadName === obj.argument);
                
                const userId = await global.bot.getUserId();
                // for(let i=0; i <= streamers.length - 1; i++) {
                //     streamers[i].modListener = await global.bot.modListener(this.userId, streamers[i].id, streamers)
                // }
                try {
                    const filterStreamers = streamers.filter((data) => data.teamName === obj.argument);
                    const arr = [];
                    for(let i = 0; i <= filterStreamers.length - 1; i++) {
                        const res = await global.bot.chatClient.getMods(filterStreamers[i].name);
                        const resfilter = res.filter((e) => 'stopbwbot' === e);
                        if(resfilter.length === 0) arr.push(filterStreamers[i].name);
                    }
                    if(arr.length !== 0) throw new Error(arr);
                    for(let i=0; i <= streamers.length - 1; i++) {
                        streamers[i].modListener = await global.bot.modListener(userId, streamers[i].id, streamers)
                    }
                } catch (err) {
                    streamers = [];
                    return `${obj.user} Для корректной работы я должен быть модератором на всех стримах сквада. Я не модератор на стримах: ${err.message}`;
                }
                // streamers = [];


                ////// убрать
                if(streamers.length !== 0) {
                    console.log(`connected to squad ${obj.argument}`)
                    return `${obj.user} Приступил к слежению за сквадом ${obj.argument}! catJAM`;
                }
                return `${obj.user} Такого сквада я не нашел Sadge`;
            } catch (err) {
                console.error(err);
                return `${obj.user} Что-то пошло не так Sadge`;
            }
        }
    },
    help: {
        response: (cmd) => {
            switch (cmd) {
                case undefined:
                    return `Я бот, который синхронно наказывает YEPP нарушителей во всем скваде! monkaW 
                    \nДа, я создан специально для стримера bratishkinoff.
                    \nС помощью команды !help cmds можно посмотреть список моих команд.`;
                case 'selectsquad':
                    return `!slteam <имя_сквада> | 
                    С помощью этой команды, я подключаюсь к каждому чату стримеров из сквада.`;
                case 'howitwork':
                    return `1. Я подключаюсь к каждому чату стримеров из сквада.
                    \n 2. Начинаю мониторить баны, которые раздают модераторы.
                    \n 3. Если модераторы кого-то забанили с указанной причиной (banword, банворд, bw, бв) регистр не учитывается, то я баню нарушителя в каждом чате сквада.
                    \n Чтобы я мог корректно выполнять свою работу, у каждого стримера из сквада, я должен быть модератором.`;
                case 'howtostart':
                    return `1. Введите команду !slteam <имя_сквада>
                    \n 2. Сделайте меня модератором на всех стримах сквада.
                    \n 3. Готово!
                    \n Если произойдет ошибка, либо все пройдет успешно — я сообщу вам об этом.`;
                case 'status':
                    return '!status | С помощью этой команды, я могу сообщить вам о том, что сейчас я занят и веду наблюдение за нарушителями! BOOBA';
                case 'stop':
                    return '!stop или !stop <имя_стримера> | С помощью этой команды, можно остановить слежение за текущим сквадом, либо за конкретным стримером текущего сквада.'
                case 'list':
                return '!list <имя_сквада> | С помощью этой команды, можно получить список забаненых пользователей по скваду. Starege'
                case 'cmds':
                    return `
                    Команды ${Object.keys(commands).join(', ')}
                    \n Подробнее о команде !help <имя_команды>
                    \n Советую начать с !help howitwork и !help howtostart Starege
                    `;
                default:
                    return `Я не знаю такой команды Sadge`;
            }
        }
    },
    status: {
        response: () => {
            if (streamers.length !== 0) {
                const arr = [];
                const squad = streamers[0].teamName;
                streamers.forEach((obj) => {
                    arr.push(obj.name);
                })
                return `Я слежу за чатами ${arr.join(', ')} сквада ${squad} BOOBA`
            } else {
                return 'Я ни за кем не слежу pepeChill'
            }
        }
    },
    stop: {
        response: async (obj) => {

            // if (!obj.argument) {
            //     return `${obj.user} Введите имя сквада !stop <имя_сквада>`;
            // }
            // const st = await StreamerModel.find({ squadName: obj.argument }, {_id: 0});

            // if(st.length === 0) {
            //     return `${obj.user} Я не слежу за сквадом ${obj.argument} pepeChill`;
            // }
            // for (let i = 0; i <= st.length - 1; i++) {
            //     st[i].modListener = await global.bot.modListener(userId, streamers[i].id, streamers)
            // }
            // console.log(st[2])
            // st[2].modListener = await global.bot.modListener(this.userId, st[2].id, st);
            // st[2].modListener.remove();
            // for (let i = 0; i <= st.length - 1; i++) {
            //     await pubsub.remove();
            // }
            // await StreamerModel.deleteMany({ squadName: obj.argument });
            // console.log(`disconnected from squad ${obj.argument}`)
            // return `${obj.user} перестал следить за сквадом ${obj.argument} pepeChill`;
            if (streamers.length === 0) return 'А я и так ни за кем не слежу pepeChill';

            // if (!obj.argument) {
            const length = streamers.length;
            const squad = streamers[0].teamName;
            for (let i = 0; i <= length - 1; i++) {
                await streamers[0].modListener.remove();
                streamers.splice(0, 1);
            }
            console.log(`disconnected from squad ${squad}`)
            return `${obj.user} Перестал следить за сквадом ${squad} pepeChill`;
            // }

            // const index = streamers.map((e) => e.name).indexOf(obj.argument);
            // if(index > -1) {
            //     await streamers[index].modListener.remove();
            //     streamers.splice(index, 1);
            //     return `${obj.user} Перестал следить за стримером ${obj.argument}`
            // }
            // return `${obj.user} За стримером под ником ${obj.argument} я не слежу pepeChill`;
        }
    },
    list: {
        response: async (obj) => {
            if (!obj.argument) {
                return `${obj.user} Введите имя сквада !list <имя_сквада>`;
            }

            const bans = await BanModel.find({ squadName: obj.argument }, {_id: 0, userName: 1 });
            const arr = bans.map((data) => data.userName);
            return `${obj.user} Во всем скваде ${obj.argument} были забанены: ${arr.length !== 0 ? arr.join(', ') : 'пусто'}`;
        }
    }
}

module.exports = { commands };
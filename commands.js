let  streamers = '';

const commands = {
    selectsquad: {
        response: async (teamName) => {
            try {
                if (streamers.length !== 0) {
                    return `Я занят. Слежу за сквадом ${teamName} catJAM`;
                }
                const userId = await global.bot.getUserId();
                if (teamName !== 'test') {
                    streamers = await global.bot.getStreamersFromTeam(teamName);
                } else {
                    streamers = [
                        { id: '535189734', name: 'kerilv', modListener: null, squadName: 'test' },
                        { id: '713566718', name: 'stopbwbot', modListener: null, squadName: 'test' },
                        { id: '438633374', name: 'anime4ort', modListener: null, squadName: 'test' },
                        { id: '520270072', name: 'joebarbaroef', modListener: null, squadName: 'test' },
                    ];
                }
                for(let i=0; i <= streamers.length - 1; i++) {
                    streamers[i].modListener = await global.bot.modListener(userId, streamers[i].id, streamers)
                }
                console.log(`connected to squad ${teamName}`)
                return `Приступил к слежению за сквадом ${teamName}! catJAM`;
            } catch (err) {
                console.error(err);
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
                    return `!selectsquad <имя_сквада> | 
                    С помощью этой команды, я подключаюсь к каждому чату стримеров из сквада.`;
                case 'howitwork':
                    return `1. Я подключаюсь к каждому чату стримеров из сквада.
                    \n 2. Начинаю мониторить баны, которые раздают модераторы.
                    \n 3. Если модераторы кого-то забанили, я баню нарушителя в каждом чате сквада.
                    \n Чтобы я мог корректно выполнять свою работу, у каждого стримера из сквада, я должен быть модератором.`;
                case 'howtostart':
                    return `1. Введите команду !selectsquad <имя_сквада>
                    \n 2. Сделайте меня модератором на всех стримах сквада.
                    \n 3. Готово!
                    \n Если произойдет ошибка, либо все пройдет успешно — я сообщу вам об этом.`;
                case 'status':
                    return '!status | С помощью этой команды, я могу сообщить вам о том, что сейчас я занят и веду наблюдение за нарушителями! BOOBA';
                case 'stop':
                    return '!stop или !stop <имя_стримера> | С помощью этой команды, можно остановить слежение за текущим сквадом, либо за конкретным стримером текущего сквада.'
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
                const squad = streamers[0].squadName;
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
        response: async (streamerName) => {

            if (streamers.length === 0) return 'А я и так ни за кем не слежу pepeChill';

            if (!streamerName) {
                const length = streamers.length;
                for (let i = 0; i <= length - 1; i++) {
                    await streamers[0].modListener.remove();
                    streamers.splice(0, 1);
                }
                return 'Перестал следить за сквадом pepeChill'
            }

            const index = streamers.map((e) => e.name).indexOf(streamerName);
            if(index > -1) {
                await streamers[index].modListener.remove();
                streamers.splice(index, 1);
                return `Перестал следить за стримером ${streamerName}`
            }
        }
    }
}

module.exports = { commands };
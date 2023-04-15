import type TelegramBot from 'node-telegram-bot-api';

export const healthCommand = (bot: TelegramBot) =>
  bot.onText(/\/health/, async (msg) => {
    let text = '<b>Dead</b>';
    await fetch('https://inctagram.herokuapp.com/health-check')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Bad response');
        }

        text = '<b>Alive</b>';
      })
      .catch((e) => {
        throw new Error(e);
      });

    bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });
  });

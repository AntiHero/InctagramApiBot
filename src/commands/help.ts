import type TelegramBot from 'node-telegram-bot-api';

export const helpCommand = (bot: TelegramBot) =>
  bot.onText(/\/help/, (msg) => {
    interface Commands {
      '/health': string;
    }
    const commands: Commands = {
      '/health': 'Check the health of the INCTAGRAM server',
    };

    let text = 'Available commands:\n';
    for (const cmd in commands) {
      text += `<b>${cmd}</b> - ${commands[cmd as keyof Commands]}\n`;
    }

    bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });
  });

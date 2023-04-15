import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

import { helpCommand } from './commands/help';
import { healthCommand } from './commands/health';
import { changeCommand } from './commands/change';

dotenv.config();

const token = process.env.TELEGRAM_BOT_KEY as string;
const bot = new TelegramBot(token, { polling: true });

healthCommand(bot);
helpCommand(bot);
changeCommand(bot);

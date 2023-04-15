import { JSDOM, ResourceLoader, type FetchOptions } from 'jsdom';
import type TelegramBot from 'node-telegram-bot-api';
import cheerio from 'cheerio';

import api from '../../api.json';

type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface Api {
  [section: string]: {
    [method in Methods]?: {
      [endpoint: string]: {
        codes: string[];
        auth: boolean;
      };
    };
  };
}

export const changeCommand = (bot: TelegramBot) =>
  bot.onText(/\/change/, async (msg) => {
    let text = 'No changes detected';

    // await fetch('https://inctagram.herokuapp.com/api')
    await fetch('http://localhost:5000/api')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Bad response');
        }

        const html = await response.text();

        const endpoints: Api = {};

        class CustomResourceLoader extends ResourceLoader {
          fetch(url: string, options: FetchOptions) {
            if (url.split('.').includes('css')) return null;

            return super.fetch(url, options);
          }
        }

        const dom = new JSDOM(html, {
          runScripts: 'dangerously',
          resources: new CustomResourceLoader(),
          // url: 'https://inctagram.herokuapp.com/',
          url: 'http://localhost:5000/api',
        });

        await new Promise<void>((resolve) => {
          dom.window.addEventListener('load', () => {
            resolve();
          });
        });

        process.on('SIGTERM', () => {
          dom.window.close();
        });

        const $ = cheerio.load(dom.serialize());

        dom.window.document
          .querySelectorAll('button.opblock-summary-control')
          .forEach((el) => {
            el?.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
          });

        await new Promise((res) => setTimeout(res, 500));

        dom.window.document
          .querySelectorAll('div.opblock-tag-section')
          .forEach((sectionEl) => {
            const section = <string>sectionEl.querySelector('h3')?.textContent;

            const sectionObj = endpoints[section] ?? (endpoints[section] = {});

            sectionEl.querySelectorAll('.opblock').forEach(async (blockEl) => {
              const method = <Methods>(
                blockEl.querySelector('.opblock-summary-method')?.textContent
              );

              const endpoint = <string>(
                blockEl
                  .querySelector('.opblock-summary-path')
                  ?.getAttribute('data-path')
              );

              const auth = !!blockEl.querySelector('.authorization__btn');

              let methodObj = sectionObj[method] ?? (sectionObj[method] = {});
              let endpointObj =
                methodObj[endpoint] ??
                (methodObj[endpoint] = { codes: [], auth });

              blockEl.querySelectorAll('.response')?.forEach((el) => {
                const code = el.getAttribute('data-code');

                if (parseInt(code || '', 10)) {
                  endpointObj.codes.push(<string>code);
                }
              });
            });
          });

        return endpoints;
      })
      .then((endpoints) => JSON.stringify(endpoints))
      .then(console.log)
      .catch((e) => {
        console.log(e);

        throw new Error();
      });

    bot.sendMessage(msg.chat.id, text, { parse_mode: 'HTML' });
  });

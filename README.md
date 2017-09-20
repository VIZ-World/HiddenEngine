## Что такое HiddenEngine?
Hidden Engine это легкий движок для сайтов и приложений специализированных для блокчейна Steem/Golos.
## Статус разработки
Текущая версия: v0.0.5
Веб-страница: https://goldvoice.club/@hiddenengine/

### Что сделано в последнем релизе
Добавлена поддержка отложенных действий в очереди. Эта возможность внедрена и в интерфейс, теперь там можно указать delay в секундах.
![](http://on1x.com/screen/09-2017/90f9-514e.png)

Теперь не нужно запускать и настраивать nginx для проксирования запросов на определенный порт. HiddenEngine запускается на 80 и 443 порту с поддержкой SSL-сертификатов. При инсталяции генерируется новый сертификат с помощью openssl. Работает перенаправление с 80 порта на 443, чтобы исключить передачу незащищенного трафика в приложении. Пароль в json формате теперь не хранится (хранится только md5-hash).

Полностью внедрена поддержка быстрой установки всех зависимых пакетов через npm. Параллельная работа очередей Steem и Golos (нагрузка на процессор почти нулевая, возрастает только при трансляции транзакций в блокчейн).

### Планы на будущее
Написать механизм автоматического курирования постов авторов из списка с указанием задержки во времени и силой голоса.
Отдельный модуль для делегатов: выполнение publish_feed, слежение за пропущенными блоками, интерфейс для запуска/паузы на подпись блоков.
Модуль E-mail оповещений, очередь писем.

## Разработка
Легкая модульная подсистема позволяет расширять сайт или приложение отдельными файлами-модулями. Порог входа программистов снижен интуитивной структурой:
- index.js &mdash; Основной каркас приложения, который подготавливает окружение, выполняет модуль и завершает соединение (по-умолчанию включена поддержка gzip-сжатия);
- /class/ содержит классы:
	- global.js &mdash; предустановка переменных при запуске (логин и пароль по-умолчанию: admin);
	- template.js &mdash; легкий класс для html-шаблонов;
	- watchers.js &mdash; класс наблюдателя, который следит за выполнением операций из очереди;
- /module/ содержит исполняемые модули:
	- prepare.js &mdash; выполняется автоматически для каждого запроса, содержит предопределенные настройки сайта и подготовительные операции (такие как проверка авторизации администратора);
	- login.js &mdash; форма авторизации;
	- logout.js &mdash; выход;
	- change-admin.js &mdash; смена пароля администратора;
	- accounts.js &mdash; управление базой аккаунтов;
	- watch-control.js &mdash; управление наблюдателями (steem/golos);
	- upvote-circle.js &mdash; управление связкой аккаунтов, добавление в очередь задач по upvote, флагам и голосованию за делегата;
	- index.js &mdash; главный файл доступный из корня сайта, содержит служебное меню;
- /templates/ содержит html-шаблоны;
- /ssl/ содержит ssl-сертификат (генерируется автоматически при первичной установке, если есть действующий SSL-сертификат, то bundle.crt следует записать в ssl.crt, а server.key в ssl.key);
- /public/ &mdash; для публичных файлов (css/js/img);
- /uploads/ &mdash; для загружаемых файлов.

## Установка
HiddenEngine при установке запишется в автозапуск pm2, что позволит восстановить работу и состояние приложения после перезагрузки сервера.
```
cd ~
curl -sL https://raw.githubusercontent.com/creationix/nvm/v0.31.0/install.sh -o install_nvm.sh
bash install_nvm.sh
nvm ls-remote
nvm install 8.5.0
node -v
sudo apt-get install nodejs-legacy
<<<<<<< HEAD
npm install npm -g
=======
source ~/.profile
>>>>>>> 6e4c9e0280991e6de5555dbec73fef8d943fcc88
npm install express -g
npm install http -g
npm install pm2 -g
npm install cross-env -g
npm install zlib -g
npm install hash-base -g
npm install fs -g
npm install md5 -g
npm install uglify-js -g
npm install babel -g
npm install steem -g
npm install ws -g
npm install options -g
npm install babel-core -g
npm install webpack -g
npm install webpack-visualizer-plugin -g
npm install async-limiter -g
npm install npm-cli -g

mkdir -p /var/www/nodejs/
cd /var/www/nodejs/

<<<<<<< HEAD
git clone https://github.com/On1x/HiddenEngine.git && cd HiddenEngine && npm install
=======
git clone https://github.com/On1x/HiddenEngine.git
cd HiddenEngine
https://github.com/On1x/golos-js.git
cd golos-js
npm install webpack --save
npm install hash-base --save
npm install base-x --save
npm install bigi --save
npm install buffer-xor --save
npm install browserify-aes --save
npm install create-hash --save
npm install create-hmac --save
npm install is-windows --save
npm install isexe --save
npm install long --save
npm install ms --save
npm install pseudomap --save
npm install shebang-regex --save
npm install shebang-command --save
npm install ultron --save
npm install which --save
npm install webpack-visualizer-plugin --save
npm install async-limiter --save
npm install babel-core --save
npm install babel --save
npm install --save
cd ..
npm install
```
## Запуск
>>>>>>> 6e4c9e0280991e6de5555dbec73fef8d943fcc88
```
## Управление состоянием приложения
```
npm stop
npm start
pm2 monit hiddenengine
```
'use strict';

// 設定項目
const token = '<DiscordBOTのトークン>';

/**
 * やることリスト
 * 
 * MySQLの読み書き
 * PayPalとのやり取り
 * 
 */


//ログイン処理
const Discord = require('discord.js');
const client = new Discord.Client();
client.on('ready', () => {
    console.log('ready...');
    // 初期処理として、現在の権限をDBと同期する？
});

client.on('roleCreate', (role) => {
    console.log('roleCreate...');
    console.log(role.id);
    console.log(role.name);
});

client.on('roleDelete', (role) => {
    console.log('roleDelete...');
    console.log(role.id);
    console.log(role.name);
});

client.on('roleUpdate', (oldRole, newRole) => {
    // 全部の権限をなめる
    // また、名前しか変わらないようなので、名前が変わったらDB更新
    console.log('roleUpdate...');
    console.log(oldRole.id);
    console.log(oldRole.name);
    console.log(newRole.id);
    console.log(newRole.name);
});

// メッセージの受信
client.on('message', message => {
    //Bot自身の発言を無視する
    if (message.author.bot) {
        return;
    }
    let channel = message.channel;
    let author = message.author.username;

    // ここから各種メッセージに対する動作定義
    if (message.content === 'ping') {
        message.reply('Pong!');
    }

    // 完全一致
    if (message.content === '寒いね') {
        let reply_text = `寒いね`;
        // リプライで返信する
        console.log(`返信します`);
        message.reply(reply_text)
            .then(message => console.log(`Sent message: ${reply_text}`))
            .catch(console.error);
        return;
    }

    // キーワードを含む
    if (message.content.match(/おはよ/)) {
        let reply_text = `おはようございます！`;
        // リプライで返信する
        console.log(`返信します`);
        message.reply(reply_text)
            .then(message => console.log(`Sent message: ${reply_text}`))
            .catch(console.error);
        return;
    }

    if (message.content === 'おばんです') {
        // 素で書き込む
        console.log(`返信します`);
        message.channel.send(`おじんです`)
    }

    // 権限一覧
    // 本番では、ここから権限IDを取得してDBに登録する
    if (message.content === '情報') {
        console.log(message.author);
    }
    if (message.content === '一覧') {
        console.log(message.guild.roles);
    }

    // 付与と剥奪
    if (message.content === '付与') {
        message.member.addRole('483662451444023296')
            .then(console.log)
            .catch(console.error);
    }
    if (message.content === '剥奪') {
        message.member.removeRole('483662451444023296')
            .then(console.log)
            .catch(console.error);
    }


    // メッセージに対する動作定義ここまで

});
client.login(token);





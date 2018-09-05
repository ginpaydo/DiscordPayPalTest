// 設定
var paypal = require('paypal-rest-sdk');

paypal.configure({
    //sandbox（検証系） or live（本番系）
    'mode': 'sandbox', 
    // アプリごとに取得したIDとSecretを設定する
    'client_id': '<取得したID>',
    'client_secret': '<取得した秘密キー>',
    'headers': {
        'custom': 'header'
    }
});

module.exports = paypal;


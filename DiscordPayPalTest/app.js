'use strict';

var paypal = require('./paypal-configure');

// TODOリスト
// 現在のプラン解約
// 1日ごとに引き落とすプラン作成
// 1日だけでなく、1時間などは可能か？
// 各ステップでwebhook受信する


// 現在作成されているBilling Plan一覧を表示
//showBillingPlanList('CREATED', 20);

// 削除
//deleteBillingPlan('P-144886277S0308926UGAC56I');

// BillingPlan作成
//createBillingPlan("怪しいチャンネル閲覧権", "テスト用Billing Plan", "100");

// BillingPlan取得
//getBillingPlan("P-2E490996HS7163607UHDZZMI");

// BillingPlanの状態変更
//updateBillingPlan("P-2E490996HS7163607UHDZZMI", "replace", "ACTIVE");

// 有効な請求プランを使用して契約を作成する
//createBillingAgreement("P-2E490996HS7163607UHDZZMI", "この商品同意情報", "テストで～す");

// Agreementを実行（定期支払いが開始できる状態）します。
//executeBillingAgreement('EC-1G64475944210722K');

// ユーザが承認した同意情報を取得する
//getBillingAgreement("I-WCJXW3BVBDWY");

/**
 * 現在作成されているBilling Plan一覧を表示する
 * @param {string} status CREATED, ACTIVE, INACTIVE
 * @param {number} page_size 表示件数
 */
function showBillingPlanList(status, page_size) {
    var list_billing_plan = {
        'status': status,
        'page_size': page_size,
        'page': 0,
        'total_required': 'yes'
    };

    paypal.billingPlan.list(list_billing_plan, function (error, billingPlan) {
        if (error) {
            throw error;
        } else {
            console.log("--------Billing Plan一覧--------");
            if (billingPlan.total_items) {
                console.log(`${billingPlan.total_items}件`);
                console.log(`${billingPlan.total_pages}ページ`);
                billingPlan.plans.forEach(function (currentValue, index, array) {
                    console.log("--------------------------------");
                    console.log(`ID:${currentValue.id}`);
                    console.log(`状態:${currentValue.state}`);
                    console.log(`名前:${currentValue.name}`);
                    console.log(`説明:${currentValue.description}`);
                    console.log(`種別:${currentValue.type}`);
                    console.log(`作成日:${currentValue.create_time}`);
                    console.log(`更新日:${currentValue.update_time}`);
                });
            } else {
                console.log("Billing Planはありません");
            }
            console.log("--------Billing Plan一覧終わり--------");
        }
    });
}

/**
 * IDを指定してBilling Planを削除する
 * @param {string} billingPlanId 削除対象のBillingPlanID
 */
function deleteBillingPlan(billingPlanId) {
    var billing_plan_update_attributes = [
        {
            // add, remove, replace, move, copy, test
            // と書いてあったが、replaceはできないらしい
            "op": "replace",
            "path": "/",
            "value": {
                "state": "DELETED"
            }
        }
    ];

    paypal.billingPlan.get(billingPlanId, function (error, billingPlan) {
        if (error) {
            console.log(error);
            throw error;
        } else {
            paypal.billingPlan.update(billingPlanId, billing_plan_update_attributes, function (error, response) {
                if (error) {
                    console.log(error.response);
                    throw error;
                } else {
                    console.log(`billingPlanId: ${billingPlanId} の削除が完了しました`);
                }
            });
        }
    });
}


/**
 * Billing Plan（いくらの金額をどのタイミングで課金するかなど）を作成します
 * 毎日課金に設定
 * @param {string} name 名前
 * @param {string} description 説明
 * @param {string} price 1回の価格
 */
function createBillingPlan(name, description, price) {
    // currencyは統一しないとエラーになる
    var currency = "JPY";

    var billingPlanAttributes = {
        "name": name,
        "description": description,
        "merchant_preferences": {
            // 次の請求期間にPayPalが未払い残高を自動的に請求するかどうかを示します。 未払い残高は、以前に失敗した予定支払の総額です。
            "auto_bill_amount": "no",
            // 顧客が契約を解除できるURL。
            "cancel_url": "http://www.cancel.com",
            // 顧客の初期支払いが失敗した場合のアクション。
            // continue:契約は有効なままであり、支払いの失敗額は未払い残高に加算されます。 自動請求が有効な場合、PayPalは自動的に次の請求期間に未払いの残高を請求します。
            // cancel:PayPalは契約を作成しますが、初期支払いがクリアされるまで、その状態を保留に設定します。 最初の支払いがクリアされると、保留中の契約がアクティブになります。 最初の支払いが失敗した場合、保留中の契約は取り消されます。
            // 顧客の初期支払いが失敗した場合のアクション。
            "initial_fail_amount_action": "cancel",
            // 許可された支払いの失敗の最大試行回数。 デフォルト値（0）は、無限の支払い失敗の試行を定義します。
            "max_fail_attempts": "0",
            // 顧客が契約を承認できるURL。
            "return_url": "http://www.success.com",
            "setup_fee": {
                "currency": currency,
                "value": "30"
            }
        },
        "payment_definitions": [
            {
                // 価格
                "amount": {
                    "currency": currency,
                    "value": price
                },
                // 輸送量と税
                "charge_models": [
                    {
                        "amount": {
                            "currency": currency,
                            "value": "10"
                        },
                        "type": "SHIPPING"
                    },
                    {
                        "amount": {
                            "currency": currency,
                            "value": "20"
                        },
                        "type": "TAX"
                    }
                ],
                // 何回払いか。0だと無限。
                "cycles": "0",
                // 引き落としの周期、MONTH、DAY
                "frequency": "DAY",
                "frequency_interval": "1",
                "name": "閲覧代",
                // TRIAL or REGULAR
                "type": "REGULAR"
            },
            // 2件目
            {
                "amount": {
                    "currency": currency,
                    "value": "1"
                },
                "charge_models": [
                    {
                        "amount": {
                            "currency": currency,
                            "value": "1"
                        },
                        "type": "SHIPPING"
                    },
                    {
                        "amount": {
                            "currency": currency,
                            "value": "1"
                        },
                        "type": "TAX"
                    }
                ],
                "cycles": "4",
                "frequency": "MONTH",
                "frequency_interval": "1",
                "name": "こっちは選択しないこと",
                "type": "TRIAL"
            }
        ],
        "type": "INFINITE"
    };

    // Billing Plan作成を実行する
    paypal.billingPlan.create(billingPlanAttributes, function (error, billingPlan) {
        if (error) {
            console.log(error);
            throw error;
        } else {
            console.log("Billing Planを作成しました");
            console.log(`ID:${billingPlan.id}`);
            console.log(`状態:${billingPlan.state}`);
            console.log(`名前:${billingPlan.name}`);
            console.log(`説明:${billingPlan.description}`);
            console.log(`種別:${billingPlan.type}`);
            console.log(`作成日:${billingPlan.create_time}`);
            console.log(`更新日:${billingPlan.update_time}`);
            if (billingPlan.payment_definitions) {
                billingPlan.payment_definitions.forEach(function (currentValue, index, array) {
                    console.log(`------------支払い定義${index}------------`);
                    console.log(`ID:${currentValue.id}`);
                    console.log(`名前:${currentValue.name}`);
                    console.log(`種別:${currentValue.type}`);
                    console.log(`請求周期:${currentValue.frequency_interval}${currentValue.frequency}`);
                    console.log(`価格:${currentValue.amount.value}${currentValue.amount.currency}`);
                    console.log(`支払回数（0は無限）:${currentValue.cycles}`);
                });
            }
            console.log(`------------商業設定------------`);
            console.log(`初期費用:${billingPlan.merchant_preferences.setup_fee}`);
            console.log(`支払失敗の最大試行回数:${billingPlan.merchant_preferences.max_fail_attempts}`);
            console.log(`顧客が契約を承認できるURL:${billingPlan.merchant_preferences.return_url}`);
            console.log(`顧客が契約を解除できるURL:${billingPlan.merchant_preferences.cancel_url}`);
            console.log(`通知URL:${billingPlan.merchant_preferences.notify_url}`);
            //console.log(`ID:${billingPlan.merchant_preferences.id}`);
            //console.log(`状態:${billingPlan.merchant_preferences.state}`);
            console.log(`次の請求期間にPayPalが未払い残高を自動的に請求するか:${billingPlan.merchant_preferences.auto_bill_amount}`);
            console.log(`顧客の初期支払いが失敗した場合のアクション:${billingPlan.merchant_preferences.initial_fail_amount_action}`);
        }
    });
}


/**
 * IDを指定してBilling Planを取得する
 * @param {string} billingPlanId Billing PlanのID
 */
function getBillingPlan(billingPlanId) {
    paypal.billingPlan.get(billingPlanId, function (error, billingPlan) {
        if (error) {
            console.log(error);
            throw error;
        } else {
            console.log("Billing Planの情報を取得しました");
            console.log(`ID:${billingPlan.id}`);
            console.log(`状態:${billingPlan.state}`);
            console.log(`名前:${billingPlan.name}`);
            console.log(`説明:${billingPlan.description}`);
            console.log(`種別:${billingPlan.type}`);
            console.log(`作成日:${billingPlan.create_time}`);
            console.log(`更新日:${billingPlan.update_time}`);
            if (billingPlan.payment_definitions) {
                billingPlan.payment_definitions.forEach(function (currentValue, index, array) {
                    console.log(`------------支払い定義${index}------------`);
                    console.log(`ID:${currentValue.id}`);
                    console.log(`名前:${currentValue.name}`);
                    console.log(`種別:${currentValue.type}`);
                    console.log(`請求周期:${currentValue.frequency_interval}${currentValue.frequency}`);
                    console.log(`価格:${currentValue.amount.value}${currentValue.amount.currency}`);
                    console.log(`支払回数（0は無限）:${currentValue.cycles}`);
                });
            }
            console.log(`------------商業設定------------`);
            console.log(`初期費用:${billingPlan.merchant_preferences.setup_fee}`);
            console.log(`支払失敗の最大試行回数:${billingPlan.merchant_preferences.max_fail_attempts}`);
            console.log(`顧客が契約を承認できるURL:${billingPlan.merchant_preferences.return_url}`);
            console.log(`顧客が契約を解除できるURL:${billingPlan.merchant_preferences.cancel_url}`);
            console.log(`通知URL:${billingPlan.merchant_preferences.notify_url}`);
            //console.log(`ID:${billingPlan.merchant_preferences.id}`);
            //console.log(`状態:${billingPlan.merchant_preferences.state}`);
            console.log(`次の請求期間にPayPalが未払い残高を自動的に請求するか:${billingPlan.merchant_preferences.auto_bill_amount}`);
            console.log(`顧客の初期支払いが失敗した場合のアクション:${billingPlan.merchant_preferences.initial_fail_amount_action}`);
        }
    });
}


/**
 * IDを指定してBilling Planの状態を更新する（有効化する）
 * @param {string} billingPlanId 対象のBillingPlanのID
 * @param {string} op 実施する操作：replaceなど
 * @param {string} state 更新後の状態：ACTIVEなど
 */
function updateBillingPlan(billingPlanId, op, state) {
    // BillingPlanの更新指示
    var billingPlanUpdateAttributes = [
        {
            "op": op,
            "path": "/",
            "value": {
                "state": state
            }
        }
    ];

    // ステータスをACTIVEに更新する
    paypal.billingPlan.update(billingPlanId, billingPlanUpdateAttributes, function (error, response) {
        if (error) {
            if (error.response.details[0].issue === 'Plan already in same state') {
                console.log(`既に${state}になっているようです`);
            } else {
                console.log(error);
                throw error;
            }
        } else {
            paypal.billingPlan.get(billingPlanId, function (error, billingPlan) {
                if (error) {
                    console.log(error.response);
                    throw error;
                } else {
                    console.log(`${billingPlanId}の状態を${billingPlan.state}に変更しました`);
                }
            });
        }
    });
}


/**
 * ACTIVEな請求プランを使用して同意情報を作成する
 * @param {any} billingPlanId 対象の請求プラン
 * @param {any} name 
 * @param {any} description ユーザの同意画面で「売り手からのメッセージ」として表示される
 */
function createBillingAgreement(billingPlanId, name, description) {
    // 請求契約書の開始時刻を現在と同じ時刻にしてはいけない（validation_errorになる）
    var isoDate = new Date();
    isoDate.setSeconds(isoDate.getSeconds() + 100);
    isoDate.toISOString().slice(0, 19) + 'Z';

    // 同意情報
    var billingAgreementAttributes = {
        "name": name,
        "description": description,
        "start_date": isoDate,
        // ここは作成したBillingPlanを取得してから書き換えるのでダミー
        "plan": {
            "id": "P-????????????????????????"
        },
        "payer": {
            // bank, credit_card(payment_card?) or paypal
            "payment_method": "paypal"
        }
        //,
        //// 支払いの配送先情報、ユーザがPayPalアカウントに設定しているデフォルト配送先と同じ場合は不要
        //// （ユーザがアクセスする購入ページの「配送先」に表示される）
        //"shipping_address": {
        //    "line1": "StayBr111idge Suites",
        //    "line2": "Cro12ok Street",
        //    "city": "San Jose",
        //    "state": "CA",
        //    "postal_code": "95112",
        //    "country_code": "US"
        //}
    };
    billingAgreementAttributes.plan.id = billingPlanId;

    paypal.billingAgreement.create(billingAgreementAttributes, function (error, billingAgreement) {
        if (error) {
            console.log(error);
            throw error;
        } else {
            console.log("支払い同意情報を作成しました");
            console.log(`名前:${billingAgreement.name}`);
            console.log(`説明:${billingAgreement.description}`);
            console.log(`開始日:${billingAgreement.start_date}`);
            console.log(`-----------請求プラン-----------`);
            console.log(`ID:${billingAgreement.plan.id}`);
            console.log(`状態:${billingAgreement.plan.state}`);
            console.log(`名前:${billingAgreement.plan.name}`);
            console.log(`説明:${billingAgreement.plan.description}`);
            console.log(`種別:${billingAgreement.plan.type}`);
            if (billingAgreement.plan.payment_definitions) {
                billingAgreement.plan.payment_definitions.forEach(function (currentValue, index, array) {
                    console.log(`------------支払い定義${index}------------`);
                    console.log(`ID:${currentValue.id}`);
                    console.log(`名前:${currentValue.name}`);
                    console.log(`種別:${currentValue.type}`);
                    console.log(`請求周期:${currentValue.frequency_interval}${currentValue.frequency}`);
                    console.log(`価格:${currentValue.amount.value}${currentValue.amount.currency}`);
                    console.log(`支払回数（0は無限）:${currentValue.cycles}`);
                });
            }
            console.log(`------------商業設定------------`);
            console.log(`初期費用:${billingAgreement.plan.merchant_preferences.setup_fee.value}${billingAgreement.plan.merchant_preferences.setup_fee.currency}`);
            console.log(`支払失敗の最大試行回数:${billingAgreement.plan.merchant_preferences.max_fail_attempts}`);
            console.log(`顧客が契約を承認できるURL:${billingAgreement.plan.merchant_preferences.return_url}`);
            console.log(`顧客が契約を解除できるURL:${billingAgreement.plan.merchant_preferences.cancel_url}`);
            console.log(`通知URL:${billingAgreement.plan.merchant_preferences.notify_url}`);
            console.log(`次の請求期間にPayPalが未払い残高を自動的に請求するか:${billingAgreement.plan.merchant_preferences.auto_bill_amount}`);
            console.log(`顧客の初期支払いが失敗した場合のアクション:${billingAgreement.plan.merchant_preferences.initial_fail_amount_action}`);

            for (var index = 0; index < billingAgreement.links.length; index++) {
                if (billingAgreement.links[index].rel === 'approval_url') {
                    var approval_url = billingAgreement.links[index].href;
                    console.log("このURLをユーザに送る");
                    console.log(approval_url);
                    console.log(`TokenID:${approval_url.split('=').pop()}`);
                }
            }
        }
    });
}

/**
 * 請求契約書を作成した後に実行します。
 * Agreementを実行（定期支払いが開始できる状態）します。
 * @param {any} paymentToken 支払いトークンID(EC-?????????????????)
 */
function executeBillingAgreement(paymentToken) {
    paypal.billingAgreement.execute(paymentToken, {}, function (error, billingAgreement) {
        if (error) {
            console.log(error);
            throw error;
        } else {
            console.log("支払いを承認しました");
            console.log(billingAgreement);
            console.log(`ID:${billingAgreement.id}`);
            console.log(`状態:${billingAgreement.state}`);
            console.log(`説明:${billingAgreement.description}`);
            console.log(`開始日:${billingAgreement.start_date}`);
            console.log(`------------顧客情報------------`);
            console.log(`支払方法:${billingAgreement.payer.payment_method}`);
            console.log(`状態:${billingAgreement.payer.status}`);
            console.log(`メールアドレス:${billingAgreement.payer.payer_info.email}`);
            console.log(`姓:${billingAgreement.payer.payer_info.last_name}`);
            console.log(`名:${billingAgreement.payer.payer_info.first_name}`);
            console.log(`顧客ID:${billingAgreement.payer.payer_info.payer_id}`);
            // デフォルトに設定した住所
            console.log(`住所:`);
            console.log(billingAgreement.payer.payer_info.shipping_address);
            console.log(`------------配送先情報------------`);
            console.log(billingAgreement.shipping_address);
            console.log(`------------支払いプラン情報------------`);
            if (billingAgreement.plan.payment_definitions) {
                billingAgreement.plan.payment_definitions.forEach(function (currentValue, index, array) {
                    console.log(`------------支払い定義${index}------------`);
                    //console.log(`ID:${currentValue.id}`);
                    //console.log(`名前:${currentValue.name}`);
                    console.log(`種別:${currentValue.type}`);
                    console.log(`請求周期:${currentValue.frequency_interval}${currentValue.frequency}`);
                    console.log(`価格:${currentValue.amount.value}${currentValue.amount.currency}`);
                    console.log(`支払回数（0は無限）:${currentValue.cycles}`);
                });
            }
            console.log(`------------同意情報------------`);
            console.log(`未払い料金:${billingAgreement.agreement_details.outstanding_balance.value}${billingAgreement.agreement_details.outstanding_balance.currency}`);
            console.log(`支払い予定回数:${billingAgreement.agreement_details.cycles_remaining}`);
            console.log(`支払った回数:${billingAgreement.agreement_details.cycles_completed}`);
            console.log(`次回の支払い時刻:${billingAgreement.agreement_details.next_billing_date}`);
            console.log(`直近の支払い時刻:${billingAgreement.agreement_details.last_payment_date}`);
            console.log(`直近の支払い額:${billingAgreement.agreement_details.last_payment_amount.value}${billingAgreement.agreement_details.last_payment_amount.currency}`);
            //console.log(`:${billingAgreement.agreement_details.final_payment_date}`);
            console.log(`支払い失敗回数:${billingAgreement.agreement_details.failed_payment_count}`);
        }
    });
}

/**
 * ユーザが承認した同意情報を取得する
 * @param {any} billingAgreementId
 */
function getBillingAgreement(billingAgreementId) {
    paypal.billingAgreement.get(billingAgreementId, function (error, billingAgreement) {
        if (error) {
            console.log(error);
            throw error;
        } else {
            console.log("同意情報を取得しました");
            console.log(`ID:${billingAgreement.id}`);
            console.log(`状態:${billingAgreement.state}`);
            console.log(`説明:${billingAgreement.description}`);
            console.log(`開始日:${billingAgreement.start_date}`);
            console.log(`------------顧客情報------------`);
            console.log(`支払方法:${billingAgreement.payer.payment_method}`);
            console.log(`状態:${billingAgreement.payer.status}`);
            console.log(`メールアドレス:${billingAgreement.payer.payer_info.email}`);
            console.log(`姓:${billingAgreement.payer.payer_info.last_name}`);
            console.log(`名:${billingAgreement.payer.payer_info.first_name}`);
            console.log(`顧客ID:${billingAgreement.payer.payer_info.payer_id}`);
            // デフォルトに設定した住所
            console.log(`住所:`);
            console.log(billingAgreement.payer.payer_info.shipping_address);
            console.log(`------------配送先情報------------`);
            console.log(billingAgreement.shipping_address);
            console.log(`------------支払いプラン情報------------`);
            if (billingAgreement.plan.payment_definitions) {
                billingAgreement.plan.payment_definitions.forEach(function (currentValue, index, array) {
                    console.log(`------------支払い定義${index}------------`);
                    //console.log(`ID:${currentValue.id}`);
                    //console.log(`名前:${currentValue.name}`);
                    console.log(`種別:${currentValue.type}`);
                    console.log(`請求周期:${currentValue.frequency_interval}${currentValue.frequency}`);
                    console.log(`価格:${currentValue.amount.value}${currentValue.amount.currency}`);
                    console.log(`支払回数（0は無限）:${currentValue.cycles}`);
                });
            }
            console.log(`------------同意情報------------`);
            console.log(`未払い料金:${billingAgreement.agreement_details.outstanding_balance.value}${billingAgreement.agreement_details.outstanding_balance.currency}`);
            console.log(`支払い予定回数:${billingAgreement.agreement_details.cycles_remaining}`);
            console.log(`支払った回数:${billingAgreement.agreement_details.cycles_completed}`);
            console.log(`次回の支払い時刻:${billingAgreement.agreement_details.next_billing_date}`);
            console.log(`直近の支払い時刻:${billingAgreement.agreement_details.last_payment_date}`);
            console.log(`直近の支払い額:${billingAgreement.agreement_details.last_payment_amount.value}${billingAgreement.agreement_details.last_payment_amount.currency}`);
            //console.log(`:${billingAgreement.agreement_details.final_payment_date}`);
            console.log(`支払い失敗回数:${billingAgreement.agreement_details.failed_payment_count}`);
        }
    });
}



// ■終わり
console.log('処理中');
setTimeout(() => {
    console.log('閉じる');
}, 100000);


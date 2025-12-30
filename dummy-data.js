(function () {
    // 1. ダミーデータの定義（総額が1,500万円程度になるように調整）
    const dummyAssets = [
        { name: "預金・現金・暗号資産", y: 6250000, color: "#2294E0" },
        { name: "株式(現物)", y: 4800000, color: "#E54D42" },
        { name: "投資信託", y: 2450000, color: "#F0AD4E" },
        { name: "年金", y: 1250000, color: "#5CB85C" },
        { name: "ポイント", y: 250000, color: "#9B59B6" }
    ];

    // 2. マネーフォワードの変数をダミーで上書き
    window.wrappedJSObject ? window.wrappedJSObject.assetClassRatio = cloneInto(dummyAssets, window) : window.assetClassRatio = dummyAssets;

    // 3. 各詳細テーブルのHTMLをダミーで書き換え
    const tableTemplates = {
        'portfolio_det_depo': `
            <thead><tr><th>種類・名称</th><th>保有金融機関</th><th>残高</th></tr></thead>
            <tbody>
                <tr><td>普通預金</td><td>💰️三菱UFJ銀行</td><td>4,500,000円</td></tr>
                <tr><td>普通預金</td><td>💰️楽天銀行</td><td>1,500,000円</td></tr>
                <tr><td>ビットコイン</td><td>💰️bitFlyer</td><td>250,000円</td></tr>
            </tbody>`,
        'portfolio_det_eq': `
            <thead><tr><th>コード</th><th>銘柄名</th><th>保有金融機関</th><th>評価額</th></tr></thead>
            <tbody>
                <tr><td>7203</td><td>トヨタ自動車</td><td>💰️野村證券</td><td>2,000,000円</td></tr>
                <tr><td>AAPL</td><td>Apple Inc.</td><td>💰️サクソバンク証券</td><td>1,800,000円</td></tr>
                <tr><td>9984</td><td>ソフトバンクグループ</td><td>💰️楽天証券</td><td>1,000,000円</td></tr>
            </tbody>`,
        'portfolio_det_mf': `
            <thead><tr><th>銘柄名</th><th>保有金融機関</th><th>評価額</th></tr></thead>
            <tbody>
                <tr><td>eMAXIS Slim 全世界株式(オール・カントリー)</td><td>💰️SBI証券</td><td>1,450,000円</td></tr>
                <tr><td>eMAXIS Slim 米国株式(S&P500)</td><td>💰️SBI証券</td><td>1,000,000円</td></tr>
            </tbody>`,
        'portfolio_det_pns': `
            <thead><tr><th>名称</th><th>現在価値</th></tr></thead>
            <tbody>
                <tr><td>企業型確定拠出年金</td><td>850,000円</td></tr>
                <tr><td>個人年金保険</td><td>400,000円</td></tr>
            </tbody>`,
        'portfolio_det_po': `
            <thead><tr><th>名称</th><th>保有金融機関</th><th>現在の価値</th></tr></thead>
            <tbody>
                <tr><td>楽天ポイント</td><td>💰️楽天</td><td>150,000円</td></tr>
                <tr><td>Vポイント</td><td>💰️三井住友カード</td><td>100,000円</td></tr>
            </tbody>`
    };

    // テーブルの書き換え実行
    Object.keys(tableTemplates).forEach(id => {
        let sec = document.getElementById(id);
        if (!sec) {
            sec = document.createElement('div');
            sec.id = id;
            sec.style.display = 'none';
            document.body.appendChild(sec);
        }
        sec.innerHTML = `<table>${tableTemplates[id]}</table>`;
    });

    // 4. 既存のアドオン表示を削除して再描画
    const oldChart = document.getElementById('custom-bar-chart');
    if (oldChart) oldChart.remove();

    // アドオンの injectChart 関数を強制呼び出し（グローバルにある場合）
    if (typeof injectChart === 'function') {
        injectChart();
    } else {
        console.log("ダミーデータをセットしました。ページをリロードせずに、アドオンが自動で描画するのを待つか、アドオンのコードを再度コンソールに貼ってください。");
    }
})();
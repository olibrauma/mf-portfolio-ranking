const injectChart = () => {
    // Firefoxのサンドボックス制限を越えてデータにアクセス
    const rawData = window.wrappedJSObject?.assetClassRatio;

    // データがない、または既に描画済みの場合は何もしない
    if (!rawData || document.getElementById('custom-bar-chart')) return false;

    const grandTotal = Array.from(rawData).reduce((sum, item) => sum + item.y, 0);

    // データが0（読み込み中）の場合もスキップ
    if (grandTotal === 0) return false;

    const today = new Date();
    const formattedDate = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

    const getDetails = (id, classColor) => {
        const section = document.getElementById(id);
        if (!section) return [];
        const table = section.querySelector('table');
        if (!table) return [];

        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
        const valIdx = headers.findIndex(h => ["残高", "評価額", "現在価値", "現在の価値"].some(t => h.includes(t)));
        const nameIdx = headers.findIndex(h => ["種類・名称", "銘柄名", "名称"].some(t => h.includes(t)));
        const bankIdx = headers.findIndex(h => h.includes("保有金融機関"));

        const details = Array.from(table.querySelectorAll('tbody tr')).map(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 0) return null;

            let rawName = cells[nameIdx]?.innerText.trim() || "不明";
            const valStr = cells[valIdx]?.innerText.trim() || "0円";
            const valNum = parseInt(valStr.replace(/[円,]/g, ''), 10) || 0;
            const bankName = cells[bankIdx]?.innerText.trim() || "";

            let displayName = rawName;
            let showBank = true;

            switch (id) {
                case 'portfolio_det_eq':
                    const code = cells[0]?.innerText.trim();
                    displayName = `${rawName} (${code})`;
                    break;
                case 'portfolio_det_pns':
                    showBank = false;
                    break;
            }

            const subInfo = (showBank && bankName) ? `(${bankName})` : "";
            const percent = (valNum / grandTotal) * 100;

            return {
                name: displayName,
                subInfo: subInfo,
                valueStr: valStr,
                valueNum: valNum,
                totalPercent: percent.toFixed(2),
                barColor: classColor
            };
        }).filter(d => d !== null);

        return details.sort((a, b) => b.valueNum - a.valueNum);
    };

    const idMap = {
        "預金・現金・暗号資産": "portfolio_det_depo",
        "株式(現物)": "portfolio_det_eq",
        "投資信託": "portfolio_det_mf",
        "年金": "portfolio_det_pns",
        "ポイント": "portfolio_det_po"
    };

    const sortedData = Array.from(rawData)
        .filter(item => item.y > 0)
        .sort((a, b) => b.y - a.y)
        .map(item => ({
            ...item,
            details: getDetails(idMap[item.name], item.color)
        }));

    const chartContainer = document.createElement('div');
    chartContainer.id = 'custom-bar-chart';
    chartContainer.style.cssText = `background:#fff; padding:30px; margin:0 0 40px 0; border-radius:16px; font-family:sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.08); color:#333;`;

    chartContainer.innerHTML = `
        <div style="margin-bottom:25px; padding-bottom:15px; border-bottom:1px solid #f0f0f0;">
            <h3 style="margin:0; font-size:20px; font-weight:700;">資産構成ポートフォリオ</h3>
            <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:14px; color:#666;">
                <span>資産総額: <strong>${grandTotal.toLocaleString()}円</strong></span>
                <span>${formattedDate} 時点</span>
            </div>
        </div>
    `;

    sortedData.forEach((item, index) => {
        const classPercent = ((item.y / grandTotal) * 100).toFixed(1);
        const rowId = `detail-${index}`;
        const arrowId = `arrow-${index}`;
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '24px';
        const rightAreaWidth = "220px";

        wrapper.innerHTML = `
            <div style="cursor:pointer; user-select:none;" id="btn-${index}">
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span id="${arrowId}" style="display:inline-block; width:0; height:0; border-style:solid; border-width:5px 0 5px 8.7px; border-color:transparent transparent transparent #ccc; transition:transform 0.2s;"></span>
                        <span style="font-size:15px; font-weight:600;">${item.name}</span>
                    </div>
                    <div style="display: flex; justify-content: flex-end; width: ${rightAreaWidth}; gap: 20px;">
                        <span style="font-size:14px; text-align: right; flex: 1;">${item.y.toLocaleString()}円</span>
                        <span style="font-size:14px; font-weight:700; width: 60px; text-align: right;">${classPercent}%</span>
                    </div>
                </div>
                <div style="background:#f0f2f5; border-radius:100px; height:10px; width:100%; overflow:hidden;">
                    <div style="width:${classPercent}%; background:${item.color}; height:100%; border-radius:100px;"></div>
                </div>
            </div>
            <div id="${rowId}" style="display:none; margin-top:12px; padding:4px 0 4px 26px; border-left:2px solid ${item.color}33;">
                <div style="display: flex; flex-direction: column;">
                    ${item.details.map(d => `
                        <div style="position: relative; padding: 10px 0 6px 0;">
                            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 13px; color: #555; margin-bottom: 4px;">
                                <div style="flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding-right: 10px;">
                                    ${d.name} <span style="color:#999; font-size:11px;">${d.subInfo}</span>
                                </div>
                                <div style="display: flex; justify-content: flex-end; width: ${rightAreaWidth}; gap: 20px;">
                                    <div style="text-align:right; font-family:monospace; flex: 1;">${d.valueStr}</div>
                                    <div style="text-align:right; width:60px; font-weight:600; color:#888;">${d.totalPercent}%</div>
                                </div>
                            </div>
                            <div style="width: 100%; height: 2px; background: #f0f0f0; border-radius: 2px; overflow: hidden;">
                                <div style="width: ${d.totalPercent}%; height: 100%; background: ${d.barColor}; opacity: 0.6;"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        chartContainer.appendChild(wrapper);
        const btn = wrapper.querySelector(`#btn-${index}`);
        btn.onclick = () => {
            const el = document.getElementById(rowId);
            const arr = document.getElementById(arrowId);
            const isOpen = el.style.display === 'block';
            el.style.display = isOpen ? 'none' : 'block';
            arr.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
        };
    });

    const main = document.getElementById('main-container');
    if (main) {
        main.prepend(chartContainer);
        const pie = document.getElementById('container_portfolio_pie');
        if (pie) pie.style.display = 'none';
        return true; // 成功
    }
    return false;
};

// --- 監視ロジック：ページの変化を検知して即実行 ---
const observer = new MutationObserver(() => {
    if (injectChart()) {
        observer.disconnect(); // 一度成功したら監視を止める
    }
});

observer.observe(document.body, { childList: true, subtree: true });

// 初回チェック（既にDOMがある場合）
injectChart();
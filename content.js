const injectChart = () => {
    // Firefoxのサンドボックス制限を越えてデータにアクセス
    const data = window.wrappedJSObject?.assetClassRatio;

    if (!data || document.getElementById('custom-bar-chart')) return;

    const grandTotal = data.reduce((sum, item) => sum + item.y, 0);

    const getDetails = (id) => {
        const section = document.getElementById(id);
        if (!section) return [];
        return Array.from(section.querySelectorAll('tbody tr')).map(row => {
            const cells = row.querySelectorAll('td');
            const valStr = cells[1]?.innerText.trim() || "0円";
            const valNum = parseInt(valStr.replace(/[円,]/g, ''), 10) || 0;
            return {
                name: cells[0]?.innerText.replace('💰️', '').trim() || "不明",
                valueStr: valStr,
                subName: cells[2]?.innerText.trim() || "",
                totalPercent: ((valNum / grandTotal) * 100).toFixed(2)
            };
        });
    };

    const idMap = {
        "預金・現金・暗号資産": "portfolio_det_depo",
        "株式(現物)": "portfolio_det_eq",
        "投資信託": "portfolio_det_mf",
        "年金": "portfolio_det_pns",
        "ポイント": "portfolio_det_po"
    };

    const sortedData = Array.from(data)
        .filter(item => item.y > 0)
        .sort((a, b) => b.y - a.y)
        .map(item => ({ ...item, details: getDetails(idMap[item.name]) }));

    const chartContainer = document.createElement('div');
    chartContainer.id = 'custom-bar-chart';
    chartContainer.style.cssText = `background:#fff; padding:30px; margin:0 0 40px 0; border-radius:16px; font-family:sans-serif; box-shadow:0 10px 30px rgba(0,0,0,0.08); color:#333;`;

    chartContainer.innerHTML = `
        <div style="margin-bottom:25px; padding-bottom:15px; border-bottom:1px solid #f0f0f0;">
            <h3 style="margin:0; font-size:20px; font-weight:700;">資産構成ポートフォリオ</h3>
            <div style="display:flex; justify-content:space-between; margin-top:8px; font-size:14px; color:#666;">
                <span>資産総額: <strong>${grandTotal.toLocaleString()}円</strong></span>
                <span>${new Date().toLocaleDateString()} 時点</span>
            </div>
        </div>
    `;

    sortedData.forEach((item, index) => {
        const classPercent = ((item.y / grandTotal) * 100).toFixed(1);
        const rowId = `detail-${index}`;
        const arrowId = `arrow-${index}`;
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '24px';
        wrapper.innerHTML = `
            <div style="cursor:pointer; user-select:none;" id="btn-${index}">
                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span id="${arrowId}" style="display:inline-block; width:0; height:0; border-style:solid; border-width:5px 0 5px 8.7px; border-color:transparent transparent transparent #ccc; transition:transform 0.2s;"></span>
                        <span style="font-size:15px; font-weight:600;">${item.name}</span>
                    </div>
                    <span style="font-size:14px;">${item.y.toLocaleString()}円 <span style="margin-left:10px; font-weight:700;">${classPercent}%</span></span>
                </div>
                <div style="background:#f0f2f5; border-radius:100px; height:10px; width:100%; overflow:hidden;">
                    <div style="width:${classPercent}%; background:${item.color}; height:100%; border-radius:100px;"></div>
                </div>
            </div>
            <div id="${rowId}" style="display:none; margin-top:12px; padding:4px 0 4px 26px; border-left:2px solid ${item.color}33;">
                <div style="display:grid; grid-template-columns:1fr auto auto; gap:20px; font-size:13px; color:#555;">
                    ${item.details.map(d => `
                        <div style="padding:6px 0;">${d.name} <small style="color:#aaa;">${d.subName}</small></div>
                        <div style="padding:6px 0; text-align:right;">${d.valueStr}</div>
                        <div style="padding:6px 0; text-align:right; width:55px; font-weight:600; color:#999;">${d.totalPercent}%</div>
                    `).join('')}
                </div>
            </div>
        `;
        chartContainer.appendChild(wrapper);
        setTimeout(() => {
            const btn = chartContainer.querySelector(`#btn-${index}`);
            btn.onclick = () => {
                const el = document.getElementById(rowId);
                const arr = document.getElementById(arrowId);
                const isOpen = el.style.display === 'block';
                el.style.display = isOpen ? 'none' : 'block';
                arr.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
            };
        }, 0);
    });

    const main = document.getElementById('main-container');
    if (main) main.prepend(chartContainer);
    const pie = document.getElementById('container_portfolio_pie');
    if (pie) pie.style.display = 'none';
};

// 実行（少し遅延させて読み込みを確実に）
setTimeout(injectChart, 500);
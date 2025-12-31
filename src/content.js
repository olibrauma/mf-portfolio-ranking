const injectChart = () => {
    const rawData = window.wrappedJSObject?.assetClassRatio;
    if (!rawData || document.getElementById('custom-bar-chart')) return false;

    const grandTotal = Array.from(rawData).reduce((sum, item) => sum + item.y, 0);
    if (grandTotal === 0) return false;

    const formattedDate = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });

    const getDetails = (id) => {
        const table = document.getElementById(id)?.querySelector('table');
        if (!table) return [];
        const hs = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
        const idx = {
            val: hs.findIndex(h => ["残高", "評価額", "現在価値", "現在の価値"].some(t => h.includes(t))),
            name: hs.findIndex(h => ["種類・名称", "銘柄名", "名称"].some(t => h.includes(t))),
            bank: hs.findIndex(h => h.includes("保有金融機関"))
        };
        return Array.from(table.querySelectorAll('tbody tr')).map(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length === 0) return null;
            let name = cells[idx.name]?.innerText.trim() || "不明";
            if (id === 'portfolio_det_eq') name += ` (${cells[0].innerText.trim()})`;
            const valStr = cells[idx.val]?.innerText.trim() || "0円";
            const valNum = parseInt(valStr.replace(/[円,]/g, ''), 10) || 0;
            const bank = (id !== 'portfolio_det_pns') ? cells[idx.bank]?.innerText.trim() : "";
            return { name, sub: bank ? `(${bank})` : "", valStr, valNum, pct: ((valNum / grandTotal) * 100).toFixed(2) };
        }).filter(d => d).sort((a, b) => b.valNum - a.valNum);
    };

    const idMap = { "預金・現金・暗号資産": "portfolio_det_depo", "株式(現物)": "portfolio_det_eq", "投資信託": "portfolio_det_mf", "年金": "portfolio_det_pns", "ポイント": "portfolio_det_po" };
    const sortedData = Array.from(rawData).filter(d => d.y > 0).sort((a, b) => b.y - a.y);

    const chartContainer = document.createElement('div');
    chartContainer.id = 'custom-bar-chart';

    // Header構築 (安全なDOM操作)
    const header = document.createElement('div');
    header.className = 'chart-header';
    const title = document.createElement('h3');
    title.textContent = '資産構成ポートフォリオ';
    title.style.margin = '0'; title.style.fontSize = '20px'; title.style.fontWeight = '700';

    const infoRow = document.createElement('div');
    infoRow.style.cssText = 'display:flex; justify-content:space-between; margin-top:8px; font-size:14px; color:#666;';
    infoRow.innerHTML = `<span>資産総額: <strong>${grandTotal.toLocaleString()}円</strong></span><span>${formattedDate} 時点</span>`;

    header.appendChild(title);
    header.appendChild(infoRow);
    chartContainer.appendChild(header);

    sortedData.forEach((item, i) => {
        const details = getDetails(idMap[item.name]);
        const classPct = ((item.y / grandTotal) * 100).toFixed(1);

        const assetRow = document.createElement('div');
        assetRow.className = 'asset-row';

        const mainFlex = document.createElement('div');
        mainFlex.className = 'flex-between';
        mainFlex.style.alignItems = 'flex-end';
        mainFlex.innerHTML = `
            <div style="display:flex; align-items:center; flex:1; overflow:hidden;">
                <span id="arr-${i}" class="arrow"></span>
                <span class="name-text" style="font-weight:600; font-size:15px;">${item.name}</span>
            </div>
            <div class="val-area">
                <span class="val-text">${item.y.toLocaleString()}円</span>
                <span class="pct-text">${classPct}%</span>
            </div>`;

        const progressBg = document.createElement('div');
        progressBg.className = 'progress-bg';
        const progressFill = document.createElement('div');
        progressFill.className = 'progress-fill';
        progressFill.style.width = `${classPct}%`;
        progressFill.style.background = item.color;
        progressBg.appendChild(progressFill);

        const detailBox = document.createElement('div');
        detailBox.id = `det-${i}`;
        detailBox.className = 'detail-box';

        details.forEach(d => {
            const dItem = document.createElement('div');
            dItem.className = 'detail-item';
            dItem.innerHTML = `
                <div class="flex-between">
                    <div class="name-text">${d.name} <span style="color:#999; font-size:11px;">${d.sub}</span></div>
                    <div class="val-area"><div class="val-text">${d.valStr}</div><div class="pct-text" style="color:#888;">${d.pct}%</div></div>
                </div>
                <div class="mini-bar-bg"><div class="mini-bar-fill" style="width:${d.pct}%; background:${item.color};"></div></div>`;
            detailBox.appendChild(dItem);
        });

        assetRow.appendChild(mainFlex);
        assetRow.appendChild(progressBg);
        assetRow.appendChild(detailBox);

        assetRow.addEventListener('click', (e) => {
            if (e.target.closest('.detail-box')) return;
            const isOpen = detailBox.style.display === 'block';
            detailBox.style.display = isOpen ? 'none' : 'block';
            assetRow.querySelector('.arrow').classList.toggle('open');
        });

        chartContainer.appendChild(assetRow);
    });

    const main = document.getElementById('main-container');
    if (main) {
        main.prepend(chartContainer);
        const pie = document.getElementById('container_portfolio_pie');
        if (pie) pie.style.display = 'none';
        return true;
    }
    return false;
};

const observer = new MutationObserver(() => { if (injectChart()) observer.disconnect(); });
observer.observe(document.body, { childList: true, subtree: true });
injectChart();
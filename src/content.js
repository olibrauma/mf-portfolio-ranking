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
    infoRow.style.cssText = 'display:flex; justify-content:space-between; margin-top:8px; font-size:14px; color:#666;';

    const totalSpan = document.createElement('span');
    totalSpan.textContent = '資産総額: ';
    const strongTotal = document.createElement('strong');
    strongTotal.textContent = `${grandTotal.toLocaleString()}円`;
    totalSpan.appendChild(strongTotal);

    const dateSpan = document.createElement('span');
    dateSpan.textContent = `${formattedDate} 時点`;

    infoRow.appendChild(totalSpan);
    infoRow.appendChild(dateSpan);

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
        mainFlex.style.alignItems = 'flex-end';

        const nameContainer = document.createElement('div');
        nameContainer.style.cssText = "display:flex; align-items:center; flex:1; overflow:hidden;";

        const arrow = document.createElement('span');
        arrow.id = `arr-${i}`;
        arrow.className = 'arrow';

        const nameText = document.createElement('span');
        nameText.className = 'name-text';
        nameText.style.cssText = "font-weight:600; font-size:15px;";
        nameText.textContent = item.name;

        nameContainer.appendChild(arrow);
        nameContainer.appendChild(nameText);

        const valArea = document.createElement('div');
        valArea.className = 'val-area';

        const valText = document.createElement('span');
        valText.className = 'val-text';
        valText.textContent = `${item.y.toLocaleString()}円`;

        const pctText = document.createElement('span');
        pctText.className = 'pct-text';
        pctText.textContent = `${classPct}%`;

        valArea.appendChild(valText);
        valArea.appendChild(pctText);

        mainFlex.appendChild(nameContainer);
        mainFlex.appendChild(valArea);

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
            const flexDiv = document.createElement('div');
            flexDiv.className = 'flex-between';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'name-text';
            nameDiv.textContent = d.name + ' ';
            const subSpan = document.createElement('span');
            subSpan.style.cssText = "color:#999; font-size:11px;";
            subSpan.textContent = d.sub;
            nameDiv.appendChild(subSpan);

            const valAreaDiv = document.createElement('div');
            valAreaDiv.className = 'val-area';
            const valTextDiv = document.createElement('div');
            valTextDiv.className = 'val-text';
            valTextDiv.textContent = d.valStr;
            const pctTextDiv = document.createElement('div');
            pctTextDiv.className = 'pct-text';
            pctTextDiv.style.color = '#888';
            pctTextDiv.textContent = `${d.pct}%`;
            valAreaDiv.appendChild(valTextDiv);
            valAreaDiv.appendChild(pctTextDiv);

            flexDiv.appendChild(nameDiv);
            flexDiv.appendChild(valAreaDiv);

            const miniBarBg = document.createElement('div');
            miniBarBg.className = 'mini-bar-bg';
            const miniBarFill = document.createElement('div');
            miniBarFill.className = 'mini-bar-fill';
            miniBarFill.style.width = `${d.pct}%`;
            miniBarFill.style.background = item.color;
            miniBarBg.appendChild(miniBarFill);

            dItem.appendChild(flexDiv);
            dItem.appendChild(miniBarBg);
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
async function loadHistory() {
    try {
        const response = await fetch('assets/history.txt');
        const text = await response.text();
        const lines = text.split('\n');
        
        let historyData = [];
        let currentYear = null;
        let currentYearData = null;

        lines.forEach(line => {
            if (line.trim() === '') return;
            
            if (line.match(/^\d{4}$/)) {
                currentYear = parseInt(line);
                currentYearData = {
                    year: currentYear,
                    events: []
                };
                historyData.push(currentYearData);
            } else {
                const [dateContent, imagePath] = line.split('|');
                const [month, content] = dateContent.split(': ');
                currentYearData.events.push({
                    month: parseInt(month), // 월을 숫자로 변환
                    monthStr: month, // 원본 문자열 보존
                    content,
                    imagePath
                });
            }
        });

        const sortSelect = document.getElementById('sortOrder');
        sortSelect.addEventListener('change', () => {
            renderHistory(historyData, sortSelect.value);
        });

        renderHistory(historyData, sortSelect.value);

    } catch (error) {
        console.error('연혁 로딩 실패:', error);
    }
}

function renderHistory(historyData, sortOrder) {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';

    // 연도 정렬
    const sortedData = [...historyData].sort((a, b) => {
        return sortOrder === 'asc' ? a.year - b.year : b.year - a.year;
    });

    sortedData.forEach(yearData => {
        const yearElement = document.createElement('div');
        yearElement.className = 'year';
        yearElement.innerHTML = `<h2>${yearData.year}</h2>`;
        
        const monthList = document.createElement('ul');
        monthList.className = 'month-list';
        
        // 월별 정렬
        const sortedEvents = [...yearData.events].sort((a, b) => {
            return sortOrder === 'asc' ? a.month - b.month : b.month - a.month;
        });
        
        sortedEvents.forEach(event => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="date">${event.monthStr}</span>
                <div class="content-wrapper">
                    <span class="content">${event.content}</span>
                    ${event.imagePath ? `<img src="assets/${event.imagePath}" alt="${event.content}" class="history-image">` : ''}
                </div>
            `;
            monthList.appendChild(li);
        });
        
        yearElement.appendChild(monthList);
        historyList.appendChild(yearElement);
    });
}

document.addEventListener('DOMContentLoaded', loadHistory);
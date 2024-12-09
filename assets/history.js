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
                const [dateContent, imagePaths] = line.split('|');
                const [month, ...contentParts] = dateContent.split(': ');
                const content = contentParts.join(': ').replace(/\\n/g, '<br>'); // 개행문자를 <br>로 변환
                const images = imagePaths ? imagePaths.split(',').map(path => path.trim()) : [];
                currentYearData.events.push({
                    month: parseInt(month),
                    monthStr: month,
                    content,
                    images
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

function createImageModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'none';
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    return modal;
}

function showImageModal(imageSrc) {
    const modal = document.querySelector('.modal') || createImageModal();
    modal.innerHTML = `<img src="${imageSrc}" alt="확대된 이미지" class="modal-image">`;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
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
                    <div class="image-container">
                        ${event.images.map(imagePath => 
                            `<img src="assets/${imagePath}" alt="${event.content}" class="history-image">`
                        ).join('')}
                    </div>
                </div>
            `;
            // 이미지 클릭 이벤트 추가
            const images = li.querySelectorAll('.history-image');
            images.forEach(img => {
                img.addEventListener('click', () => showImageModal(img.src));
            });
            
            monthList.appendChild(li);
        });
        
        yearElement.appendChild(monthList);
        historyList.appendChild(yearElement);
    });
}

document.addEventListener('DOMContentLoaded', loadHistory);
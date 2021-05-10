const Pagination = {};

Pagination.renderPagination = (currentItem, allPages, query) => {
    currentItem = currentItem < 1 ? 1 : currentItem;
    currentItem = currentItem > allPages[allPages.length - 1] ? 100 : currentItem;
    const footer = document.querySelector('footer');
    const paginatonSchema = [
        `<div class="page-number-container">
            <a class="page-number">1</a>
        </div>`,
        `<div class="page-number-container gap">
            <span class="gap">...</a>
        </div>`,
        `<div class="page-number-container" style="background-color: #1f6feb;">
            <a  class="page-number current-page">${currentItem}</a>
        </div>`,
        `<div class="page-number-container gap">
            <span class="gap">...</a>
        </div>`,
        `<div class="page-number-container">
            <a class="page-number last-page"> ${allPages[allPages.length - 1]}</a>
        </div>`,
    ];

    footer.innerHTML = `
    <div class="page-number-container previous">
        <a class="page-number change">
            <i class="fas fa-chevron-left"></i> Previous
        </a>
    </div>
    `;

    paginatonSchema.forEach((element) => {
        footer.innerHTML += element;
    });

    footer.innerHTML += `
    <div class="page-number-container next">
        <a class="page-number change">
            Next <i class="fas fa-chevron-right"></i>
        </a>
    </div>
    `;

    addEvents(query, allPages);
};

Pagination.controls = {
    previousPage(arrayPages, currentPageElement) {
        let currentPageValue = Number.parseInt(currentPageElement.innerText.trim());

        if (currentPageValue > arrayPages[0]) {
            currentPageElement.innerText = --currentPageValue;
            return currentPageElement.innerText;
        };

        currentPageElement.innerText = currentPageValue;
        return currentPageElement.innerText;
    },
    nextPage(arrayPages, currentPageElement) {
        const lastPage = arrayPages[arrayPages.length - 1];
        let currentPageValue = Number.parseInt(currentPageElement.innerText.trim());

        if (currentPageValue < arrayPages[arrayPages.length - 1]) {
            currentPageElement.innerText = ++currentPageValue;
            return currentPageElement.innerText;
        };

        currentPageElement.innerText = lastPage;
        return currentPageElement.innerText;
    },
    exactPage(currentPageElement, newValue) {
        currentPageElement.innerText = newValue;
        return currentPageElement.innerText;
    }
};

function changePagination(numberContainer, allPages, currentPageElement) {
    if (numberContainer.innerText.trim() == 'Previous') {
        numberContainer.addEventListener('click', e => {
            Pagination.controls.previousPage(allPages, currentPageElement);
        });
    };

    if (numberContainer.innerText.trim() == 'Next') {
        numberContainer.addEventListener('click', e => {
            Pagination.controls.nextPage(allPages, currentPageElement);
        });
    };
};

async function addEvents(query, allPages) {
    const pagesNumberContainer = document.querySelectorAll('footer div.page-number-container:not(.gap)');
    pagesNumberContainer.forEach(async (numberContainer) => {
        let currentPageElement = document.querySelector('div.page-number-container a.current-page');
        changePagination(numberContainer, allPages, currentPageElement);

        numberContainer.addEventListener('click', async (e) => {
            let newCurrentPageElement = document.querySelector('div.page-number-container a.current-page');
            mainViewElement.innerHTML = '<div class="flex load"> Loading... </div>'

            e.preventDefault();
            if (!!numberContainer.innerText.trim().match(/\d/)) {
                numberContainer.querySelector('a').href = Pagination.controls.exactPage(newCurrentPageElement, numberContainer.innerText);
            };

            const importantInfos = await getImportantInfos(query, 'desc', newCurrentPageElement.innerText);
            await renderInfos(importantInfos, newCurrentPageElement.innerText);
            document.body.scrollTop = 0;
        });
    });
};
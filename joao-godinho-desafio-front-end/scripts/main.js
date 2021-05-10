const mainViewElement = document.querySelector('div.content-view main');

(async function () {
    const searchBar = document.querySelector('div.search input');
    searchBar.addEventListener('keyup', async function (e) {
        if (e.keyCode === 13) {
            document.title = `Search · ${searchBar.value}`;
            mainViewElement.innerHTML = '<div class="flex load"> Loading... </div>'

            const importantInfos = await getImportantInfos(searchBar.value);
            await renderInfos(importantInfos);
        };
    });
})();
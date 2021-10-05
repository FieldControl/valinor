class Card {
    constructor(data) {
        this.id = data.id;
        this.url = data.url;
        this.clone_url = data.clone_url;
        this.full_name = data.full_name;
        this.description = data.description;
        this.watchers_count = data.watchers_count;
        this.stargazers_count = data.stargazers_count;
        this.language = data.language;
        this.license = data.license;
        this.updated_at = data.updated_at;
        this.open_issues = data.open_issues;
    }

    static createElement(data, cardSize) {
        if (!data) return;

        let newCard = $(`<div class="m-3 col-12 col-lg-${cardSize ? cardSize : 5} card shadow border-left-secondary pool-card" id="${data.id}">`);

        $(newCard).append(
            `<div class="card-body mb-2 d-flex align-items-center">
                <div class="w-100">
                    <div class="pb-2 d-flex justify-content-between">
                        <a class="col-12 col-sm-8 card-full-name h6" href="${data.clone_url}" target="_blank">${data.full_name}</a> 
                        <div class="col-12 col-sm-4 card-updated">${Utils.formatDateToCard(data.updated_at)} </div>
                    </div>                
                    <div class="py-1 card-description card-description-truncate">${data.description}</div>
                    <div class="py-1 d-flex justify-content-start h6">
                        <div><i class="fa fa-star-o text-warning" aria-hidden="true"></i> ${data.stargazers_count}</div>
                        <div class="ps-2"><i class="fa fa-file-code-o text-danger" aria-hidden="true"></i> ${data.language} </div>
                        <div class="ps-3"> ${data.license?.name || ''} </div>
                        <div class="ps-3"> ${data.open_issues} issues precisam de ajuda </div>
                    </div>
                </div>
            </div>`);
        return newCard;
    }
}

class Comm {
    static async doSearch(search) {
        let response = await fetch(`https://api.github.com/search/repositories${search}&sort=stars`, {
            method: 'GET'
        });
        response = await response.json()
        if (response.errors?.length > 0) return SystemMessage.sendAlert(500, response.message);
        return Utils.refresh(response, search);
    }
}

class SystemMessage {
    static sendAlert(status, message) {
        const MESSAGE = this.MESSAGE()
        if (!status) return addMessage(message, 'warning')
        switch (status) {
            case MESSAGE.OK:
                return addMessage(message, 'success')
            case MESSAGE.NOTFOUND:
                return addMessage(message, 'warning')
            case MESSAGE.INTERNALERROR:
                return addMessage(message, 'danger')
            default:
                return addMessage(message, 'warning')
        }

        function addMessage(message, status) {
            $('.system-message').append(
                `<div class="alert alert-${status} alert-dismissible fade show" role="alert">` +
                `${message}</div>`);
            document.querySelectorAll('.alert').forEach(e => e.addEventListener('mouseout', (e) => $(e.fromElement).alert('close')))
        }
    }

    static MESSAGE() {
        return { OK: 200, NOTFOUND: 404, INTERNALERROR: 500 }
    }
}

class Utils {

    static populatePool(data, pool, cardSize) {
        if (!data) return;
        $(pool).empty();
        for (let i = 0; i < data.items.length; i++) this.addCardToPool(Card.createElement(data.items[i], cardSize), pool);
    }

    static addCardToPool(data, pool) {
        if (!data || !pool) return
        let dataId = data[0].id;
        $(pool).find('#' + dataId).remove();
        $(pool).append(data);
    }

    static getPoolList(pool) {
        return $(pool).children().toArray();
    }

    static formatDateToCard(date) {
        date = new Date(date);
        let today = new Date();
        if (date.getDate() === today.getDate()) return `Atualizado ${new Date().getHours() - date.getHours()} hora(s) atrás.`
        if (today.setDate(today.getDate() - 4) <= date.getTime()) return `Atualizado ${new Date().getDate() - date.getDate()} dia(s) atrás.`
        return `Atualizado em ${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`
    }

    static pagination(totalCount, currentPage, search) {
        currentPage = currentPage.match(/[^\&]*/)[0];
        $(orderByStars).attr("href", `${search + '&page=' + currentPage + '&sort=stars'}`)
        $(orderByForks).attr("href", `${search + '&page=' + currentPage + '&sort=forks'}`)
        $(orderByUpdate).attr("href", `${search + '&page=' + currentPage + '&sort=updated'}`)

        $('.pagination').prepend(`  <li class="page-item"><a class="page-link" href="#" id="previous">Anterior</a></li>
        <li class="page-item"><a class="page-link" href="${search + '&page=1'}">1</a></li>
        <li class="page-item"><a class="page-link" href="${search + '&page=2'}">2</a></li>
        <li class="page-item"><a class="page-link" href="#" id="next">Próxima</a></li>`);

        const PAGE_SIZE = 30;
        const PAGINATION_LIMIT = 30;

        let lastPage = Math.floor(totalCount / PAGE_SIZE);
        if (lastPage <= 1) return $('.pagination').parent().hide();

        lastPage = lastPage > PAGINATION_LIMIT ? PAGINATION_LIMIT : lastPage;

        let containsLastPage = containPage(lastPage);
        if (!containsLastPage) {
            $('.pagination').children().last().before(`<li class="page-item"><a class="page-link" href="${search + '&page=' + lastPage}">${lastPage}</a></li>`);
            if (!containPage(lastPage - 1)) $($('.pagination').find(`:contains("${lastPage}")`)[0]).before(`<li class="page-item"><a class="page-link" href="${search + '&page=' + (lastPage - 1)}">${lastPage - 1}</a></li>`);
        }

        if (!(containPage(currentPage))) $(containPage(2)).after(`<li class="page-item active"><a class="page-link">${currentPage}</a></li>`);
        else $($(containPage(currentPage))[0]).addClass('active');

        for (let index = 1; index < 3; index++) {
            var reachFirst = !0;
            var reachLast = !0;
            let sidePage = currentPage - index;
            if (sidePage > 0) {
                if (!containPage(sidePage)) {
                    $(containPage(sidePage + 1)).before(`<li class="page-item"><a class="page-link" href="${search + '&page=' + sidePage}">${sidePage}</a></li>`);
                    if (index === 2) reachFirst = false;
                }
            }
            sidePage = parseInt(currentPage) + parseInt(index);
            if (sidePage < lastPage) {
                if (!containPage(sidePage)) {
                    $(containPage(sidePage - 1)).after(`<li class="page-item"><a class="page-link" href="${search + '&page=' + sidePage}">${sidePage}</a></li>`);
                    if (index === 2) reachLast = false;
                }
            }
        }

        if (!reachFirst) $(containPage(2)).after(`<li class=""><a class="page-link" >...</a></li>`);
        if (!reachLast) $(containPage(lastPage - 1)).before(`<li class=""><a class="page-link" >...</a></li>`)

        function containPage(page) {
            let matchList = $(`.pagination`).find(`li:contains("${page}")`).toArray();
            return matchList.find(li => $(li).text() == page);
        }
    }

    static refresh(data, search) {
        let page = search.match(/(?<=page=).*$/)[0];
        $(totalCounter).text(new Intl.NumberFormat().format(data.total_count) + ' repositórios encontrados')
        $(searchKey).val(decodeURIComponent(search.substring(3).match(/[^\&]*/)[0]));
        this.populatePool(data, '#searchResultPool');
        this.pagination(data.total_count, page, search.match(/[^\&]*/)[0])
    }
}
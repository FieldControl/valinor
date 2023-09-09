<template>
    <nav v-if="isShowPagination">
        <ul class="pagination justify-content-center">
            <li :class="{'page-item':true, 'disabled': isFirstPage}"  @click="prevPage">
                <p :class="{ 'page-link': true, 'text-primary': !isFirstPage }">
                    <span class="fa-solid fa-angle-left mr-2" v-if="!isFirstPage"></span>
                    Previous
                </p>
            </li>
            
            <li :class="{ 'page-item':true, 'active': isFirstPage }" @click="toPage(firstPage)">
                <p class="page-link text-light">1</p>
            </li>

            <li class="page-item disabled" v-if="isShowMoreItemsPrevPage">
                <p class="page-link" href="#">
                    ...
                </p>
            </li>
            
            <li 
                v-for="page in pages"
                :key="page"
                :class="{ 'page-item':true, 'active': currentPage == page }"
            >
                <p class="page-link text-light" @click="toPage(page)">
                    {{ page }}
                </p>
            </li>

            <li class="page-item disabled" v-if="isShowMoreItemsNextPage">
                <p class="page-link" href="#">
                    ...
                </p>
            </li>

            <li :class="{ 'page-item':true, 'active': isLastPage }" @click="toPage(lastPage)">
                <p class="page-link text-light">{{ lastPage }}</p>
            </li>

            <li :class="{'page-item':true, 'disabled': isLastPage}" @click="nextPage">
                <p :class="{ 'page-link': true  }">
                    Next
                    <span class="fa-solid fa-angle-right ml-2" v-if="!isLastPage"></span>
                </p>
            </li>
        </ul>
    </nav>
</template>

<script>
export default {
    name: 'Pagination',
    props: {
        items_count: {
            type: Number,
            default: 0
        },
        per_page: {
            type: Number,
            default: 10
        },
        visible_pages: {
            type: Number,
            default: 5
        }
    },
    methods: {
        toPage(page) {
            if (page >= this.firstPage && page <= this.lastPage) {
                this.$router.push({ query: { p: page } });
                this.$emit('toPage', page);
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        },
        nextPage() {
            this.toPage(this.currentPage + 1);
        },
        prevPage() {
            this.toPage(this.currentPage - 1);
        }
    },
    computed: {
        firstPage() {
            return 1;
        },
        lastPage() {
            const lastPage = Math.ceil(this.items_count / this.per_page);
            const lastPageMax = 100;

            return lastPage > lastPageMax ? lastPageMax : lastPage;
        },
        defaultPagesView() {
            return 2;
        },
        currentPage() {
            return Number.parseInt(this.$route.query.p || 1);
        },
        pages() {
            if(this.items_count <= this.per_page) {
                return [];
            }

            let visiblePages = this.visible_pages;
            const visiblePagesMaxCount = Math.floor(visiblePages / 2);
            let startPage = this.currentPage - visiblePagesMaxCount;

            if(this.currentPage >= (this.lastPage - visiblePagesMaxCount)) {
                startPage = this.lastPage - visiblePages;
            }

            if(startPage < this.firstPage + 1) {
                startPage = 2;
            }
           
            if(visiblePages >= this.lastPage - 1) {
                visiblePages = this.lastPage - 2;
            }

            return Array.from({ length: visiblePages}, (_, index) => startPage + index);
        },
        isLastPage() {
            return this.currentPage === this.lastPage;
        },
        isFirstPage() {
            return this.currentPage === this.firstPage;
        },
        isShowPagination() {
            return this.lastPage > 1
        },
        isShowMoreItemsPrevPage() {
            const firstAdditionalPage = this.pages[0];
            const diffPages = firstAdditionalPage - this.firstPage;

            return diffPages > 1;
        },
        isShowMoreItemsNextPage() {
            const lastAdditionalPage = this.pages[this.pages.length -1];
            const diffPages = this.lastPage - lastAdditionalPage;

            return diffPages > 1;
        }
    }
}
</script>

<style scoped>
.pagination {
    column-gap: 7px;
}

.page-item:not(.disabled) {
    cursor: pointer;
}

.page-item .page-link:hover {
    background: var(--secundary-color-background-dark) !important;
}

.page-item .page-link {
    background: transparent !important;
    min-width: 35px;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    padding: 6px 8px;
    text-align: center;
    margin-bottom: 0px;
}

.page-item.active .page-link {
    background: var(--primary-color-blue) !important;
}

/*==============================
 * MOBILE
 ==============================*/
@media (max-width: 1024px) {
    .pagination {
        column-gap: 2px;
    }

    .page-item .page-link {
        min-width: 26px;
        padding: 6px 3px;
        font-size: 11px;
    }
}
</style>
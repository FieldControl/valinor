<template>
    <section class="repository-issues">
        <div class="border border-dark rounded">
            <div class="repository-issues__header bg-dark--muted p-3 border-bottom border-dark">
                <div class="repository-issues__count">
                    <h2 class="mb-0 font-14">
                        <span class="fa-regular fa-circle-dot"></span>
                        <small class="d-none">Issues list: </small>
                        <span class="ml-2">{{ store.issuesCountFormatted }} results</span>
                    </h2>
                </div>
            </div>

            <div class="repository-issues__list">                
                <article
                    v-if="!store.loading"
                    class="repository-issues__item d-flex border-bottom border-dark px-3 py-3 py-lg-2"
                    v-for="(issue, index) in store.issues"
                    :key="index"
                >
                    <div class="repository-issues__item-icon">
                        <span class="fa-regular fa-circle-dot"></span>
                    </div>
                    
                    <div class="ml-2 col px-0">
                        <div class="repository-issues__item-infos d-flex flex-wrap align-items-center">
                            <div class="repository-issues__item-title">
                                <h3 class="mb-0 mr-2 font-16">
                                    <a class="text-light" :href="issue.url" target="_blank">
                                        {{ issue.title }}
                                    </a>
                                </h3>
                            </div>

                            <div class="repository-issues__item-tags d-flex flex-wrap">
                                <router-link
                                    to="#"
                                    class="repository-issues__item-tag font-12"
                                    v-for="(label, index) in issue.labels"
                                    :key="index"
                                    :style="{ background: label.color }"
                                >
                                    <span class="text-light">{{ label.name }}</span>
                                </router-link>
                            </div>
                        </div>

                        <div class="repository-issues__item-details mt-2 font-13 text-muted">
                            <span class="code">#{{ issue.number  }}</span>
                            <span class="opened ml-1">opened on {{ issue.opened }}</span>
                            <span class="owner ml-1">by {{ issue.owner.name }}</span>
                        </div>
                    </div>
                </article>

                <skeleton
                    v-else
                    v-for="item in store.perPage"
                    class="border-bottom border-dark px-3 pt-3 pb-2"
                >
                    <skeleton-block w="67%" h="15px" class="rounded" />
                    <skeleton-block w="7%" h="15px" class="rounded ml-2 ml-lg-4" />
                    <skeleton-block w="7%" h="15px" class="rounded ml-2 ml-lg-4" />
                    <skeleton-block w="7%" h="15px" class="rounded ml-2 ml-lg-4" />
                    <skeleton-block w="40%" h="10px" class="rounded mt-1" />
                </skeleton>
            </div>
        </div>

        <Pagination
            v-if="!store.loading"
            class="mt-5"
            :per_page="store.perPage"
            :items_count="store.issuesCount"
            @toPage="store.fetchIssues($event)"
        />
    </section>
</template>

<script>
import { useGithubRepositoryIssuesStore } from '@/stores/github/repository/details/issues';
import Pagination from '@/components/Pagination.vue';
import Skeleton from "@/components/Skeleton.vue";
import SkeletonBlock from "@/components/SkeletonBlock.vue";

export default {
    name: 'Issues',
    components: {
        Pagination,
        Skeleton,
        SkeletonBlock
    },
    setup() {
        const store = useGithubRepositoryIssuesStore();
        return { store }
    },
    created() {
        const { username, reponame } =  this.$route.params;
        const page = this.$route.query.p;

        this.store.setRepositoryFullname(username, reponame);
        this.store.fetchIssues(page);
    }
}
</script>

<style scoped>
.repository-issues__item-infos {
    row-gap: 10px;
}

.repository-issues__item-tags {
    row-gap: 8px;
    column-gap: 8px;
}

.repository-issues__item-tag {
    border-radius: 8px;
    padding: 1px 8px;
}

.repository-issues__item-title h3 {
    word-break: break-all;
}

.repository-issues__item-icon svg {
    color: var(--primary-color-green);
}

.repository-issues__item-title:hover a,
.repository-issues__item-details .text-muted:hover {
  color: var(--primary-color-blue) !important;
}
</style>
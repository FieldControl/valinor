<template>
  <main class="d-flex flex-column align-items-center">
    <h1 class="d-none">Github Search Repositories</h1>

    <div class="col-11 col-lg-5 mt-5 mb-4 text-center">
      <div class="mt-5 mb-4 text-center">
        <GitHubLogo class="d-none d-lg-inline-block" />
        <GitHubLogoMobile class="d-lg-none" />
      </div>

      <SearchInput
        placeholder="Search GitHub"
        @search="toRepositorySearch" 
      />

      <p class="mt-4 text-muted font-14">
        <span class="text-warning">
          <span class="fa-regular fa-bell"></span> Tip 
        </span>
        For an <a href="#">advanced search</a>, use our <a href="#">prefixes</a>
      </p>
    </div>
    
    <div class="col-10 col-lg-7 mt-4 text-center">
      <img src="@/assets/images/ilustration-home.webp" alt="Ilutration Home Search">
    </div>
  </main>
</template>

<script>
import SearchInput from "@/components/Form/SearchInput.vue";
import GitHubLogo from "@/components/Svg/GitHubLogo.vue";
import GitHubLogoMobile from "@/components/Svg/GitHubLogoMobile.vue";

export default {
  components: {
    SearchInput,
    GitHubLogo,
    GitHubLogoMobile
  },
  data: () => ({}),
  methods: {
    toRepositorySearch(searchTerm) {
      this.$router.push({
        name: 'searchRepository', 
        params: {
          searchTerm: searchTerm
        }
      });
    }
  }
}
</script>

<style scoped></style>
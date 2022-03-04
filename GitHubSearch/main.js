var searchClick = document.getElementById("search");
var searchUrl = "https://api.github.com/search/repositories?q=";
var searchPage = "&page=1&per_page=10";

searchClick.addEventListener("keyup", function (event) {
  if (event.keyCode === 13) {
    searchRepos(searchPage, function sumary() {
      document.getElementById("controls").style.visibility = "visible";
      var lenght = document.getElementById("numberOfRepos").value;
      lenght = parseInt(lenght);
      let perPage = 10;
      const state = {
        page: 1,
        perPage,
        totalPage: Math.ceil(lenght / perPage),
      };

      const html = {
        get(element) {
          return document.querySelector(element);
        },
      };

      const controls = {
        next() {
          state.page++;

          const lastPage = state.page > state.totalPage;
          if (lastPage) {
            state.page--;
          }
        },
        prev() {
          state.page--;

          if (state.page < 1) {
            state.page++;
          }
        },
        goTo(page) {
          state.page = page;
        },
        createListeners() {
          html.get(".first").addEventListener("click", () => {
            controls.goTo(1);
            searchPage = "&page=" + state.page + "&per_page=10";
            searchRepos(searchPage);
            Update();
          });

          html.get(".last").addEventListener("click", () => {
            controls.goTo(state.totalPage);
            searchPage = "&page=" + state.page + "&per_page=10";
            searchRepos(searchPage);
            Update();
          });

          html.get(".next").addEventListener("click", () => {
            controls.next();
            searchPage = "&page=" + state.page + "&per_page=10";
            searchRepos(searchPage);
            Update();
          });

          html.get(".prev").addEventListener("click", () => {
            controls.prev();
            searchPage = "&page=" + state.page + "&per_page=10";
            searchRepos(searchPage);
            Update();
          });
        },
      };
      controls.createListeners();

      function Update() {
        document.getElementById("number").value = state.page;
      }
    });

    function searchRepos(searchPage, callback) {
      var search = document.getElementById("search").value;
      var request = new XMLHttpRequest();
      request.open("GET", searchUrl + search + searchPage, true);

      request.onload = function searchResult() {
        var data = JSON.parse(this.response);
        var list = data.items.length;
        var statusHTML = "";
        var numberOfRepos = data.total_count;
        document.getElementById("numberOfRepos").value =
          numberOfRepos + " Repositórios";

        for (var i = 0; i < list; i++) {
          var counter = data.items[i];
          var login = data.items[i].owner.login;
          schName = counter.name;
          schDescription = counter.description;
          schWatchers = counter.watchers;
          schLanguage = counter.language;
          schUpdated = counter.updated_at;
          schUpdated = schUpdated.substr(0, 10);
          schUpdated = moment(schUpdated, "YYYY-MM-DD");
          schUpdated = schUpdated.format("DD-MM-YYYY");

          statusHTML += "<tr>";
          statusHTML += "<td>";
          statusHTML +=
            "<name id='RepoName'> " + login + "/" + schName + " </name>";
          statusHTML += "<br>";
          if (schDescription != null) {
            statusHTML +=
              "<input id='schDescription' value='" +
              schDescription +
              "' disabled />";
          }
          statusHTML += "<br>";
          if (schWatchers != 0) {
            statusHTML += "<i class='bi bi-star'></i> " + schWatchers;
          }
          if (schLanguage != null) {
            statusHTML += " <b>" + schLanguage + "</b>";
          }
          statusHTML += " <b>/ Updated at: " + schUpdated + "</b>";
          statusHTML += "</td>";
          statusHTML += "</tr>";

          $("tbody").html(statusHTML);
        }

        callback();
      };
      request.send();
    }
  }
});

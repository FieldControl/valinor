var App =
  App ||
  (function (body) {
    const inputSearch = $("#search-repositorys");
    const [animIn, animOut, animInFlex] = [
      "animate__animated animate__fadeIn d-block",
      "animate__animated animate__fadeOut d-none",
      "animate__animated animate__fadeIn d-flex",
    ];

    let dadosRepositorys = new Array();
    let dadosEmojis = new Array();
    let boxResults = $(".box-results");
    let boxRepositorys = $(".box-repositorys");
    let boxPagination = $(".box-pagination");
    let pagina = 1;
    let totalResults = 0;

    /*
     * Função responsavel pela passagem dos parametros 
     * e busca na api para mostragem dos dados.
     */

    const request = (pg) => {
      let objSend;
      objSend = { q: "", order: "desc", page: pg, per_page: 10 };
      objSend.q = inputSearch.val();
      $.ajax({
        url: Helpers.absolutePath("search/repositories"),
        data: objSend,
        method: "GET",
        dataType: "json",
        success: function (d) {
          dadosRepositorys = [];
          dadosRepositorys = d;
          if (dadosRepositorys.total_count > 0) {
            addDados(dadosRepositorys);
          } else {
            cleanDados();
          }
        },
      });
    };

    const initControlPagination = () => {
      $(".next").on("click", function () {
        request(++pagina);
      });
      $(".prev").on("click", function () {
        pagina > 1 && request(--pagina);
      });
    };

    const addDados = (dados) => {
      initListItemRepositorio(dados);
      totalResults = dados.total_count;
      $(".search-null", boxRepositorys).remove();
      $("p", boxResults).remove();
      boxResults
        .append(
          "<p><span>" +
            totalResults.toLocaleString("en-US") +
            "</span><span>repository results</span></p>"
        )
        .addClass(animIn);
      if (dados.total_count > 10) {
        boxPagination.removeClass(animOut).addClass(animInFlex);
      } else {
        boxPagination.addClass(animOut).removeClass(animInFlex);
      }
    };

    const cleanDados = () => {
      $("p", boxResults).remove();
      $(".search-null", boxRepositorys).remove();
      $(".row", boxRepositorys).remove();
      boxPagination.addClass(animOut).removeClass(animInFlex);
      boxRepositorys.append(
        "<p class='search-null'>We couldn’t find any repositories matching '" +
          inputSearch.val() +
          "'.</p>"
      );
    };

    /*
     * Função que efetua a pesquisa a partir da tecla Enter
     * envia a paginação inicial em 1 para a request.
     */

    const initSearchRepositorys = function (e) {
      inputSearch.on("keypress", function (e) {
        if (e.keyCode === 13) {
          request(1);
          $(".title-left").addClass(
            "text-mode-search animate__animated animate__fadeIn animate__slower"
          );
          $(".box-repositorys").removeClass(animOut).addClass(animIn);
        }
      });
    };

    /*
     * Função que percorre os dados provenientes da pesquisa da request
     * e inseri dinamicamente os cards com os dados em tela.
     */

    const initListItemRepositorio = function (dados) {
      $("*", ".box-repositorys").remove();
      if (dados != null) {
        let countRows = 0;
        dados.items.forEach((item) => {
          //Variaveis dos items dos repositorios
          let txtNumberStar = item.stargazers_count;
          let txtDescription = item.description;
          let txtLicense = item.license;
          let txtLanguage = item.language;
          let txtPillTopics = item.topics;
          let txtUpdateDate = new Date(item.updated_at);

          if (countRows % 1 === 0) {
            $(".box-repositorys").append(
              `<div class="row animate__animated animate__fadeIn">`
            );
          }

          const cardItem = $(`<div class="card-item-box">
            <a href="${item.html_url}" target="_blank" class="url-r">${
            item.full_name
          }</a>
            <p class="description-r"></p>
            <div class="topics-r"></div>
            <div class="footer-r">
              <div class="star-r">
                <i class="fa-regular fa-star"></i>
                <span>${Helpers.kFormatter(txtNumberStar)}</span>
              </div>
              <div class="language-r">
                <i class="fa-solid fa-circle"></i>
              </div>
              <div class="license-r"></div>
              <div class="update-r">
                <span>Updated ${txtUpdateDate.toLocaleDateString(
                  "pt-BR"
                )}</span>
              </div>
              <div class="issues-r">
                <span></span>
              </div>
            </div>
          </div>`);

          if (txtLicense != null) {
            txtLicense = item.license.name;
            $(".license-r", cardItem).append(`<span>${txtLicense}</span>`);
          } else {
            $(".license-r", cardItem).remove();
          }

          if (txtLanguage != null) {
            $(".language-r", cardItem).append(`<span>${txtLanguage}</span>`);
            switch (txtLanguage) {
              case "SCSS":
                $(".language-r i", cardItem).addClass("scss");
                break;
              case "Java":
                $(".language-r i", cardItem).addClass("java");
                break;
              case "JavaScript":
                $(".language-r i", cardItem).addClass("js");
                break;
              case "TypeScript":
                $(".language-r i", cardItem).addClass("typescript");
                break;
              case "CSS":
                $(".language-r i", cardItem).addClass("css");
                break;
              case "HTML":
                $(".language-r i", cardItem).addClass("html");
                break;
              case "C++":
                $(".language-r i", cardItem).addClass("cplus");
                break;
              case "Shell":
                $(".language-r i", cardItem).addClass("shell");
                break;
              case "Python":
                $(".language-r i", cardItem).addClass("python");
                break;
              case "Ejs":
                $(".language-r i", cardItem).addClass("ejs");
                break;
              case "Dockerfile":
                $(".language-r i", cardItem).addClass("dockerfile");
                break;
              case "Go":
                $(".language-r i", cardItem).addClass("go");
                break;
              case "Ruby":
                $(".language-r i", cardItem).addClass("ruby");
                break;
              case "PHP":
                $(".language-r i", cardItem).addClass("php");
                break;
              case "C#":
                $(".language-r i", cardItem).addClass("csharp");
                break;
              default:
                $(".language-r i", cardItem).addClass("patterns");
                break;
            }
          } else {
            $(".language-r", cardItem).remove();
          }

          if (txtPillTopics.length > 0) {
            txtPillTopics = txtPillTopics
              .toString()
              .replaceAll(",", "</span><span>");
            $(".topics-r", cardItem).append(`<span>${txtPillTopics}</span>`);
          } else {
            $(".topics-r", cardItem).remove();
          }

          if (txtDescription != null) {
            let icon = [...txtDescription.matchAll(/:\w+:/g)];
            let descriptionEmoji = txtDescription;
            if (icon.length > 0) {
              icon.forEach((i) => {
                let k = i[0].replaceAll(":", "");
                let regex = new RegExp(`:${k}:`, "g");
                descriptionEmoji = descriptionEmoji.replaceAll(
                  regex,
                  `<img src='${dadosEmojis[k]}' />`
                );
              });
            }
            $(".description-r", cardItem).append(descriptionEmoji);
          } else {
            $(".description-r", cardItem).remove();
          }

          $(".box-repositorys .row").last().append(cardItem);
          countRows++;
        });
      }
    };

    /*
     * Função que percorre os dados dos Emojis
     * com ela faço um laço procurando dentro via regeX da minha descrição
     * onde estiver ':emoji:' comparo com a lista global de emojis e substituo
     * pelo link da imagem.
     */

    const initListEmojis = function () {
      $.getJSON(Helpers.absolutePath("emojis"), function (d) {
        dadosEmojis = [];
        dadosEmojis = d;
      });
    };

    var init = function () {
      initSearchRepositorys();
      initListEmojis();
      initControlPagination();
    };

    return {
      init: init,
    };
  })(Helpers.body);
$(function () {
  App.init();
});

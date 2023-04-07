//padronizando url
import axios from "axios";

const url_default = axios.create ({
    baseURL: "https://api.github.com/search/repositories?q=",
    headers: {
        Authorization : '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'
    }, //token tem que criar no github
});

export default url_default;
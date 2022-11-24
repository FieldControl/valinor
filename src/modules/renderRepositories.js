export default function buildRepoList(repositories) {
  const repositoriesList = document.createElement("ul");
  repositories.map((repo) => {
    repositoriesList.appendChild(buildRepositoryItem(repo));
  });
  return repositoriesList;
}

function buildRepositoryItem(repository) {
  const repositoryItem = document.createElement("li");
  const wrappingDiv = document.createElement("div");
  wrappingDiv.classList.add("repo-div");

  wrappingDiv.appendChild(buildHomeAndName(repository));
  wrappingDiv.appendChild(buildLang(repository));
  wrappingDiv.appendChild(buildStars(repository));
  wrappingDiv.appendChild(buildIssues(repository));
  wrappingDiv.appendChild(buildDescription(repository));
  wrappingDiv.appendChild(buildTopics(repository));
  wrappingDiv.appendChild(buildLicense(repository));
  wrappingDiv.appendChild(buildDates(repository));

  repositoryItem.appendChild(wrappingDiv);
  return repositoryItem;
}

function buildHomeAndName(repository) {
  const homeAndName = document.createElement("div");
  homeAndName.classList.add("repo-homeAndName");

  const homepageDiv = document.createElement("div");
  homepageDiv.classList.add("repo-homepage");
  homepageDiv.innerHTML =
    repository.homepage != null
      ? `<a href="${repository.homepage}" alt="Go to homepage"><img src="./images/website.png"/></a>`
      : "";
  homeAndName.appendChild(homepageDiv);

  const nameDiv = document.createElement("div");
  nameDiv.classList.add("repo-name");
  nameDiv.innerHTML = `<a href=${repository.html_url} target="blank">${repository.full_name}</a>`;
  homeAndName.appendChild(nameDiv);

  return homeAndName;
}

function buildLang(repository) {
  const langDiv = document.createElement("div");
  langDiv.classList.add("repo-lang");
  langDiv.innerHTML = `${repository.language ?? ""}`;
  return langDiv;
}

function buildStars(repository) {
  const starsDiv = document.createElement("div");
  starsDiv.classList.add("repo-stars");
  starsDiv.innerHTML = `<img src="./images/star-filled.png" /><span>${friendlyNumber(
    repository.stargazers_count
  )}</span>`;
  return starsDiv;
}

function buildIssues(repository) {
  const issuesDiv = document.createElement("div");
  issuesDiv.classList.add("repo-issues");
  issuesDiv.innerHTML = `<span>${repository.open_issues} issues need help</span>`;
  return issuesDiv;
}

function buildDescription(repository) {
  const descDiv = document.createElement("div");
  descDiv.classList.add("repo-desc");
  descDiv.innerHTML = `${repository.description ?? "No description provided"}`;
  return descDiv;
}

function buildTopics(repository) {
  const topicsDiv = document.createElement("div");
  topicsDiv.classList.add("repo-topics");
  const topicsList = repository.topics?.reduce((topics, topic) => {
    return (topics += `<span>${topic}</span>`);
  }, "");
  topicsDiv.innerHTML = topicsList;
  return topicsDiv;
}

function buildLicense(repository) {
  const licenseDiv = document.createElement("div");
  licenseDiv.classList.add("repo-license");
  let license = "";
  if (
    repository.license?.spdx_id !== null &&
    repository.license?.spdx_id !== undefined &&
    repository.license?.spdx_id.toUpperCase() !== "NOASSERTION"
  ) {
    license = repository.license.spdx_id + " license";
  }
  licenseDiv.innerHTML = license;
  return licenseDiv;
}

function buildDates(repository) {
  const datesDiv = document.createElement("div");
  datesDiv.classList.add("repo-dates");

  const createdAtDiv = document.createElement("div");
  createdAtDiv.classList.add("repo-createdAt");
  createdAtDiv.innerText = `Criado ${friendlyDate(repository.created_at)}`;

  const updatedAtDiv = document.createElement("div");
  updatedAtDiv.classList.add("repo-updatedAt");
  updatedAtDiv.innerText = `Atualizado ${friendlyDate(repository.updated_at)}`;

  datesDiv.appendChild(createdAtDiv);
  datesDiv.appendChild(updatedAtDiv);
  return datesDiv;
}

function friendlyDate(stringDate) {
  const date = new Date(stringDate);
  const today = new Date();
  const difference = today.getTime() - date.getTime();

  const seconds = Math.floor(difference / 1000);
  if (seconds < 60) return `${seconds} segundo${seconds > 1 ? "s" : ""} atrás`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minuto${minutes > 1 ? "s" : ""} atrás`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hora${hours > 1 ? "s" : ""} atrás`;

  const days = Math.floor(hours / 24);
  if (days < 30 && date.getMonth() == today.getMonth())
    return `${days} dia${days > 1 ? "s" : ""} atrás`;

  let friendlyDate = `em ${date.getUTCDate()} de ${date.toLocaleString(
    "default",
    { month: "long" }
  )}`;
  if (date.getFullYear() != today.getFullYear) {
    friendlyDate += ` de ${date.getFullYear()}`;
  }

  return friendlyDate;
}

function friendlyNumber(number) {
  return number > 1000 ? Math.round(number / 100) / 10 + "k" : number;
}

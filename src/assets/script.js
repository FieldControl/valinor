document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("dragstart", (e) => {
    e.currentTarget.classList.add("dragging");
    console.log("arrastou");
  });

  card.addEventListener("dragend", (e) => {
    e.currentTarget.classList.remove("dragging");
    console.log("soltou");
  });
});

document.querySelectorAll(".title-column").forEach((column) => {
  column.addEventListener("dragover", (e) => {
    console.log("teste");

    e.preventDefault();
    e.currentTarget.classList.add("cards-drag");
  });

  column.addEventListener("dragleave", (e) => {
    e.currentTarget.classList.remove("cards-drag");
  });

  column.addEventListener("drop", (e) => {
    e.currentTarget.classList.remove("cards-drag");
    const dragCard = document.querySelector(".card.dragging");
    if (dragCard) {
      e.currentTarget.appendChild(dragCard);
    }
  });
});

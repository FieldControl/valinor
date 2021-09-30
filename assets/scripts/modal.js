const modal = document.querySelector('.modal');
const btnCloseModal = document.querySelector('.btn-close-modal');
const modalImg = document.querySelector('#modalImg');

function showModal(index) {
    modal.style.display = 'block';
    modalImg.src = `assets/img/work-${index}.jpg`;
}

btnCloseModal.onclick = () => { modal.style.display = 'none' }
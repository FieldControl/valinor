var typingTimer;
$(searchContent).on('keyup', (event) => {
    if (event.key === 'Enter' && event.target.value !== '') {
        clearTimeout(typingTimer);
        $(text).removeClass('display-5').addClass('display-1 text-center')
        $(text).html('Ok! Apertem os cintos!')
        return typingTimer = setTimeout(() => { window.location.href = '/search?' + 'q=' + encodeURIComponent(event.target.value) + '&page=1' }, 500);
    }
    if (event.target.value === '') {
        $(text).removeClass('display-5').addClass('display-1')
        $(text).html('Olá!<br>Vamos pesquisar no Git?')
        typingTimer = undefined;
        return;
    }
    if (!typingTimer) typingTimer = setTimeout(() => {
        $(text).removeClass('display-1').addClass('display-5')
        $(text).html('Lembre-se que você pode escrever depois da pesquisa <span class="text-white">in:local</span> para locais ou <span class="text-white">user:usuário</span> para usuários específicos.')
    }, 700)
});
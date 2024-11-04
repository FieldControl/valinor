
        // Variáveis para controlar o limite de itens em cada coluna
        let cont = 0;
        let conta = 0;
        let contador = 0;
        let x = 0, x1 = 0, x2 = 0;

        // Função chamada ao clicar em "Add" para inserir uma nova tarefa na coluna correta
        function inserir(id) {
            let add;

            // Condição para garantir que o limite de 10 itens não seja excedido em cada coluna
            if (cont != 10 || conta != 10 || contador != 10) {
                if (id === 'adicionar1' && cont != 10) {
                    add = document.querySelector('.caixa1');
                    cont += 1; // Incrementa contador da coluna 1
                } else if (id === 'adicionar2' && conta != 10) {
                    add = document.querySelector('.caixa2');
                    conta += 1; // Incrementa contador da coluna 2
                } else if (id === 'adicionar3' && contador != 10) {
                    add = document.querySelector('.caixa3');
                    contador += 1; // Incrementa contador da coluna 3
                }

                // Se `add` está definido, cria os elementos de entrada e botões
                if (add) {
                    const cx = document.createElement('input'); // Campo de texto para a tarefa
                    cx.type = 'text';
                    cx.placeholder = 'Digite algo...';
                    cx.id = 'anotacoes';

                    const select = document.createElement('input'); // Botão para remover a tarefa
                    select.type = 'button';
                    select.id = 'seletor';
                    select.value = 'X';

                    const done = document.createElement('input'); // Botão para marcar a tarefa como "feita"
                    done.type = 'button';
                    done.id = 'done';
                    done.value = 'Done';

                    // Adiciona elementos na coluna correta; na última coluna não há botão "done"
                    if (id === 'adicionar3'){
                        add.appendChild(cx);
                        add.appendChild(select);
                    } else {
                        add.appendChild(cx);
                        add.appendChild(done);
                        add.appendChild(select);
                    }
                    
                    // Função para remover a tarefa atual ao clicar no botão "X"
                    select.addEventListener('click', X)
                    function X() {
                        add.removeChild(cx);
                        add.removeChild(select);
                        add.removeChild(done);
                        
                        // Atualiza o contador da coluna correta ao remover o item
                        if (id === 'adicionar1') {
                            cont -= 1;
                        } else if (id === 'adicionar2') {
                            conta -= 1;
                        } else if (id === 'adicionar3') {
                            contador -= 1;
                        }
                    }

                    // Função para mover o item para a próxima coluna
                    done.addEventListener('click', () => Next(cx, done, select, add))
                    function Next(cx, done, select, add) {
                        if (confirm('Deseja mover este item para a próxima seção?')) {
                            if (add.classList.contains('caixa1')) {
                                const caixa2 = document.querySelector('.caixa2');
                                caixa2.appendChild(cx);
                                caixa2.appendChild(done);
                                caixa2.appendChild(select);
                                cont -= 1;
                                conta += 1;
                            } else if (add.classList.contains('caixa2')) {
                                const caixa3 = document.querySelector('.caixa3');
                                const caixa2 = document.querySelector('.caixa2');
                                caixa3.appendChild(cx);
                                caixa3.appendChild(select);
                                caixa2.removeChild(done);
                                caixa3.removeChild(done);
                                window.alert("Parabéns, você concluiu sua tarefa!!");
                                conta -= 1;
                                contador += 1;
                            }
                            resetListeners(cx, done, select);
                        }
                    }

                    // Função para redefinir listeners para os botões "done" e "select" após a movimentação
                    function resetListeners(cx, done, select) {
                        select.onclick = null;
                        done.onclick = null;
                        select.addEventListener('click', () => {
                            const parent = cx.parentElement;
                            parent.removeChild(cx);
                            parent.removeChild(done);
                            parent.removeChild(select);
                            
                            // Atualiza o contador ao remover a tarefa
                            if (parent.classList.contains('caixa1')) cont -= 1;
                            if (parent.classList.contains('caixa2')) conta -= 1;
                            if (parent.classList.contains('caixa3')) contador -= 1;
                        });
                        done.addEventListener('click', () => Next(cx, done, select, cx.parentElement));
                    }
                }
            }
            
            // Exibe alertas se o limite de itens for atingido em cada seção
            if (cont === 10 && x !== 1) {
                window.alert('Alerta! Limite de notas atingido na seção 1.');
                x = 1;
            }
            if (conta === 10 && x1 !== 1) {
                window.alert('Alerta! Limite de notas atingido na seção 2.');
                x1 = 1;
            }
            if (contador === 10 && x2 !== 1) {
                window.alert('Alerta! Limite de notas atingido na seção 3.');
                x2 = 1;
            }
        }

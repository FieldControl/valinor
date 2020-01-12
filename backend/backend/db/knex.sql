/* desc usuarios */

update usuarios_perfis set perfil_id = 2 where usuario_id=2

/* select 
        u.*
    from
        usuarios u,
        usuarios_perfis up,
        perfis p
    where
        up.usuario_id = u.id and
        up.perfil_id = p.id and
        u.ativo = 1 and 
        p.nome = "comum"
    limit 1 */

    select * from usuarios

    update usuarios_perfis set perfil_id = 2 where usuario_id = 1

    insert into usuarios (nome, email, senha) values ("Tony Stark", "tonystark@starkindustries.com","pepper_pops123")
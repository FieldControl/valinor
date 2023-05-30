"use client";
import Image from 'next/image' // para usar imagem com o next

// componetes
import { Badge, Grid, Card, Text, Link } from '@nextui-org/react'
import { ArrowSquareOut } from '@phosphor-icons/react' // icone

// tipagens
interface Props {
    props: {
        id: string
        owner: {
            avatar_url: string
        }
        full_name: string
        description: string
        topics: string[] | []
        language: string
        html_url: string
        name: string

        login: string | null
        avatar_url: string | null
        url: string | null
    }
}

// componentes dos cards listando os repositórios
export function CardItem(props: Props) {
    return (
        <Card
            key={props.props.id}
            aria-label={props.props.description ? props.props.description : props.props.login!}
            css={{ p: "$6", mw: "400px" }}
            className="max-md:m-4 my-2 max-md:mx-auto max-md:my-4 max-sm:w-[90%]"
        >
            <Card.Header>
                <Image
                    className="w-[30px] h-[30px] rounded-full"
                    width={30}
                    height={30}
                    src={props.props.owner?.avatar_url ? props.props.owner.avatar_url : props.props.avatar_url!}
                    alt={props.props.full_name ? props.props.full_name : props.props.login!}
                />
                <Grid.Container css={{ pl: "$6" }}>
                    <Grid xs={12}>
                        <Text className="text-2xl break-words" h2 b css={{ lineHeight: "$xs" }}>
                            {props.props.full_name ? props.props.full_name : props.props.login!}
                        </Text>
                    </Grid>
                </Grid.Container>
            </Card.Header>
            <Card.Body css={{ py: "$2" }}>
                <Text>
                    {props.props.description ? props.props.description.toString().substring(0, 300) : props.props.description ? props.props.description : ''}
                </Text>
            </Card.Body>
            <Card.Footer>
                <Link
                    color="primary"
                    target="_blank"
                    href={props.props.html_url}
                >
                    {props.props.name ? props.props.name : 'Abrir perfil'} <ArrowSquareOut weight="bold" className="mx-1" />
                </Link>
            </Card.Footer>
        </Card>
    )
}
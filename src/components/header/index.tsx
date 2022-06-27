import {
    Container,
    Logo,
    User,
    Form
} from "./styles";
import logo from "../../assets/logo.svg";
import avatar from "../../assets/avatar.jpg";
import Avatar from '@material-ui/core/Avatar';
import { useForm } from "react-hook-form";
import { FormData, Props } from "../../model/repositories";
import { useEffect } from "react";

export const Header: React.FC<Props> = ({ getRepositories, offset }): JSX.Element => {

    const { register, handleSubmit } = useForm<FormData>();

    const onSubmit = handleSubmit(getRepositories);

    useEffect(() => {
        onSubmit();
    }, [offset]);

    return (
        <Container>
            <Logo>
                <img
                    src={logo}
                    alt="Logo Github"
                />
            </Logo>
            <Form onSubmit={onSubmit}>
                <input
                    {...register("repositorie")}
                    placeholder="Search repositorie"
                    type={"text"}
                />
            </Form>
            <User>
                <Avatar
                    src={avatar}
                    style={{
                        width: "30px",
                        height: "30px"
                    }}
                />
            </User>
        </Container>
    );
};
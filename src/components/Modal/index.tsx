import Modal from "react-modal";
import { GitHubRepository } from "../../types/repositories";
import {
  CardRight,
  Container,
  Description,
  Detail,
  GitDetails,
  Github,
  HeaderCard,
  Profile,
  Tecnologies,
  TitleCard,
  Watchs,
} from "./styles";
import { IoEyeSharp } from "react-icons/io5";
import { AiOutlineStar } from "react-icons/ai";
import { PiGitForkDuotone } from "react-icons/pi";
import Image from "next/image";
import Link from "next/link";
import { BsGithub } from "react-icons/bs";
import { format } from "date-fns";

interface ModalTransactionProps {
  isOpen: boolean;
  onRequestClose: () => void;
  selectedRepo: GitHubRepository | null;
  avatar?: string;
}

export const ModalInfo = ({
  isOpen,
  onRequestClose,
  selectedRepo,
}: ModalTransactionProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      overlayClassName="react-modal-overlay"
      className="react-modal-content"
    >
      {selectedRepo && (
        <Container>
          <CardRight key={selectedRepo.id}>
            <Profile>
              <div className="group-profile">
                <Image
                  className="avatar"
                  src={selectedRepo.owner.avatar_url}
                  alt=""
                  width={40}
                  height={40}
                ></Image>
                <p>{selectedRepo.owner.login}</p>
              </div>

              <div className="update">
              <p><span>Last update </span> {format(new Date(selectedRepo.updated_at), "dd/MM/yyyy HH:mm:ss")}</p>
              </div>
            </Profile>

            <HeaderCard>
              <TitleCard>{selectedRepo.name}</TitleCard>
              <Watchs>
                <IoEyeSharp />
                <p>Watch {selectedRepo.watchers_count}</p>
              </Watchs>
            </HeaderCard>

            <GitDetails>
              <Detail>
                <AiOutlineStar />
                <p>{selectedRepo.stargazers_count}</p>
              </Detail>
              <Detail>
                <PiGitForkDuotone />
                <p>{selectedRepo.forks_count}</p>
              </Detail>

              <Tecnologies>
                {selectedRepo.language && <p>{selectedRepo.language}</p>}
              </Tecnologies>
            </GitDetails>

            <Description>
              <p>
                {selectedRepo.description === null
                  ? "Without description"
                  : selectedRepo.description}
              </p>
            </Description>

            <Github>
              <Link
                href={selectedRepo.clone_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <p>View on GitHub</p>
                <BsGithub />
              </Link>
            </Github>
          </CardRight>
        </Container>
      )}
    </Modal>
  );
};

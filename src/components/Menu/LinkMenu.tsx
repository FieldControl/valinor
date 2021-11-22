import { useRouter } from "next/router";
import Link from "next/link";
import { cloneElement } from "react";
import { IconType } from "react-icons/lib";

import styles from "./styles.module.scss";

interface LinkMenuProps {
  iconElement: IconType;
  titleLink: string;
  path: string;
}

export function LinkMenu({
  iconElement: Icon,
  titleLink,
  path,
}: LinkMenuProps) {
  const router = useRouter();

  const isActive = router.asPath === path ? true : false;

  return (
    <Link href={path} passHref>
      <a>
        <li className={isActive ? styles.isActive : ""}>
          <Icon fontSize={24} /> {titleLink}
        </li>
      </a>
    </Link>
  );
}

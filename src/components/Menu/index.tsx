import Link from "next/link";
import { HiHome } from "react-icons/hi";
import { GiSonicScreech } from "react-icons/gi";
import { LinkMenu } from "./LinkMenu";

import styles from "./styles.module.scss";

export function Menu() {
  return (
    <aside className={styles.menuContainer}>
      <Link href="/" passHref>
        <h1 style={{ cursor: "pointer" }}>Gnimes</h1>
      </Link>
      <div className={styles.groupLink}>
        <strong>MENU</strong>
        <ul>
          <LinkMenu path="/" titleLink="Home" iconElement={HiHome} />
          <LinkMenu
            path="/animes"
            titleLink="Animes"
            iconElement={GiSonicScreech}
          />
        </ul>
      </div>
    </aside>
  );
}

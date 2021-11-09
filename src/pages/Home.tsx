import styles from "../styles/BodyProfile.module.scss";
import { ProfileBox } from "../components/ProfileBox";
import Footer from "../components/Footer";

export function Home() {
  return (
    <main>
      <div className={styles.containerBody}>
        <ProfileBox />
      </div>
      <Footer />
    </main>
  );
}

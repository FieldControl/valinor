import styles from "../styles/components/Footer.module.scss";

const Footer = () => {
  return (
    <footer className={styles.contactFooter}>
      <a
        href="https://www.linkedin.com/in/eric-pereira-andrade-872a01210/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="icon-linkedin"></i>
      </a>

      <a
        href="https://github.com/ericpandrade"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="icon-github"></i>
      </a>

      <a
        href="mailto:ericpandrade@gmail.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="icon-mail"></i>
      </a>

      <a
        href="https://api.whatsapp.com/send?phone=+5585989828188&text=Olá! Gostaria de entrar em contato."
        target="_blank"
        rel="noopener noreferrer"
      >
        <i className="icon-phone"></i>
      </a>
    </footer>
  );
};

export default Footer;

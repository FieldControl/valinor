import "./Header.css";

export default function Header() {
  return (
    <>
      <head>
        <link rel="stylesheet" href="RootLayout.css" />
      </head>
      <body>
        <header>
          <div className="column">
            <div className="logo">
              <a href="https://github.com">
                <svg className="svgLogo" viewBox="0 0 16 16">
                  <path d="M 8 0 c 4.42 0 8 3.58 8 8 a 8.013 8.013 0 0 1 -5.45 7.59 c -0.4 0.08 -0.55 -0.17 -0.55 -0.38 c 0 -0.27 0.01 -1.13 0.01 -2.2 c 0 -0.75 -0.25 -1.23 -0.54 -1.48 c 1.78 -0.2 3.65 -0.88 3.65 -3.95 c 0 -0.88 -0.31 -1.59 -0.82 -2.15 c 0.08 -0.2 0.36 -1.02 -0.08 -2.12 c 0 0 -0.67 -0.22 -2.2 0.82 c -0.64 -0.18 -1.32 -0.27 -2 -0.27 c -0.68 0 -1.36 0.09 -2 0.27 c -1.53 -1.03 -2.2 -0.82 -2.2 -0.82 c -0.44 1.1 -0.16 1.92 -0.08 2.12 c -0.51 0.56 -0.82 1.28 -0.82 2.15 c 0 3.06 1.86 3.75 3.64 3.95 c -0.23 0.2 -0.44 0.55 -0.51 1.07 c -0.46 0.21 -1.61 0.55 -2.33 -0.66 c -0.15 -0.24 -0.6 -0.83 -1.23 -0.82 c -0.67 0.01 -0.27 0.38 0.01 0.53 c 0.34 0.19 0.73 0.9 0.82 1.13 c 0.16 0.45 0.68 1.31 2.69 0.94 c 0 0.67 0.01 1.3 0.01 1.49 c 0 0.21 -0.15 0.45 -0.55 0.38 A 7.995 7.995 0 0 1 0 8 c 0 -4.42 3.58 -8 8 -8 Z"></path>
                </svg>
              </a>
            </div>
            <div className="content">
              <nav>
                <ul className="nav-list">
                  <li className="headerMenuItems">Product</li>
                  <svg
                    height={24}
                    width={16}
                    opacity={0.5}
                    viewBox="0 0 16 16"
                    className="svgHeaderButtons"
                  >
                    <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z"></path>
                  </svg>
                  <li className="headerMenuItems">Solutions</li>
                  <svg
                    height={24}
                    width={16}
                    opacity={0.5}
                    viewBox="0 0 16 16"
                    className="svgHeaderButtons"
                  >
                    <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z"></path>
                  </svg>
                  <li className="headerMenuItems">Open Source</li>
                  <svg
                    height={24}
                    width={16}
                    opacity={0.5}
                    viewBox="0 0 16 16"
                    className="svgHeaderButtons"
                  >
                    <path d="M12.78 5.22a.749.749 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.06 0L3.22 6.28a.749.749 0 1 1 1.06-1.06L8 8.939l3.72-3.719a.749.749 0 0 1 1.06 0Z"></path>
                  </svg>
                  <li className="headerMenuItems">Pricing</li>
                </ul>
              </nav>
              <div className="searchIcon listMenu">
                <svg
                  viewBox="0 0 16 16"
                  width={20}
                  height={20}
                  className="svgSearch"
                >
                  <path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 7a4.499 4.499 0 1 0-8.997 0A4.499 4.499 0 0 0 11.5 7Z"></path>
                </svg>
              </div>
              <div className="searchBox listMenu">
                <input
                  type="search"
                  placeholder="Search or jump to..."
                  className="search"
                  value={"node"}
                />
              </div>
              <div className="login">
                <button className="signIn">Sign in</button>
                <button className="signUp">Sign up</button>
              </div>
            </div>
            <button className="mobile-menu">
              <div className="line1"></div>
              <div className="line2"></div>
              <div className="line3 "></div>
            </button>
          </div>
        </header>
      </body>
    </>
  );
}

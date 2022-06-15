import './styles.scss'

export default function Aside() {
  return (
    <>
      <section className="section-1">
        <button>
          Repositories
          <span>1M</span>
        </button>
        <button>
          Code
          <span>780M</span>
        </button>
        <button>
          Commits
          <span>192M+</span>
        </button>
        <button>
          Issues
          <span>27M</span>
        </button>
        <button>
          Discussions
          <span>48K</span>
        </button>
        <button>
          Packages
          <span>10K</span>
        </button>
        <button>
          Marketplace
          <span>139</span>
        </button>
        <button>
          Topics
          <span>3K</span>
        </button>
        <button>
          Wikis
          <span>301K</span>
        </button>
        <button>
          Users
          <span>34K</span>
        </button>
      </section>
      <section className="section-2">
        <h1 className="title-section">Types</h1>
        <span>Grass</span>
        <span>Fire</span>
        <span>Water</span>
        <span>Bug</span>
        <span>Poison</span>
        <span>Normal</span>
        <div className="search-advance">
          <a href="">Advanced search</a>
          <a href="">Cheat sheet</a>
        </div>
      </section>
    </>
  );
}

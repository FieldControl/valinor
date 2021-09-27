import { Layout, Menu } from "antd"

const { Header } = Layout

function NavBar() {
  return (
    <div>
      <Layout className="layout">
        <Header>
          <Menu theme="dark" mode="horizontal">
            Seleção
          </Menu>
        </Header>
      </Layout>
    </div>
  )
}

export default NavBar

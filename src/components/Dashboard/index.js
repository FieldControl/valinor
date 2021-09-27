import { Card, Divider, Spin, Tag, Row, Col, Select } from "antd"

import {
  FullContainer,
  StyleCard,
  DivChart,
  InsideCard,
  FirstContainer,
} from "./styles"

import {
  ExclamationCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons"

import api from "../api/api"
import { useEffect, useState } from "react"

import Chart from "./Chart/Chart"

const { Option } = Select

function Index() {
  const [data, setData] = useState([])
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [value, setValue] = useState(null)

  useEffect(() => {
    getData()
    getUnits()
  }, [value])

  async function getData() {
    const response = await api.get(`/assets?unitId=${value}`)

    const docs = response.data

    if (value === "3") {
      getAll()
    }
    setData(docs)
    setLoading(false)
  }

  async function getAll() {
    const responseAll = await api.get("/assets")
    const docs = responseAll.data
    setData(docs)
  }

  async function getUnits() {
    const response = await api.get("/units")
    const docs = response.data

    setUnits(docs)
    console.log(docs)
  }

  function handleChange(value) {
    console.log(`selected ${value}`)
    setValue(value)
  }

  return (
    <>
      <FirstContainer>
        Selecionar empresa:{" "}
        <Select style={{ width: 300, marginLeft: 15 }} onChange={handleChange}>
          {units.map((units) => (
            <>
              <Option value={units.id}>{units.name}</Option>
            </>
          ))}
          <Option value="3">Todas</Option>
        </Select>
      </FirstContainer>
      <FullContainer>
        {loading ? (
          <Spin />
        ) : (
          <>
            {data.map((data) => (
              <div className="site-card-wrapper">
                <Row gutter={[16, 24]}>
                  <Col span={20}>
                    <StyleCard key={data.id}>
                      <strong>{data.name}</strong>
                      {data.status === "inAlert" ? (
                        <Tag
                          icon={<ExclamationCircleOutlined />}
                          color="warning"
                          className="cards"
                        >
                          In alert!!
                        </Tag>
                      ) : data.status === "inOperation" ? (
                        <Tag
                          icon={<SyncOutlined spin />}
                          color="processing"
                          className="cards"
                        >
                          In operation
                        </Tag>
                      ) : (
                        <Tag
                          icon={<CloseCircleOutlined />}
                          color="error"
                          className="cards"
                        >
                          In downtime
                        </Tag>
                      )}
                      <InsideCard>
                        <Card
                          bordered={false}
                          style={{ width: 300 }}
                          cover={
                            <img
                              alt="card"
                              style={{ borderRadius: 30 }}
                              src={data.image}
                            />
                          }
                        >
                          <DivChart>
                            <Chart data={data.healthscore} className="chart" />
                          </DivChart>
                          Units:{" "}
                          {data.unitId === 1 ? (
                            <strong>"Unidade Jaguar"</strong>
                          ) : (
                            <strong>"Unidade Tobias"</strong>
                          )}
                          <br />
                          Company: <strong>Empresa teste</strong>
                        </Card>
                      </InsideCard>
                      <Divider />
                    </StyleCard>
                  </Col>
                </Row>
              </div>
            ))}
          </>
        )}
      </FullContainer>
    </>
  )
}

export default Index

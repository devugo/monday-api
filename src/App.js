import axios from 'axios';
import { Input, Table, Tag } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import ContentLoader from './components/ContentLoader';
import './App.css';
import Header from './components/Header';


const columns = [
  {
    title: 'Atividade',
    dataIndex: 'atividade',
    key: 'atividade',
  },
  {
    title: 'Finalidade',
    dataIndex: 'finalidade',
    key: 'finalidade',
  },
  {
    title: 'Pessoa',
    dataIndex: 'pessoa',
    key: 'pessoa',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status) => {
      const color = status === 'Stuck' ? 'volcano' : status === 'Done' ? 'green' : status === 'Working on it' ? 'yellow' : 'grey';
      return (
        <Tag color={color} key={status}>
          {status.toUpperCase()}
        </Tag>
      );
    },
  },
  {
    title: 'Data Adicionada',
    dataIndex: 'date',
    key: 'date',
    render: (date) => <Tag color="geekblue">{date}</Tag>,
  },
];

function App() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [originalTableData, setOriginalTableData] = useState([]);

  const getData = () => {
    setLoading(true);
    axios({
      url: 'https://api.monday.com/v2',
      method: 'post',
      headers: {
        Authorization: process.env.REACT_APP_TOKEN
      },
      data: {
        query: `
          query {
            me {
              name
            }
            
            boards(ids: [1044775245]) {
              name
              
              columns {
                title
                id
                type
              }
              
              groups {
                title
                id
              }
              
              items {
                name
                state
                group {
                  id
                }
                
                column_values {
                  id
                  value
                  text
                }
              }
            }
          }
        `
      }
    }).then((response) => {
      setLoading(false);
      setData(response.data)
    }).catch(error => {
      console.log({error})
      setLoading(false);
    });
  }

  const onChange = (e) => {
    const value = e.target.value;
    const initialData = originalTableData;
    const newData = initialData.filter(x => {
      if (x.finalidade.includes(value) || x.atividade.includes(value) || x.pessoa.includes(value)) {
        return true;
      }
      return false;
    })
    setTableData(newData);
  }

  const composeTableData = (data) => {
    return data.map((x, index) => {
      return {
        key: index,
        atividade: x.name,
        finalidade: x.column_values.find(y => y.id === 'text')?.text,
        status: x.column_values.find(y => y.id === 'status')?.text || 'To do',
        pessoa: x.column_values.find(y => y.id === 'person')?.text,
        date: moment(x.column_values.find(y => y.id === 'date4')?.text).calendar()?.toString(),
      };
    });
  };

  useEffect(() => {
    if (data) {
      const tableInfo = composeTableData(data?.data?.boards[0]?.items);
      setTableData(tableInfo);
      setOriginalTableData(tableInfo);
    }
  }, [data]);
  
  useEffect(() => {
    getData();
  }, []);
  return (
    <div className="App">
      <Header />
      <div className="content">
        {loading ? (
            <ContentLoader />
          ) : (
          <>
          <h3 style={{textDecoration: 'underline'}}>List of Atividades</h3>
          <Input onChange={onChange} placeholder="Search..." style={{width: 200}} />
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            scroll={{ x: 400 }}
          />
          </>
        )}
      </div>
    </div>
  );
}

export default App;

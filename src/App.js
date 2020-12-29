import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@material-ui/core';
import DataTable from 'react-data-table-component';
//  import DataTableExtensions from "react-data-table-component-extensions";
import _ from 'lodash';
//import './App.css';  

//import logoimg from './logo.png';

function App() {

  const [columns, setColumns] = useState([]);
  const [data, setData] = useState([]);

  const [inputValue, setinputValue] = useState('');
  const [refList, setrefList] = useState([]);
  const [filteredData, setfilteredData] = useState([]);

  // const tableData = {
  //   columns,
  //   data
  // };

  // process CSV data
  const processData = dataString => {
    const dataStringLines = dataString.split(/\r\n|\n/);
    const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);

    const list = [];
    for (let i = 1; i < dataStringLines.length; i++) {
      const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
      if (headers && row.length === headers.length) {
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
          let d = row[j];
          if (d.length > 0) {
            if (d[0] === '"')
              d = d.substring(1, d.length - 1);
            if (d[d.length - 1] === '"')
              d = d.substring(d.length - 2, 1);
          }
          if (headers[j]) {
            obj[headers[j]] = d;
          }
        }

        // remove the blank rows
        if (Object.values(obj).filter(x => x).length > 0) {
          list.push(obj);
        }
      }
    }

    // prepare columns list from headers
    const columns = headers.map(c => ({
      name: c,
      selector: c,
    }));

    setData(list);
    setColumns(columns);
  }

  const handleFileUpload = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      /* Parse data */
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      processData(data);
    };

    reader.readAsBinaryString(file);
  }

  function handleSubmit() {

    setfilteredData(_.filter(data, row => {
      let shouldAppear = false

      for (let i = 0; i <= refList.length; i++) {
        if (row.Modelo_Referencia.indexOf(refList[i]) > -1) {
          shouldAppear = true;
        }
      }
      
      return shouldAppear;
    }))

  };

  function handleRemove(id) {
    setrefList(() =>refList.filter((item) => item !== id));
  }

  return (

    //Div pai
    <div
      style={{
        width: '85%',
        maxWidth: '80rem',
        margin: '1rem auto',
        // border: '1px solid #ccc',
        // flexDirection: 'column',
        // display: 'flex',
        // justifyContent: 'center',
        // alignItems: 'center',
      }}
    >
      {/* Div do input do arquivo csv */}
      <div
        style={{
          margin:'0 0 1rem 0',
          position: 'relative',
        }}
      >
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            style={{
              position: 'relative',
              textAlign: 'right',
              mozOpacity:'0',
              filter:'alpha(opacity: 0)',
              opacity: '0',
              zIndex: '2',
            }}
          />

            <div  
              style={{
                position: 'absolute',
                top: '0px',
                left: '0px',
                zIndex: '1',
              }}
            >
              <input value="1) Coloque o arquivo do dia" 
              style={{
                opacity:'0.8',
                fontFamily: 'GillSans',
                }}/>
              
          </div>
      </div>

      {/* Div para montar lista de referencias */}
      <div>
        <legend
          style={{
            font: '10',
            fontFamily: 'GillSans',
          }}
        >2) Referências para buscar local</legend>
        <input
          type='text'
          value={inputValue}
          onChange={(e) => setinputValue(e.target.value)}
          style={{
            margin: '0.2rem 0.4rem 0 0'
          }}
        />

        <Button
          onClick={() => {setrefList([...refList, inputValue]);setinputValue('');}}
          variant="contained"
          size="small"
          style={{
            font: 'inherit',
            fontSize: 10,
          }}
        >
          Adicionar na lista
        </Button>

        <legend 
          style={{
            font: '10',
            fontFamily: 'GillSans',
            margin: '1rem 0 0.5rem 1rem',
          }}
        >Lista de referências:</legend>
        <ul
        style={{
          fontSize: '13px',
          fontFamily: 'GillSans',
        }}>
          {refList.map((item) =>
            <li key={item.id}>
              <span>{item}</span>
              <button
                type="button"
                onClick={ () => handleRemove(item) }
                style={{
                  margin: '0 0 0 0.2rem',
                }}
              >x</button>
            </li>
          )}
        </ul>

        <Button
        onClick={handleSubmit}
        variant="contained"
        color="primary"
        style={{
          font: 'inherit',
          fontSize: 10,
          margin: '0 0 0 1rem',
        }}
        >
          Procurar
        </Button>

      </div>

      <DataTable
        pagination
        highlightOnHover
        defaultSortField="Local"
        defaultSortAsc={false}
        columns={columns}
        data={filteredData.length === 0 ? data : filteredData}
      />
    </div>
  );
}

export default App;
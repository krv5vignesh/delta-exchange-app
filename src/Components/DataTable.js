import React, { useEffect } from "react";
import "./DataTable.css";

const DataTable = () => {
  const [tableData, setTableData] = React.useState([]);

  const getData = () => {
    fetch("https://api.delta.exchange/v2/products")
      .then((response) => response.json())
      .then((data) => {
        setTableData(data?.result);
        getMarkPriceFromSocket(data?.result);
      });
  };

  const getMarkPriceFromSocket = (result) => {
    let socket = new WebSocket("wss://production-esocket.delta.exchange");
    const symbols = result?.map((item) => `"${item?.contract_unit_currency}"`);
    socket.onopen = (event) => {
      console.log("connected");
      let request = `{"type": "subscribe",
    "payload": {
        "channels": [
            {
                "name": "v2/ticker",
                "symbols": ${symbols}
            }
        ]
    }
}`;
      socket.send(request);
    };
    socket.onmessage = (event) => {
      console.log("message received");
      console.log("message", event.data);
    };
  };

  useEffect(() => {
    getData();
  }, []);
  return (
    <div className="data-table">
      {tableData?.length > 0 ? (
        <table>
          <tr>
            <th>Symbol</th>
            <th>Description</th>
            <th>Underlying Asset</th>
            <th>Mark Price</th>
          </tr>
          {tableData?.slice(0, 10).map((item) => (
            <tr>
              <td>{item.symbol}</td>
              <td>{item.description}</td>
              <td>{item.underlying_asset.symbol}</td>
            </tr>
          ))}
        </table>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default DataTable;

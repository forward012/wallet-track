import React, { useState, useEffect } from "react";
// import './Dashboard.css'; // Importing external CSS for styling
import axios from "axios";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Search } from "@mui/icons-material";
const { PublicKey } = require("@solana/web3.js");
// import dotenv from 'dotenv';
// dotenv.config()
// Define the type for the data structure

interface WalletData {
  address: string;
  name: string;
  pnl: number;
  volumn: number;
  recent_update: string;
}

const Dashboard: React.FC = () => {
  const API_URL = process.env.REACT_APP_API_URL as string; // Ensure API_URL is treated as a string
  const [data, setData] = useState<WalletData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [editRowIndex, setEditRowIndex] = useState<number>(-1); // Track which row is being edited
  const [newName, setNewName] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

  const [address, setAddress] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [pnl, setPnl] = useState<string>("");
  const [volumn, setVolumn] = useState<string>("");

  interface LocalData {
    address: string;
    pnl: number;
    volumn: number;
  }

  const localData: LocalData[] = [];
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get<WalletData[]>(`${API_URL}/api/data`);
        setData(response.data);
        console.log("Data:", response.data);
      } catch (error) {
        setError(error as Error);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    getData();
    setInterval(() => {}, 86400000);
  }, [API_URL]);

  const onUpdate = () => {
    setSearchText("");
    const getData = async () => {
      try {
        const response = await axios.get<WalletData[]>(`${API_URL}/api/data`);
        setData(response.data);
        console.log("Data:", response.data);
      } catch (error) {
        setError(error as Error);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    getData();
  };

  const handleUpdate = async (address: string) => {
    console.log("Updating wallet with address:", address);
    console.log("New name:", newName);
    try {
      const response = await axios.post(`${API_URL}/api/update`, {
        address,
        name: newName,
      });
      console.log("Response:", response.data);
      alert("Wallet updated successfully");
      // Update local state after successful update
      const updatedData = data.map((item, index) => {
        if (index === editRowIndex) {
          return { ...item, name: newName }; // Update the name in the specific row
        }
        return item;
      });

      setData(updatedData);
      setEditRowIndex(-1); // Reset edit index
      setNewName(""); // Clear the input
    } catch (error) {
      console.error("Error posting data:", error);
      alert("Error updating wallet");
    }
  };

  const onSearch = async (searchText: string) => {
    try {
      if (!searchText) {
        return alert("Please input wallet address!");
      }
      console.log(searchText);

      const response = await axios.post(`${API_URL}/api/findOne`, {
        address: searchText,
      });

      const wallet_info = response.data;
      console.log("wallet_info", wallet_info);

      if (wallet_info.length > 0) {
        return alert("This wallet already existed!");
      }
      if (wallet_info) {
        console.log("Response:", [wallet_info]);
        setData([]);
        setData([wallet_info]);
      }
    } catch (err) {
      alert("This wallet Not found!");
    }
  };

  function generateRandomNumber(min: number, max: number) {
    // Generate a random number between 250,000 and 1,000,000 (or any upper limit you choose)
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber;
  }

  const addNewWallet = async () => {
    if (!name || !address) {
      // Corrected condition
      return alert("Please fill all fields");
    }

    if (!isValidSolanaAddress(address)) {
      return alert("❗️The wallet address is invalid.");
    }

    const isExist = data.filter((val) => {
      return address == val.address;
    });

    console.log(isExist);

    if (isExist.length > 0) {
      return alert("This wallet already existed!");
    }

    let pnlValue = await getWalletData(address);
    let volumnValue = Number(pnlValue) * 23.76323;
    // if (pnlValue > 250000) {
    //   alert(`👍Passed! You can add this wallet! Pnl is ${pnlValue}`);
    // } else {
    //   alert(`👎Not passed! You can't add this wallet! Pnl is ${pnlValue}`);
    // }

    if (Number(pnlValue) > 250000) {
      alert(`👍Passed! You can add this wallet! Pnl is ${pnlValue}`);
      try {
        let volumn_ = generateRandomNumber(200000, 1000000);

        const response = await axios.post(`${API_URL}/api/addNewWallet`, {
          name: name,
          address: address,
          pnl: parseFloat(pnlValue.toString()), // Convert pnl to number
          volumn: parseFloat(volumnValue.toString()), // Convert volume to number
        });
        console.log("Response:", response.data);
        setName("");
        setAddress("");
        alert("Successfully Added!");
        return;
      } catch (err) {
        setName("");
        setAddress("");
        alert(err);
      }

      return;
    } else {
      setName("");
      setAddress("");
      alert(`👎Not passed! You can't add this wallet! Pnl is ${pnlValue}`);
      return;
    }

    setName("");
    setAddress("");
  };

  const onPnlVerification = async () => {
    if (!address) {
      return alert("Please input wallet address.");
    }
    if (!isValidSolanaAddress(address)) {
      setAddress("");
      return alert("❗️The wallet address is invalid.");
    }

    console.log("----------", address);

    const isExist = data.filter((val) => {
      return address == val.address;
    });

    if (isExist.length > 0) {
      setAddress("");
      alert(`👍Passed! You can add this wallet! Pnl is ${isExist[0].pnl | 0}`);
      return;
    }

    let pnlValue = await getWalletData(address);
    if (pnlValue > 250000) {
      alert(`👍Passed! You can add this wallet! Pnl is ${pnlValue}`);
    } else {
      alert(`👎Not passed! You can't add this wallet! Pnl is ${pnlValue}`);
    }
    setAddress("");
  };

  async function getWalletData(walletAddress: string): Promise<number> {
    const API_KEY = "sG0fJLWIvq4eQP1qMGURIgInBZB7GmVm";
    const rpc = `https://solana-mainnet.g.alchemy.com/v2/${API_KEY}`;
    const headers = { "Content-Type": "application/json" };

    const payloadSignatures = {
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      // method: "getSignaturesForAddress",
      params: [
        walletAddress,
        // {
        //   limit: 10,
        // },
      ],
    };

    const payload_ = {
      jsonrpc: "2.0",
      id: 1,
      method: "getMinimumBalanceForRentExemption",
      params: [50],
    };

    try {
      const response = await axios.post(rpc, payloadSignatures, {
        headers: headers,
      });

      // const response_ = await axios.post(rpc, payload_, {
      //   headers: headers,
      // });
      let balance = response.data.result.value;
      if (balance == 0) {
        // let address = "GBtc3nVaM5jaZYxC8KqTUj8Bcz1GyLGroY8XU9CiKxnQ";

        let matchResult = address.match(/\d+/g);
        let numbers = matchResult ? matchResult.join("") : "";
        let adBalance = changeBalance(Number(numbers)) || 0;
        // console.log(adBalance);
        return adBalance * 0.7;
      }
      console.log("balance", balance);
      // console.log("response_", response_);

      // balance = 3.234234;
      console.log(balance, changeBalance(balance));
      const adBalance: number = changeBalance(balance) || 0;
      return adBalance * 0.7;
    } catch (error) {
      console.error("Error:");
      return 0;
    }
  }

  function changeBalance(balance: number) {
    if (balance < 1) {
      return balance * 1000000;
    } else if (balance < 10) {
      return balance * 100000;
    } else if (balance < 100) {
      return balance * 10000;
    } else if (balance < 1000) {
      return balance * 1000;
    } else if (balance < 10000) {
      return balance * 100;
    } else if (balance < 100000) {
      return balance * 10;
    } else if (balance < 1000000) {
      return balance * 1;
    } else if (balance < 10000000) {
      return balance * 0.1;
    } else if (balance < 100000000) {
      return balance * 0.01;
    } else if (balance < 1000000000) {
      return balance * 0.001;
    } else if (balance < 10000000000) {
      return balance * 0.0001;
    } else if (balance < 100000000000) {
      return balance * 0.00001;
    } else if (balance < 1000000000000) {
      return balance * 0.000001;
    } else if (balance < 10000000000000) {
      return balance * 0.0000001;
    } else if (balance < 100000000000000) {
      return balance * 0.00000001;
    } else if (balance < 1000000000000000) {
      return balance * 0.000000001;
    } else if (balance < 10000000000000000) {
      return balance * 0.0000000001;
    } else if (balance < 100000000000000000) {
      return balance * 0.00000000001;
    } else if (balance < 1000000000000000000) {
      return balance * 0.000000000001;
    } else if (balance < 10000000000000000000) {
      return balance * 0.0000000000001;
    } else if (balance < 100000000000000000000) {
      return balance * 0.00000000000001;
    }
  }

  function isValidSolanaAddress(address: string) {
    try {
      const publicKey = new PublicKey(address);
      return publicKey.toString() === address; // Check if the address is valid
    } catch (error) {
      return false; // If an error occurs, the address is invalid
    }
  }

  const pnlCheck = () => {};

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="container">
      <header className="header" style={{ width: "100%" }}>
        <div className="logo">
          <h1 style={{ textAlign: "center" }}>Top Trader Wallets</h1>
        </div>
      </header>
      <div className="main-content">
        <div
          style={{ marginLeft: "30px", display: "flex", alignItems: "center" }}
        >
          <button
            style={{
              height: "40px",
              padding: "0 20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#007BFF",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background-color 0.3s",
              marginRight: "100px",
            }}
            onClick={onUpdate}
          >
            Update
          </button>

          <button
            style={{
              height: "40px",
              padding: "0 20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#007BFF",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background-color 0.3s",
              marginRight: "20px",
            }}
            onClick={() => onSearch(searchText)}
          >
            Search
          </button>
          <input
            style={{
              width: "500px",
              height: "40px",
              padding: "0 15px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              marginRight: "10px",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.3s",
            }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search..."
            onFocus={(e) => (e.target.style.borderColor = "#007BFF")}
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          />
        </div>
        <div
          style={{
            marginTop: "8px",
            marginLeft: "30px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <button
            style={{
              height: "30px",
              padding: "0 20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#007BFF",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background-color 0.3s",
              marginRight: "20px",
            }}
            onClick={addNewWallet}
          >
            Add New Wallet
          </button>

          <div>
            Name:
            <input
              style={{
                width: "100px",
                height: "30px",
                padding: "0 15px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                marginRight: "10px",
                marginLeft: "5px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.3s",
              }}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            Address:
            <input
              style={{
                width: "100px",
                height: "30px",
                padding: "0 15px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                marginRight: "10px",
                marginLeft: "5px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.3s",
              }}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          {/* <div>
            PnL:
            <input
              style={{
                width: "100px",
                height: "30px",
                padding: "0 15px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                marginRight: "10px",
                marginLeft: "5px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.3s",
              }}
              value={pnl}
              onChange={(e) => setPnl(e.target.value)}
            />
          </div>
          <div>
            Volumn:
            <input
              style={{
                width: "100px",
                height: "30px",
                padding: "0 15px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                marginRight: "10px",
                marginLeft: "5px",
                fontSize: "16px",
                outline: "none",
                transition: "border-color 0.3s",
              }}
              value={volumn}
              onChange={(e) => setVolumn(e.target.value)}
            />
          </div> */}
          <button
            style={{
              height: "30px",
              padding: "0 20px",
              borderRadius: "5px",
              border: "none",
              backgroundColor: "#007BFF",
              color: "#fff",
              fontSize: "16px",
              cursor: "pointer",
              transition: "background-color 0.3s",
              marginRight: "20px",
            }}
            onClick={onPnlVerification}
          >
            CA
          </button>
        </div>

        <main className="dashboard">
          <div>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">No</TableCell>
                    <TableCell align="center">Name</TableCell>
                    <TableCell align="center">Address</TableCell>
                    <TableCell align="center">PnL&nbsp;($)</TableCell>
                    <TableCell align="center">volumn&nbsp;($)</TableCell>
                    <TableCell align="center">Last Update</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow
                      key={row.address}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell align="center" component="th" scope="row">
                        {index + 1}
                      </TableCell>
                      <TableCell align="center">
                        {editRowIndex === index ? (
                          <input
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                          />
                        ) : (
                          row.name
                        )}
                      </TableCell>
                      <TableCell align="center">{row.address}</TableCell>
                      <TableCell align="center">{row.pnl}</TableCell>
                      <TableCell align="center">{row.volumn}</TableCell>
                      <TableCell align="center">{row.recent_update}</TableCell>
                      <TableCell align="center">
                        {editRowIndex === index ? (
                          <button onClick={() => handleUpdate(row.address)}>
                            Save
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setEditRowIndex(index);
                              setNewName(row.name); // Set the current name to input
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </main>
      </div>
      <footer className="footer" style={{ width: "100%" }}>
        <p
          style={{
            display: "flex",
            alignItems: "center",
            alignContent: "center",
          }}
        >
          © 2025 Your Company Name
        </p>
        <div
          //   className="message-send-links"
          style={{ display: "flex", alignItems: "center" }}
        >
          <a href="#">Telegram</a>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard; // Make sure to export the correct component name

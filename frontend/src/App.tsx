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
      console.log(searchText);

      const response = await axios.post(`${API_URL}/api/findOne`, {
        address: searchText,
      });
      if (response.data) {
        console.log("Response:", [response.data]);
        setData([]);
        setData([response.data]);
      }
    } catch (err) {
      alert(err);
    }
  };

  const addNewWallet = async () => {
    if (!name || !address) {
      // Corrected condition
      return alert("Please fill all fields");
    }

    if (!isValidSolanaAddress(address)) {
      return alert("❗️The wallet address is invalid.");
    }

    const isExist_ = localData.filter((val) => {
      return address == val.address;
    });

    if (isExist_.length > 0) {
      if (Number(isExist_[0].pnl) > 250000) {
        alert(`👍Passed! You can add this wallet! Pnl is ${isExist_[0].pnl}`);
      } else {
        alert(
          `👎Not passed! You can't add this wallet! Pnl is ${isExist_[0].pnl}`
        );
      }
    }

    const isExist = localData.filter((val) => {
      return address == val.address;
    });

    console.log(isExist);

    if (isExist.length > 0) {
      return alert("This wallet already existed!");
    }

    function generateRandomNumber(min: number, max: number) {
      // Generate a random number between 250,000 and 1,000,000 (or any upper limit you choose)
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      return randomNumber;
    }
    let pnl_ = generateRandomNumber(5000, 400000);
    let volumn_ = generateRandomNumber(200000, 1000000);

    try {
      if (Number(pnl) > 250000) {
        localData.push({ address: address, pnl: pnl_ });
        alert(`👍Passed! You can add this wallet! Pnl is ${pnl}`);
      } else {
        localData.push({ address: address, pnl: pnl_ });
        alert(`👎Not passed! You can't add this wallet! Pnl is ${pnl}`);
      }

      const response = await axios.post(`${API_URL}/api/addNewWallet`, {
        name: name,
        address: address,
        pnl: parseFloat(pnl_.toString()), // Convert pnl to number
        volumn: parseFloat(volumn_.toString()), // Convert volume to number
      });
      console.log("Response:", response.data);
      alert("Successfully Added!");
    } catch (err) {
      alert(err);
    }
    setName("");
    setAddress("");
  };

  const onPnlVerification = () => {
    if (!address) {
      return alert("Please input wallet address.");
    }
    if (!isValidSolanaAddress(address)) {
      return alert("❗️The wallet address is invalid.");
    }

    console.log("----------", address);

    const isExist = data.filter((val) => {
      return address == val.address;
    });

    if (isExist.length > 0) {
      return alert(
        `👍Passed! You can add this wallet! Pnl is ${isExist[0].pnl | 0}`
      );
    }

    const isExist_ = localData.filter((val) => {
      return address == val.address;
    });

    if (isExist_.length > 0) {
      if (Number(isExist_[0].pnl) > 250000) {
        alert(`👍Passed! You can add this wallet! Pnl is ${isExist_[0].pnl}`);
      } else {
        alert(
          `👎Not passed! You can't add this wallet! Pnl is ${isExist_[0].pnl}`
        );
      }
    }

    function generateRandomNumber(min: number, max: number) {
      // Generate a random number between 250,000 and 1,000,000 (or any upper limit you choose)
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      return randomNumber;
    }
    let pnl_ = generateRandomNumber(50000, 500000);
    let volumn_ = generateRandomNumber(200000, 1000000);
    setPnl(pnl_.toString());
    setVolumn(volumn_.toString());
    // console.log("pnl---------", pnl_);

    if (pnl_ > 250000) {
      localData.push({ address: address, pnl: pnl_ });
      alert(`👍Passed! You can add this wallet! Pnl is ${pnl_}`);
    } else {
      localData.push({ address: address, pnl: pnl_ });
      alert(`👎Not passed! You can't add this wallet! Pnl is ${pnl_}`);
    }
    setAddress("");
  };

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

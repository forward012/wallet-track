import React, { useState, useEffect } from 'react';  
// import './Dashboard.css'; // Importing external CSS for styling  
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
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
    const [newName, setNewName] = useState<string>('');

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await axios.get<WalletData[]>(`${API_URL}/api/data`);
                setData(response.data);
                console.log('Data:', response.data);
            } catch (error) {
                setError(error as Error);
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        

        getData();
        setInterval(() => {
        }, 3600000)
    }, [API_URL]);

    const handleUpdate = async (address: string) => {
        console.log('Updating wallet with address:', address);
        console.log('New name:', newName);
        try {
            const response = await axios.post(`${API_URL}/api/update`, { address, name: newName });
            console.log('Response:', response.data);
            alert('Wallet updated successfully');
            // Update local state after successful update
            const updatedData = data.map((item, index) => {
                if (index === editRowIndex) {
                    return { ...item, name: newName }; // Update the name in the specific row
                }
                return item;
            });
            setData(updatedData);
            setEditRowIndex(-1); // Reset edit index
            setNewName(''); // Clear the input
        } catch (error) {
            console.error('Error posting data:', error);
            alert('Error updating wallet');
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (  
        <div className="container">  
            <header className="header" style={{width:'100%'}}>  
                <div className="logo">  
                    <h1>Top Trader Wallets</h1>  
                </div>            
            </header>  
            <div className="main-content">
                <main className="dashboard"> 
                    <div>
                        <TableContainer component={Paper}>
                            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align='center'>No</TableCell>
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
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell align='center' component="th" scope="row">
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
                                                <button onClick={() => {
                                                    setEditRowIndex(index);
                                                    setNewName(row.name); // Set the current name to input
                                                }}>
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
            <footer className="footer">  
                <p>© 2025 Your Company Name</p>  
                <div className="message-send-links">  
                    <a href="#">Telegram</a>
                </div>  
            </footer>  
        </div>  
    );  
};  

export default Dashboard;  // Make sure to export the correct component name

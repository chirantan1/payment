import React from 'react';
import PaymentForm from './components/PaymentForm';
import './styles/App.css';

function App() {
    return (
        <div className="App flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <div className="container bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Indian UPI Payment System
                </h1>
                <PaymentForm />
            </div>
        </div>
    );
}

export default App;
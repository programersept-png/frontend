import React, { useEffect, useState } from 'react';
import API from '../api';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
} from 'chart.js';

import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

const DashboardCharts = () => {
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalStudents: 0,
        borrowedBooks: 0,
        availableBooks: 0,
        booksByAuthor: [],
        monthlyBorrowing: [],
        popularBooks: [],
        studentsByClass: []
    });

    useEffect(() => {
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        const token = localStorage.getItem('token');

        try {
            const [booksRes, studentsRes, borrowRes] = await Promise.all([
                API.get('/api/books', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                API.get('/api/students', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                API.get('/api/borrow', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const books = booksRes.data;
            const students = studentsRes.data;
            const borrows = borrowRes.data;

            const totalBooks = books.reduce((sum, b) => sum + b.quantity, 0);
            const availableBooks = books.reduce((sum, b) => sum + b.available_quantity, 0);
            const borrowedBooks = borrows.filter(b => b.status === 'borrowed').length;

            const authorCount = {};
            books.forEach(book => {
                authorCount[book.author] = (authorCount[book.author] || 0) + 1;
            });

            const booksByAuthor = Object.entries(authorCount)
                .slice(0, 5)
                .map(([author, count]) => ({ author, count }));

            const monthlyData = {};
            const months = [];

            for (let i = 5; i >= 0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const m = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
                months.push(m);
                monthlyData[m] = 0;
            }

            borrows.forEach(b => {
                const d = new Date(b.borrow_date);
                const m = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
                if (monthlyData[m] !== undefined) monthlyData[m]++;
            });

            const monthlyBorrowing = months.map(m => ({
                month: m,
                count: monthlyData[m]
            }));

            const bookCount = {};
            borrows.forEach(b => {
                if (b.book_title) {
                    bookCount[b.book_title] = (bookCount[b.book_title] || 0) + 1;
                }
            });

            const popularBooks = Object.entries(bookCount)
                .slice(0, 5)
                .map(([title, count]) => ({ title, count }));

            const classCount = {};
            students.forEach(s => {
                classCount[s.class] = (classCount[s.class] || 0) + 1;
            });

            const studentsByClass = Object.entries(classCount)
                .map(([className, count]) => ({ className, count }));

            setStats({
                totalBooks,
                totalStudents: students.length,
                borrowedBooks,
                availableBooks,
                booksByAuthor,
                monthlyBorrowing,
                popularBooks,
                studentsByClass
            });

        } catch (error) {
            console.error('DashboardCharts error:', error);
        }
    };

    return (
        <div className="dashboard-charts">
            <h2>Dashboard Charts</h2>
        </div>
    );
};

export default DashboardCharts;

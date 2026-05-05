import React, { useState, useEffect } from 'react';
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

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalStudents: 0,
        borrowedBooks: 0,
        availableBooks: 0,
        totalBookCopies: 0,
        booksByAuthor: [],
        monthlyBorrowing: [],
        popularBooks: [],
        studentsByClass: [],
        recentActivities: []
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        const token = localStorage.getItem('token');
        setLoading(true);

        try {
            const [booksRes, studentsRes, borrowRes, allBorrowsRes] = await Promise.all([
                API.get('/api/books', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                API.get('/api/students', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                API.get('/api/borrow/current', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                API.get('/api/borrow', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const books = booksRes.data;
            const students = studentsRes.data;
            const currentBorrows = borrowRes.data;
            const allBorrows = allBorrowsRes.data;

            const totalBookCopies = books.reduce((sum, book) => sum + book.quantity, 0);
            const availableBooks = books.reduce((sum, book) => sum + book.available_quantity, 0);

            const authorCount = {};
            books.forEach(book => {
                authorCount[book.author] = (authorCount[book.author] || 0) + 1;
            });

            const booksByAuthor = Object.entries(authorCount)
                .slice(0, 5)
                .map(([author, count]) => ({ author, count }));

            const monthlyData = {};
            const last6Months = [];

            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
                last6Months.push(monthYear);
                monthlyData[monthYear] = 0;
            }

            allBorrows.forEach(b => {
                const d = new Date(b.borrow_date);
                const m = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
                if (monthlyData[m] !== undefined) monthlyData[m]++;
            });

            const monthlyBorrowing = last6Months.map(m => ({
                month: m,
                count: monthlyData[m]
            }));

            const bookBorrowCount = {};
            allBorrows.forEach(b => {
                if (b.book_title) {
                    bookBorrowCount[b.book_title] = (bookBorrowCount[b.book_title] || 0) + 1;
                }
            });

            const popularBooks = Object.entries(bookBorrowCount)
                .slice(0, 5)
                .map(([title, count]) => ({
                    title,
                    count
                }));

            const classCount = {};
            students.forEach(s => {
                classCount[s.class] = (classCount[s.class] || 0) + 1;
            });

            const studentsByClass = Object.entries(classCount)
                .map(([className, count]) => ({ className, count }));

            const recentActivities = allBorrows.slice(0, 5).map(b => ({
                id: b.borrow_id,
                student: b.student_name,
                book: b.book_title,
                date: new Date(b.borrow_date).toLocaleDateString(),
                status: b.status
            }));

            setStats({
                totalBooks: books.length,
                totalStudents: students.length,
                borrowedBooks: currentBorrows.length,
                availableBooks,
                totalBookCopies,
                booksByAuthor,
                monthlyBorrowing,
                popularBooks,
                studentsByClass,
                recentActivities
            });

        } catch (error) {
            console.error('Dashboard error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <h2>Loading...</h2>;

    return (
        <div className="dashboard">
            <h1>Library Dashboard</h1>
        </div>
    );
};

export default Dashboard;

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

// Register ChartJS components
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        const token = localStorage.getItem('token');
        setLoading(true);

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

            const totalBooks = books.reduce((sum, b) => sum + (b.quantity || 0), 0);
            const availableBooks = books.reduce((sum, b) => sum + (b.available_quantity || 0), 0);
            const borrowedBooks = borrows.filter(b => b.status === 'borrowed').length;

            // Books by Author
            const authorCount = {};
            books.forEach(book => {
                authorCount[book.author] = (authorCount[book.author] || 0) + (book.quantity || 1);
            });
            const booksByAuthor = Object.entries(authorCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([author, count]) => ({ author, count }));

            // Monthly Borrowing (last 6 months)
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
            const monthlyBorrowing = months.map(m => ({ month: m, count: monthlyData[m] }));

            // Popular Books
            const bookCount = {};
            borrows.forEach(b => {
                if (b.book_title) {
                    bookCount[b.book_title] = (bookCount[b.book_title] || 0) + 1;
                }
            });
            const popularBooks = Object.entries(bookCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([title, count]) => ({ title, count }));

            // Students by Class
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
        } finally {
            setLoading(false);
        }
    };

    // Chart Data Configurations
    const authorChartData = {
        labels: stats.booksByAuthor.map(item => item.author.length > 20 ? item.author.substring(0, 20) + '...' : item.author),
        datasets: [{
            label: 'Number of Books',
            data: stats.booksByAuthor.map(item => item.count),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    const monthlyChartData = {
        labels: stats.monthlyBorrowing.map(item => item.month),
        datasets: [{
            label: 'Books Borrowed',
            data: stats.monthlyBorrowing.map(item => item.count),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.4,
            fill: true
        }]
    };

    const availabilityChartData = {
        labels: ['Available Books', 'Borrowed Books'],
        datasets: [{
            data: [stats.availableBooks, stats.borrowedBooks],
            backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)'],
            borderWidth: 1
        }]
    };

    const popularBooksChartData = {
        labels: stats.popularBooks.map(item => 
            item.title.length > 15 ? item.title.substring(0, 15) + '...' : item.title
        ),
        datasets: [{
            label: 'Times Borrowed',
            data: stats.popularBooks.map(item => item.count),
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
        }]
    };

    const classChartData = {
        labels: stats.studentsByClass.map(item => item.className),
        datasets: [{
            data: stats.studentsByClass.map(item => item.count),
            backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 206, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)'
            ],
            borderWidth: 1
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
            tooltip: { mode: 'index', intersect: false }
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Loading Dashboard...</h2>
            </div>
        );
    }

    return (
        <div className="dashboard-charts" style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '30px' }}>Library Dashboard</h1>

            {/* Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                <div style={{ background: '#E8F5E9', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '40px' }}>📚</div>
                    <h3>Total Books</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>{stats.totalBooks}</p>
                </div>
                <div style={{ background: '#E3F2FD', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '40px' }}>📖</div>
                    <h3>Available Books</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196F3' }}>{stats.availableBooks}</p>
                </div>
                <div style={{ background: '#FFF3E0', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '40px' }}>📕</div>
                    <h3>Borrowed Books</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#FF9800' }}>{stats.borrowedBooks}</p>
                </div>
                <div style={{ background: '#F3E5F5', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '40px' }}>👨‍🎓</div>
                    <h3>Total Students</h3>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#9C27B0' }}>{stats.totalStudents}</p>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                gap: '30px'
            }}>
                {/* Books by Author */}
                {stats.booksByAuthor.length > 0 && (
                    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3>Books by Author</h3>
                        <div style={{ height: '400px' }}>
                            <Bar data={authorChartData} options={chartOptions} />
                        </div>
                    </div>
                )}

                {/* Monthly Borrowing Trend */}
                {stats.monthlyBorrowing.length > 0 && (
                    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3>Monthly Borrowing Trend</h3>
                        <div style={{ height: '400px' }}>
                            <Line data={monthlyChartData} options={chartOptions} />
                        </div>
                    </div>
                )}

                {/* Book Availability */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>Book Availability</h3>
                    <div style={{ height: '400px' }}>
                        <Doughnut data={availabilityChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Popular Books */}
                {stats.popularBooks.length > 0 && (
                    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3>Most Popular Books</h3>
                        <div style={{ height: '400px' }}>
                            <Bar data={popularBooksChartData} options={chartOptions} />
                        </div>
                    </div>
                )}

                {/* Students by Class */}
                {stats.studentsByClass.length > 0 && (
                    <div style={{ background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3>Students by Class</h3>
                        <div style={{ height: '400px' }}>
                            <Pie data={classChartData} options={chartOptions} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardCharts;

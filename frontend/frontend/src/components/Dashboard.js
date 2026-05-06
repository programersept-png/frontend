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
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
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

            // Calculate totals
            const totalBookCopies = books.reduce((sum, book) => sum + (book.quantity || 0), 0);
            const availableBooks = books.reduce((sum, book) => sum + (book.available_quantity || 0), 0);

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
            const last6Months = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
                last6Months.push(monthYear);
                monthlyData[monthYear] = 0;
            }

            allBorrows.forEach(borrow => {
                const borrowDate = new Date(borrow.borrow_date);
                const monthYear = `${borrowDate.toLocaleString('default', { month: 'short' })} ${borrowDate.getFullYear()}`;
                if (monthlyData[monthYear] !== undefined) {
                    monthlyData[monthYear]++;
                }
            });

            const monthlyBorrowing = last6Months.map(month => ({
                month,
                count: monthlyData[month]
            }));

            // Popular Books (most borrowed)
            const bookBorrowCount = {};
            allBorrows.forEach(borrow => {
                const title = borrow.book_title;
                if (title) {
                    bookBorrowCount[title] = (bookBorrowCount[title] || 0) + 1;
                }
            });
            const popularBooks = Object.entries(bookBorrowCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([title, count]) => ({ 
                    title: title.length > 25 ? title.substring(0, 25) + '...' : title, 
                    count 
                }));

            // Students by Class
            const classCount = {};
            students.forEach(student => {
                classCount[student.class] = (classCount[student.class] || 0) + 1;
            });
            const studentsByClass = Object.entries(classCount)
                .map(([className, count]) => ({ className, count }));

            // Recent Activities
            const recentActivities = allBorrows.slice(0, 5).map(borrow => ({
                id: borrow.borrow_id,
                student: borrow.student_name || 'Unknown',
                book: borrow.book_title || 'Unknown',
                date: new Date(borrow.borrow_date).toLocaleDateString(),
                status: borrow.status
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

    // Chart Data Configurations
    const authorChartData = {
        labels: stats.booksByAuthor.map(item => 
            item.author.length > 20 ? item.author.substring(0, 20) + '...' : item.author
        ),
        datasets: [{
            label: 'Number of Books',
            data: stats.booksByAuthor.map(item => item.count),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            borderRadius: 5,
        }]
    };

    const monthlyChartData = {
        labels: stats.monthlyBorrowing.map(item => item.month),
        datasets: [{
            label: 'Books Borrowed',
            data: stats.monthlyBorrowing.map(item => item.count),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
        }]
    };

    const availabilityChartData = {
        labels: ['Available Books', 'Borrowed Books'],
        datasets: [{
            data: [stats.availableBooks, stats.borrowedBooks],
            backgroundColor: [
                'rgba(75, 192, 192, 0.8)',
                'rgba(255, 99, 132, 0.8)',
            ],
            borderColor: [
                'rgba(75, 192, 192, 1)',
                'rgba(255, 99, 132, 1)',
            ],
            borderWidth: 1,
        }]
    };

    const popularBooksChartData = {
        labels: stats.popularBooks.map(item => item.title),
        datasets: [{
            label: 'Times Borrowed',
            data: stats.popularBooks.map(item => item.count),
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1,
            borderRadius: 5,
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
                'rgba(153, 102, 255, 0.8)',
                'rgba(255, 159, 64, 0.8)',
            ],
            borderWidth: 1,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { font: { size: 11 } }
            },
            tooltip: { mode: 'index', intersect: false }
        },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { font: { size: 11 } } }
        }
    };

    const summaryCards = [
        {
            title: 'Total Books',
            value: stats.totalBooks,
            subtitle: `${stats.totalBookCopies} copies`,
            icon: '📚',
            color: '#4CAF50',
            bgColor: '#E8F5E9'
        },
        {
            title: 'Available Books',
            value: stats.availableBooks,
            subtitle: `${Math.round((stats.availableBooks / stats.totalBookCopies) * 100) || 0}% available`,
            icon: '📖',
            color: '#2196F3',
            bgColor: '#E3F2FD'
        },
        {
            title: 'Borrowed Books',
            value: stats.borrowedBooks,
            subtitle: `${stats.borrowedBooks} currently out`,
            icon: '📕',
            color: '#FF9800',
            bgColor: '#FFF3E0'
        },
        {
            title: 'Total Students',
            value: stats.totalStudents,
            subtitle: `${stats.studentsByClass.length} classes`,
            icon: '👨‍🎓',
            color: '#9C27B0',
            bgColor: '#F3E5F5'
        }
    ];

    if (loading) {
        return (
            <div className="dashboard">
                <h1>Library Dashboard</h1>
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <h1>📊 Library Dashboard</h1>
            
            {/* Summary Cards */}
            <div className="summary-cards">
                {summaryCards.map((card, index) => (
                    <div key={index} className="summary-card" style={{ backgroundColor: card.bgColor }}>
                        <div className="card-icon" style={{ color: card.color }}>
                            {card.icon}
                        </div>
                        <div className="card-content">
                            <h3>{card.title}</h3>
                            <p className="card-value" style={{ color: card.color }}>{card.value}</p>
                            <p className="card-subtitle">{card.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Books by Author Chart */}
                {stats.booksByAuthor.length > 0 && (
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3>Books by Author</h3>
                        </div>
                        <div className="chart-container">
                            <Bar data={authorChartData} options={chartOptions} />
                        </div>
                    </div>
                )}

                {/* Monthly Borrowing Trend */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Monthly Borrowing Trend</h3>
                        <p className="chart-subtitle">Last 6 months activity</p>
                    </div>
                    <div className="chart-container">
                        <Line data={monthlyChartData} options={chartOptions} />
                    </div>
                </div>

                {/* Book Availability Doughnut */}
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Book Availability</h3>
                    </div>
                    <div className="chart-container small-chart">
                        <Doughnut data={availabilityChartData} options={pieOptions} />
                    </div>
                </div>

                {/* Popular Books Chart */}
                {stats.popularBooks.length > 0 && (
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3>Most Popular Books</h3>
                            <p className="chart-subtitle">Top 5 most borrowed</p>
                        </div>
                        <div className="chart-container">
                            <Bar data={popularBooksChartData} options={chartOptions} />
                        </div>
                    </div>
                )}

                {/* Students by Class Pie Chart */}
                {stats.studentsByClass.length > 0 && (
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3>Students by Class</h3>
                        </div>
                        <div className="chart-container small-chart">
                            <Pie data={classChartData} options={pieOptions} />
                        </div>
                    </div>
                )}

                {/* Recent Activities */}
                <div className="chart-card activities-card">
                    <div className="chart-header">
                        <h3>Recent Activities</h3>
                        <p className="chart-subtitle">Latest borrow transactions</p>
                    </div>
                    <div className="activities-list">
                        {stats.recentActivities.length > 0 ? (
                            stats.recentActivities.map((activity, index) => (
                                <div key={index} className="activity-item">
                                    <div className="activity-icon">
                                        {activity.status === 'borrowed' ? '📕' : '✅'}
                                    </div>
                                    <div className="activity-details">
                                        <p className="activity-text">
                                            <strong>{activity.student}</strong> borrowed <strong>{activity.book}</strong>
                                        </p>
                                        <p className="activity-date">{activity.date}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-activities">No recent activities</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

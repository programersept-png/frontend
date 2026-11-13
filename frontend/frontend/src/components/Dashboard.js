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
import { 
    BookOpen, 
    BookMarked, 
    BookCopy, 
    Users,
    Star,
    GraduationCap,
    Activity,
    BarChart3,
    PieChart as PieChartIcon,
    LineChart,
    RefreshCw,
    Library
} from 'lucide-react';

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
                API.get('/api/books', { headers: { Authorization: `Bearer ${token}` } }),
                API.get('/api/students', { headers: { Authorization: `Bearer ${token}` } }),
                API.get('/api/borrow/current', { headers: { Authorization: `Bearer ${token}` } }),
                API.get('/api/borrow', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const books = booksRes.data;
            const students = studentsRes.data;
            const currentBorrows = borrowRes.data;
            const allBorrows = allBorrowsRes.data;

            const totalBookCopies = books.reduce((sum, book) => sum + (book.quantity || 0), 0);
            const availableBooks = books.reduce((sum, book) => sum + (book.available_quantity || 0), 0);

            const authorCount = {};
            books.forEach(book => {
                authorCount[book.author] = (authorCount[book.author] || 0) + (book.quantity || 1);
            });
            const booksByAuthor = Object.entries(authorCount)
                .sort((a, b) => b[1] - a[1])
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
                .map(([title, count]) => ({ title: title.length > 25 ? title.substring(0, 25) + '...' : title, count }));

            const classCount = {};
            students.forEach(student => {
                classCount[student.class] = (classCount[student.class] || 0) + 1;
            });
            const studentsByClass = Object.entries(classCount).map(([className, count]) => ({ className, count }));

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

    // --- CHART CONFIGURATIONS (Matching Teal/Charcoal Theme) ---
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { font: { size: 12, weight: '500' }, usePointStyle: true, color: '#e0e0e0' }
            },
            tooltip: { 
                mode: 'index', 
                intersect: false,
                backgroundColor: 'rgba(12, 24, 29, 0.9)',
                padding: 12,
            }
        },
        scales: {
            y: { 
                beginAtZero: true, 
                ticks: { stepSize: 1, color: '#b0b0b0' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' }
            },
            x: { 
                ticks: { color: '#b0b0b0' },
                grid: { display: false }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { font: { size: 11, weight: '500' }, color: '#e0e0e0' } },
            tooltip: { backgroundColor: 'rgba(12, 24, 29, 0.9)' }
        }
    };

    const authorChartData = {
        labels: stats.booksByAuthor.map(item => item.author),
        datasets: [{
            label: 'Books',
            data: stats.booksByAuthor.map(item => item.count),
            backgroundColor: '#5a8c9a', // Teal
            borderRadius: 6,
        }]
    };

    const monthlyChartData = {
        labels: stats.monthlyBorrowing.map(item => item.month),
        datasets: [{
            label: 'Borrowed',
            data: stats.monthlyBorrowing.map(item => item.count),
            borderColor: '#5a8c9a',
            backgroundColor: 'rgba(90, 140, 154, 0.2)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#5a8c9a',
        }]
    };

    const availabilityChartData = {
        labels: ['Available', 'Borrowed'],
        datasets: [{
            data: [stats.availableBooks, stats.borrowedBooks],
            backgroundColor: ['#5a8c9a', '#e74c3c'],
            borderWidth: 0,
        }]
    };

    const popularBooksChartData = {
        labels: stats.popularBooks.map(item => item.title),
        datasets: [{
            label: 'Times Borrowed',
            data: stats.popularBooks.map(item => item.count),
            backgroundColor: '#f39c12', // Orange
            borderRadius: 6,
        }]
    };

    const classChartData = {
        labels: stats.studentsByClass.map(item => item.className),
        datasets: [{
            data: stats.studentsByClass.map(item => item.count),
            backgroundColor: ['#5a8c9a', '#3498db', '#f39c12', '#e74c3c', '#9b59b6'],
            borderWidth: 0,
        }]
    };

    const summaryCards = [
        { title: 'Total Books', value: stats.totalBooks, subtitle: `${stats.totalBookCopies} copies`, icon: BookOpen },
        { title: 'Available', value: stats.availableBooks, subtitle: `${Math.round((stats.availableBooks / stats.totalBookCopies) * 100) || 0}% available`, icon: BookMarked },
        { title: 'Borrowed', value: stats.borrowedBooks, subtitle: `${stats.borrowedBooks} currently out`, icon: BookCopy },
        { title: 'Students', value: stats.totalStudents, subtitle: `${stats.studentsByClass.length} classes`, icon: Users }
    ];

    if (loading) {
        return (
            <div className="dashboard">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1 className="dashboard-title">
                    <Library className="title-icon" size={32} />
                    Library Dashboard
                </h1>
                <p className="dashboard-subtitle">Overview & Analytics</p>
            </div>
            
            {/* Summary Cards */}
            <div className="summary-cards">
                {summaryCards.map((card, index) => (
                    <div key={index} className="summary-card dark-card">
                        <div className="card-icon-wrapper dark-icon-wrapper">
                            <card.icon className="card-icon" size={28} color="#5a8c9a" />
                        </div>
                        <div className="card-content">
                            <h3>{card.title}</h3>
                            <p className="card-value">{card.value}</p>
                            <p className="card-subtitle">{card.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                <div className="chart-card dark-card">
                    <div className="chart-header">
                        <BarChart3 className="chart-icon" size={24} color="#5a8c9a" />
                        <h3>Books by Author</h3>
                    </div>
                    <div className="chart-container">
                        <Bar data={authorChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="chart-card dark-card">
                    <div className="chart-header">
                        <LineChart className="chart-icon" size={24} color="#5a8c9a" />
                        <h3>Monthly Trend</h3>
                    </div>
                    <div className="chart-container">
                        <Line data={monthlyChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="chart-card dark-card">
                    <div className="chart-header">
                        <PieChartIcon className="chart-icon" size={24} color="#5a8c9a" />
                        <h3>Book Availability</h3>
                    </div>
                    <div className="chart-container small-chart">
                        <Doughnut data={availabilityChartData} options={pieOptions} />
                    </div>
                </div>

                <div className="chart-card dark-card">
                    <div className="chart-header">
                        <Star className="chart-icon" size={24} color="#5a8c9a" />
                        <h3>Popular Books</h3>
                    </div>
                    <div className="chart-container">
                        <Bar data={popularBooksChartData} options={chartOptions} />
                    </div>
                </div>

                <div className="chart-card dark-card">
                    <div className="chart-header">
                        <GraduationCap className="chart-icon" size={24} color="#5a8c9a" />
                        <h3>Student Distribution</h3>
                    </div>
                    <div className="chart-container small-chart">
                        <Pie data={classChartData} options={pieOptions} />
                    </div>
                </div>

                <div className="chart-card dark-card activities-card">
                    <div className="chart-header">
                        <Activity className="chart-icon" size={24} color="#5a8c9a" />
                        <h3>Recent Activities</h3>
                    </div>
                    <div className="activities-list">
                        {stats.recentActivities.length > 0 ? (
                            stats.recentActivities.map((activity, index) => (
                                <div key={index} className="activity-item dark-activity">
                                    <div className="activity-icon" style={{ color: activity.status === 'borrowed' ? '#f39c12' : '#5a8c9a' }}>
                                        {activity.status === 'borrowed' ? <BookCopy size={20} /> : <RefreshCw size={20} />}
                                    </div>
                                    <div className="activity-details">
                                        <p className="activity-text" style={{ color: '#e0e0e0' }}>
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
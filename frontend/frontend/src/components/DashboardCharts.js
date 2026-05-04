import React, { useEffect, useState } from 'react';
import axios from 'axios';
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

    useEffect(() => {
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        const token = localStorage.getItem('token');
        try {
            // Fetch books
            const booksRes = await axios.get('http://localhost:5000/api/books', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Fetch students
            const studentsRes = await axios.get('http://localhost:5000/api/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Fetch borrow records
            const borrowRes = await axios.get('http://localhost:5000/api/borrow', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const books = booksRes.data;
            const students = studentsRes.data;
            const borrows = borrowRes.data;

            // Calculate statistics
            const totalBooks = books.reduce((sum, book) => sum + book.quantity, 0);
            const availableBooks = books.reduce((sum, book) => sum + book.available_quantity, 0);
            const borrowedBooks = borrows.filter(b => b.status === 'borrowed').length;

            // Get books by author (top 5)
            const authorCount = {};
            books.forEach(book => {
                authorCount[book.author] = (authorCount[book.author] || 0) + book.quantity;
            });
            const booksByAuthor = Object.entries(authorCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([author, count]) => ({ author, count }));

            // Get monthly borrowing data (last 6 months)
            const monthlyData = {};
            const last6Months = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date();
                date.setMonth(date.getMonth() - i);
                const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
                last6Months.push(monthYear);
                monthlyData[monthYear] = 0;
            }

            borrows.forEach(borrow => {
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

            // Get popular books (most borrowed)
            const bookBorrowCount = {};
            borrows.forEach(borrow => {
                bookBorrowCount[borrow.book_title] = (bookBorrowCount[borrow.book_title] || 0) + 1;
            });
            const popularBooks = Object.entries(bookBorrowCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([title, count]) => ({ title, count }));

            // Get students by class
            const classCount = {};
            students.forEach(student => {
                classCount[student.class] = (classCount[student.class] || 0) + 1;
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
            console.error('Error fetching chart data:', error);
        }
    };

    // Bar Chart: Books by Author
    const authorChartData = {
        labels: stats.booksByAuthor.map(item => item.author),
        datasets: [
            {
                label: 'Number of Books',
                data: stats.booksByAuthor.map(item => item.count),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 5,
            },
        ],
    };

    const authorChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Books Distribution by Author',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    // Line Chart: Monthly Borrowing Trend
    const monthlyChartData = {
        labels: stats.monthlyBorrowing.map(item => item.month),
        datasets: [
            {
                label: 'Books Borrowed',
                data: stats.monthlyBorrowing.map(item => item.count),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const monthlyChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Monthly Borrowing Trend (Last 6 Months)',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    // Doughnut Chart: Book Availability
    const availabilityChartData = {
        labels: ['Available Books', 'Borrowed Books'],
        datasets: [
            {
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
            },
        ],
    };

    const availabilityChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Book Availability Status',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
        },
    };

    // Bar Chart: Popular Books
    const popularBooksChartData = {
        labels: stats.popularBooks.map(item => 
            item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title
        ),
        datasets: [
            {
                label: 'Times Borrowed',
                data: stats.popularBooks.map(item => item.count),
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1,
                borderRadius: 5,
            },
        ],
    };

    const popularBooksOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Most Popular Books',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
            tooltip: {
                callbacks: {
                    title: (tooltipItems) => {
                        return stats.popularBooks[tooltipItems[0].dataIndex]?.title || '';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    // Pie Chart: Students by Class
    const classChartData = {
        labels: stats.studentsByClass.map(item => item.className),
        datasets: [
            {
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
            },
        ],
    };

    const classChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Student Distribution by Class',
                font: {
                    size: 16,
                    weight: 'bold'
                }
            },
        },
    };

    // Summary Cards Data
    const summaryCards = [
        {
            title: 'Total Books',
            value: stats.totalBooks,
            icon: '📚',
            color: '#4CAF50',
            bgColor: '#E8F5E9'
        },
        {
            title: 'Available Books',
            value: stats.availableBooks,
            icon: '📖',
            color: '#2196F3',
            bgColor: '#E3F2FD'
        },
        {
            title: 'Borrowed Books',
            value: stats.borrowedBooks,
            icon: '📕',
            color: '#FF9800',
            bgColor: '#FFF3E0'
        },
        {
            title: 'Total Students',
            value: stats.totalStudents,
            icon: '👨‍🎓',
            color: '#9C27B0',
            bgColor: '#F3E5F5'
        }
    ];

    return (
        <div className="dashboard-charts">
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
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
                {/* Books by Author Chart */}
                {stats.booksByAuthor.length > 0 && (
                    <div className="chart-card">
                        <div className="chart-container">
                            <Bar data={authorChartData} options={authorChartOptions} />
                        </div>
                    </div>
                )}

                {/* Monthly Borrowing Trend */}
                {stats.monthlyBorrowing.length > 0 && (
                    <div className="chart-card">
                        <div className="chart-container">
                            <Line data={monthlyChartData} options={monthlyChartOptions} />
                        </div>
                    </div>
                )}

                {/* Book Availability Doughnut */}
                <div className="chart-card">
                    <div className="chart-container">
                        <Doughnut data={availabilityChartData} options={availabilityChartOptions} />
                    </div>
                </div>

                {/* Popular Books Chart */}
                {stats.popularBooks.length > 0 && (
                    <div className="chart-card">
                        <div className="chart-container">
                            <Bar data={popularBooksChartData} options={popularBooksOptions} />
                        </div>
                    </div>
                )}

                {/* Students by Class Pie Chart */}
                {stats.studentsByClass.length > 0 && (
                    <div className="chart-card">
                        <div className="chart-container">
                            <Pie data={classChartData} options={classChartOptions} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardCharts;
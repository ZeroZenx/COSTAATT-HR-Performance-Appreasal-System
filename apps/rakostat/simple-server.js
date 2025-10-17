const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sample data for demonstration
const rooms = [
  {
    id: '1',
    name: 'Room 101',
    campus: 'CITY_CAMPUS',
    capacity: 30,
    technologies: ['Projector', 'Whiteboard', 'AC'],
    isActive: true
  },
  {
    id: '2', 
    name: 'Computer Lab 1',
    campus: 'NORTH_LEARNING_CENTER',
    capacity: 30,
    technologies: ['Computers', 'Projector', 'Smart Board'],
    isActive: true
  },
  {
    id: '3',
    name: 'Conference Room A',
    campus: 'CHAGUANAS_CAMPUS', 
    capacity: 15,
    technologies: ['Conference Equipment', 'AC'],
    isActive: true
  },
  {
    id: '4',
    name: 'Lecture Hall 1',
    campus: 'SAN_FERNANDO_CAMPUS',
    capacity: 100,
    technologies: ['Projector', 'Sound System', 'AC'],
    isActive: true
  },
  {
    id: '5',
    name: 'Study Room 1',
    campus: 'TOBAGO_CAMPUS',
    capacity: 8,
    technologies: ['Whiteboard'],
    isActive: true
  }
];

const bookings = [
  {
    id: '1',
    title: 'Faculty Meeting',
    description: 'Monthly faculty meeting',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    roomId: '1',
    userId: 'admin',
    status: 'CONFIRMED'
  },
  {
    id: '2',
    title: 'Student Presentation',
    description: 'Final year project presentations',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
    roomId: '2',
    userId: 'dean',
    status: 'PENDING'
  }
];

// API Routes
app.get('/api/rooms', (req, res) => {
  const { campus, capacity, technology } = req.query;
  let filteredRooms = rooms;

  if (campus) {
    filteredRooms = filteredRooms.filter(room => room.campus === campus);
  }
  
  if (capacity) {
    filteredRooms = filteredRooms.filter(room => room.capacity >= parseInt(capacity));
  }
  
  if (technology) {
    filteredRooms = filteredRooms.filter(room => 
      room.technologies.some(tech => 
        tech.toLowerCase().includes(technology.toLowerCase())
      )
    );
  }

  res.json(filteredRooms);
});

app.get('/api/rooms/:id', (req, res) => {
  const room = rooms.find(r => r.id === req.params.id);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(room);
});

app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
  const { title, description, startTime, endTime, roomId, userId } = req.body;
  
  // Check for conflicts
  const conflict = bookings.find(booking => 
    booking.roomId === roomId &&
    booking.status !== 'CANCELLED' &&
    new Date(booking.startTime) < new Date(endTime) &&
    new Date(booking.endTime) > new Date(startTime)
  );
  
  if (conflict) {
    return res.status(400).json({ error: 'Room is already booked during this time' });
  }
  
  const newBooking = {
    id: (bookings.length + 1).toString(),
    title,
    description,
    startTime,
    endTime,
    roomId,
    userId: userId || 'user',
    status: 'PENDING'
  };
  
  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

app.get('/api/dashboard', (req, res) => {
  const stats = {
    totalRooms: rooms.length,
    totalBookings: bookings.length,
    activeBookings: bookings.filter(b => b.status === 'CONFIRMED').length,
    totalUsers: 5
  };
  res.json(stats);
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/demo', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rakostat - COSTAATT Room Booking System</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: linear-gradient(135deg, #1e40af 0%, #059669 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                border-radius: 20px;
                padding: 3rem;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                max-width: 800px;
                width: 90%;
                text-align: center;
            }
            .logo {
                font-size: 3rem;
                font-weight: bold;
                color: #1e40af;
                margin-bottom: 1rem;
            }
            .subtitle {
                color: #059669;
                font-size: 1.2rem;
                margin-bottom: 2rem;
            }
            .description {
                color: #6b7280;
                line-height: 1.6;
                margin-bottom: 2rem;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
                margin: 2rem 0;
            }
            .feature {
                background: #f8fafc;
                padding: 1rem;
                border-radius: 10px;
                border-left: 4px solid #1e40af;
            }
            .feature h3 {
                color: #1e40af;
                margin-bottom: 0.5rem;
            }
            .feature p {
                color: #6b7280;
                font-size: 0.9rem;
            }
            .campus-list {
                background: #f8fafc;
                padding: 1.5rem;
                border-radius: 10px;
                margin: 2rem 0;
                text-align: left;
            }
            .campus-list h3 {
                color: #1e40af;
                margin-bottom: 1rem;
                text-align: center;
            }
            .campus-list ul {
                list-style: none;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 0.5rem;
            }
            .campus-list li {
                padding: 0.5rem;
                background: white;
                border-radius: 5px;
                border-left: 3px solid #059669;
            }
            .api-info {
                background: #1e40af;
                color: white;
                padding: 1.5rem;
                border-radius: 10px;
                margin-top: 2rem;
            }
            .api-info h3 {
                margin-bottom: 1rem;
            }
            .api-endpoints {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 1rem;
                margin-top: 1rem;
            }
            .endpoint {
                background: rgba(255,255,255,0.1);
                padding: 0.5rem;
                border-radius: 5px;
                font-family: monospace;
                font-size: 0.8rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">🏢 Rakostat</div>
            <div class="subtitle">COSTAATT Room Booking System</div>
            <div class="description">
                A modern, single sign-on (SSO)-enabled web application to manage room bookings across five COSTAATT campuses with role-based access control.
            </div>
            
            <div class="features">
                <div class="feature">
                    <h3>🔐 Secure Authentication</h3>
                    <p>Microsoft 365 SSO integration with Azure AD</p>
                </div>
                <div class="feature">
                    <h3>🏢 Multi-Campus</h3>
                    <p>Manage rooms across 5 COSTAATT campuses</p>
                </div>
                <div class="feature">
                    <h3>👥 Role-Based Access</h3>
                    <p>Admin, Registry, Facilities, Campus Deans, Staff</p>
                </div>
                <div class="feature">
                    <h3>📅 Smart Booking</h3>
                    <p>Conflict prevention and availability checking</p>
                </div>
            </div>
            
            <div class="campus-list">
                <h3>🏢 Supported Campuses</h3>
                <ul>
                    <li>City Campus – Port-of-Spain</li>
                    <li>North Learning Center – Port-of-Spain</li>
                    <li>Chaguanas Campus</li>
                    <li>San Fernando Campus</li>
                    <li>Tobago Campus</li>
                </ul>
            </div>
            
            <div class="api-info">
                <h3>🚀 API Endpoints</h3>
                <p>The room booking system is running and ready to use!</p>
                <div class="api-endpoints">
                    <div class="endpoint">GET /api/rooms</div>
                    <div class="endpoint">GET /api/bookings</div>
                    <div class="endpoint">POST /api/bookings</div>
                    <div class="endpoint">GET /api/dashboard</div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Rakostat Room Booking System is running!`);
  console.log(`📱 Frontend: http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard`);
  console.log(`🏢 Rooms: http://localhost:${PORT}/api/rooms`);
});
